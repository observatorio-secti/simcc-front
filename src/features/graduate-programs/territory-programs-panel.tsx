import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { GraduateProgramSummary } from '@/entities/graduate-program/model';
import { graduateProgramListQueryOptions } from '@/entities/graduate-program/queries';
import { ProgramCard } from '@/entities/graduate-program/ui/program-card';
import { TerritoryDetailPanel } from '@/entities/territory/ui/territory-detail-panel';
import type {
  TerritoryMapNoun,
  TerritorySelectionContext,
} from '@/entities/territory/ui/territory-map';
import {
  toGraduateProgramMapPreviewQuery,
  type GraduateProgramListSearchState,
} from './search';

export interface TerritoryProgramsPanelProps extends TerritorySelectionContext {
  search: GraduateProgramListSearchState;
  noun: TerritoryMapNoun;
}

/**
 * Prévia paginada de programas de pós-graduação exibida na coluna lateral do
 * mapa quando um território ou município é focado.
 */
export function TerritoryProgramsPanel({
  selection,
  onBackToTerritories,
  onBackToTerritory,
  onSelectCity,
  search,
  noun,
}: TerritoryProgramsPanelProps) {
  const scopeKey = JSON.stringify(
    toGraduateProgramMapPreviewQuery(search, selection, 1),
  );

  const [pageState, setPageState] = useState({ scopeKey, page: 1 });
  const currentPage = pageState.scopeKey === scopeKey ? pageState.page : 1;

  const query = useQuery({
    ...graduateProgramListQueryOptions(
      toGraduateProgramMapPreviewQuery(search, selection, currentPage),
    ),
    placeholderData: keepPreviousData,
  });

  const items = (query.data?.data ?? []) as GraduateProgramSummary[];

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
      isEmpty={items.length === 0}
    >
      <ul className="flex flex-col gap-2">
        {items.map((program) => (
          <li key={program.id} className="min-w-0">
            <ProgramCard
              program={program}
              layout="compact"
              className="w-full"
            />
          </li>
        ))}
      </ul>
    </TerritoryDetailPanel>
  );
}
