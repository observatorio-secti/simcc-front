import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  LayoutGrid,
  Rows3,
  X,
} from 'lucide-react';
import type { ProductionItem } from '@/entities/production/model';
import { productionListQueryOptions } from '@/entities/production/queries';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { ProductionMetricYearChart } from '@/entities/production/ui/production-year-charts';
import { RecentYearsNotice } from '@/entities/production/ui/recent-years-notice';
import { formatCount } from '@/entities/researcher/model';
import { qualisColor } from '@/shared/lib/design-tokens';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { SectionHeader } from '@/shared/ui/section-header';
import { SortSelect, type SortOption } from '@/shared/ui/sort-select';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type {
  ArticleSortBy,
  ProfileViewMode,
  QualisStratum,
  ResearcherProfileSearch,
} from '../search-schema';
import { YearFilter } from './year-filter';

const QUALIS_OPTIONS: ReadonlyArray<{ value: QualisStratum; label: string }> = [
  { value: 'A1', label: 'A1' },
  { value: 'A2', label: 'A2' },
  { value: 'A3', label: 'A3' },
  { value: 'A4', label: 'A4' },
  { value: 'B1', label: 'B1' },
  { value: 'B2', label: 'B2' },
  { value: 'B3', label: 'B3' },
  { value: 'B4', label: 'B4' },
  { value: 'C', label: 'C' },
  { value: 'not_rated', label: 'Sem Qualis' },
];

const ARTICLE_SORT_OPTIONS: readonly SortOption<ArticleSortBy>[] = [
  { value: 'year', label: 'Ano', defaultOrder: 'desc' },
  { value: 'citations', label: 'Citações', defaultOrder: 'desc' },
  { value: 'title', label: 'Título', defaultOrder: 'asc' },
];

export interface ArticlesTabProps {
  researcherId: string;
  search: ResearcherProfileSearch;
  onUpdateSearch: (patch: Partial<ResearcherProfileSearch>) => void;
  onOpenItem: (item: ProductionItem<'article'>) => void;
}

/**
 * Aba de Artigos do perfil do pesquisador: filtros de Qualis e ano,
 * gráfico por Qualis e listagem paginada com alternância grade/lista.
 */
