import { useQuery } from '@tanstack/react-query';
import { GraduationCap, LayoutGrid, Rows3 } from 'lucide-react';
import type { ProductionItem } from '@/entities/production/model';
import { productionListQueryOptions } from '@/entities/production/queries';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { ProductionMetricYearChart } from '@/entities/production/ui/production-year-charts';
import { formatCount } from '@/entities/researcher/model';
import { orientationColor, statusColor } from '@/shared/lib/design-tokens';
import { Badge, Dot, Tag } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Pagination } from '@/shared/ui/pagination';
import { SectionHeader } from '@/shared/ui/section-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group';
import type { ProfileViewMode } from '../search-schema';

export interface GuidanceTabProps {
  researcherId: string;
  yearStart?: number;
  yearEnd?: number;
  page: number;
  view: ProfileViewMode;
  onPageChange: (page: number) => void;
  onViewChange: (view: ProfileViewMode) => void;
  onOpenItem: (item: ProductionItem<'guidance'>) => void;
}

/**
 * Aba de Orientações: exibe tabela no modo lista (`pesquisador.html`) e cards no modo grade.
 */
export function GuidanceTab({
  researcherId,
  yearStart,
  yearEnd,
  page,
  view,
  onPageChange,
  onViewChange,
  onOpenItem,
}: GuidanceTabProps) {
  const { data, isLoading, isError } = useQuery(
    productionListQueryOptions('guidance', {
      researcher_id: [researcherId],
      ...(yearStart !== undefined ? { year_start: yearStart } : {}),
      ...(yearEnd !== undefined ? { year_end: yearEnd } : {}),
      page,
      per_page: 12,
    }),
  );

  const items = data?.data ?? [];
  const total = data?.pagination.total_items ?? items.length;
  const totalPages = data?.pagination.total_pages ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <ProductionMetricYearChart
        title="Gráfico de orientações por natureza ao longo dos anos"
        kind="guidance"
        groupBy="nature"
        query={{
          researcher_id: [researcherId],
          ...(yearStart !== undefined ? { year_start: yearStart } : {}),
          ...(yearEnd !== undefined ? { year_end: yearEnd } : {}),
        }}
      />

      <section className="flex flex-col gap-3">
        <SectionHeader
          title={
            <span className="inline-flex items-center gap-2">
              <span>Orientações</span>
              {!isLoading && !isError && (
                <Tag variant="neutral" className="tabular-nums">
                  {formatCount(total)}
                </Tag>
              )}
            </span>
          }
          icon={GraduationCap}
        >
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
            <ToggleGroupItem value="list" aria-label="Ver em tabela">
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
            title="Não foi possível carregar as orientações"
            description="Tente recarregar a página ou ajustar os filtros."
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="Nenhuma orientação encontrada"
            description="Não há orientações registradas para este filtro."
          />
        ) : view === 'list' ? (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orientando(a) / Título</TableHead>
                  <TableHead>Natureza</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ano</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const natColor = orientationColor(item.nature);
                  const stColor = item.status ? statusColor(item.status) : null;
                  return (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() => onOpenItem(item)}
                    >
                      <TableCell className="font-medium">
                        <div>{item.oriented || item.title}</div>
                        {item.oriented && item.title && (
                          <div className="line-clamp-1 text-xs font-normal text-muted-foreground">
                            {item.title}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-2 text-sm">
                          <Dot className={natColor.bg} />
                          <span>{item.nature || natColor.label}</span>
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.status && stColor ? (
                          <Badge size="sm" className={stColor.bg}>
                            {item.status}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {item.year ?? '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <ProductionCard
                key={item.id}
                kind="guidance"
                item={item}
                showAuthors={false}
                onOpen={onOpenItem}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </section>
    </div>
  );
}
