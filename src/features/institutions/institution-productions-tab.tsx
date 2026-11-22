import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Rows3 } from 'lucide-react';
import {
  PRODUCTION_KINDS,
  type ProductionItem,
  type ProductionKind,
  type ProductionQuery,
} from '@/entities/production/model';
import { productionListQueryOptions } from '@/entities/production/queries';
import { getProductionDefinition } from '@/entities/production/registry';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { YearFilter } from '@/shared/ui/year-filter';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination, type PaginationMeta } from '@/shared/ui/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { SortSelect, type SortOption } from '@/shared/ui/sort-select';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type {
  InstitutionDetailSearch,
  InstitutionProductionSortBy,
  InstitutionViewMode,
} from './search-schema';

const ARTICLE_SORT_OPTIONS: readonly SortOption<InstitutionProductionSortBy>[] =
  [
    { value: 'year', label: 'Ano', defaultOrder: 'desc' },
    { value: 'citations', label: 'Citações', defaultOrder: 'desc' },
    { value: 'title', label: 'Título', defaultOrder: 'asc' },
  ];

const DEFAULT_SORT_OPTIONS: readonly SortOption<InstitutionProductionSortBy>[] =
  [
    { value: 'year', label: 'Ano', defaultOrder: 'desc' },
    { value: 'title', label: 'Título', defaultOrder: 'asc' },
  ];

export interface InstitutionProductionsTabProps {
  institutionId: string;
  search: InstitutionDetailSearch;
  onUpdateSearch: (
    patch: Partial<InstitutionDetailSearch>,
    options?: { resetPage?: boolean },
  ) => void;
  onOpenProduction?: (kind: ProductionKind, id: string) => void;
  onClearQuery: () => void;
}

/**
 * Aba de produções da página de detalhe da instituição.
 * Permite alternar entre todos os tipos de produção da API v2, filtrar por
 * ano, ordenar e abrir o detalhe de cada item.
 */
export function InstitutionProductionsTab({
  institutionId,
  search,
  onUpdateSearch,
  onOpenProduction,
  onClearQuery,
}: InstitutionProductionsTabProps) {
  const kind: ProductionKind = search.kind ?? 'article';
  const view: InstitutionViewMode = search.view ?? 'grid';
  const definition = getProductionDefinition(kind);
  const sortOptions =
    kind === 'article' ? ARTICLE_SORT_OPTIONS : DEFAULT_SORT_OPTIONS;
  const sortBy =
    kind !== 'article' && search.sort_by === 'citations'
      ? 'year'
      : search.sort_by;

  const queryParams: ProductionQuery<ProductionKind> = {
    institution_id: [institutionId],
    ...(search.q ? { q: search.q } : {}),
    ...(search.year_start !== undefined
      ? { year_start: search.year_start }
      : {}),
    ...(search.year_end !== undefined ? { year_end: search.year_end } : {}),
    ...(sortBy ? { sort_by: sortBy } : {}),
    ...(search.sort_order ? { sort_order: search.sort_order } : {}),
    page: search.page,
    per_page: search.per_page,
  };

  const { data, isPending, isFetching, isError, refetch } = useQuery(
    productionListQueryOptions(kind, queryParams),
  );

  const typedData = data as
    | {
        data?: ProductionItem[];
        pagination?: PaginationMeta;
      }
    | undefined;
  const items = typedData?.data ?? [];
  const hasFilters = Boolean(
    search.q || search.year_start !== undefined || search.year_end !== undefined,
  );

  function handleKindChange(nextKind: string) {
    if ((PRODUCTION_KINDS as readonly string[]).includes(nextKind)) {
      const resolved = nextKind as ProductionKind;
      onUpdateSearch({
        kind: resolved === 'article' ? undefined : resolved,
        ...(resolved !== 'article' && search.sort_by === 'citations'
          ? { sort_by: undefined, sort_order: undefined }
          : {}),
      });
    }
  }

  function handleClearFilters() {
    onClearQuery();
    if (search.year_start !== undefined || search.year_end !== undefined) {
      onUpdateSearch({
        q: undefined,
        year_start: undefined,
        year_end: undefined,
      });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={kind} onValueChange={handleKindChange}>
            <SelectTrigger
              aria-label="Tipo de produção"
              className="w-[220px] bg-card"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRODUCTION_KINDS.map((optionKind) => {
                const optionDef = getProductionDefinition(optionKind);
                return (
                  <SelectItem key={optionKind} value={optionKind}>
                    {optionDef.title}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <YearFilter
            yearStart={search.year_start}
            yearEnd={search.year_end}
            onChange={({ yearStart, yearEnd }) =>
              onUpdateSearch({
                year_start: yearStart,
                year_end: yearEnd,
              })
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <SortSelect
            options={sortOptions}
            value={sortBy}
            order={search.sort_order}
            onChange={(next) =>
              onUpdateSearch({
                sort_by: next.sort_by,
                sort_order: next.sort_order,
              })
            }
            showOrderToggle
          />

          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(next) => {
              if (next === 'grid' || next === 'list') {
                onUpdateSearch(
                  { view: next === 'grid' ? undefined : next },
                  { resetPage: false },
                );
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
        </div>
      </div>

      {isPending ? (
        <LoadingBlock />
      ) : isError ? (
        <EmptyState
          icon={definition.icon}
          title={`Não foi possível carregar ${definition.title.toLowerCase()}`}
          description="Tente novamente em instantes ou ajuste os filtros."
          action={
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          }
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={definition.icon}
          title={`Nenhum registro em ${definition.title.toLowerCase()}`}
          description={
            hasFilters
              ? `Não encontramos ${definition.title.toLowerCase()} para os filtros aplicados nesta instituição.`
              : `Esta instituição ainda não possui ${definition.title.toLowerCase()} cadastrados.`
          }
          action={
            hasFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
              >
                Limpar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div
          aria-busy={isFetching || undefined}
          className="flex flex-col gap-4"
        >
          <div
            className={
              view === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                : 'flex flex-col gap-3'
            }
          >
            {items.map((item) => (
              <ProductionCard
                key={item.id}
                kind={kind}
                item={item}
                showAuthors
                onOpen={
                  onOpenProduction
                    ? (selected) => onOpenProduction(kind, selected.id)
                    : undefined
                }
              />
            ))}
          </div>

          {typedData?.pagination && (
            <Pagination
              pagination={typedData.pagination}
              onPageChange={(page) =>
                onUpdateSearch({ page }, { resetPage: false })
              }
              onPerPageChange={(per_page) => onUpdateSearch({ per_page })}
            />
          )}
        </div>
      )}
    </div>
  );
}
