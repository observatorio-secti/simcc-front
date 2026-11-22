import { stripSearchParams } from '@tanstack/react-router';
import { z } from 'zod';
import { productionRefParam } from '@/entities/production/links';
import {
  MAGAZINE_SORT_OPTIONS,
  type MagazineQuery,
  type MagazineSortBy,
} from '@/entities/magazine/model';
import type { ProductionMetricQuery } from '@/entities/production/metric-queries';
import type {
  ProductionKind,
  ProductionQuery,
} from '@/entities/production/model';
import {
  getProductionSortOptions,
  PRODUCTION_SORT_LABELS,
} from '@/entities/production/registry';
import type {
  ResearcherClassification,
  ResearcherSearch,
  ResearcherSourceType,
} from '@/entities/researcher/model';
import {
  SCHOLARSHIP_SORT_OPTIONS,
  type ScholarshipQuery,
  type ScholarshipSortBy,
} from '@/entities/scholarship/model';
import {
  createListSearch,
  searchEnumArrayParam,
  searchStringArrayParam,
  searchStringParam,
} from '@/shared/lib/search-params';
import type { SortDirection, SortOption } from '@/shared/ui/sort-select';
import { SEARCH_TYPES, type SearchType } from './search-schema';
import {
  DEFAULT_SEARCH_TAB,
  resolveSearchTab,
  SEARCH_TAB_IDS,
  tabIdsFor,
  type SearchTabDefinition,
  type SearchTabId,
} from './search-tabs';

// Estado de `/busca` (T2): um só schema da F1.5 para a URL e para a API v2.
// Os filtros usam os nomes dos parâmetros da v2 (o `param` de cada faceta);
// `type`, `tab`, `view`, `researcher`, `profile` e `production` são só da
// tela.

export const RESEARCHER_CLASSIFICATIONS = [
  'A+',
  'A',
  'B+',
  'B',
  'C+',
  'C',
  'D+',
  'D',
  'E+',
  'E',
] as const satisfies readonly ResearcherClassification[];

export const RESEARCHER_SOURCE_TYPES = [
  'article',
  'book',
  'book_chapter',
  'patent',
  'software',
  'event',
  'area_specialty',
] as const satisfies readonly ResearcherSourceType[];

type ArticleQualis = NonNullable<ProductionQuery<'article'>['qualis']>[number];

export const ARTICLE_QUALIS = [
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
] as const satisfies readonly ArticleQualis[];

type ResearcherSortBy = NonNullable<ResearcherSearch['sort_by']>;

/** Todas as ordenações aceitas na URL; a aba decide quais valem. */
export const RESULTS_SORT_VALUES = [
  'matches',
  'relevance',
  'name',
  'year',
  'citations',
  'title',
  // Bolsistas (`/v2/scholarship`) e revistas (`/v2/magazine`), D1.4.
  'researcher_name',
  'modality',
  'category_level',
  'jcr',
] as const;

export const RESULTS_VIEW_MODES = ['grid', 'list'] as const;
export type ResultsViewMode = (typeof RESULTS_VIEW_MODES)[number];

export const resultsSearch = createListSearch({
  sortBy: RESULTS_SORT_VALUES,
  defaultPerPage: 20,
  filters: {
    area: searchStringArrayParam(),
    institution_id: searchStringArrayParam(),
    graduate_program_id: searchStringArrayParam(),
    city_id: searchStringArrayParam(),
    identity_territory: searchStringArrayParam(),
    graduation: searchStringArrayParam(),
    classification: searchEnumArrayParam(RESEARCHER_CLASSIFICATIONS),
    modality: searchStringArrayParam(),
    category_level: searchStringArrayParam(),
    source_type: searchEnumArrayParam(RESEARCHER_SOURCE_TYPES),
    qualis: searchEnumArrayParam(ARTICLE_QUALIS),
  },
  extra: {
    type: z.enum(SEARCH_TYPES).optional().catch(undefined),
    tab: z.enum(SEARCH_TAB_IDS).optional().catch(undefined),
    view: z.enum(RESULTS_VIEW_MODES).optional().catch(undefined),
    /** Pesquisador aberto no overlay (ADR 0004 / ADR 0010). */
    researcher: searchStringParam(),
    /** Search params do perfil aberto no overlay, como query string. */
    profile: searchStringParam(),
    /** Produção aberta no overlay (`<kind da v2>:<id>`, T13 / ADR 0010). */
    production: productionRefParam,
  },
});

