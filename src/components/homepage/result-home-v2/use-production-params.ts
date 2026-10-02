// Parâmetros das abas de produção guardados na URL, ao lado dos filtros da busca.
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchProductionsV2Params } from '../../../services/productions-v2';
import { FilterValueV2 } from '../../../services/researchers-v2';
import {
  ProductionKindV2,
  ProductionSortByV2,
} from '../../../types/production-v2';
import { ProfileSearchState } from '../categorias/researchers-profile-home/hooks/use-profile-search-state';
import { PRODUCTION_DEFINITIONS } from './production-registry';

const SORT_PARAM = 'production_sort';
const QUALIS_PARAM = 'qualis';
const OPEN_ACCESS_PARAM = 'open_access';

/** Parâmetros de URL exclusivos das produções (limpos junto com os filtros). */
export const PRODUCTION_FILTER_PARAMS = [QUALIS_PARAM, OPEN_ACCESS_PARAM];

/** Filtros da busca que as rotas de produção também aceitam. */
const SHARED_FILTERS = [
  'institution_id',
  'graduate_program_id',
  'year_start',
  'year_end',
];

/** Filtros da busca sem equivalente nas rotas de produção. */
const RESEARCHER_ONLY_FILTERS = ['city_id', 'identity_territory'];

export function useProductionParams(state: ProfileSearchState) {
  const [searchParams, setSearchParams] = useSearchParams();

  const update = useCallback(
    (mutate: (params: URLSearchParams) => void) =>
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace: true },
      ),
    [setSearchParams],
  );

  const sortParam = searchParams.get(SORT_PARAM) as ProductionSortByV2 | null;
  const qualis = searchParams.getAll(QUALIS_PARAM);
  const openAccess = searchParams.get(OPEN_ACCESS_PARAM) === 'true';

  /** Ordenação válida para o tipo: com busca textual, relevância; sem ela, ano. */
  const sortFor = (kind: ProductionKindV2): ProductionSortByV2 => {
    const options = PRODUCTION_DEFINITIONS[kind].sortOptions;
    if (sortParam && options.includes(sortParam)) {
      if (sortParam !== 'relevance' || state.hasQuery) return sortParam;
    }
    return state.hasQuery ? 'relevance' : 'year';
  };

  const paramsFor = (
    kind: ProductionKindV2,
  ): Omit<SearchProductionsV2Params, 'page' | 'perPage'> => {
    const filters: Record<string, FilterValueV2> = {};
    SHARED_FILTERS.forEach((param) => {
      filters[param] = state.filters[param];
    });
    if (kind === 'article') {
      filters.qualis = qualis;
      filters.has_open_access = openAccess ? 'true' : undefined;
    }
    const sortBy = sortFor(kind);
    return {
      q: state.q,
      filters,
      sortBy,
      sortOrder: sortBy === 'title' ? 'asc' : 'desc',
    };
  };

  const setSort = (value: ProductionSortByV2) =>
    update((params) => params.set(SORT_PARAM, value));

  const toggleQualis = (value: string) =>
    update((params) => {
      const next = qualis.includes(value)
        ? qualis.filter((item) => item !== value)
        : [...qualis, value];
      params.delete(QUALIS_PARAM);
      next.forEach((item) => params.append(QUALIS_PARAM, item));
    });

  const setOpenAccess = (value: boolean) =>
    update((params) => {
      if (value) params.set(OPEN_ACCESS_PARAM, 'true');
      else params.delete(OPEN_ACCESS_PARAM);
    });

  const hasResearcherOnlyFilters = RESEARCHER_ONLY_FILTERS.some(
    (param) => state.getMulti(param).length > 0,
  );

  return {
    sortFor,
    setSort,
    qualis,
    toggleQualis,
    openAccess,
    setOpenAccess,
    paramsFor,
    hasResearcherOnlyFilters,
  };
}

export type ProductionParams = ReturnType<typeof useProductionParams>;
