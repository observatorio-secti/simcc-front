import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ResearcherSummary } from '@/entities/researcher/model';
import { researcherListQueryOptions } from '@/entities/researcher/queries';
import { PersonCard } from '@/entities/researcher/ui/person-card';
import { TerritoryDetailPanel } from '@/entities/territory/ui/territory-detail-panel';
import type {
  TerritoryMapNoun,
  TerritorySelectionContext,
} from '@/entities/territory/ui/territory-map';
import { isPlainLeftClick } from '@/shared/lib/plain-click';
import {
  toResearcherMapPreviewQuery,
  type ResultsSearch,
} from '../results-search';
import type { SearchType } from '../search-schema';

export interface TerritoryResearchersPanelProps extends TerritorySelectionContext {
  search: ResultsSearch;
  type: SearchType;
  noun: TerritoryMapNoun;
  onOpenResearcher: (id: string) => void;
}

/**
 * Prévia paginada de pesquisadores exibida na coluna lateral do mapa quando
 * um território ou município é focado.
 */
export function TerritoryResearchersPanel({
  selection,
  onBackToTerritories,
  onBackToTerritory,
  onSelectCity,
  search,
  type,
  noun,
  onOpenResearcher,
}: TerritoryResearchersPanelProps) {
  const scopeKey = JSON.stringify(
    toResearcherMapPreviewQuery(search, selection, 1),
  );

  const [pageState, setPageState] = useState({ scopeKey, page: 1 });
  const currentPage = pageState.scopeKey === scopeKey ? pageState.page : 1;

  const query = useQuery({
    ...researcherListQueryOptions(
      toResearcherMapPreviewQuery(search, selection, currentPage),
    ),
    placeholderData: keepPreviousData,
  });

  const researchers = (query.data?.data ?? []) as ResearcherSummary[];

  return (
    <TerritoryDetailPanel
      selection={selection}
      onBackToTerritories={onBackToTerritories}
      onBackToTerritory={onBackToTerritory}
      onSelectCity={onSelectCity}
      noun={noun}
      pagination={query.data?.pagination}
      loading={query.isPending}
      fetching={query.isFetching}
      error={query.isError}
      onRetry={() => void query.refetch()}
      onPageChange={(page) => setPageState({ scopeKey, page })}
      isEmpty={researchers.length === 0}
    >
      <ul className="flex flex-col gap-2">
        {researchers.map((researcher) => (
          <li key={researcher.id} className="min-w-0">
            <PersonCard
              researcher={researcher}
              searchType={type}
              layout="compact"
              className="w-full"
              onClick={(event) => {
                if (!isPlainLeftClick(event)) return;
                event.preventDefault();
                onOpenResearcher(researcher.id);
              }}
            />
          </li>
        ))}
      </ul>
    </TerritoryDetailPanel>
  );
}
