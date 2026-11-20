import createClient from 'openapi-fetch';
import { env } from '@/config/env';
import {
  ApiError,
  apiErrorMiddleware,
  clientErrorCodes,
  normalizeErrorBody,
} from './errors';
import type { paths } from './generated/simcc-v2';

/**
 * Base da v2 a partir da URL da API (`<url>v2`). O OpenAPI da v2 declara
 * `servers: [{ url: '/v2' }]` e caminhos sem o prefixo (`/researcher`).
 */
export function simccV2BaseUrl(apiUrl: string): string {
  return new URL('v2', apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`).href;
}

/** Cria um cliente da v2 com a normalização de erro instalada. */
export function createSimccClient(apiUrl: string) {
  const client = createClient<paths>({ baseUrl: simccV2BaseUrl(apiUrl) });
  client.use(apiErrorMiddleware);
  return client;
}

/**
 * Cliente único da API v2. Toda chamada que falha rejeita com `ApiError`.
 * Use com `unwrap` para receber o corpo já sem `undefined`:
 *
 *     unwrap(simcc.GET('/researcher/{researcher_id}', {
 *       params: { path: { researcher_id: id } },
 *       signal,
 *     }))
 */
export const simcc = createSimccClient(env.simccApiUrl);

type ClientResult<T> = {
  data?: T;
  error?: unknown;
  response: Response;
};

/**
 * Devolve o corpo de uma chamada do `openapi-fetch` ou rejeita com `ApiError`.
 * Com o middleware o ramo `error` não acontece; ele é tratado aqui para o
 * helper valer também em clientes sem middleware.
 */
export async function unwrap<T>(request: Promise<ClientResult<T>>): Promise<T> {
  const { data, error, response } = await request;
  if (error !== undefined || !response.ok) {
    throw normalizeErrorBody(response.status, error);
  }
  if (data === undefined) {
    throw new ApiError({
      status: response.status,
      code: clientErrorCodes.invalidResponse,
      message: 'A API respondeu sem conteúdo.',
    });
  }
  return data;
}
