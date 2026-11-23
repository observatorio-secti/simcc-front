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
  adaptOdaInstitutions,
  adaptOdaKnowledgeAreas,
  adaptOdaStates,
  type OdaInstitutionOption,
  type OdaKnowledgeAreaOption,
  type OdaStateOption,
  type ResearchGroup,
  type ResearchGroupListResult,
  type ResearchGroupResearchersResult,
} from './adapter';
import {
  odaGroupDetailResponseSchema,
  odaGroupListResponseSchema,
  odaGroupResearchersResponseSchema,
  odaInstitutionListResponseSchema,
  odaKnowledgeAreaListResponseSchema,
  odaStateListResponseSchema,
} from './schemas';

const DEFAULT_PAGE_SIZE = 100;

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

export type OdaGroupSortField = 'nome' | 'anoFormacao' | 'situacao';
export type OdaSortOrder = 'asc' | 'desc';

export interface ListOdaGroupsParams {
  page?: number;
  size?: number;
  q?: string;
  situacao?: string;
  areaConhecimentoId?: string;
  estadoId?: string;
  uf?: string;
  instituicaoId?: string;
  cidade?: string;
  anoFormacao?: number;
  ordenarPor?: OdaGroupSortField;
  ordem?: OdaSortOrder;
  signal?: AbortSignal;
}

export interface ListOdaKnowledgeAreasParams {
  page?: number;
  size?: number;
  nome?: string;
  tipo?: 'GRANDE_AREA' | 'AREA' | 'SUBAREA' | 'TOPICO';
  signal?: AbortSignal;
}

export interface ListOdaInstitutionsParams {
  page?: number;
  size?: number;
  nome?: string;
  uf?: string;
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
    const trimmedQuery = params.q?.trim();
    const raw = await requestJson(
      'grupos-pesquisa/simcc',
      odaGroupListResponseSchema,
      {
        query: {
          page,
          size,
          ...(trimmedQuery
            ? { q: trimmedQuery, modoBusca: 'textual' }
            : undefined),
          situacao: params.situacao?.trim() || undefined,
          areaConhecimentoId: params.areaConhecimentoId?.trim() || undefined,
          estadoId: params.estadoId?.trim() || undefined,
          uf: params.uf?.trim().toUpperCase() || undefined,
          instituicaoId: params.instituicaoId?.trim() || undefined,
          cidade: params.cidade?.trim() || undefined,
          anoFormacao: params.anoFormacao,
          ordenarPor: params.ordenarPor,
          ordem: params.ordem,
        },
        signal: params.signal,
      },
    );
    return adaptOdaGroupList(raw, page, size, normalizedBase);
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

  async function listStates(
    options: GetOdaGroupOptions = {},
  ): Promise<OdaStateOption[]> {
    const raw = await requestJson('uf', odaStateListResponseSchema, {
      signal: options.signal,
    });
    return adaptOdaStates(raw);
  }

  async function listKnowledgeAreas(
    params: ListOdaKnowledgeAreasParams = {},
  ): Promise<OdaKnowledgeAreaOption[]> {
    const raw = await requestJson(
      'area-conhecimento',
      odaKnowledgeAreaListResponseSchema,
      {
        query: {
          page: params.page ?? 1,
          size: params.size ?? 100,
          nome: params.nome?.trim() || undefined,
          tipo: params.tipo,
        },
        signal: params.signal,
      },
    );
    return adaptOdaKnowledgeAreas(raw);
  }

  async function listInstitutions(
    params: ListOdaInstitutionsParams = {},
  ): Promise<OdaInstitutionOption[]> {
    const raw = await requestJson(
      'instituicao',
      odaInstitutionListResponseSchema,
      {
        query: {
          page: params.page ?? 1,
          size: params.size ?? 100,
          nome: params.nome?.trim() || undefined,
          uf: params.uf?.trim().toUpperCase() || undefined,
        },
        signal: params.signal,
      },
    );
    return adaptOdaInstitutions(raw);
  }

  return {
    isConfigured: Boolean(normalizedBase),
    listGroupsPage,
    getGroup,
    listGroupResearchers,
    listStates,
    listKnowledgeAreas,
    listInstitutions,
  };
}

/**
 * Cliente padrão da API ODA. Seguro para importar mesmo quando
 * `VITE_ODA_API_URL` não está definida; nesse caso as chamadas rejeitam com
 * `ApiError` (`code: 'oda_not_configured'`).
 */
export const oda = createOdaClient(env.odaApiUrl);
