import type { QueryClient } from '@tanstack/react-query';
import { productionListQueryOptions } from '@/entities/production/queries';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import {
  activeTab,
  toProductionQuery,
  toResearcherQuery,
  type ResultsSearch,
} from './results-search';

/**
 * Pré-carrega a lista da aba ativa sem bloquear a navegação: a busca pode
 * levar alguns segundos sem cache, e a tela mostra o carregamento no lugar.
 */
export function prefetchSearchResults(
  queryClient: QueryClient,
  search: ResultsSearch,
): void {
  const tab = activeTab(search);
  if (tab.source === 'researcher') {
    void queryClient.prefetchQuery(
      researcherListQueryOptions(toResearcherQuery(search)),
    );
    return;
  }
  void queryClient.prefetchQuery(
    productionListQueryOptions(tab.kind, toProductionQuery(tab.kind, search)),
  );
}
