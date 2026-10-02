import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  getProductionDetailV2,
  searchProductionsV2,
  SearchProductionsV2Params,
} from '../services/productions-v2';
import { ProductionKindV2 } from '../types/production-v2';

export const PRODUCTION_PAGE_SIZE = 12;

/** Busca paginada sob demanda de produções na v2. */
export const useProductionSearch = <K extends ProductionKindV2>(
  kind: K,
  params: Omit<SearchProductionsV2Params, 'page' | 'perPage'>,
  enabled: boolean = true,
) => {
  return useInfiniteQuery({
    queryKey: ['production-search', kind, params],
    queryFn: ({ pageParam }) =>
      searchProductionsV2(kind, {
        ...params,
        page: pageParam,
        perPage: PRODUCTION_PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
    // Mantém o resultado na tela enquanto a nova combinação de filtros carrega.
    placeholderData: keepPreviousData,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

/** Detalhe de uma produção, buscado só quando o usuário a abre. */
export const useProductionDetail = <K extends ProductionKindV2>(
  kind: K,
  id: string | undefined,
) => {
  return useQuery({
    queryKey: ['production-detail', kind, id],
    queryFn: () => getProductionDetailV2(kind, id as string),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
};
