import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query';
import {
  searchResearchersV2,
  SearchResearchersV2Params,
} from '../services/researchers-v2';
import { ResearcherSearchResponseV2 } from '../types/researcher-v2';

export const PROFILE_PAGE_SIZE = 24;

/**
 * Busca paginada sob demanda na v2. Facets só são pedidos na primeira página:
 * eles descrevem o resultado inteiro, então repeti-los nas páginas seguintes
 * só gastaria consultas extras no orçamento da API.
 */
export const useResearcherProfileSearch = (
  params: Omit<SearchResearchersV2Params, 'page'>,
  enabled: boolean = true,
) => {
  return useInfiniteQuery<ResearcherSearchResponseV2, Error>({
    queryKey: ['researcher-profile-search', params],
    queryFn: ({ pageParam = 1 }) => {
      const page = pageParam as number;
      return searchResearchersV2({
        ...params,
        page,
        facets: page === 1 ? params.facets : [],
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.has_next ? lastPage.pagination.page + 1 : undefined,
    // Mantém resultado e facets na tela enquanto a nova combinação de filtros carrega.
    placeholderData: keepPreviousData,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Facets do mapa (território e cidade) numa consulta própria: `per_page=1`,
 * sem evidências e com o limite máximo de valores, para o mapa cobrir o
 * resultado inteiro. Isolada da listagem, uma falha aqui não derruba a página.
 */
export const useResearcherMapFacets = (
  params: Pick<
    SearchResearchersV2Params,
    'q' | 'filters' | 'facets' | 'facetLimit'
  >,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['researcher-profile-map-facets', params],
    queryFn: async () =>
      (
        await searchResearchersV2({
          ...params,
          page: 1,
          perPage: 1,
        })
      ).facets,
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(params.facets?.length),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

/** Quantidade de pesquisadores na nuvem de palavras. */
export const CLOUD_SIZE = 10;

/**
 * Pesquisadores com mais obras que casam com a busca (`sort_by=matches`),
 * para a nuvem de palavras. Consulta própria, independente da ordenação da
 * listagem; `matches.total` traz a contagem usada na ordenação.
 */
export const useResearcherCloud = (
  params: Pick<SearchResearchersV2Params, 'q' | 'filters'>,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: ['researcher-profile-cloud', params],
    queryFn: async () =>
      (
        await searchResearchersV2({
          ...params,
          page: 1,
          perPage: CLOUD_SIZE,
          sortBy: 'matches',
          sortOrder: 'desc',
          includeMatches: true,
          matchesLimit: 1,
        })
      ).data,
    placeholderData: keepPreviousData,
    enabled: enabled && Boolean(params.q?.trim()),
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};
