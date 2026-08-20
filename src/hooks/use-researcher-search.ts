import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getSearchResearchersPage,
  getOpenAlexResearchers,
  SearchResearchersParams,
} from '../services/researchers';
import { Research, ResearchOpenAlex } from '../types/researcher';

/**
 * Hook de busca paginada sob demanda de pesquisadores (100 itens por página).
 */
export const useSearchResearchersInfinite = (
  params: Omit<SearchResearchersParams, 'page'>,
  enabled: boolean = true,
) => {
  return useInfiniteQuery<Research[], Error>({
    queryKey: ['search-researchers-infinite', params],
    queryFn: ({ pageParam = 1 }) =>
      getSearchResearchersPage({ ...params, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // Se a última página retornou menos de 100 itens ou veio vazia, não há próxima página
      if (!lastPage || lastPage.length < 100) {
        return undefined;
      }
      return (lastPageParam as number) + 1;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
};

/**
 * Hook de busca de autores no OpenAlex
 */
export const useOpenAlexResearchers = (
  terms?: string,
  enabled: boolean = false,
) => {
  return useQuery<ResearchOpenAlex[], Error>({
    queryKey: ['open-alex-researchers', terms],
    queryFn: () => getOpenAlexResearchers(terms),
    enabled: enabled && Boolean(terms && terms.trim().length > 0),
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};
