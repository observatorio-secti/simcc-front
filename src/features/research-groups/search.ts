import { z } from 'zod';
import {
  createListSearch,
  searchStringArrayParam,
  searchStringParam,
} from '@/shared/lib/search-params';

export const GROUP_SORT_FIELDS = ['name', 'members', 'lines', 'year'] as const;
export type GroupSortField = (typeof GROUP_SORT_FIELDS)[number];

export const GROUP_VIEW_MODES = ['grid', 'list'] as const;
export type GroupViewMode = (typeof GROUP_VIEW_MODES)[number];

export const researchGroupsSearch = createListSearch({
  sortBy: GROUP_SORT_FIELDS,
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  defaultPerPage: 12,
  maxPerPage: 96,
  yearRange: false,
  filters: {
    area: searchStringArrayParam(),
    institution: searchStringArrayParam(),
    status: searchStringArrayParam(),
    state: searchStringArrayParam(),
  },
  extra: {
    view: z.enum(GROUP_VIEW_MODES).optional(),
  },
});

export type ResearchGroupsSearch = z.output<typeof researchGroupsSearch.schema>;

export const GROUP_DETAIL_TABS = ['linhas', 'pesquisadores'] as const;
export type GroupDetailTab = (typeof GROUP_DETAIL_TABS)[number];

export const researchGroupDetailSearch = createListSearch({
  defaultPerPage: 12,
  maxPerPage: 100,
  yearRange: false,
  extra: {
    tab: z.enum(GROUP_DETAIL_TABS).optional(),
    q: searchStringParam(),
  },
});

export type ResearchGroupDetailSearch = z.output<
  typeof researchGroupDetailSearch.schema
>;
