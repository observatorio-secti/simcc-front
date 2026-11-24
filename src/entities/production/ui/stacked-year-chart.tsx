import { useId, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { chartNeutralBg } from '@/shared/lib/design-tokens';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/section-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { getYearLabelStep } from './year-label-step';

export interface StackedYearSeries {
  /** Chave do grupo presente em `groups` (ex.: `A1`, `book`, `CONCLUIDO`). */
  key: string;
  /** Rótulo exibido na legenda e no leitor de tela. */
  label: string;
  /** Classe Tailwind de fundo (ex.: `bg-qualis-A1`). */
  bgClassName: string;
}

export interface StackedYearPoint {
  period: number;
  value: number;
  groups?: Record<string, number> | null;
}

export interface StackedYearChartProps {
  title: string;
  ariaLabel?: string;
  points: readonly StackedYearPoint[];
  /**
   * Ordem e metadados das séries. Chaves que aparecerem nos dados fora desta
   * lista recebem cor neutra cíclica automaticamente.
   */
  series?: readonly StackedYearSeries[];
  isLoading?: boolean;
  /** Chaves selecionadas para destaque/filtro (ex.: estratos Qualis). */
  selectedKeys?: readonly string[];
  /** Callback opcional ao clicar em uma série (na legenda ou segmento). */
  onToggleKey?: (key: string) => void;
  /** Oculta a legenda quando houver apenas uma série sem distinção visual útil. */
  hideLegend?: boolean;
}

const CHART_HEIGHT_PX = 144;

function resolveSeriesList(
  points: readonly StackedYearPoint[],
  configured: readonly StackedYearSeries[],
): StackedYearSeries[] {
  const presentKeys = new Set<string>();
  for (const point of points) {
    if (!point.groups) continue;
    for (const [key, count] of Object.entries(point.groups)) {
      if (count > 0) presentKeys.add(key);
    }
  }

  const configuredMap = new Map(configured.map((item) => [item.key, item]));
  const result: StackedYearSeries[] = [];

  for (const item of configured) {
    if (presentKeys.has(item.key)) {
      result.push(item);
    }
  }

  let fallbackIdx = 0;
  for (const key of presentKeys) {
    if (!configuredMap.has(key)) {
      result.push({
        key,
        label: key,
        bgClassName: chartNeutralBg(fallbackIdx++),
      });
    }
  }

  return result;
}

/**
 * Gráfico de colunas empilhadas por ano (`period`), com total no topo e
 * legenda inferior interativa. Usado no perfil do pesquisador e na `/busca`.
 */
export function StackedYearChart({
  title,
  ariaLabel,
  points,
  series = [],
  isLoading = false,
  selectedKeys = [],
  onToggleKey,
  hideLegend = false,
}: StackedYearChartProps) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  const sortedPoints = [...points]
    .filter((point) => point.value > 0)
    .sort((a, b) => a.period - b.period);

  if (!isLoading && sortedPoints.length === 0) {
    return null;
  }

  const activeSeries = resolveSeriesList(sortedPoints, series);
  const maxValue = Math.max(1, ...sortedPoints.map((p) => p.value));
  const labelStep = getYearLabelStep(sortedPoints.length);
  const isDense = sortedPoints.length > 14;
  const gapClass =
    sortedPoints.length > 35
      ? 'gap-px sm:gap-0.5'
      : sortedPoints.length > 20
        ? 'gap-0.5 sm:gap-1'
        : 'gap-1 sm:gap-1.5';

  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title={title}
        icon={BarChart3}
        open={open}
        onOpenChange={setOpen}
        controls={contentId}
      />

      {open && (
        <Card id={contentId} className="p-4 sm:p-5">
          {isLoading ? (
            <div
              className="flex h-44 items-end gap-3 px-2 pt-4"
              aria-busy="true"
              aria-label={`Carregando ${title}`}
            >
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-1 animate-pulse rounded-t-sm bg-muted"
                  style={{ height: `${30 + ((idx * 19) % 60)}%` }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                role="img"
                aria-label={ariaLabel ?? title}
                className={cn(
                  'flex w-full items-end justify-center overflow-hidden px-3 pt-2',
                  gapClass,
                )}
              >
                {sortedPoints.map((point, idx) => {
                  const groups = point.groups ?? {};
                  const segments = activeSeries
                    .map((s) => ({
                      series: s,
                      count: groups[s.key] ?? 0,
                    }))
                    .filter((seg) => seg.count > 0);

                  const totalPx = Math.max(
                    10,
                    Math.round((point.value / maxValue) * CHART_HEIGHT_PX),
                  );

                  const showLabel = idx % labelStep === 0;

                  return (
                    <Tooltip key={point.period}>
                      <TooltipTrigger asChild>
                        <div
                          tabIndex={onToggleKey ? undefined : 0}
                          className="flex max-w-12 min-w-0 flex-1 flex-col items-center gap-1.5 rounded-t-sm transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
                        >
                          <div
                            className="flex w-full max-w-8 flex-col-reverse items-center gap-0.5"
                            style={{ height: `${CHART_HEIGHT_PX}px` }}
                          >
                            {segments.length > 0 ? (
                              segments.map((seg) => {
                                const segPx = Math.max(
                                  4,
                                  Math.round(
                                    (seg.count / point.value) * totalPx,
                                  ),
                                );
                                const isSelected = selectedKeys.includes(
                                  seg.series.key,
                                );
                                const isDimmed =
                                  selectedKeys.length > 0 && !isSelected;

                                return onToggleKey ? (
                                  <button
                                    key={seg.series.key}
                                    type="button"
                                    onClick={() => onToggleKey(seg.series.key)}
                                    aria-label={`${point.period} ${seg.series.label}: ${seg.count}`}
                                    className={cn(
                                      'w-full cursor-pointer rounded-[3px] transition-opacity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden',
                                      seg.series.bgClassName,
                                      isDimmed && 'opacity-35',
                                      isSelected &&
                                        'ring-1 ring-foreground/60 ring-offset-1',
                                    )}
                                    style={{ height: `${segPx}px` }}
                                  />
                                ) : (
                                  <div
                                    key={seg.series.key}
                                    className={cn(
                                      'w-full rounded-[3px]',
                                      seg.series.bgClassName,
                                    )}
                                    style={{ height: `${segPx}px` }}
                                  />
                                );
                              })
                            ) : (
                              <div
                                className="w-full rounded-[3px] bg-chart-neutral-1"
                                style={{ height: `${totalPx}px` }}
                              />
                            )}
                          </div>
                          <div className="relative h-3.5 w-full">
                            {showLabel && (
                              <span
                                className={cn(
                                  'pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 leading-none font-medium whitespace-nowrap text-muted-foreground tabular-nums',
                                  isDense
                                    ? 'text-[9px] sm:text-[10px]'
                                    : 'text-[11px]',
                                )}
                              >
                                {point.period}
                              </span>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-left">
                        <div className="font-semibold tabular-nums">
                          {point.period} — Total: {point.value}
                        </div>
                        {!hideLegend && segments.length > 0 && (
                          <div className="mt-1 flex flex-col gap-0.5 text-[11px] opacity-90">
                            {segments.map((seg) => (
                              <div
                                key={seg.series.key}
                                className="flex items-center justify-between gap-3 tabular-nums"
                              >
                                <span className="inline-flex items-center gap-1.5">
                                  <span
                                    className={cn(
                                      'size-2 shrink-0 rounded-[2px]',
                                      seg.series.bgClassName,
                                    )}
                                    aria-hidden
                                  />
                                  <span>{seg.series.label}</span>
                                </span>
                                <span className="font-medium">{seg.count}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>

              {!hideLegend && activeSeries.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border/50 pt-3">
                  {activeSeries.map((s) => {
                    const isSelected = selectedKeys.includes(s.key);
                    const isDimmed = selectedKeys.length > 0 && !isSelected;

                    if (!onToggleKey) {
                      return (
                        <span
                          key={s.key}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                        >
                          <span
                            className={cn(
                              'size-2.5 rounded-[2px]',
                              s.bgClassName,
                            )}
                            aria-hidden
                          />
                          <span>{s.label}</span>
                        </span>
                      );
                    }

                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => onToggleKey(s.key)}
                        aria-pressed={isSelected}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-1.5 py-0.5 text-xs text-foreground transition-opacity hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden',
                          isDimmed && 'opacity-45',
                          isSelected && 'bg-muted font-medium',
                        )}
                      >
                        <span
                          className={cn(
                            'size-2.5 rounded-[2px]',
                            s.bgClassName,
                          )}
                          aria-hidden
                        />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </section>
  );
}
