import { z } from 'zod';
import type {
  GraduateProgramSearch,
  GraduateProgramSortBy,
} from '@/entities/graduate-program/model';
import {
  createListSearch,
  searchStringArrayParam,
} from '@/shared/lib/search-params';
import type { SortOption } from '@/shared/ui/sort-select';

export const GRADUATE_PROGRAM_SORT_VALUES = [
  'name',
  'acronym',
] as const satisfies readonly GraduateProgramSortBy[];

export const GRADUATE_PROGRAM_SORT_OPTIONS: readonly SortOption<GraduateProgramSortBy>[] =
  [
    { value: 'name', label: 'Nome', defaultOrder: 'asc' },
    { value: 'acronym', label: 'Sigla', defaultOrder: 'asc' },
  ];

export const GRADUATE_PROGRAM_FACETS = [
  'institution',
  'area',
  'modality',
  'rating',
  'state',
  'city',
] as const;

export const GRADUATE_PROGRAM_FACET_ORDER = [
  'area',
  'rating',
  'modality',
  'institution',
  'city',
  'state',
] as const;

export type GraduateProgramViewMode = 'grid' | 'table';

/**
 * Motor de search params para `/pos-graduacao`:
 * valida URL com zod, limpa valores padrão e converte direto para a API v2.
 */
export const graduateProgramListSearch = createListSearch({
  sortBy: GRADUATE_PROGRAM_SORT_VALUES,
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  defaultPerPage: 20,
  yearRange: false,
  filters: {
    institution_id: searchStringArrayParam(),
    area: searchStringArrayParam(),
    modality: searchStringArrayParam(),
    rating: searchStringArrayParam(),
    state: searchStringArrayParam(),
    city: searchStringArrayParam(),
  },
  extra: {
    view: z.enum(['grid', 'table']).optional(),
  },
});

export type GraduateProgramListSearchState = z.output<
  typeof graduateProgramListSearch.schema
>;

/** Converte o estado validado da URL nos parâmetros de query da API v2. */
export function toGraduateProgramQueryParams(
  search: GraduateProgramListSearchState,
): GraduateProgramSearch {
  return {
    ...graduateProgramListSearch.toApiParams(search),
    facets: [...GRADUATE_PROGRAM_FACETS],
  };
}