export type ResultsSearch = z.output<typeof resultsSearch.schema>;

/** Padrões de UI omitidos da URL (o resto vem de `resultsSearch.middlewares`). */
const UI_DEFAULTS = {
  type: 'profile',
  tab: DEFAULT_SEARCH_TAB,
  view: 'grid',
} as const satisfies Partial<ResultsSearch>;

export const resultsSearchMiddlewares = [
  ...resultsSearch.middlewares,
  stripSearchParams<ResultsSearch>(UI_DEFAULTS),
];

export type ResultsFilterKey =
  | 'area'
  | 'institution_id'
  | 'graduate_program_id'
  | 'city_id'
  | 'identity_territory'
  | 'graduation'
  | 'classification'
  | 'modality'
  | 'category_level'
  | 'source_type'
  | 'qualis';

const COMMON_FILTERS = [
  'area',
  'institution_id',
  'graduate_program_id',
  'city_id',
  'identity_territory',
] as const satisfies readonly ResultsFilterKey[];

const RESEARCHER_FILTERS = [
  ...COMMON_FILTERS,
  'graduation',
  'classification',
  'modality',
  'source_type',
] as const satisfies readonly ResultsFilterKey[];

const ARTICLE_FILTERS = [
  ...COMMON_FILTERS,
  'qualis',
] as const satisfies readonly ResultsFilterKey[];

/**
 * Bolsistas: `/v2/scholarship` filtra por instituição, programa, modalidade e
 * nível. Instituição, programa e `modality` têm os mesmos valores das facetas
 * de pesquisadores e passam de uma aba à outra.
 */
const SCHOLARSHIP_FILTERS = [
  'institution_id',
  'graduate_program_id',
  'modality',
  'category_level',
] as const satisfies readonly ResultsFilterKey[];

/** Revistas: `/v2/magazine` filtra por Qualis (mesmo enum dos artigos). */
const MAGAZINE_FILTERS = [
  'qualis',
] as const satisfies readonly ResultsFilterKey[];

const ALL_FILTERS: readonly ResultsFilterKey[] = [
  ...RESEARCHER_FILTERS,
  'qualis',
  'category_level',
];

/** O que define a lista de uma aba: a origem e, nas produções, o tipo. */
export type TabSource =
  | { source: 'researcher' }
  | { source: 'production'; kind: ProductionKind }
  | { source: 'scholarship' }
  | { source: 'magazine' };

/** Filtros que a aba envia à API (e mantém ao trocar de aba). */
export function filterKeysForTab(tab: TabSource): readonly ResultsFilterKey[] {
  switch (tab.source) {
    case 'researcher':
      return RESEARCHER_FILTERS;
    case 'scholarship':
      return SCHOLARSHIP_FILTERS;
    case 'magazine':
      return MAGAZINE_FILTERS;
    case 'production':
      return tab.kind === 'article' ? ARTICLE_FILTERS : COMMON_FILTERS;
  }
}

/** Bolsas e revistas não têm ano na v2. */
export function tabSupportsYear(tab: TabSource): boolean {
  return tab.source === 'researcher' || tab.source === 'production';
}

/** Quantidade de filtros aplicados que valem para a aba (o intervalo de anos conta 1). */
export function countTabFilters(search: ResultsSearch, tab: TabSource): number {
  let count = 0;
  for (const key of filterKeysForTab(tab)) {
    const value = search[key];
    if (Array.isArray(value)) count += value.length;
  }
  if (
    tabSupportsYear(tab) &&
    (search.year_start !== undefined || search.year_end !== undefined)
  ) {
    count += 1;
  }
  return count;
}

