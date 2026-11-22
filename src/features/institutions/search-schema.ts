import { z } from 'zod';
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
  'panel',
] as const;
export type InstitutionDetailTab = (typeof INSTITUTION_DETAIL_TABS)[number];

export const institutionDetailSearch = createListSearch({
  defaultPerPage: 12,
  yearRange: false,
  extra: {
    tab: z.enum(INSTITUTION_DETAIL_TABS).optional().catch(undefined),
  },
});

export type InstitutionDetailSearch = z.output<
  typeof institutionDetailSearch.schema
>;
