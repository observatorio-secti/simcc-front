import { api } from '../lib/api';
import { FilterValueV2, serializeParams } from './researchers-v2';
import { SortOrderV2 } from '../types/researcher-v2';
import {
  ProductionDetailByKindV2,
  ProductionKindV2,
  ProductionSearchResponseV2,
  ProductionSortByV2,
  ProductionSummaryByKindV2,
} from '../types/production-v2';

export interface SearchProductionsV2Params {
  q?: string;
  /** Filtros no formato da API (institution_id, year_start, qualis...). */
  filters?: Record<string, FilterValueV2>;
  page?: number;
  perPage?: number;
  sortBy?: ProductionSortByV2;
  sortOrder?: SortOrderV2;
}

/**
 * Lista produções canônicas de um tipo (GET /v2/production/{kind}).
 */
export const searchProductionsV2 = async <K extends ProductionKindV2>(
  kind: K,
  params: SearchProductionsV2Params,
): Promise<ProductionSearchResponseV2<ProductionSummaryByKindV2[K]>> => {
  const { q, filters = {}, page = 1, perPage = 12, sortBy, sortOrder } = params;

  const query: Record<string, FilterValueV2> = {
    q: q?.trim() || undefined,
    ...filters,
    page,
    per_page: perPage,
    by: sortBy,
    order: sortOrder,
  };

  const { data } = await api.get(`v2/production/${kind}`, {
    params: query,
    paramsSerializer: { serialize: serializeParams },
  });
  return data;
};

/**
 * Detalhe de uma produção (GET /v2/production/{kind}/{id}).
 */
export const getProductionDetailV2 = async <K extends ProductionKindV2>(
  kind: K,
  id: string,
): Promise<ProductionDetailByKindV2[K]> => {
  const { data } = await api.get(
    `v2/production/${kind}/${encodeURIComponent(id)}`,
  );
  return data;
};
