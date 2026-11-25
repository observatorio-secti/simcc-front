import { useState } from 'react';
import { LayoutGrid, Rows3, Users } from 'lucide-react';
import type { ResearcherSummary } from '@/entities/researcher/model';
import { PersonCard } from '@/entities/researcher/ui/person-card';
import { cn } from '@/shared/lib/cn';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination, type PaginationMeta } from '@/shared/ui/pagination';
import { SectionHeader } from '@/shared/ui/section-header';
import {
  SortSelect,
  type SortOption,
  type SortSelection,
} from '@/shared/ui/sort-select';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import { isPlainLeftClick } from '@/shared/lib/plain-click';
import type { ResolvedSort, ResultsViewMode } from '../results-search';
import type { SearchType } from '../search-schema';
import { ResultsEmpty, ResultsError } from './result-states';

export interface ResearcherResultsProps {
  researchers: readonly ResearcherSummary[] | undefined;
  pagination: PaginationMeta | undefined;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  q?: string;
  type: SearchType;
  view: ResultsViewMode;
  sort: ResolvedSort;
  sortOptions: readonly SortOption[];
  hasFilters: boolean;
  onSortChange: (next: SortSelection) => void;
  onViewChange: (view: ResultsViewMode) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onClearFilters: () => void;
  onClearQuery: () => void;
  onOpenResearcher: (id: string) => void;
}

/**
 * Grade ou lista paginada de pesquisadores, com ordenação.
 */
export function ResearcherResults({
  researchers = [],
  pagination,
  isPending,
  isFetching,
  isError,
  onRetry,
  q,
  type,
  view,
  sort,
  sortOptions,
  hasFilters,
  onSortChange,
  onViewChange,
  onPageChange,
  onPerPageChange,
  onClearFilters,
  onClearQuery,
  onOpenResearcher,
}: ResearcherResultsProps) {
  const [open, setOpen] = useState(true);
  const cardLayout = view === 'list' ? 'list' : 'grid';

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={Users}
        title="Pesquisadores"
        open={open}
        onOpenChange={setOpen}
        controls="results-researchers"
        className="flex-wrap"
      >
        <SortSelect
          options={sortOptions}
          value={sort.sort_by}
          order={sort.sort_order}
          onChange={onSortChange}
          showOrderToggle
        />
        <ToggleGroup
          type="single"
          value={cardLayout}
          onValueChange={(value) => {
            if (value === 'grid' || value === 'list') {
              onViewChange(value);
            }
          }}
          aria-label="Modo de visualização"
          className="rounded-md bg-neutral-100 p-0.5 dark:bg-neutral-800"
        >
          <ToggleGroupItem
            value="list"
            aria-label="Ver em lista"
            className="size-8 rounded-sm data-[state=on]:border data-[state=on]:bg-card"
          >
            <Rows3 className="size-4" aria-hidden />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="grid"
            aria-label="Ver em grade"
            className="size-8 rounded-sm data-[state=on]:border data-[state=on]:bg-card"
          >
            <LayoutGrid className="size-4" aria-hidden />
          </ToggleGroupItem>
        </ToggleGroup>
      </SectionHeader>

      {open && (
        <div
          id="results-researchers"
          aria-busy={isFetching || undefined}
          className={cn(
            'flex flex-col gap-4 transition-opacity',
            isFetching && !isPending && 'opacity-60',
          )}
        >
          {isPending ? (
            <LoadingBlock className="min-h-72" />
          ) : isError ? (
            <ResultsError onRetry={onRetry} />
          ) : researchers.length === 0 ? (
            <ResultsEmpty
              icon={Users}
              noun="pesquisadores"
              q={q}
              hasFilters={hasFilters}
              onClearFilters={onClearFilters}
              onClearQuery={onClearQuery}
            />
          ) : (
            <>
              <ul
                className={cn(
                  'grid gap-3',
                  view === 'list'
                    ? 'grid-cols-1'
                    : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
                )}
              >
                {researchers.map((researcher) => (
                  <li key={researcher.id} className="min-w-0">
                    <PersonCard
                      researcher={researcher}
                      searchType={type}
                      layout={cardLayout}
                      className="h-full w-full"
                      onClick={(event) => {
                        if (!isPlainLeftClick(event)) return;
                        event.preventDefault();
                        onOpenResearcher(researcher.id);
                      }}
                    />
                  </li>
                ))}
              </ul>
              {pagination && (
                <Pagination
                  pagination={pagination}
                  onPageChange={onPageChange}
                  onPerPageChange={onPerPageChange}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
