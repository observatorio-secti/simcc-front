import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Rows3 } from 'lucide-react';
import type {
  ProductionItem,
  ProductionKind,
} from '@/entities/production/model';
import { productionListQueryOptions } from '@/entities/production/queries';
import { getProductionDefinition } from '@/entities/production/registry';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { formatCount } from '@/entities/researcher/model';
import { Tag } from '@/shared/ui/badge';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { SectionHeader } from '@/shared/ui/section-header';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type { ProfileViewMode } from '../search-schema';

export interface ProductionListSectionProps<K extends ProductionKind> {
  researcherId: string;
  kind: K;
  title?: string;
  yearStart?: number;
  yearEnd?: number;
  page?: number;
  perPage?: number;
  view?: ProfileViewMode;
  collapsible?: boolean;
  onPageChange?: (page: number) => void;
  onViewChange?: (view: ProfileViewMode) => void;
  onOpenItem?: (kind: K, item: ProductionItem<K>) => void;
}

/**
 * Seção reutilizável de listagem de produções de um pesquisador por tipo (`ProductionKind`).
 */
export function ProductionListSection<K extends ProductionKind>({
  researcherId,
  kind,
  title,
  yearStart,
  yearEnd,
  page = 1,
  perPage = 12,
  view = 'grid',
  collapsible = false,
  onPageChange,
  onViewChange,
  onOpenItem,
}: ProductionListSectionProps<K>) {
  const [open, setOpen] = useState(true);
  const contentId = useId();
  const definition = getProductionDefinition(kind);

  const queryParams = {
    researcher_id: [researcherId],
    ...(yearStart !== undefined ? { year_start: yearStart } : {}),
    ...(yearEnd !== undefined ? { year_end: yearEnd } : {}),
    page,
    per_page: perPage,
  };

  const { data, isLoading, isError } = useQuery(
    productionListQueryOptions(kind, queryParams),
  );

  const typedData = data as
    | {
        data?: ProductionItem<K>[];
        pagination?: { total_items: number; total_pages: number };
      }
    | undefined;
  const items = typedData?.data ?? [];
  const total = typedData?.pagination?.total_items ?? items.length;
  const totalPages = typedData?.pagination?.total_pages ?? 1;

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title={
          <span className="inline-flex items-center gap-2">
            <span>{title ?? definition.title}</span>
            {!isLoading && !isError && (
              <Tag variant="neutral" className="tabular-nums">
                {formatCount(total)}
              </Tag>
            )}
          </span>
        }
        icon={definition.icon}
        open={collapsible ? open : undefined}
        onOpenChange={collapsible ? setOpen : undefined}
        controls={collapsible ? contentId : undefined}
      >
        {onViewChange && (
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(next) => {
              if (next === 'grid' || next === 'list') {
                onViewChange(next);
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
        )}
      </SectionHeader>

      {(!collapsible || open) && (
        <div id={contentId} className="flex flex-col gap-4">
          {isLoading ? (
            <LoadingBlock />
          ) : isError ? (
            <EmptyState
              title={`Não foi possível carregar ${definition.title.toLowerCase()}`}
              description="Tente recarregar a página ou ajustar os filtros."
            />
          ) : items.length === 0 ? (
            <EmptyState
              icon={definition.icon}
              title={`Nenhum registro em ${definition.title.toLowerCase()}`}
              description="Não há produções cadastradas para este filtro."
            />
          ) : (
            <>
              <div
                className={
                  view === 'grid'
                    ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
                    : 'flex flex-col gap-3'
                }
              >
                {items.map((item) => (
                  <ProductionCard
                    key={(item as ProductionItem).id}
                    kind={kind}
                    item={item}
                    showAuthors={false}
                    onOpen={
                      onOpenItem
                        ? (selected) => onOpenItem(kind, selected)
                        : undefined
                    }
                  />
                ))}
              </div>

              {onPageChange && totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                />
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
