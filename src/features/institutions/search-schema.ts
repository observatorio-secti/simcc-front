import { z } from 'zod';
import { productionRefParam } from '@/entities/production/links';
import { PRODUCTION_KINDS } from '@/entities/production/model';
import { createListSearch } from '@/shared/lib/search-params';

export const INSTITUTION_VIEW_MODES = ['grid', 'list'] as const;
export type InstitutionViewMode = (typeof INSTITUTION_VIEW_MODES)[number];

export const institutionListSearch = createListSearch({
  sortBy: ['name', 'acronym'] as const,
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  defaultPerPage: 20,
  yearRange: false,
  extra: {
    view: z.enum(INSTITUTION_VIEW_MODES).optional().catch(undefined),
  },
});

export type InstitutionListSearch = z.output<
  typeof institutionListSearch.schema
>;

export const INSTITUTION_DETAIL_TABS = [
  'researchers',
  'programs',
  'productions',
] as const;
export type InstitutionDetailTab = (typeof INSTITUTION_DETAIL_TABS)[number];

export const INSTITUTION_PRODUCTION_SORT_BY = [
  'year',
  'citations',
  'title',
] as const;
export type InstitutionProductionSortBy =
  (typeof INSTITUTION_PRODUCTION_SORT_BY)[number];

export const institutionDetailSearch = createListSearch({
  sortBy: INSTITUTION_PRODUCTION_SORT_BY,
  defaultSortBy: 'year',
  defaultSortOrder: 'desc',
  defaultPerPage: 12,
  yearRange: true,
  extra: {
    tab: z.enum(INSTITUTION_DETAIL_TABS).optional().catch(undefined),
    kind: z.enum(PRODUCTION_KINDS).optional().catch(undefined),
    view: z.enum(INSTITUTION_VIEW_MODES).optional().catch(undefined),
    production: productionRefParam,
  },
});

export type InstitutionDetailSearch = z.output<
  typeof institutionDetailSearch.schema
>;
