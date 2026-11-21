import { z } from 'zod';
import { env } from '@/config/env';
import {
  ApiError,
  apiErrorFromResponse,
  clientErrorCodes,
  isAbortError,
  networkError,
} from './errors';
import { idp } from './idp';

// Cliente da API administrativa (`simcc-admin`).
//
// Envia `Authorization: Bearer <token>` exclusivamente para `env.adminApiUrl`,
// normaliza erros `{ detail }` do FastAPI em `ApiError` e trata 401 (renovação
// em fila única + 1 repetição), 403 (acesso negado) e 502/504 (erro de ação
// sem derrubar a sessão). Veja ADR 0008.

export const adminUserSchema = z.object({
  sub: z.string().min(1),
  name: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
  email: z
    .string()
    .nullish()
    .transform((v) => v ?? null),
});

export const adminMeSchema = z.object({
  user: adminUserSchema,
  is_admin: z.boolean(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;
export type AdminMeResponse = z.infer<typeof adminMeSchema>;

export interface AdminClientOptions {
  baseUrl?: string;
  fetch?: typeof globalThis.fetch;
  getAccessToken: () => string | null;
  hasRefreshToken?: () => boolean;
  refreshAccessToken: (failedAccessToken?: string) => Promise<string>;
  onAuthFailure?: () => void;
}

export interface AdminRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
}

export function isAdminApiConfigured(
  adminApiUrl: string | undefined = env.adminApiUrl,
): adminApiUrl is string {
  return typeof adminApiUrl === 'string' && adminApiUrl.trim() !== '';
}

function normalizeTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
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
    throw new ApiError({
      status: 0,
      code: 'admin_api_not_configured',
      message:
        'A API administrativa (VITE_ADMIN_API_URL) não está configurada.',
    });
  }

  const normalizedBase = normalizeTrailingSlash(baseUrl);
  const base = new URL(normalizedBase);
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

async function normalizeAdminError(response: Response): Promise<ApiError> {
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

  function notifyAuthFailure() {
    authFailureHandler?.();
  }

  async function executeFetch(
    url: string,
    token: string,
    init: AdminRequestOptions,
  ): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    try {
      return await fetchFn(url, {
        ...init,
        headers,
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      throw networkError(error);
    }
  }

  async function request<T>(
    path: string,
    init: AdminRequestOptions = {},
  ): Promise<T> {
    const url = resolveAdminUrl(getBaseUrl(), path);

    let token = options.getAccessToken();
    if (!token) {
      if (options.hasRefreshToken?.()) {
        try {
          token = await options.refreshAccessToken();
        } catch (error) {
          if (!isAbortError(error)) {
            notifyAuthFailure();
          }
          throw error;
        }
      } else {
        notifyAuthFailure();
        throw new ApiError({
          status: 401,
          code: clientErrorCodes.unauthorized,
          message: 'Sessão não autenticada.',
        });
      }
    }

    let response = await executeFetch(url, token, init);

    if (response.status === 401) {
      let nextToken: string;
      try {
        nextToken = await options.refreshAccessToken(token);
      } catch (error) {
        if (!isAbortError(error)) {
          notifyAuthFailure();
        }
        throw error;
      }

      response = await executeFetch(url, nextToken, init);

      if (response.status === 401) {
        notifyAuthFailure();
        throw await normalizeAdminError(response);
      }
    }

    if (!response.ok) {
      throw await normalizeAdminError(response);
    }

    if (!hasBody(response)) {
      return undefined as T;
    }

    if (!isJsonContentType(response)) {
      throw new ApiError({
        status: response.status,
        code: clientErrorCodes.invalidResponse,
        message: 'A API administrativa respondeu num formato inesperado.',
      });
    }

    try {
      return (await response.json()) as T;
    } catch (error) {
      throw new ApiError({
        status: response.status,
        code: clientErrorCodes.invalidResponse,
        message: 'Não foi possível ler a resposta JSON da API administrativa.',
        cause: error,
      });
    }
  }

  async function fetchMe(signal?: AbortSignal): Promise<AdminMeResponse> {
    const data = await request<unknown>('me', { method: 'GET', signal });
    const parsed = adminMeSchema.safeParse(data);
    if (!parsed.success) {
      throw new ApiError({
        status: 200,
        code: clientErrorCodes.invalidResponse,
        message: 'Formato inválido na resposta de /me da API administrativa.',
      });
    }
    return parsed.data;
  }

  return {
    isConfigured: () => isAdminApiConfigured(getBaseUrl()),
    request,
    fetchMe,
    setAuthFailureHandler(handler: (() => void) | undefined) {
      authFailureHandler = handler;
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

export const fetchMe = (signal?: AbortSignal) => admin.fetchMe(signal);
