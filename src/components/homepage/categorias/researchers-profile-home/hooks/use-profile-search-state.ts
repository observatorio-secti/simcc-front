// Estado da busca por perfil guardado na URL (compartilhável e sobrevive ao recarregar).
// A URL é a única fonte da verdade: a cada mudança de filtro a consulta é refeita e a
// API devolve os facets já recalculados — não há contagem guardada no frontend.
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FilterValueV2 } from '../../../../../services/researchers-v2';
import { SortByV2, SortOrderV2 } from '../../../../../types/researcher-v2';
import { termsToQuery } from '../../../../../lib/search-types';
import {
  FACET_DEFINITIONS,
  FacetDefinition,
  facetFilterParams,
} from '../facets/facet-registry';

export type ProfileView = 'pesquisadores' | 'mapa';

export const DEFAULT_FACET_LIMIT = 20;
export const EXPANDED_FACET_LIMIT = 100;

const SORT_OPTIONS: SortByV2[] = ['relevance', 'name'];

const parseYear = (value: string | null) => {
  if (!value) return null;
  const year = Number(value);
  return Number.isInteger(year) ? year : null;
};

export function useProfileSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();

  const terms = searchParams.get('terms') ?? '';
  const q = useMemo(() => termsToQuery(terms), [terms]);
  const hasQuery = q.length > 0;

  const sortParam = searchParams.get('sort_by') as SortByV2 | null;
  // Com busca textual a ordem natural é por relevância; sem ela, alfabética.
  const sortBy: SortByV2 =
    sortParam && SORT_OPTIONS.includes(sortParam)
      ? sortParam
      : hasQuery
        ? 'relevance'
        : 'name';
  const sortOrder: SortOrderV2 = sortBy === 'relevance' ? 'desc' : 'asc';

  const facetLimit =
    Number(searchParams.get('facet_limit')) || DEFAULT_FACET_LIMIT;

  // Filtros no formato da API, derivados do registro de facets.
  const searchParamsKey = searchParams.toString();
  const filters = useMemo(() => {
    const result: Record<string, FilterValueV2> = {};
    FACET_DEFINITIONS.forEach(({ filter }) => {
      if (filter.kind === 'multi') {
        result[filter.param] = searchParams.getAll(filter.param);
      } else if (filter.kind === 'range') {
        result[filter.startParam] = parseYear(
          searchParams.get(filter.startParam),
        );
        result[filter.endParam] = parseYear(searchParams.get(filter.endParam));
      }
    });
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey]);

  const update = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const getMulti = useCallback(
    (param: string) => (filters[param] as string[] | undefined) ?? [],
    [filters],
  );

  const setMulti = useCallback(
    (param: string, values: string[]) =>
      update((params) => {
        params.delete(param);
        values.forEach((value) => params.append(param, value));
      }),
    [update],
  );

  const toggleMulti = useCallback(
    (param: string, value: string) => {
      const current = getMulti(param);
      setMulti(
        param,
        current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      );
    },
    [getMulti, setMulti],
  );

  const getRange = useCallback(
    (startParam: string, endParam: string) => ({
      start: (filters[startParam] as number | null) ?? null,
      end: (filters[endParam] as number | null) ?? null,
    }),
    [filters],
  );

  const setRange = useCallback(
    (
      startParam: string,
      endParam: string,
      start: number | null,
      end: number | null,
    ) =>
      update((params) => {
        // Garante start <= end mesmo se o usuário inverter os campos.
        const [from, to] =
          start !== null && end !== null && start > end
            ? [end, start]
            : [start, end];
        if (from !== null) params.set(startParam, String(from));
        else params.delete(startParam);
        if (to !== null) params.set(endParam, String(to));
        else params.delete(endParam);
      }),
    [update],
  );

  const clearFacet = useCallback(
    (definition: FacetDefinition) =>
      update((params) => {
        const { filter } = definition;
        if (filter.kind === 'multi') params.delete(filter.param);
        if (filter.kind === 'range') {
          params.delete(filter.startParam);
          params.delete(filter.endParam);
        }
      }),
    [update],
  );

  const clearFilters = useCallback(
    () =>
      update((params) => {
        facetFilterParams().forEach((param) => params.delete(param));
      }),
    [update],
  );

  const isFacetActive = useCallback(
    (definition: FacetDefinition) => {
      const { filter } = definition;
      if (filter.kind === 'multi') return getMulti(filter.param).length > 0;
      if (filter.kind === 'range') {
        const { start, end } = getRange(filter.startParam, filter.endParam);
        return start !== null || end !== null;
      }
      return false;
    },
    [getMulti, getRange],
  );

  const hasActiveFilters = FACET_DEFINITIONS.some(isFacetActive);

  const setSortBy = useCallback(
    (value: SortByV2) => update((params) => params.set('sort_by', value)),
    [update],
  );

  // Aba ativa (mesmo parâmetro `tab` usado pela página de resultados antiga).
  const view: ProfileView =
    searchParams.get('tab') === 'mapa' ? 'mapa' : 'pesquisadores';
  const setView = useCallback(
    (value: ProfileView) =>
      update((params) => {
        if (value === 'mapa') params.set('tab', 'mapa');
        else params.delete('tab');
      }),
    [update],
  );

  const setFacetLimit = useCallback(
    (value: number) =>
      update((params) => {
        if (value === DEFAULT_FACET_LIMIT) params.delete('facet_limit');
        else params.set('facet_limit', String(value));
      }),
    [update],
  );

  return {
    terms,
    q,
    hasQuery,
    sortBy,
    sortOrder,
    setSortBy,
    facetLimit,
    setFacetLimit,
    view,
    setView,
    filters,
    getMulti,
    setMulti,
    toggleMulti,
    getRange,
    setRange,
    clearFacet,
    clearFilters,
    isFacetActive,
    hasActiveFilters,
  };
}

export type ProfileSearchState = ReturnType<typeof useProfileSearchState>;
