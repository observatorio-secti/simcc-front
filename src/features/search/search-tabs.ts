import type { LucideIcon } from 'lucide-react';
import { Users } from 'lucide-react';
import type { ProductionKind } from '@/entities/production/model';
import { getProductionDefinition } from '@/entities/production/registry';
import type { SearchType } from './search-schema';

// Abas de resultado de `/busca` (tabs de visão, `sc-viewtabs`). Cada aba diz
// de qual catálogo da v2 vem a lista (`source`). Para uma aba nova (ex.:
// bolsistas, revistas na D1.4): acrescente o id em `SEARCH_TAB_IDS`, a
// definição em `SEARCH_TABS` com um `source` novo, o id nos tipos em
// `TABS_BY_SEARCH_TYPE` e o ramo do `source` em `results-page.tsx`.

export const SEARCH_TAB_IDS = [
  'researchers',
  'articles',
  'books',
  'book_chapters',
  'patents',
  'software',
  'events',
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

/** Aba listada por `/v2/production/<kind>`. */
export interface ProductionSearchTab extends SearchTabBase<
  Exclude<SearchTabId, 'researchers'>
> {
  source: 'production';
  kind: ProductionKind;
}

export type SearchTabDefinition = ResearcherSearchTab | ProductionSearchTab;

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

export function tabsForSearchType(
  type: SearchType = 'profile',
): readonly SearchTabDefinition[] {
  return TABS_BY_SEARCH_TYPE[type].map((id) => SEARCH_TABS[id]);
}

/** Aba efetiva: a da URL, se o tipo de busca a oferece; senão, a padrão. */
export function resolveSearchTab(
  type: SearchType = 'profile',
  tab: SearchTabId | undefined,
): SearchTabDefinition {
  const available = TABS_BY_SEARCH_TYPE[type];
  const id = tab && available.includes(tab) ? tab : DEFAULT_SEARCH_TAB;
  return SEARCH_TABS[id];
}
