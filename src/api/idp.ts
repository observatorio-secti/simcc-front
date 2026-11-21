import { z } from 'zod';
import { env } from '@/config/env';
import { readStorage, removeStorage, writeStorage } from '@/shared/lib/storage';
import {
  ApiError,
  clientErrorCodes,
  isAbortError,
  networkError,
  normalizeErrorBody,
} from './errors';

// Cliente do Provedor de Identidade (OAuth 2.0 PKCE S256).
//
// Tokens (access e refresh) ficam EXCLUSIVAMENTE em memória. Apenas o
// verifier/state efêmero do redirecionamento PKCE vai para sessionStorage via
// `src/shared/lib/storage.ts`, sendo apagado no callback (ADR 0008).

export const IDP_CLIENT_ID = 'simcc';
export const PKCE_STORAGE_KEY = 'simcc:auth:pkce';

const DEFAULT_CLOCK_SKEW_MS = 30_000;

export type AuthPrompt = 'none' | 'login' | 'default';

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
}

export interface PkceTransaction {
  state: string;
  codeVerifier: string;
  returnTo: string;
  prompt: AuthPrompt;
}

export interface TokenSet {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
}

export interface JwtIdentity {
  sub: string;
  name: string | null;
  email: string | null;
}

export interface IdpClientOptions {
  idpUrl?: string;
  fetch?: typeof globalThis.fetch;
  getOrigin?: () => string;
  getBaseUrl?: () => string;
}

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  token_type: z.string().optional(),
  refresh_token: z.string().min(1).optional(),
  expires_in: z.number().finite().positive().optional(),
});

const pkceTransactionSchema = z.object({
  state: z.string().min(1),
  codeVerifier: z.string().min(1),
  returnTo: z.string().min(1),
  prompt: z.enum(['none', 'login', 'default']),
});

const oauthStatePayloadSchema = z.object({
  n: z.string().min(1),
  to: z.string().min(1),
});

const jwtIdentitySchema = z.object({
  sub: z.string().min(1),
  name: z.string().nullish(),
  email: z.string().nullish(),
});

export function isIdpConfigured(
  idpUrl: string | undefined = env.idpUrl,
): idpUrl is string {
  return typeof idpUrl === 'string' && idpUrl.trim() !== '';
}

function requireIdpUrl(idpUrl: string | undefined): string {
  if (!isIdpConfigured(idpUrl)) {
    throw new ApiError({
      status: 0,
      code: 'idp_not_configured',
      message:
        'O provedor de autenticação (VITE_IDP_URL) não está configurado.',
    });
  }
  return idpUrl.endsWith('/') ? idpUrl : `${idpUrl}/`;
}

export function base64UrlEncode(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlDecode(encoded: string): Uint8Array {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + '='.repeat(padding);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomBytes(length: number): Uint8Array {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Web Crypto API indisponível para gerar PKCE.');
  }
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/** Gera par PKCE (verifier de 32 bytes e challenge S256 em base64url). */
export async function generatePkcePair(): Promise<PkcePair> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('crypto.subtle indisponível para gerar PKCE S256.');
  }
  const codeVerifier = base64UrlEncode(randomBytes(32));
  const digest = await globalThis.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier),
  );
  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(digest),
  };
}

