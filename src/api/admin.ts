import createClient, { type Client, type Middleware } from 'openapi-fetch';
import { env } from '@/config/env';
import {
  ApiError,
  apiErrorFromResponse,
  clientErrorCodes,
  isAbortError,
  isApiError,
  networkError,
} from './errors';
import type { components, paths } from './generated/simcc-admin';
import { idp } from './idp';
import { unwrap } from './simcc';

// Cliente da API administrativa (`simcc-admin`), tipado pelo OpenAPI dela
// (`src/api/generated/simcc-admin.d.ts`, gerado por `npm run api:types`).
//
// - Envia `Authorization: Bearer <token>` só para `env.adminApiUrl`.
// - 401: renova pela fila única do IdP e repete a chamada uma vez; se falhar
//   de novo, avisa a sessão (`onAuthFailure`), que retoma com `prompt=none`.
// - 403: avisa a sessão (`onForbidden`), que passa a mostrar "sem acesso".
// - 502/504: erro da ação, sem derrubar a sessão nem limpar tokens.
// - Erros `{ detail }` do FastAPI viram `ApiError` (ADR 0003 e 0008).

export type AdminSchemas = components['schemas'];
export type AdminPaths = paths;

/** Identidade devolvida por `GET /me`. */
export type AdminUser = AdminSchemas['MeUser'];
export type AdminMeResponse = AdminSchemas['MeResponse'];

export interface AdminClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  getAccessToken: () => string | null;
  hasRefreshToken?: () => boolean;
  refreshAccessToken: (failedAccessToken?: string) => Promise<string>;
  onAuthFailure?: () => void;
  onForbidden?: () => void;
}

export function isAdminApiConfigured(
  adminApiUrl: string | undefined = env.adminApiUrl,
): adminApiUrl is string {
  return typeof adminApiUrl === 'string' && adminApiUrl.trim() !== '';
}

function normalizeTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

function notConfiguredError() {
  return new ApiError({
    status: 0,
    code: 'admin_api_not_configured',
    message: 'A API administrativa (VITE_ADMIN_API_URL) não está configurada.',
  });
}

/**
 * Resolve o caminho contra a URL base da API de admin e garante que o token
 * jamais saia para outro host ou prefixo de caminho.
 */
export function resolveAdminUrl(
  baseUrl: string | undefined,
  path: string,
): string {
  if (!isAdminApiConfigured(baseUrl)) {
    throw notConfiguredError();
  }

  const base = new URL(normalizeTrailingSlash(baseUrl));
  const trimmed = path.trim();

  if (trimmed.startsWith('//')) {
    throw new ApiError({
      status: 0,
      code: clientErrorCodes.badRequest,
      message: 'Destino inválido para a API administrativa.',
    });
  }

  const relativePath =
    trimmed.startsWith('/') && !/^https?:\/\//i.test(trimmed)
      ? trimmed.replace(/^\/+/, '')
      : trimmed;

  const target = new URL(relativePath, base);
  if (
    target.origin !== base.origin ||
    !target.pathname.startsWith(base.pathname)
  ) {
    throw new ApiError({
      status: 0,
      code: clientErrorCodes.badRequest,
      message:
        'O token administrativo só pode ser enviado para a API de admin configurada.',
    });
  }

  return target.href;
}

const isJsonContentType = (response: Response) =>
  /[/+]json\b/i.test(response.headers.get('Content-Type') ?? '');

const hasBody = (response: Response) =>
  response.status !== 204 && response.headers.get('Content-Length') !== '0';

const GENERIC_SERVER_MESSAGE =
  'O servidor não conseguiu responder. Tente de novo mais tarde.';

/** Normaliza a resposta de erro, com mensagens próprias para 502/504 sem corpo. */
export async function normalizeAdminError(
  response: Response,
): Promise<ApiError> {
  const error = await apiErrorFromResponse(response);

  if (response.status === 502 && error.message === GENERIC_SERVER_MESSAGE) {
    return new ApiError({
      status: 502,
      code: error.code,
      message:
        'Falha na comunicação com o serviço de processamento (ETL). Sua sessão continua ativa; tente novamente em instantes.',
      details: error.details,
    });
  }

  if (response.status === 504 && error.message === GENERIC_SERVER_MESSAGE) {
    return new ApiError({
      status: 504,
      code: error.code,
      message:
        'O serviço de processamento (ETL) demorou para responder (tempo esgotado). Sua sessão continua ativa; tente novamente em instantes.',
      details: error.details,
    });
  }

  return error;
}

