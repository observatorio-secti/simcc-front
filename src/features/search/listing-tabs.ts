import {
  CATALOG_TABS,
  DEFAULT_SEARCH_TAB,
  type SearchTabId,
} from './search-tabs';

// `/listagens` virou `/busca` sem termo (D1.4, ADR 0011). A rota antiga
// redireciona e traduz o `?tab=` do legado (`legado-v1:src/components/
// listagens/todos-pesquisadores.tsx`) para a aba nova.

const LEGACY_LISTING_TABS: Readonly<Record<string, SearchTabId>> = {
  bolsistas: 'scholarships',
  pesquisadores: 'researchers',
  article: 'articles',
  book: 'books',
  patent: 'patents',
  software: 'software',
  brand: 'brands',
  'relatorio-tecnico': 'reports',
  orientacoes: 'guidances',
  speaker: 'events',
  'research-project': 'research_projects',
  'texto-revista': 'magazine_texts',
  'work-event': 'event_works',
  magazine: 'magazines',
};

const CATALOG_TAB_SET: ReadonlySet<string> = new Set(CATALOG_TABS);

/**
 * Aba de `/busca` para um `?tab=` de `/listagens`: aceita os ids do legado e
 * os novos. Sem correspondência (ex.: `tecnicos`, descontinuado pelo ADR 0007)
 * ou na aba padrão, não há aba.
 */
export function listingTabToSearchTab(
  tab: string | undefined,
): Exclude<SearchTabId, typeof DEFAULT_SEARCH_TAB> | undefined {
  const value = tab?.trim();
  if (!value) return undefined;
  const id =
    LEGACY_LISTING_TABS[value] ??
    (CATALOG_TAB_SET.has(value) ? (value as SearchTabId) : undefined);
  if (!id || id === DEFAULT_SEARCH_TAB) return undefined;
  return id;
}
