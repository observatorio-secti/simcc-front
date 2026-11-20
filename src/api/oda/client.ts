import type { z } from 'zod';
import { env } from '@/config/env';
import {
  ApiError,
  apiErrorFromResponse,
  clientErrorCodes,
  isAbortError,
  isApiError,
  networkError,
} from '../errors';
import {
  adaptOdaGroupDetail,
  adaptOdaGroupList,
  adaptOdaGroupResearchers,
  type ResearchGroup,
  type ResearchGroupListResult,
  type ResearchGroupResearchersResult,
} from './adapter';
import {
  odaGroupDetailResponseSchema,
  odaGroupListResponseSchema,
  odaGroupResearchersResponseSchema,
} from './schemas';

const DEFAULT_PAGE_SIZE = 100;
const SIMCC_SINGLE_SHOT_SIZE = 10000;
const SIMCC_MAX_PAGES = 100;
const SIMCC_BATCH_SIZE = 6;

export const odaErrorCodes = {
  notConfigured: 'oda_not_configured',
} as const;

export function odaBaseUrl(apiUrl: string): string {
  const trimmed = apiUrl.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

function unconfiguredOdaError(): ApiError {
  return new ApiError({
    status: 0,
    code: odaErrorCodes.notConfigured,
    message:
      'A API ODA não está configurada para consultar grupos de pesquisa.',
  });
}

function invalidIdError(): ApiError {
  return new ApiError({
    status: 400,
    code: clientErrorCodes.badRequest,
    message: 'Identificador do grupo de pesquisa inválido.',
  });
}

function validationApiError(status: number, zodError: z.ZodError): ApiError {
  return new ApiError({
    status,
    code: clientErrorCodes.invalidResponse,
    message: 'A resposta da API ODA não corresponde ao formato esperado.',
    details: zodError.issues.map((issue) => ({
      field: issue.path.length ? issue.path.map(String).join('.') : null,
      message: issue.message,
      type: issue.code,
      input: null,
    })),
    cause: zodError,
  });
}

const isJsonContentType = (response: Response) => {
  const contentType = response.headers.get('Content-Type');
  return !contentType || /[/+]json\b/i.test(contentType);
};

export interface OdaClientOptions {
  fetch?: typeof fetch;
}

export interface ListOdaGroupsParams {
  page?: number;
  size?: number;
  signal?: AbortSignal;
}

export interface ListAllOdaGroupsOptions {
  pageSize?: number;
  maxPages?: number;
  batchSize?: number;
  signal?: AbortSignal;
}

export interface GetOdaGroupOptions {
  signal?: AbortSignal;
}

/** Cria o cliente HTTP da API ODA com validação Zod na borda e erros em `ApiError`. */
export function createOdaClient(
  apiUrl: string | undefined,
  options?: OdaClientOptions,
) {
  const normalizedBase = apiUrl?.trim() ? odaBaseUrl(apiUrl) : undefined;
  const runFetch: typeof fetch = (input, init) =>
    options?.fetch ? options.fetch(input, init) : fetch(input, init);

  async function requestJson<T>(
    path: string,
    schema: z.ZodType<T>,
    init?: {
      query?: Record<string, string | number | undefined>;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    if (!normalizedBase) {
      throw unconfiguredOdaError();
    }

    const url = new URL(path.replace(/^\/+/, ''), normalizedBase);
    if (init?.query) {
      for (const [key, value] of Object.entries(init.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    let response: Response;
    try {
      response = await runFetch(url.href, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: init?.signal,
      });
    } catch (error) {
      if (isAbortError(error)) throw error;
      if (isApiError(error)) throw error;
      throw networkError(error);
    }

    if (!response.ok) {
      throw await apiErrorFromResponse(response);
    }

    if (!isJsonContentType(response)) {
      throw new ApiError({
        status: response.status,
        code: clientErrorCodes.invalidResponse,
        message: 'A API ODA respondeu num formato inesperado.',
      });
    }

    let rawJson: unknown;
    try {
      rawJson = await response.json();
    } catch (error) {
      throw new ApiError({
        status: response.status,
        code: clientErrorCodes.invalidResponse,
        message: 'A API ODA respondeu num formato inesperado.',
        cause: error,
      });
    }

    const parsed = schema.safeParse(rawJson);
    if (!parsed.success) {
      throw validationApiError(response.status, parsed.error);
    }
    return parsed.data;
  }

  async function listGroupsPage(
    params: ListOdaGroupsParams = {},
  ): Promise<ResearchGroupListResult> {
    const page = params.page ?? 1;
    const size = params.size ?? DEFAULT_PAGE_SIZE;
    const raw = await requestJson(
      'grupos-pesquisa/simcc',
      odaGroupListResponseSchema,
      {
        query: { page, size },
        signal: params.signal,
      },
    );
    return adaptOdaGroupList(raw, page, size, normalizedBase);
  }

  async function listAllGroups(
    listOptions: ListAllOdaGroupsOptions = {},
  ): Promise<ResearchGroup[]> {
    const pageSize = listOptions.pageSize ?? SIMCC_SINGLE_SHOT_SIZE;
    const maxPages = listOptions.maxPages ?? SIMCC_MAX_PAGES;
    const batchSize = Math.max(1, listOptions.batchSize ?? SIMCC_BATCH_SIZE);

    const first = await listGroupsPage({
      page: 1,
      size: pageSize,
      signal: listOptions.signal,
    });
    if (first.items.length === 0) return [];
    if (
      first.meta.totalItems > 0 &&
      first.items.length >= first.meta.totalItems
    ) {
      return first.items;
    }

    const actualSize = first.meta.size > 0 ? first.meta.size : pageSize;
    const fromTotal =
      first.meta.totalItems > 0
        ? Math.ceil(first.meta.totalItems / actualSize)
        : null;
    const totalPages = Math.min(
      fromTotal ?? first.meta.totalPages ?? 1,
      maxPages,
    );
    if (totalPages <= 1) return first.items;

    const byPage: ResearchGroup[][] = Array.from(
      { length: totalPages },
      (): ResearchGroup[] => [],
    );
    byPage[0] = first.items;

    const remainingPages: number[] = [];
    for (let page = 2; page <= totalPages; page += 1) {
      remainingPages.push(page);
    }

    for (let index = 0; index < remainingPages.length; index += batchSize) {
      const batch = remainingPages.slice(index, index + batchSize);
      const results = await Promise.all(
        batch.map((page) =>
          listGroupsPage({
            page,
            size: actualSize,
            signal: listOptions.signal,
          }),
        ),
      );
      results.forEach((result, offset) => {
        const pageNumber = batch[offset];
        if (pageNumber !== undefined) {
          byPage[pageNumber - 1] = result.items;
        }
      });
    }

    return byPage.flat();
  }

  async function getGroup(
    id: string,
    getOptions: GetOdaGroupOptions = {},
  ): Promise<ResearchGroup> {
    const trimmed = id.trim();
    if (!trimmed) throw invalidIdError();

    const raw = await requestJson(
      `grupos-pesquisa/${encodeURIComponent(trimmed)}`,
      odaGroupDetailResponseSchema,
      { signal: getOptions.signal },
    );
    return adaptOdaGroupDetail(raw, normalizedBase);
  }

  async function listGroupResearchers(
    id: string,
    params: ListOdaGroupsParams = {},
  ): Promise<ResearchGroupResearchersResult> {
    const trimmed = id.trim();
    if (!trimmed) throw invalidIdError();

    const page = params.page ?? 1;
    const size = params.size ?? DEFAULT_PAGE_SIZE;
    const raw = await requestJson(
      `grupos-pesquisa/${encodeURIComponent(trimmed)}/pesquisadores`,
      odaGroupResearchersResponseSchema,
      {
        query: { page, size },
        signal: params.signal,
      },
    );
    return adaptOdaGroupResearchers(raw, page, size, normalizedBase);
  }

  return {
    isConfigured: Boolean(normalizedBase),
    listGroupsPage,
    listAllGroups,
    getGroup,
    listGroupResearchers,
  };
}

/**
 * Cliente padrão da API ODA. Seguro para importar mesmo quando
 * `VITE_ODA_API_URL` não está definida; nesse caso as chamadas rejeitam com
 * `ApiError` (`code: 'oda_not_configured'`).
 */
export const oda = createOdaClient(env.odaApiUrl);
