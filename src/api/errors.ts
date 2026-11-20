import type { Middleware } from 'openapi-fetch';
import type { components } from './generated/simcc-v2';

// Normalização de erros da API v2 (ADR 0003).
//
// Toda falha de chamada à v2 chega ao resto do app como `ApiError`:
// - erro da v2: `{ error: { code, message, details } }`;
// - formato antigo do FastAPI, aceito durante a transição: `{ detail: "..." }`
//   ou `{ detail: [{ loc, msg, type, input }] }` (422);
// - corpo não-JSON ou fora desses formatos (ex.: página de erro do proxy):
//   código e mensagem derivados do status HTTP;
// - falha de rede: `status: 0`, `code: 'network_error'`.
// Cancelamento (`AbortError`) não é erro da API: passa adiante sem conversão.

export type ApiErrorDetail = components['schemas']['ErrorDetail'];
type ErrorResponse = components['schemas']['ErrorResponse'];

/** Códigos que o próprio front atribui quando o corpo não traz um código da v2. */
export const clientErrorCodes = {
  network: 'network_error',
  invalidResponse: 'invalid_response',
  badRequest: 'bad_request',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not_found',
  validation: 'validation_error',
  rateLimited: 'rate_limited',
  server: 'server_error',
  http: 'http_error',
} as const;

export type ApiErrorInit = {
  /** Status HTTP; 0 quando não houve resposta (falha de rede). */
  status: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  cause?: unknown;
};

export class ApiError extends Error {
  override readonly name = 'ApiError';
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor({ status, code, message, details = [], cause }: ApiErrorInit) {
    super(message, cause === undefined ? undefined : { cause });
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

const fallbackByStatus: Record<number, { code: string; message: string }> = {
  400: { code: clientErrorCodes.badRequest, message: 'Requisição inválida.' },
  401: {
    code: clientErrorCodes.unauthorized,
    message: 'Acesso não autorizado.',
  },
  403: { code: clientErrorCodes.forbidden, message: 'Acesso negado.' },
  404: { code: clientErrorCodes.notFound, message: 'Recurso não encontrado.' },
  422: { code: clientErrorCodes.validation, message: 'Parâmetros inválidos.' },
  429: {
    code: clientErrorCodes.rateLimited,
    message: 'Muitas requisições. Tente de novo em instantes.',
  },
};

function fallbackFor(status: number) {
  const known = fallbackByStatus[status];
  if (known) return known;
  if (status >= 500) {
    return {
      code: clientErrorCodes.server,
      message: 'O servidor não conseguiu responder. Tente de novo mais tarde.',
    };
  }
  return {
    code: clientErrorCodes.http,
    message: `Erro ao consultar a API (HTTP ${status}).`,
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

const optionalString = (value: unknown) =>
  typeof value === 'string' ? value : null;

function parseV2Details(value: unknown): ApiErrorDetail[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).flatMap((item) =>
    nonEmptyString(item.message)
      ? [
          {
            field: optionalString(item.field),
            message: item.message,
            type: optionalString(item.type),
            input: item.input ?? null,
          },
        ]
      : [],
  );
}

function isV2Error(body: unknown): body is ErrorResponse {
  return (
    isRecord(body) &&
    isRecord(body.error) &&
    nonEmptyString(body.error.code) &&
    nonEmptyString(body.error.message)
  );
}

/** Onde o FastAPI coloca o parâmetro no `loc` (`['query', 'page']`). */
const legacyLocSources = new Set(['query', 'path', 'body', 'header', 'cookie']);

function parseLegacyDetails(items: unknown[]): ApiErrorDetail[] {
  return items.filter(isRecord).flatMap((item) => {
    if (!nonEmptyString(item.msg)) return [];
    const loc = Array.isArray(item.loc) ? item.loc.map(String) : [];
    const path =
      loc.length > 1 && legacyLocSources.has(loc[0] ?? '') ? loc.slice(1) : loc;
    return [
      {
        field: path.length ? path.join('.') : null,
        message: item.msg,
        type: optionalString(item.type),
        input: item.input ?? null,
      },
    ];
  });
}

/**
 * Converte o corpo de uma resposta de erro (já lido; JSON ou texto) em
 * `ApiError`. Função pura: não lança e sempre devolve um erro utilizável.
 */
export function normalizeErrorBody(
  status: number,
  body: unknown,
  cause?: unknown,
): ApiError {
  if (isV2Error(body)) {
    return new ApiError({
      status,
      code: body.error.code,
      message: body.error.message,
      details: parseV2Details(body.error.details),
      cause,
    });
  }

  const fallback = fallbackFor(status);

  if (isRecord(body) && 'detail' in body) {
    const { detail } = body;
    if (nonEmptyString(detail)) {
      return new ApiError({
        status,
        code: fallback.code,
        message: detail,
        cause,
      });
    }
    if (Array.isArray(detail)) {
      return new ApiError({
        status,
        code: status === 422 ? clientErrorCodes.validation : fallback.code,
        message: fallback.message,
        details: parseLegacyDetails(detail),
        cause,
      });
    }
  }

  return new ApiError({ status, ...fallback, cause });
}

/** Lê o corpo de uma resposta de erro e o normaliza. Nunca lança. */
export async function apiErrorFromResponse(
  response: Response,
): Promise<ApiError> {
  let text = '';
  try {
    text = await response.text();
  } catch {
    // Corpo ilegível conta como corpo vazio.
  }
  let body: unknown = text;
  try {
    body = text ? JSON.parse(text) : undefined;
  } catch {
    // Não-JSON (ex.: HTML do proxy): fica como texto e cai no fallback.
  }
  return normalizeErrorBody(response.status, body);
}

export function isAbortError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

export function networkError(cause: unknown): ApiError {
  return new ApiError({
    status: 0,
    code: clientErrorCodes.network,
    message:
      'Não foi possível conectar à API. Verifique sua conexão e tente de novo.',
    cause,
  });
}

const isJsonContentType = (response: Response) =>
  /[/+]json\b/i.test(response.headers.get('Content-Type') ?? '');

const hasBody = (response: Response) =>
  response.status !== 204 && response.headers.get('Content-Length') !== '0';

/**
 * Middleware do `openapi-fetch`: toda chamada que não termina em sucesso
 * rejeita com `ApiError`.
 *
 * - resposta não-2xx → erro normalizado do corpo;
 * - 2xx com corpo que não é JSON quando se espera JSON (ex.: `index.html`
 *   servido no lugar da API por URL base errada) → `invalid_response`;
 * - falha de rede → `network_error`; cancelamento passa sem conversão.
 */
export const apiErrorMiddleware: Middleware = {
  async onResponse({ response, options }) {
    if (!response.ok) {
      throw await apiErrorFromResponse(response);
    }
    if (
      options.parseAs === 'json' &&
      hasBody(response) &&
      !isJsonContentType(response)
    ) {
      throw new ApiError({
        status: response.status,
        code: clientErrorCodes.invalidResponse,
        message: 'A API respondeu num formato inesperado.',
      });
    }
    return undefined;
  },
  onError({ error }) {
    if (isAbortError(error) || isApiError(error)) return undefined;
    return networkError(error);
  },
};
