import type { ReactNode } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { territoryFill } from '@/shared/lib/design-tokens';
import { Button } from '@/shared/ui/button';
import { Pagination, type PaginationMeta } from '@/shared/ui/pagination';
import { Skeleton } from '@/shared/ui/skeleton';
import { formatTerritoryName } from '../model';
import type { TerritoryMapNoun, TerritorySelection } from './territory-map';

function countLabel(count: number, [singular, plural]: TerritoryMapNoun) {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : plural}`;
}

export interface TerritoryDetailPanelProps {
  selection: TerritorySelection;
  onBackToTerritories: () => void;
  onBackToTerritory: () => void;
  noun: TerritoryMapNoun;
  pagination?: PaginationMeta;
  loading?: boolean;
  fetching?: boolean;
  error?: boolean;
  onRetry?: () => void;
  onPageChange: (page: number) => void;
  isEmpty?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Painel lateral de detalhamento para o território ou município selecionado no
 * mapa: navegação hierárquica de volta, lista paginada no estilo da página e
 * controles compactos de paginação.
 */
export function TerritoryDetailPanel({
  selection,
  onBackToTerritories,
  onBackToTerritory,
  noun,
  pagination,
  loading = false,
  fetching = false,
  error = false,
  onRetry,
  onPageChange,
  isEmpty = false,
  children,
  className,
}: TerritoryDetailPanelProps) {
  const territoryCode =
    selection.kind === 'territory' ? selection.code : selection.territoryCode;
  const formattedTerritory = formatTerritoryName(
    selection.kind === 'territory' ? selection.label : selection.territoryLabel,
  );
  const title =
    selection.kind === 'territory' ? formattedTerritory : selection.label;
  const totalCount = pagination?.total_items ?? selection.count;

  return (
    <div
      data-slot="territory-detail-panel"
      aria-busy={fetching || undefined}
      className={cn(
        'flex h-[420px] flex-col gap-2.5 rounded-lg border bg-card p-3 md:h-[480px]',
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 border-b pb-2.5">
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-1.5 h-6 px-1.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={onBackToTerritories}
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Territórios
          </Button>
          {selection.kind === 'city' && (
            <>
              <span
                aria-hidden
                className="text-xs text-muted-foreground/60"
              >
                /
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 max-w-[165px] px-1.5 text-xs text-muted-foreground hover:text-foreground"
                onClick={onBackToTerritory}
              >
                <span className="truncate">{formattedTerritory}</span>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-xs border border-black/10"
              style={{ backgroundColor: territoryFill(territoryCode) }}
            />
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {title}
              </h3>
              {selection.kind === 'city' && (
                <p className="truncate text-[11px] text-muted-foreground">
                  {formattedTerritory}
                </p>
              )}
            </div>
          </div>
          {!loading && (
            <span className="shrink-0 text-xs font-medium text-muted-foreground tabular-nums">
              {countLabel(totalCount, noun)}
            </span>
          )}
        </div>
      </div>

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 transition-opacity',
          fetching && !loading && 'opacity-60',
        )}
      >
        {loading ? (
          Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-[74px] w-full shrink-0 rounded-lg" />
          ))
        ) : error ? (
          <div
            role="alert"
            className="flex flex-1 flex-col items-center justify-center gap-2 px-2 text-center text-xs text-muted-foreground"
          >
            <p>Não foi possível carregar os resultados desta área.</p>
            {onRetry && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetry}
              >
                Tentar novamente
              </Button>
            )}
          </div>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-2 text-center text-xs text-muted-foreground">
            <MapPin className="size-5 text-neutral-400" aria-hidden />
            <p>Nenhum resultado encontrado nesta área.</p>
          </div>
        ) : (
          children
        )}
      </div>

      {pagination && !loading && !error && !isEmpty && (
        <div className="border-t pt-2">
          <Pagination
            compact
            pagination={pagination}
            disabled={fetching}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
