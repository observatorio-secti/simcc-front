import { useState } from 'react';
import type {
  ProductionItem,
  ProductionKind,
} from '@/entities/production/model';
import { getProductionDefinition } from '@/entities/production/registry';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { cn } from '@/shared/lib/cn';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination, type PaginationMeta } from '@/shared/ui/pagination';
import { SectionHeader } from '@/shared/ui/section-header';
import {
  SortSelect,
  type SortOption,
  type SortSelection,
} from '@/shared/ui/sort-select';
import { interceptResearcherLink } from '../researcher-links';
import type { ResolvedSort } from '../results-search';
import { ResultsEmpty, ResultsError } from './result-states';

export interface ProductionResultsProps<K extends ProductionKind> {
  kind: K;
  items: readonly ProductionItem<K>[] | undefined;
  pagination: PaginationMeta | undefined;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  q?: string;
  sort: ResolvedSort;
  sortOptions: readonly SortOption[];
  hasFilters: boolean;
  onSortChange: (next: SortSelection) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onClearFilters: () => void;
  onClearQuery: () => void;
  onOpenResearcher: (id: string) => void;
}

/**
 * Lista de produções de um tipo (`ProductionCard`). Sem rota de detalhe de
 * produção por enquanto (T13); os chips de autor abrem o overlay do perfil.
 */
export function ProductionResults<K extends ProductionKind>({
  kind,
  items = [],
  pagination,
  isPending,
  isFetching,
  isError,
  onRetry,
  q,
  sort,
  sortOptions,
  hasFilters,
  onSortChange,
  onPageChange,
  onPerPageChange,
  onClearFilters,
  onClearQuery,
  onOpenResearcher,
}: ProductionResultsProps<K>) {
  const [open, setOpen] = useState(true);
  const definition = getProductionDefinition(kind);
  const panelId = `results-production-${kind}`;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={definition.icon}
        title={definition.title}
        open={open}
        onOpenChange={setOpen}
        controls={panelId}
        className="flex-wrap"
      >
        <SortSelect
          options={sortOptions}
          value={sort.sort_by}
          order={sort.sort_order}
          onChange={onSortChange}
          showOrderToggle
        />
      </SectionHeader>

      {open && (
        <div
          id={panelId}
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
          ) : items.length === 0 ? (
            <ResultsEmpty
              icon={definition.icon}
              noun={definition.noun[1]}
              q={q}
              hasFilters={hasFilters}
              onClearFilters={onClearFilters}
              onClearQuery={onClearQuery}
            />
          ) : (
            <>
              {/* Delegação: os chips de autor (links) abrem o overlay do perfil. */}
              <ul
                className="grid gap-4 xl:grid-cols-2"
                onClick={(event) =>
                  interceptResearcherLink(event, onOpenResearcher)
                }
              >
                {items.map((item) => (
                  <li key={(item as ProductionItem).id} className="min-w-0">
                    <ProductionCard
                      kind={kind}
                      item={item}
                      className="h-full"
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
