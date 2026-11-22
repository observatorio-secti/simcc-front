import { useState, type MouseEvent, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { Magazine } from '@/entities/magazine/model';
import { MagazineCard } from '@/entities/magazine/ui/magazine-card';
import type { Scholarship } from '@/entities/scholarship/model';
import { ScholarshipCard } from '@/entities/scholarship/ui/scholarship-card';
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
import { SEARCH_TABS } from '../search-tabs';
import { ResultsEmpty, ResultsError } from './result-states';

interface CatalogResultsBaseProps {
  pagination: PaginationMeta | undefined;
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  onRetry: () => void;
  sort: ResolvedSort;
  sortOptions: readonly SortOption[];
  hasFilters: boolean;
  onSortChange: (next: SortSelection) => void;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onClearFilters: () => void;
  onClearQuery: () => void;
}

interface CatalogSectionProps extends CatalogResultsBaseProps {
  id: string;
  icon: LucideIcon;
  title: string;
  noun: string;
  count: number;
  onListClick?: (event: MouseEvent<HTMLUListElement>) => void;
  children: ReactNode;
}

/** Seção colapsável de um catálogo sem termo (template C): ordenação, grade e paginação. */
function CatalogSection({
  id,
  icon,
  title,
  noun,
  count,
  pagination,
  isPending,
  isFetching,
  isError,
  onRetry,
  sort,
  sortOptions,
  hasFilters,
  onSortChange,
  onPageChange,
  onPerPageChange,
  onClearFilters,
  onClearQuery,
  onListClick,
  children,
}: CatalogSectionProps) {
  const [open, setOpen] = useState(true);
  const panelId = `results-${id}`;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        icon={icon}
        title={title}
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
          ) : count === 0 ? (
            <ResultsEmpty
              icon={icon}
              noun={noun}
              hasFilters={hasFilters}
              onClearFilters={onClearFilters}
              onClearQuery={onClearQuery}
            />
          ) : (
            <>
              <ul
                className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3"
                onClick={onListClick}
              >
                {children}
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

export interface ScholarshipResultsProps extends CatalogResultsBaseProps {
  items: readonly Scholarship[] | undefined;
  onOpenResearcher: (id: string) => void;
}

/** Bolsistas de `/v2/scholarship` (`ScholarshipCard`); o nome abre o overlay do perfil. */
export function ScholarshipResults({
  items = [],
  onOpenResearcher,
  ...props
}: ScholarshipResultsProps) {
  const tab = SEARCH_TABS.scholarships;
  return (
    <CatalogSection
      {...props}
      id="scholarships"
      icon={tab.icon}
      title={tab.label}
      noun="bolsistas"
      count={items.length}
      onListClick={(event) => interceptResearcherLink(event, onOpenResearcher)}
    >
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <ScholarshipCard scholarship={item} className="h-full" />
        </li>
      ))}
    </CatalogSection>
  );
}

export interface MagazineResultsProps extends CatalogResultsBaseProps {
  items: readonly Magazine[] | undefined;
}

/** Revistas de `/v2/magazine` (`MagazineCard`, com Qualis e JCR). */
export function MagazineResults({
  items = [],
  ...props
}: MagazineResultsProps) {
  const tab = SEARCH_TABS.magazines;
  return (
    <CatalogSection
      {...props}
      id="magazines"
      icon={tab.icon}
      title={tab.label}
      noun="revistas"
      count={items.length}
    >
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <MagazineCard magazine={item} className="h-full" />
        </li>
      ))}
    </CatalogSection>
  );
}
