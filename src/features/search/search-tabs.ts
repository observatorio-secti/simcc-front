import type { LucideIcon } from 'lucide-react';
import { HandCoins, Newspaper, Users } from 'lucide-react';
import type { ProductionKind } from '@/entities/production/model';
import { defaultMetricGroupBy } from '@/entities/production/metric-queries';
import { getProductionDefinition } from '@/entities/production/registry';
import type { SearchType } from './search-schema';

// Abas de resultado de `/busca` (tabs de visão, `sc-viewtabs`). Cada aba diz
// de qual catálogo da v2 vem a lista (`source`). Para uma aba nova:
// acrescente o id em `SEARCH_TAB_IDS`, a definição em `SEARCH_TABS` com um
// `source` novo, o id em `TABS_BY_SEARCH_TYPE` (com termo) e/ou em
// `CATALOG_TABS` (sem termo) e o ramo do `source` em `results-page.tsx`.
//
// Sem termo (`q`), `/busca` é a tela de listagens (D1.4, ADR 0011): uma aba
// por catálogo da v2, qualquer que seja o tipo de busca.

export const SEARCH_TAB_IDS = [
  'researchers',
  'articles',
  'books',
  'book_chapters',
  'patents',
  'software',
  'events',
  'research_projects',
  'brands',
  'guidances',
  'reports',
  'magazine_texts',
  'event_works',
  'scholarships',
  'magazines',
] as const;

export type SearchTabId = (typeof SEARCH_TAB_IDS)[number];

export const DEFAULT_SEARCH_TAB = 'researchers' satisfies SearchTabId;

interface SearchTabBase<TId extends SearchTabId> {
  id: TId;
  label: string;
  icon: LucideIcon;
}

/** Aba listada por `/v2/researcher`. */
export interface ResearcherSearchTab extends SearchTabBase<'researchers'> {
  source: 'researcher';
}

/** Aba listada por `/v2/scholarship` (bolsistas, só sem termo). */
export interface ScholarshipSearchTab extends SearchTabBase<'scholarships'> {
  source: 'scholarship';
}

/** Aba listada por `/v2/magazine` (revistas, só sem termo). */
export interface MagazineSearchTab extends SearchTabBase<'magazines'> {
  source: 'magazine';
}

/** Aba listada por `/v2/production/<kind>`. */
export interface ProductionSearchTab extends SearchTabBase<
  Exclude<SearchTabId, 'researchers' | 'scholarships' | 'magazines'>
> {
  source: 'production';
  kind: ProductionKind;
}

export type SearchTabDefinition =
  | ResearcherSearchTab
  | ScholarshipSearchTab
  | ProductionSearchTab
  | MagazineSearchTab;

function productionTab(
  id: ProductionSearchTab['id'],
  kind: ProductionKind,
): ProductionSearchTab {
  const definition = getProductionDefinition(kind);
  return {
    id,
    source: 'production',
    kind,
    label: definition.title,
    icon: definition.icon,
  };
}

export const SEARCH_TABS: Record<SearchTabId, SearchTabDefinition> = {
  researchers: {
    id: 'researchers',
    source: 'researcher',
    label: 'Pesquisadores',
    icon: Users,
  },
  articles: productionTab('articles', 'article'),
  books: productionTab('books', 'book'),
  book_chapters: productionTab('book_chapters', 'book_chapter'),
  patents: productionTab('patents', 'patent'),
  software: productionTab('software', 'software'),
  events: productionTab('events', 'event'),
  research_projects: productionTab('research_projects', 'research_project'),
  brands: productionTab('brands', 'brand'),
  guidances: productionTab('guidances', 'guidance'),
  reports: productionTab('reports', 'report'),
  magazine_texts: productionTab('magazine_texts', 'magazine_text'),
  event_works: productionTab('event_works', 'event_work'),
  scholarships: {
    id: 'scholarships',
    source: 'scholarship',
    label: 'Bolsistas',
    icon: HandCoins,
  },
  magazines: {
    id: 'magazines',
    source: 'magazine',
    label: 'Revistas',
    icon: Newspaper,
  },
};

const ALL_PRODUCTION_TABS = [
  'articles',
  'books',
  'book_chapters',
  'patents',
  'software',
  'events',
] as const satisfies readonly SearchTabId[];

/**
 * Abas disponíveis por tipo de busca. A primeira é a padrão. A busca no
 * perfil inteiro abre todas as produções; nome, resumo e áreas de
 * especialidade só têm pesquisadores.
 */
export const TABS_BY_SEARCH_TYPE: Record<SearchType, readonly SearchTabId[]> = {
  profile: ['researchers', ...ALL_PRODUCTION_TABS],
  article: ['researchers', 'articles'],
  book: ['researchers', 'books', 'book_chapters'],
  patent: ['researchers', 'patents'],
  software: ['researchers', 'software'],
  speaker: ['researchers', 'events'],
  area: ['researchers'],
  name: ['researchers'],
  abstract: ['researchers'],
};

/**
 * Abas sem termo (listagens, D1.4): um catálogo da v2 por aba, na ordem das
 * listagens do legado (texto em revista e trabalho em evento entraram na
 * V4.1, com as rotas novas da v2). Bolsistas e revistas só existem aqui: `/v2/scholarship`
 * não tem busca textual, e o `q` de `/v2/magazine` busca só o nome da revista.
 */
export const CATALOG_TABS = [
  'researchers',
  'scholarships',
  ...ALL_PRODUCTION_TABS,
  'research_projects',
  'brands',
  'guidances',
  'reports',
  'magazine_texts',
  'event_works',
  'magazines',
] as const satisfies readonly SearchTabId[];

/** Ids das abas disponíveis: por tipo com termo; o catálogo inteiro sem termo. */
export function tabIdsFor(
  type: SearchType = 'profile',
  hasQuery = true,
): readonly SearchTabId[] {
  return hasQuery ? TABS_BY_SEARCH_TYPE[type] : CATALOG_TABS;
}

export function tabsForSearchType(
  type: SearchType = 'profile',
  hasQuery = true,
): readonly SearchTabDefinition[] {
  return tabIdsFor(type, hasQuery).map((id) => SEARCH_TABS[id]);
}

/** Aba efetiva: a da URL, se o tipo de busca a oferece; senão, a padrão. */
export function resolveSearchTab(
  type: SearchType = 'profile',
  tab: SearchTabId | undefined,
  hasQuery = true,
): SearchTabDefinition {
  const available = tabIdsFor(type, hasQuery);
  const id = tab && available.includes(tab) ? tab : DEFAULT_SEARCH_TAB;
  return SEARCH_TABS[id];
}

const CHART_GROUP_SUFFIX = {
  qualis: ' e Qualis',
  nature: ' e natureza',
  status: ' e situação',
  type_participation: ' e tipo de participação',
} as const;

/**
 * Título do gráfico por ano de uma aba de produção (ex.: "Artigos por ano e
 * Qualis"). Patentes se dividem em concedidas e depositadas (`granted`).
 */
export function productionChartTitle(kind: ProductionKind): string {
  if (kind === 'patent') return 'Patentes por ano: concedidas e depositadas';
  const groupBy = defaultMetricGroupBy(kind);
  const suffix = groupBy ? CHART_GROUP_SUFFIX[groupBy] : '';
  return `${getProductionDefinition(kind).title} por ano${suffix}`;
}