/**
 * `source_type` fixo de cada tipo de busca em `/v2/researcher`. Sem entrada,
 * a busca cobre o perfil inteiro (nome, resumo e produções) e o usuário pode
 * filtrar pela faceta `source_type`. Nome e resumo não filtram por tipo de
 * produção: restringem o campo da busca com `search_in` (`searchInFor`).
 */
const SOURCE_TYPES_BY_SEARCH_TYPE: Partial<
  Record<SearchType, ResearcherSourceType[]>
> = {
  article: ['article'],
  book: ['book', 'book_chapter'],
  patent: ['patent'],
  software: ['software'],
  speaker: ['event'],
  area: ['area_specialty'],
};

export function fixedSourceTypes(
  type: SearchType = 'profile',
): ResearcherSourceType[] | undefined {
  return SOURCE_TYPES_BY_SEARCH_TYPE[type];
}

type ResearcherSearchIn = NonNullable<ResearcherSearch['search_in']>;

/** Campo da busca textual de `/v2/researcher` por tipo de busca. */
const SEARCH_IN_BY_SEARCH_TYPE: Partial<
  Record<SearchType, ResearcherSearchIn>
> = {
  name: 'name',
  abstract: 'abstract',
};

/**
 * `search_in` de `/v2/researcher` para o tipo de busca: `name` (só o nome),
 * `abstract` (só o resumo) ou `undefined` (o padrão da v2, `all`).
 */
export function searchInFor(
  type: SearchType = 'profile',
): ResearcherSearchIn | undefined {
  return SEARCH_IN_BY_SEARCH_TYPE[type];
}

/** O tipo de busca restringe o resultado (por tipo de produção ou campo). */
function narrowsSourceType(type: SearchType = 'profile'): boolean {
  return Boolean(fixedSourceTypes(type) ?? searchInFor(type));
}

const RESEARCHER_FACETS_BASE = [
  'area',
  'institution',
  'graduate_program',
  'identity_territory',
  'city',
  'graduation',
  'classification',
  'modality',
  'year',
] as const;

const PRODUCTION_FACETS_BASE = [
  'year',
  'area',
  'institution',
  'graduate_program',
  'identity_territory',
  'city',
] as const;

/**
 * Facetas pedidas a `/v2/researcher`: `source_type` só na busca no perfil
 * inteiro (sem tipo de produção fixo nem `search_in`).
 */
export function researcherFacets(type: SearchType = 'profile'): string[] {
  return narrowsSourceType(type)
    ? [...RESEARCHER_FACETS_BASE]
    : [...RESEARCHER_FACETS_BASE, 'source_type'];
}

export function productionFacets(kind: ProductionKind): string[] {
  return kind === 'article'
    ? [...PRODUCTION_FACETS_BASE, 'qualis']
    : [...PRODUCTION_FACETS_BASE];
}

/** Facetas que `/v2/scholarship` aceita. */
export const SCHOLARSHIP_FACETS = [
  'institution',
  'graduate_program',
  'modality',
  'category_level',
] as const;
// A v2 aceita no máximo 100 (acima disso, 422).
const SCHOLARSHIP_FACET_LIMIT = 50;

/** Faceta que `/v2/magazine` aceita. */
export const MAGAZINE_FACETS = ['qualis'] as const;

/** Ordem de exibição das facetas no painel. */
export const RESULTS_FACET_ORDER = [
  'source_type',
  'area',
  'qualis',
  'year',
  'institution',
  'graduate_program',
  'identity_territory',
  'city',
  'graduation',
  'classification',
  'modality',
  'category_level',
] as const;

const RESEARCHER_SORT_OPTIONS: readonly SortOption<ResearcherSortBy>[] = [
  { value: 'matches', label: 'Mais ocorrências', defaultOrder: 'desc' },
  { value: 'relevance', label: 'Mais relevantes', defaultOrder: 'desc' },
  { value: 'name', label: 'Nome (A–Z)', defaultOrder: 'asc' },
];

