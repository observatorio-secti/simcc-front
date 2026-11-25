import { z } from 'zod';
import type {
  GraduateProgramSearch,
  GraduateProgramSortBy,
} from '@/entities/graduate-program/model';
import { productionRefParam } from '@/entities/production/links';
import {
  TERRITORY_CITY_FACET,
  TERRITORY_FACET_LIMIT,
} from '@/entities/territory/model';
import type { TerritorySelection } from '@/entities/territory/ui/territory-map';
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
  'type',
  'rating',
  'state',
  'city',
  'identity_territory',
  TERRITORY_CITY_FACET,
] as const;

export const GRADUATE_PROGRAM_FACET_ORDER = [
  'area',
  'rating',
  'type',
  'modality',
  'institution',
  'identity_territory',
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
    type: searchStringArrayParam(),
    rating: searchStringArrayParam(),
    state: searchStringArrayParam(),
    city: searchStringArrayParam(),
    identity_territory: searchStringArrayParam(),
    city_code: searchStringArrayParam(),
  },
  extra: {
    view: z.enum(['grid', 'table']).optional(),
  },
});

export type GraduateProgramListSearchState = z.output<
  typeof graduateProgramListSearch.schema
>;

export const GRADUATE_PROGRAM_MAP_PREVIEW_SIZE = 6;

/** Converte o estado validado da URL nos parâmetros de query da API v2. */
export function toGraduateProgramQueryParams(
  search: GraduateProgramListSearchState,
): GraduateProgramSearch {
  return {
    ...graduateProgramListSearch.toApiParams(search),
    facets: [...GRADUATE_PROGRAM_FACETS],
    // O limite vale por nível em `territory_city`: 100 traz os 27 territórios.
    facet_limit: TERRITORY_FACET_LIMIT,
  };
}

/** Query paginada para listar os programas do território ou município focado no mapa. */
export function toGraduateProgramMapPreviewQuery(
  search: GraduateProgramListSearchState,
  selection: TerritorySelection,
  page: number,
  perPage = GRADUATE_PROGRAM_MAP_PREVIEW_SIZE,
): GraduateProgramSearch {
  return {
    ...graduateProgramListSearch.toApiParams(search),
    ...(selection.kind === 'territory'
      ? { identity_territory: [selection.code], city_code: undefined }
      : { identity_territory: undefined, city_code: [selection.ibge] }),
    page,
    per_page: perPage,
  };
}

export const GRADUATE_PROGRAM_DETAIL_VIEW_MODES = ['grid', 'list'] as const;
export type GraduateProgramDetailViewMode =
  (typeof GRADUATE_PROGRAM_DETAIL_VIEW_MODES)[number];

export const GRADUATE_PROGRAM_DETAIL_TABS = [
  'researchers',
  'articles',
  'books',
  'technical',
  'reports',
  'guidance',
  'events',
  'projects',
  'students',
] as const;
export type GraduateProgramDetailTab =
  (typeof GRADUATE_PROGRAM_DETAIL_TABS)[number];

export const GRADUATE_PROGRAM_PRODUCTION_SORT_BY = [
  'year',
  'citations',
  'title',
] as const;
export type GraduateProgramProductionSortBy =
  (typeof GRADUATE_PROGRAM_PRODUCTION_SORT_BY)[number];

export const graduateProgramDetailSearch = createListSearch({
  sortBy: GRADUATE_PROGRAM_PRODUCTION_SORT_BY,
  defaultSortBy: 'year',
  defaultSortOrder: 'desc',
  defaultPerPage: 12,
  yearRange: true,
  extra: {
    tab: z.enum(GRADUATE_PROGRAM_DETAIL_TABS).optional().catch(undefined),
    view: z
      .enum(GRADUATE_PROGRAM_DETAIL_VIEW_MODES)
      .optional()
      .catch(undefined),
    production: productionRefParam,
  },
});

export type GraduateProgramDetailSearch = z.output<
  typeof graduateProgramDetailSearch.schema
>;
