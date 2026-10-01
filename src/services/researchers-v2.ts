import { api } from '../lib/api';
import {
  FacetKeyV2,
  ResearcherSearchResponseV2,
  SortByV2,
  SortOrderV2,
} from '../types/researcher-v2';

/** Valores de filtro aceitos pela API: listas viram chaves repetidas. */
export type FilterValueV2 = string | number | string[] | null | undefined;

export interface SearchResearchersV2Params {
  q?: string;
  /** Filtros no formato da API (institution_id, graduate_program_id, year_start...). */
  filters?: Record<string, FilterValueV2>;
  page?: number;
  perPage?: number;
  sortBy?: SortByV2;
  sortOrder?: SortOrderV2;
  facets?: FacetKeyV2[];
  facetLimit?: number;
  includeMatches?: boolean;
  matchesLimit?: number;
}

/**
 * A API (FastAPI) espera listas como chaves repetidas (`institution_id=a&institution_id=b`),
 * e não no formato padrão do axios (`institution_id[]=a`).
 */
const serializeParams = (params: Record<string, FilterValueV2>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, item));
    } else {
      search.append(key, String(value));
    }
  });
  return search.toString();
};

/**
 * Busca pesquisadores pelo perfil completo (GET /v2/researcher).
 */
export const searchResearchersV2 = async (
  params: SearchResearchersV2Params,
): Promise<ResearcherSearchResponseV2> => {
  const {
    q,
    filters = {},
    page = 1,
    perPage = 24,
    sortBy,
    sortOrder,
    facets = [],
    facetLimit,
    includeMatches = false,
    matchesLimit,
  } = params;

  const query: Record<string, FilterValueV2> = {
    q: q?.trim() || undefined,
    ...filters,
    page,
    per_page: perPage,
    sort_by: sortBy,
    sort_order: sortOrder,
    facets: facets.length ? facets.join(',') : undefined,
    facet_limit: facets.length ? facetLimit : undefined,
    include: includeMatches ? 'matches' : undefined,
    matches_limit: includeMatches ? matchesLimit : undefined,
  };

  const { data } = await api.get<ResearcherSearchResponseV2>('v2/researcher', {
    params: query,
    paramsSerializer: { serialize: serializeParams },
  });
  return data;
};

/** Monta a URL absoluta de um recurso da API (ex.: `image` do pesquisador). */
export const resolveApiUrl = (path?: string | null) => {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  const base = api.defaults.baseURL || '';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};