/** Opções de ordenação da aba; a primeira é a padrão. */
export function sortOptionsForTab(
  tab: TabSource,
  hasQuery: boolean,
): readonly SortOption[] {
  if (tab.source === 'researcher') {
    return hasQuery
      ? RESEARCHER_SORT_OPTIONS
      : RESEARCHER_SORT_OPTIONS.filter((option) => option.value === 'name');
  }
  if (tab.source === 'scholarship') return SCHOLARSHIP_SORT_OPTIONS;
  if (tab.source === 'magazine') return MAGAZINE_SORT_OPTIONS;
  return getProductionSortOptions(tab.kind, hasQuery).map((value) => ({
    value,
    label: PRODUCTION_SORT_LABELS[value],
    defaultOrder: value === 'title' ? 'asc' : 'desc',
  }));
}

export interface ResolvedSort {
  sort_by: string;
  sort_order: SortDirection;
}

/** Ordenação efetiva: a da URL quando a aba aceita; senão, a padrão da aba. */
export function resolveSort(
  tab: TabSource,
  search: Pick<ResultsSearch, 'q' | 'sort_by' | 'sort_order'>,
): ResolvedSort {
  const options = sortOptionsForTab(tab, Boolean(search.q));
  const chosen =
    options.find((option) => option.value === search.sort_by) ?? options[0];
  const sortBy = chosen?.value ?? 'name';
  const urlOrder = chosen?.value === search.sort_by ? search.sort_order : null;
  return {
    sort_by: sortBy,
    sort_order: urlOrder ?? chosen?.defaultOrder ?? 'asc',
  };
}

/** Aba ativa do estado da URL. */
export function activeTab(search: ResultsSearch): SearchTabDefinition {
  return resolveSearchTab(search.type, search.tab, Boolean(search.q));
}

function pickFilters(
  search: ResultsSearch,
  keys: readonly ResultsFilterKey[],
): Partial<Pick<ResultsSearch, ResultsFilterKey>> {
  const picked: Record<string, unknown> = {};
  for (const key of keys) {
    const value = search[key];
    if (value !== undefined) picked[key] = value;
  }
  return picked as Partial<Pick<ResultsSearch, ResultsFilterKey>>;
}

function baseQuery(search: ResultsSearch) {
  const api = resultsSearch.toApiParams(search);
  return {
    ...(api.q !== undefined ? { q: api.q } : {}),
    ...(api.year_start !== undefined ? { year_start: api.year_start } : {}),
    ...(api.year_end !== undefined ? { year_end: api.year_end } : {}),
    page: api.page,
    per_page: api.per_page,
  };
}

/** Parâmetros de `/v2/researcher` para a aba de pesquisadores. */
export function toResearcherQuery(search: ResultsSearch): ResearcherSearch {
  const sort = resolveSort({ source: 'researcher' }, search);
  const filters = pickFilters(search, RESEARCHER_FILTERS);
  const fixed = fixedSourceTypes(search.type);
  const searchIn = search.q ? searchInFor(search.type) : undefined;
  // Com `search_in`, a busca é só no nome ou no resumo: não filtra por tipo.
  const sourceType = searchIn ? undefined : (fixed ?? filters.source_type);
  const { source_type: _sourceType, ...otherFilters } = filters;
  return {
    ...baseQuery(search),
    ...otherFilters,
    ...(searchIn ? { search_in: searchIn } : {}),
    ...(sourceType ? { source_type: sourceType } : {}),
    sort_by: sort.sort_by as ResearcherSortBy,
    sort_order: sort.sort_order,
    facets: researcherFacets(search.type),
    ...(search.q ? { include: ['matches'], matches_limit: 1 } : {}),
  };
}

const RANKING_SIZE = 10;

/** Ranking "pesquisadores com mais ocorrências" (mesmo recorte, por `matches`). */
export function toResearcherRankingQuery(
  search: ResultsSearch,
): ResearcherSearch {
  const { facets: _facets, ...query } = toResearcherQuery(search);
  return {
    ...query,
    page: 1,
    per_page: RANKING_SIZE,
    sort_by: 'matches',
    sort_order: 'desc',
  };
}

