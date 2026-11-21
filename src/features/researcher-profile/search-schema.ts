import { z } from 'zod';
import type { ProductionKind } from '@/entities/production/model';
import { PRODUCTION_KINDS } from '@/entities/production/model';
import {
  cleanSearchParams,
  searchEnumArrayParam,
  searchStringParam,
  searchYearParam,
} from '@/shared/lib/search-params';

export const PROFILE_TABS = [
  'articles',
  'books',
  'technical',
  'reports',
  'guidance',
  'events',
  'projects',
  'trajectory',
] as const;

export type ProfileTab = (typeof PROFILE_TABS)[number];

export const QUALIS_STRATA = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'C',
  'not_rated',
  'not_applicable',
] as const;

export type QualisStratum = (typeof QUALIS_STRATA)[number];

export const ARTICLE_SORT_BY = [
  'year',
  'citations',
  'title',
  'relevance',
] as const;

export type ArticleSortBy = (typeof ARTICLE_SORT_BY)[number];

export type ProfileViewMode = 'grid' | 'list';

const SORT_ORDERS = ['asc', 'desc'] as const;

function parsePositiveInt(raw: unknown, fallback: number): number {
  if (typeof raw === 'number' && Number.isSafeInteger(raw) && raw >= 1) {
    return raw;
  }
  if (typeof raw === 'string' && /^\d+$/.test(raw.trim())) {
    const parsed = Number(raw.trim());
    if (Number.isSafeInteger(parsed) && parsed >= 1) return parsed;
  }
  return fallback;
}

const tabParam = z
  .unknown()
  .transform((raw): ProfileTab => {
    const val = Array.isArray(raw) ? raw[0] : raw;
    if (
      typeof val === 'string' &&
      (PROFILE_TABS as readonly string[]).includes(val)
    ) {
      return val as ProfileTab;
    }
    return 'articles';
  })
  .catch('articles');

const viewParam = z
  .unknown()
  .transform((raw): ProfileViewMode => {
    const val = Array.isArray(raw) ? raw[0] : raw;
    return val === 'list' ? 'list' : 'grid';
  })
  .catch('grid');

const sortByParam = z
  .unknown()
  .transform((raw): ArticleSortBy | undefined => {
    const val = Array.isArray(raw) ? raw[0] : raw;
    if (
      typeof val === 'string' &&
      (ARTICLE_SORT_BY as readonly string[]).includes(val)
    ) {
      return val as ArticleSortBy;
    }
    return undefined;
  })
  .catch(undefined);

const sortOrderParam = z
  .unknown()
  .transform((raw): 'asc' | 'desc' | undefined => {
    const val = Array.isArray(raw) ? raw[0] : raw;
    if (
      typeof val === 'string' &&
      (SORT_ORDERS as readonly string[]).includes(val)
    ) {
      return val as 'asc' | 'desc';
    }
    return undefined;
  })
  .catch(undefined);

const prodKindParam = z
  .unknown()
  .transform((raw): ProductionKind | undefined => {
    const val = Array.isArray(raw) ? raw[0] : raw;
    if (
      typeof val === 'string' &&
      (PRODUCTION_KINDS as readonly string[]).includes(val)
    ) {
      return val as ProductionKind;
    }
    return undefined;
  })
  .catch(undefined);

export const researcherProfileSearchSchema = z.object({
  tab: tabParam,
  qualis: searchEnumArrayParam(QUALIS_STRATA),
  year_start: searchYearParam(),
  year_end: searchYearParam(),
  page: z
    .unknown()
    .transform((raw) => parsePositiveInt(raw, 1))
    .catch(1),
  view: viewParam,
  sort_by: sortByParam,
  sort_order: sortOrderParam,
  q: searchStringParam(),
  search_type: searchStringParam(),
  prod_kind: prodKindParam,
  prod_id: searchStringParam(),
});

export type ResearcherProfileSearch = z.infer<
  typeof researcherProfileSearchSchema
>;

export const PROFILE_SEARCH_DEFAULTS: Partial<ResearcherProfileSearch> = {
  tab: 'articles',
  page: 1,
  view: 'grid',
};

/** Remove valores padrão e vazios para manter a URL limpa. */
export function cleanProfileSearch(
  search: Partial<ResearcherProfileSearch>,
): Partial<ResearcherProfileSearch> {
  return cleanSearchParams(search, PROFILE_SEARCH_DEFAULTS);
}
