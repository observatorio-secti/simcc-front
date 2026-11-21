import type { QueryClient } from '@tanstack/react-query';
import { magazineListQueryOptions } from '@/entities/magazine/queries';
import { productionListQueryOptions } from '@/entities/production/queries';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import { scholarshipListQueryOptions } from '@/entities/scholarship/queries';
import {
  activeTab,
  toMagazineQuery,
  toProductionQuery,
  toResearcherQuery,
  toScholarshipQuery,
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
  switch (tab.source) {
    case 'researcher':
      void queryClient.prefetchQuery(
        researcherListQueryOptions(toResearcherQuery(search)),
      );
      return;
    case 'scholarship':
      void queryClient.prefetchQuery(
        scholarshipListQueryOptions(toScholarshipQuery(search)),
      );
      return;
    case 'magazine':
      void queryClient.prefetchQuery(
        magazineListQueryOptions(toMagazineQuery(search)),
      );
      return;
    case 'production':
      void queryClient.prefetchQuery(
        productionListQueryOptions(
          tab.kind,
          toProductionQuery(tab.kind, search),
        ),
      );
  }
}