export function createAdminClient(options: AdminClientOptions) {
  const getBaseUrl = () => options.baseUrl ?? env.adminApiUrl;
  const fetchFn =
    options.fetch ?? ((...args: Parameters<typeof fetch>) => fetch(...args));
  let authFailureHandler = options.onAuthFailure;
  let forbiddenHandler = options.onForbidden;

  async function sendWithToken(
    request: Request,
    token: string,
  ): Promise<Response> {
    const headers = new Headers(request.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Accept')) headers.set('Accept', 'application/json');
    try {
      return await fetchFn(new Request(request, { headers }));
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw networkError(error);
    }
  }

  async function obtainToken(): Promise<string> {
    const token = options.getAccessToken();
    if (token) return token;
    if (options.hasRefreshToken?.()) {
      try {
        return await options.refreshAccessToken();
      } catch (error) {
        if (!isAbortError(error)) authFailureHandler?.();
        throw error;
      }
    }
    authFailureHandler?.();
    throw new ApiError({
      status: 401,
      code: clientErrorCodes.unauthorized,
      message: 'Sessão não autenticada.',
    });
  }

  /**
   * `fetch` entregue ao `openapi-fetch`: confere o destino, injeta o Bearer e
   * faz a renovação com uma única repetição em 401.
   */
  async function authorizedFetch(request: Request): Promise<Response> {
    resolveAdminUrl(getBaseUrl(), request.url);
    const retryRequest = request.clone();

    const token = await obtainToken();
    let response = await sendWithToken(request, token);
    if (response.status !== 401) return response;

    let nextToken: string;
    try {
      nextToken = await options.refreshAccessToken(token);
    } catch (error) {
      if (!isAbortError(error)) authFailureHandler?.();
      throw error;
    }

    response = await sendWithToken(retryRequest, nextToken);
    if (response.status === 401) authFailureHandler?.();
    return response;
  }

  const errorMiddleware: Middleware = {
    async onResponse({ response, options: requestOptions }) {
      if (!response.ok) {
        if (response.status === 403) forbiddenHandler?.();
        throw await normalizeAdminError(response);
      }
      if (
        requestOptions.parseAs === 'json' &&
        hasBody(response) &&
        !isJsonContentType(response)
      ) {
        throw new ApiError({
          status: response.status,
          code: clientErrorCodes.invalidResponse,
          message: 'A API administrativa respondeu num formato inesperado.',
        });
      }
      return undefined;
    },
    onError({ error }) {
      if (isAbortError(error) || isApiError(error)) return undefined;
      return networkError(error);
    },
  };

  let cached: { baseUrl: string; client: Client<paths> } | null = null;

  /** Cliente `openapi-fetch` tipado pelo OpenAPI da API de admin. */
  function api(): Client<paths> {
    const baseUrl = getBaseUrl();
    if (!isAdminApiConfigured(baseUrl)) throw notConfiguredError();
    if (cached?.baseUrl !== baseUrl) {
      const client = createClient<paths>({
        baseUrl: normalizeTrailingSlash(baseUrl).replace(/\/$/, ''),
        fetch: authorizedFetch,
      });
      client.use(errorMiddleware);
      cached = { baseUrl, client };
    }
    return cached.client;
  }

  async function fetchMe(signal?: AbortSignal): Promise<AdminMeResponse> {
    return unwrap(api().GET('/me', { signal }));
  }

  return {
    isConfigured: () => isAdminApiConfigured(getBaseUrl()),
    api,
    fetchMe,
    setAuthFailureHandler(handler: (() => void) | undefined) {
      authFailureHandler = handler;
    },
    setForbiddenHandler(handler: (() => void) | undefined) {
      forbiddenHandler = handler;
    },
  };
}

export type AdminClient = ReturnType<typeof createAdminClient>;

export const admin = createAdminClient({
  getAccessToken: () => idp.getAccessToken(),
  hasRefreshToken: () => idp.hasRefreshToken(),
  refreshAccessToken: (failedAccessToken) =>
    idp.refreshAccessToken({ failedAccessToken }),
});

/** Atalho para o cliente tipado da instância única: `adminApi().GET('/admins')`. */
export const adminApi = () => admin.api();

export const fetchMe = (signal?: AbortSignal) => admin.fetchMe(signal);

/**
 * Para chamadas sem corpo de resposta (ex.: `DELETE` com `204`): o
 * middleware já rejeitou os erros, então só falta descartar o resultado.
 */
export async function unwrapEmpty(
  request: Promise<{ response: Response }>,
): Promise<void> {
  await request;
}