export function ArticlesTab({
  researcherId,
  search,
  onUpdateSearch,
  onOpenItem,
}: ArticlesTabProps) {
  const selectedQualis = search.qualis ?? [];

  const queryParams = {
    researcher_id: [researcherId],
    ...(selectedQualis.length > 0 ? { qualis: selectedQualis } : {}),
    ...(search.year_start !== undefined
      ? { year_start: search.year_start }
      : {}),
    ...(search.year_end !== undefined ? { year_end: search.year_end } : {}),
    ...(search.sort_by !== undefined ? { sort_by: search.sort_by } : {}),
    ...(search.sort_order !== undefined
      ? { sort_order: search.sort_order }
      : {}),
    page: search.page,
    per_page: 12,
    facets: ['qualis'],
  };

  const { data, isLoading, isError } = useQuery(
    productionListQueryOptions('article', queryParams),
  );

  const items = data?.data ?? [];
  const total = data?.pagination.total_items ?? items.length;
  const totalPages = data?.pagination.total_pages ?? 1;

  const defaultYearStart = getDefaultYearStart();
  const hasCustomFilters =
    selectedQualis.length > 0 ||
    search.year_start !== defaultYearStart ||
    search.year_end !== undefined;

  function handleToggleQualis(stratum: QualisStratum) {
    const exists = selectedQualis.includes(stratum);
    const next = exists
      ? selectedQualis.filter((item) => item !== stratum)
      : [...selectedQualis, stratum];
    onUpdateSearch({
      qualis: next.length > 0 ? next : undefined,
      page: 1,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <CheckCircle2
              className="size-4 text-muted-foreground"
              aria-hidden
            />
            Selecione o Qualis
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 min-w-56 justify-between font-normal"
                >
                  <span className="truncate">
                    {selectedQualis.length > 0
                      ? `${selectedQualis.length} selecionado(s)`
                      : 'Escolha o Qualis dos artigos'}
                  </span>
                  <ChevronDown
                    className="size-4 text-muted-foreground"
                    aria-hidden
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-56 p-2">
                <div className="flex flex-col gap-1">
                  {QUALIS_OPTIONS.map((option) => {
                    const checked = selectedQualis.includes(option.value);
                    const color = qualisColor(
                      option.value === 'not_rated' ? 'SQ' : option.value,
                    );
                    return (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() =>
                            handleToggleQualis(option.value)
                          }
                        />
                        <Dot className={color.bg} />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {selectedQualis.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onUpdateSearch({ qualis: undefined, page: 1 })}
              >
                <X aria-hidden />
                Limpar Qualis
              </Button>
            )}
          </div>

          {selectedQualis.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedQualis.map((stratum) => {
                const label = stratum === 'not_rated' ? 'SQ' : stratum;
                const color = qualisColor(label);
                return (
                  <Badge
                    key={stratum}
                    size="sm"
                    variant={color.light ? 'outline' : 'solid'}
                    className={color.light ? undefined : color.bg}
                  >
                    {color.light && <Dot className={color.bg} />}
                    {label}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        <YearFilter
          yearStart={search.year_start}
          yearEnd={search.year_end}
          onChange={({ yearStart, yearEnd }) =>
            onUpdateSearch({
              year_start: yearStart,
              year_end: yearEnd,
              page: 1,
            })
          }
        />
      </div>

      <RecentYearsNotice
        yearStart={search.year_start}
        yearEnd={search.year_end}
      />

      <ProductionMetricYearChart
        title="Gráfico de quantidade total por Qualis"
        ariaLabel="Distribuição anual de artigos por estrato Qualis"
        kind="article"
        groupBy="qualis"
        query={{
          researcher_id: [researcherId],
          ...(search.year_start !== undefined
            ? { year_start: search.year_start }
            : {}),
          ...(search.year_end !== undefined
            ? { year_end: search.year_end }
            : {}),
        }}
        selectedKeys={selectedQualis}
        onToggleKey={(key) => handleToggleQualis(key as QualisStratum)}
      />

      <section className="flex flex-col gap-3">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <span>Artigos</span>
              {!isLoading && !isError && (
                <Tag variant="neutral" className="tabular-nums">
                  {formatCount(total)}
                </Tag>
              )}
            </span>
          }
          icon={FileText}
        >
          <SortSelect
            options={ARTICLE_SORT_OPTIONS}
            value={search.sort_by}
            order={search.sort_order}
            showOrderToggle
            onChange={({ sort_by, sort_order }) =>
              onUpdateSearch({ sort_by, sort_order, page: 1 })
            }
          />
          <ToggleGroup
            type="single"
            value={search.view}
            onValueChange={(next: string) => {
              if (next === 'grid' || next === 'list') {
                onUpdateSearch({ view: next as ProfileViewMode });
              }
            }}
            aria-label="Modo de visualização"
          >
            <ToggleGroupItem value="list" aria-label="Ver em lista">
              <Rows3 className="size-4" aria-hidden />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Ver em blocos">
              <LayoutGrid className="size-4" aria-hidden />
            </ToggleGroupItem>
          </ToggleGroup>
        </SectionHeader>

        {isLoading ? (
          <LoadingBlock />
        ) : isError ? (
          <EmptyState
            title="Não foi possível carregar os artigos"
            description="Tente recarregar a página ou ajustar os filtros."
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Nenhum artigo encontrado"
            description={
              hasCustomFilters
                ? 'Não há artigos publicados para os filtros selecionados.'
                : `Não há artigos publicados a partir de ${search.year_start}.`
            }
            action={
              hasCustomFilters ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onUpdateSearch({
                      qualis: undefined,
                      year_start: defaultYearStart,
                      year_end: undefined,
                      page: 1,
                    })
                  }
                >
                  Limpar filtros
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div
              className={
                search.view === 'grid'
                  ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-3'
              }
            >
              {items.map((article) => (
                <ProductionCard
                  key={article.id}
                  kind="article"
                  item={article}
                  showAuthors={false}
                  onOpen={onOpenItem}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                page={search.page}
                totalPages={totalPages}
                onPageChange={(page) => onUpdateSearch({ page })}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