/** Parâmetros de `/v2/production/<kind>` para uma aba de produção. */
export function toProductionQuery<K extends ProductionKind>(
  kind: K,
  search: ResultsSearch,
): ProductionQuery<K> {
  const sort = resolveSort({ source: 'production', kind }, search);
  const keys = kind === 'article' ? ARTICLE_FILTERS : COMMON_FILTERS;
  return {
    ...baseQuery(search),
    ...pickFilters(search, keys),
    sort_by: sort.sort_by,
    sort_order: sort.sort_order,
    facets: productionFacets(kind),
  } as ProductionQuery<K>;
}

/**
 * Parâmetros de `/v2/scholarship` para a aba de bolsistas. A rota não tem
 * busca textual nem ano: a aba só existe sem termo.
 */
export function toScholarshipQuery(search: ResultsSearch): ScholarshipQuery {
  const sort = resolveSort({ source: 'scholarship' }, search);
  const { page, per_page } = baseQuery(search);
  return {
    page,
    per_page,
    ...pickFilters(search, SCHOLARSHIP_FILTERS),
    sort_by: sort.sort_by as ScholarshipSortBy,
    sort_order: sort.sort_order,
    facets: [...SCHOLARSHIP_FACETS],
    // Os KPIs somam PQ e DT pela faceta de modalidade: traz todas.
    facet_limit: SCHOLARSHIP_FACET_LIMIT,
  };
}

/**
 * Parâmetros de `/v2/magazine` para a aba de revistas. O `q` da rota busca
 * só o nome da revista; a aba só existe sem termo, então ele não é enviado.
 */
export function toMagazineQuery(search: ResultsSearch): MagazineQuery {
  const sort = resolveSort({ source: 'magazine' }, search);
  const { page, per_page } = baseQuery(search);
  return {
    page,
    per_page,
    ...pickFilters(search, MAGAZINE_FILTERS),
    sort_by: sort.sort_by as MagazineSortBy,
    sort_order: sort.sort_order,
    facets: [...MAGAZINE_FACETS],
  };
}

/** Parâmetros de `/v2/metrics/production/{kind}` com o mesmo recorte da aba. */
export function toProductionMetricQuery(
  search: ResultsSearch,
): ProductionMetricQuery {
  const { q, year_start, year_end } = baseQuery(search);
  return {
    ...(q !== undefined ? { q } : {}),
    ...(year_start !== undefined ? { year_start } : {}),
    ...(year_end !== undefined ? { year_end } : {}),
    ...pickFilters(search, COMMON_FILTERS),
  };
}

/** Troca de aba: zera página e ordenação e descarta filtros que a aba não aceita. */
export function switchTab(
  search: ResultsSearch,
  tabId: SearchTabId,
): ResultsSearch {
  const next = resolveSearchTab(search.type, tabId, Boolean(search.q));
  const allowed = new Set<string>(filterKeysForTab(next));
  const patch: Record<string, unknown> = {
    tab: next.id === DEFAULT_SEARCH_TAB ? undefined : next.id,
    sort_by: undefined,
    sort_order: undefined,
  };
  for (const key of ALL_FILTERS) {
    if (!allowed.has(key)) patch[key] = undefined;
  }
  return resultsSearch.update(search, patch);
}

/**
 * Nova busca (termo e/ou tipo): mantém os filtros compatíveis, zera página e
 * ordenação (a padrão depende de haver termo) e volta à aba padrão se o novo
 * tipo não tiver a aba atual.
 */
export function applyQuery(
  search: ResultsSearch,
  next: { q?: string; type?: SearchType },
): ResultsSearch {
  const type = next.type ?? search.type ?? 'profile';
  const q = next.q?.trim() || undefined;
  const tab =
    search.tab && tabIdsFor(type, Boolean(q)).includes(search.tab)
      ? search.tab
      : undefined;
  return resultsSearch.update(search, {
    q,
    type: type === 'profile' ? undefined : type,
    tab: tab === DEFAULT_SEARCH_TAB ? undefined : tab,
    sort_by: undefined,
    sort_order: undefined,
    ...(narrowsSourceType(type) ? { source_type: undefined } : {}),
  });
}