function normalizeBasePath(baseUrl: string): string {
  const withLeading = baseUrl.startsWith('/') ? baseUrl : `/${baseUrl}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/**
 * Garante que a rota de retorno seja um caminho interno seguro (evita open
 * redirect e loops em `/auth/callback` ou `/auth/sem-acesso`).
 */
export function sanitizeReturnTo(
  value: string | null | undefined,
  baseUrl: string = import.meta.env.BASE_URL || '/',
): string {
  if (!value || typeof value !== 'string') return '/';
  const trimmed = value.trim();
  if (
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    /[\r\n\0]/.test(trimmed)
  ) {
    return '/';
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed, 'https://simcc.invalid');
  } catch {
    return '/';
  }

  if (
    parsed.origin !== 'https://simcc.invalid' ||
    parsed.pathname.startsWith('//')
  ) {
    return '/';
  }

  let pathname = parsed.pathname;
  const basePrefix = normalizeBasePath(baseUrl).replace(/\/$/, '');
  if (basePrefix && basePrefix !== '/') {
    if (pathname === basePrefix) {
      pathname = '/';
    } else if (pathname.startsWith(`${basePrefix}/`)) {
      pathname = pathname.slice(basePrefix.length);
    }
  }

  if (
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/auth/sem-acesso')
  ) {
    return '/';
  }

  return `${pathname}${parsed.search}${parsed.hash}`;
}

export function encodeOAuthState(
  returnTo: string,
  nonce: string = base64UrlEncode(randomBytes(16)),
  baseUrl?: string,
): string {
  const payload = JSON.stringify({
    n: nonce,
    to: sanitizeReturnTo(returnTo, baseUrl),
  });
  return base64UrlEncode(new TextEncoder().encode(payload));
}

export function decodeOAuthState(
  rawState: string | null | undefined,
  baseUrl?: string,
): { nonce: string; returnTo: string } | null {
  if (!rawState) return null;
  try {
    const json = new TextDecoder().decode(base64UrlDecode(rawState));
    const parsed = oauthStatePayloadSchema.safeParse(JSON.parse(json));
    if (!parsed.success) return null;
    return {
      nonce: parsed.data.n,
      returnTo: sanitizeReturnTo(parsed.data.to, baseUrl),
    };
  } catch {
    return null;
  }
}

export function getCallbackUrl(
  origin: string = window.location.origin,
  baseUrl: string = import.meta.env.BASE_URL || '/',
): string {
  const normalizedBase = normalizeBasePath(baseUrl);
  return new URL(`${normalizedBase}auth/callback`, origin).href;
}

export function getPostLogoutUrl(
  returnTo = '/',
  origin: string = window.location.origin,
  baseUrl: string = import.meta.env.BASE_URL || '/',
): string {
  const normalizedBase = normalizeBasePath(baseUrl).replace(/\/$/, '');
  const safePath = sanitizeReturnTo(returnTo, baseUrl);
  return new URL(`${normalizedBase}${safePath}`, origin).href;
}

export function savePkceTransaction(tx: PkceTransaction): void {
  writeStorage(PKCE_STORAGE_KEY, tx, 'session');
}

export function readPkceTransaction(): PkceTransaction | null {
  const raw = readStorage<unknown>(PKCE_STORAGE_KEY, null, 'session');
  const parsed = pkceTransactionSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function clearPkceTransaction(): void {
  removeStorage(PKCE_STORAGE_KEY, 'session');
}

export function consumePkceTransaction(): PkceTransaction | null {
  const tx = readPkceTransaction();
  clearPkceTransaction();
  return tx;
}

/**
 * Lê apenas os campos de identidade (`sub`, `name`, `email`) do payload do JWT
 * para fallback de exibição. O campo `role` do token é ignorado (ADR 0008).
 */
export function readJwtIdentity(accessToken: string): JwtIdentity | null {
  const parts = accessToken.split('.');
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(parts[1]));
    const parsed = jwtIdentitySchema.safeParse(JSON.parse(payloadJson));
    if (!parsed.success) return null;
    return {
      sub: parsed.data.sub,
      name: parsed.data.name ?? null,
      email: parsed.data.email ?? null,
    };
  } catch {
    return null;
  }
}

function oauthErrorFallbackMessage(code: string, status: number): string {
  if (code === 'invalid_grant') {
    return 'Sua sessão expirou ou foi revogada. Faça login novamente.';
  }
  if (status === 401 || code === 'unauthorized_client') {
    return 'Não foi possível validar sua sessão no provedor de identidade.';
  }
  return 'Não foi possível concluir a autenticação no provedor de identidade.';
}

async function idpErrorFromResponse(response: Response): Promise<ApiError> {
  let text = '';
  try {
    text = await response.text();
  } catch {
    // Corpo ilegível conta como vazio.
  }
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    // Corpo não-JSON cai na normalização padrão.
  }

  if (
    typeof body === 'object' &&
    body !== null &&
    !Array.isArray(body) &&
    'error' in body &&
    typeof (body as { error: unknown }).error === 'string'
  ) {
    const oauthBody = body as { error: string; error_description?: unknown };
    const description =
      typeof oauthBody.error_description === 'string' &&
      oauthBody.error_description.trim() !== ''
        ? oauthBody.error_description
        : oauthErrorFallbackMessage(oauthBody.error, response.status);
    return new ApiError({
      status: response.status,
      code: oauthBody.error,
      message: description,
    });
  }

  return normalizeErrorBody(response.status, body);
}

/**
 * Cria um cliente do IdP com armazenamento exclusivo em memória e fila única
 * (mutex) para renovação de refresh tokens rotacionados.
 */
export function createIdpClient(options: IdpClientOptions = {}) {
  const getIdpUrl = () => options.idpUrl ?? env.idpUrl;
  const fetchFn =
    options.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  const getOrigin = options.getOrigin ?? (() => window.location.origin);
  const getBaseUrl =
    options.getBaseUrl ?? (() => import.meta.env.BASE_URL || '/');

  let tokens: TokenSet | null = null;
  let inFlightRefresh: Promise<string> | null = null;
  let inFlightRefreshId: symbol | null = null;
  let sessionEpoch = 0;

  function setTokens(next: TokenSet) {
    tokens = next;
  }

  function clearTokens() {
    sessionEpoch += 1;
    tokens = null;
    inFlightRefresh = null;
    inFlightRefreshId = null;
  }

  function isAccessTokenExpired(skewMs = DEFAULT_CLOCK_SKEW_MS): boolean {
    if (!tokens) return true;
    if (tokens.expiresAt === null) return false;
    return Date.now() + skewMs >= tokens.expiresAt;
  }

  async function postTokenEndpoint(
    payload: Record<string, string>,
    signal?: AbortSignal,
  ): Promise<TokenSet> {
    const baseUrl = requireIdpUrl(getIdpUrl());
    const url = new URL('token', baseUrl).href;

    let response: Response;
    try {
      response = await fetchFn(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal,
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw networkError(error);
    }

    if (!response.ok) {
      throw await idpErrorFromResponse(response);
    }

    let rawBody: unknown;
    try {
      rawBody = await response.json();
    } catch (error) {
      throw new ApiError({
        status: response.status,
        code: clientErrorCodes.invalidResponse,
        message: 'O provedor de identidade respondeu num formato inesperado.',
        cause: error,
      });
    }

    const parsed = tokenResponseSchema.safeParse(rawBody);
    if (!parsed.success) {
      throw new ApiError({
        status: response.status,
        code: clientErrorCodes.invalidResponse,
        message: 'Resposta de token inválida do provedor de identidade.',
      });
    }

    return {
      accessToken: parsed.data.access_token,
      refreshToken: parsed.data.refresh_token ?? null,
      expiresAt:
        parsed.data.expires_in !== undefined
          ? Date.now() + parsed.data.expires_in * 1000
          : null,
    };
  }

  return {
    isConfigured: () => isIdpConfigured(getIdpUrl()),

    getAccessToken: () => tokens?.accessToken ?? null,

    hasRefreshToken: () => Boolean(tokens?.refreshToken),

    hasSession: () => Boolean(tokens?.accessToken || tokens?.refreshToken),

    isAccessTokenExpired,

    clearTokens,

    /**
     * Monta a URL `/authorize` com PKCE S256 e salva `codeVerifier`/`state`
     * efêmeros em `sessionStorage`.
     */
    async prepareAuthorization(
      params: {
        prompt?: 'none' | 'login';
        returnTo?: string;
      } = {},
    ): Promise<{ url: string; state: string; returnTo: string }> {
      const baseUrl = requireIdpUrl(getIdpUrl());
      const appBaseUrl = getBaseUrl();
      const safeReturnTo = sanitizeReturnTo(params.returnTo ?? '/', appBaseUrl);
      const { codeVerifier, codeChallenge } = await generatePkcePair();
      const state = encodeOAuthState(safeReturnTo, undefined, appBaseUrl);
      const redirectUri = getCallbackUrl(getOrigin(), appBaseUrl);

      savePkceTransaction({
        state,
        codeVerifier,
        returnTo: safeReturnTo,
        prompt: params.prompt ?? 'default',
      });

      const url = new URL('authorize', baseUrl);
      url.searchParams.set('client_id', IDP_CLIENT_ID);
      url.searchParams.set('redirect_uri', redirectUri);
      url.searchParams.set('response_type', 'code');
      url.searchParams.set('code_challenge', codeChallenge);
      url.searchParams.set('code_challenge_method', 'S256');
      url.searchParams.set('state', state);
      if (params.prompt) {
        url.searchParams.set('prompt', params.prompt);
      }

      return { url: url.href, state, returnTo: safeReturnTo };
    },

    buildEndSessionUrl(postLogoutRedirectUri?: string): string {
      const baseUrl = requireIdpUrl(getIdpUrl());
      const redirectUri =
        postLogoutRedirectUri && /^https?:\/\//i.test(postLogoutRedirectUri)
          ? postLogoutRedirectUri
          : getPostLogoutUrl(postLogoutRedirectUri, getOrigin(), getBaseUrl());

      const url = new URL('end_session', baseUrl);
      url.searchParams.set('client_id', IDP_CLIENT_ID);
      url.searchParams.set('post_logout_redirect_uri', redirectUri);
      return url.href;
    },

    async exchangeCodeForTokens(params: {
      code: string;
      codeVerifier: string;
      redirectUri?: string;
      signal?: AbortSignal;
    }): Promise<TokenSet> {
      const redirectUri =
        params.redirectUri ?? getCallbackUrl(getOrigin(), getBaseUrl());
      const startEpoch = sessionEpoch;
      const nextTokens = await postTokenEndpoint(
        {
          grant_type: 'authorization_code',
          client_id: IDP_CLIENT_ID,
          code: params.code,
          redirect_uri: redirectUri,
          code_verifier: params.codeVerifier,
        },
        params.signal,
      );

      if (sessionEpoch === startEpoch) {
        setTokens(nextTokens);
      }
      return nextTokens;
    },

    /**
     * Renova o access token usando fila única (mutex) para jamais reusar um
     * refresh token já rotacionado.
     */
    async refreshAccessToken(
      params: {
        failedAccessToken?: string;
        signal?: AbortSignal;
      } = {},
    ): Promise<string> {
      if (
        params.failedAccessToken &&
        tokens?.accessToken &&
        tokens.accessToken !== params.failedAccessToken &&
        inFlightRefresh === null
      ) {
        return tokens.accessToken;
      }

      if (inFlightRefresh !== null) {
        return inFlightRefresh;
      }

      const currentRefreshToken = tokens?.refreshToken;
      if (!currentRefreshToken) {
        clearTokens();
        throw new ApiError({
          status: 401,
          code: clientErrorCodes.unauthorized,
          message: 'Sessão expirada. Faça login novamente.',
        });
      }

      const startEpoch = sessionEpoch;
      const refreshId = Symbol('refresh');
      inFlightRefreshId = refreshId;
      const refreshRun = (async () => {
        try {
          const next = await postTokenEndpoint(
            {
              grant_type: 'refresh_token',
              client_id: IDP_CLIENT_ID,
              refresh_token: currentRefreshToken,
            },
            params.signal,
          );

          if (sessionEpoch !== startEpoch) {
            throw new ApiError({
              status: 401,
              code: clientErrorCodes.unauthorized,
              message: 'Sessão encerrada.',
            });
          }

          setTokens({
            accessToken: next.accessToken,
            // Refresh token é rotacionado; substitui imediatamente se vier no corpo.
            refreshToken: next.refreshToken ?? currentRefreshToken,
            expiresAt: next.expiresAt,
          });

          return next.accessToken;
        } catch (error) {
          if (!isAbortError(error) && sessionEpoch === startEpoch) {
            clearTokens();
          }
          throw error;
        } finally {
          if (inFlightRefreshId === refreshId) {
            inFlightRefresh = null;
            inFlightRefreshId = null;
          }
        }
      })();

      inFlightRefresh = refreshRun;
      return refreshRun;
    },

    async ensureAccessToken(signal?: AbortSignal): Promise<string | null> {
      if (!tokens) return null;
      if (!isAccessTokenExpired() && tokens.accessToken) {
        return tokens.accessToken;
      }
      if (!tokens.refreshToken) {
        clearTokens();
        return null;
      }
      return this.refreshAccessToken({
        failedAccessToken: tokens.accessToken,
        signal,
      });
    },
  };
}

export type IdpClient = ReturnType<typeof createIdpClient>;

export const idp = createIdpClient();
