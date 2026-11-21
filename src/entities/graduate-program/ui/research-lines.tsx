import { useState, type ReactNode } from 'react';
import { Calendar, LayoutGrid, Rows3, TextSearch } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Dot, Tag } from '@/shared/ui/badge';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
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
import {
  formatCount,
  formatProgramArea,
  formatResearchLinePeriod,
  resolveProgramAreaColor,
  type ResearchLine,
} from '../model';

export type ResearchLinesLayout = 'grid' | 'table';

export interface ResearchLinesProps {
  lines: readonly ResearchLine[];
  /** Título exibido no cabeçalho; passe `null` para ocultá-lo. */
  title?: ReactNode;
  /** Modo de exibição controlado (`grid` ou `table`). */
  layout?: ResearchLinesLayout;
  /** Modo inicial quando `layout` não é controlado. */
  defaultLayout?: ResearchLinesLayout;
  onLayoutChange?: (layout: ResearchLinesLayout) => void;
  /** Exibe alternância grade/tabela no cabeçalho quando há itens. */
  showLayoutToggle?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

function formatEndYearCell(line: ResearchLine): string {
  if (typeof line.end_year === 'number' && Number.isFinite(line.end_year)) {
    return String(line.end_year);
  }
  if (typeof line.start_year === 'number' && Number.isFinite(line.start_year)) {
    return 'Atual';
  }
  return '—';
}

/**
 * Linhas de pesquisa no detalhe do programa de pós-graduação, com alternância
 * entre grade de cards e tabela (`sc-table`).
 */
export function ResearchLines({
  lines,
  title = 'Linhas de pesquisa',
  layout,
  defaultLayout = 'grid',
  onLayoutChange,
  showLayoutToggle = true,
  emptyTitle = 'Nenhuma linha de pesquisa cadastrada',
  emptyDescription = 'Este programa ainda não possui linhas de pesquisa registradas.',
  className,
}: ResearchLinesProps) {
  const [internalLayout, setInternalLayout] =
    useState<ResearchLinesLayout>(defaultLayout);
  const activeLayout = layout ?? internalLayout;

  function handleLayoutChange(next: string) {
    if (next !== 'grid' && next !== 'table') return;
    if (layout === undefined) setInternalLayout(next);
    onLayoutChange?.(next);
  }

  return (
    <section
      data-slot="research-lines"
      className={cn('flex flex-col gap-3', className)}
    >
      {title !== null && (
        <SectionHeader
          icon={TextSearch}
          as="h3"
          title={
            <span className="inline-flex flex-wrap items-center gap-2">
              <span>{title}</span>
              {lines.length > 0 && (
                <Tag variant="neutral">
                  <b>{formatCount(lines.length)}</b>
                </Tag>
              )}
            </span>
          }
        >
          {showLayoutToggle && lines.length > 0 && (
            <ToggleGroup
              type="single"
              value={activeLayout}
              onValueChange={handleLayoutChange}
              aria-label="Modo de exibição das linhas de pesquisa"
            >
              <ToggleGroupItem value="grid" aria-label="Exibir em grade">
                <LayoutGrid aria-hidden />
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Exibir em tabela">
                <Rows3 aria-hidden />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </SectionHeader>
      )}

      {lines.length === 0 ? (
        <Card>
          <EmptyState
            icon={TextSearch}
            title={emptyTitle}
            description={emptyDescription}
          />
        </Card>
      ) : activeLayout === 'table' ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Linha de pesquisa</TableHead>
                <TableHead>Área</TableHead>
                <TableHead className="text-right">Início</TableHead>
                <TableHead className="text-right">Término</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lines.map((line, index) => {
                const areaLabel = formatProgramArea(line.area);
                const areaColor = areaLabel
                  ? resolveProgramAreaColor(line.area)
                  : null;
                const startText =
                  typeof line.start_year === 'number' &&
                  Number.isFinite(line.start_year)
                    ? String(line.start_year)
                    : '—';

                return (
                  <TableRow key={`${line.name}-${index}`}>
                    <TableCell className="font-medium text-foreground">
                      {line.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {areaLabel && areaColor ? (
                        <span className="inline-flex items-center gap-2">
                          <Dot className={areaColor.bg} />
                          <span>{areaLabel}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {startText}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground tabular-nums">
                      {formatEndYearCell(line)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div
          data-slot="research-lines-grid"
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {lines.map((line, index) => {
            const areaLabel = formatProgramArea(line.area);
            const areaColor = areaLabel
              ? resolveProgramAreaColor(line.area)
              : null;
            const period = formatResearchLinePeriod(
              line.start_year,
              line.end_year,
            );

            return (
              <Card
                key={`${line.name}-${index}`}
                className="justify-between gap-3 p-4"
              >
                <p className="text-sm leading-snug font-medium text-foreground">
                  {line.name}
                </p>
                {(areaLabel || period) && (
                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    {areaLabel && areaColor && (
                      <span className="inline-flex items-center gap-1.5">
                        <Dot className={areaColor.bg} />
                        <span>{areaLabel}</span>
                      </span>
                    )}
                    {period && (
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <Calendar className="size-3 shrink-0" aria-hidden />
                        <span>{period}</span>
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
