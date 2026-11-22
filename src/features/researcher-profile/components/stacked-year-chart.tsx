import { useId, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { chartNeutralBg } from '@/shared/lib/design-tokens';
import { Card } from '@/shared/ui/card';
import { SectionHeader } from '@/shared/ui/section-header';

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
const MAX_SINGLE_YEAR_BARS = 20;

interface DisplayBucket {
  key: string;
  label: string;
  tooltipPeriod: string;
  value: number;
  groups: Record<string, number>;
}

function groupPointsByPeriod(
  points: readonly StackedYearPoint[],
): DisplayBucket[] {
  if (points.length <= MAX_SINGLE_YEAR_BARS) {
    return points.map((p) => ({
      key: String(p.period),
      label: String(p.period),
      tooltipPeriod: String(p.period),
      value: p.value,
      groups: p.groups ?? {},
    }));
  }

  const minYear = points[0]!.period;
  const maxYear = points[points.length - 1]!.period;
  const span = maxYear - minYear + 1;
  const step =
    [2, 3, 5, 10].find((s) => Math.ceil(span / s) <= MAX_SINGLE_YEAR_BARS) ??
    Math.ceil(span / MAX_SINGLE_YEAR_BARS);

  const buckets = new Map<number, DisplayBucket>();

  for (const point of points) {
    const bucketIdx = Math.floor((point.period - minYear) / step);
    const startYear = minYear + bucketIdx * step;
    const endYear = Math.min(maxYear, startYear + step - 1);

    let bucket = buckets.get(bucketIdx);
    if (!bucket) {
      const label =
        startYear === endYear
          ? String(startYear)
          : `${startYear}–${String(endYear).slice(-2)}`;
      const tooltipPeriod =
        startYear === endYear ? String(startYear) : `${startYear}–${endYear}`;
      bucket = {
        key: `${startYear}-${endYear}`,
        label,
        tooltipPeriod,
        value: 0,
        groups: {},
      };
      buckets.set(bucketIdx, bucket);
    }

    bucket.value += point.value;
    if (point.groups) {
      for (const [groupKey, count] of Object.entries(point.groups)) {
        if (count > 0) {
          bucket.groups[groupKey] = (bucket.groups[groupKey] ?? 0) + count;
        }
      }
    }
  }

  return [...buckets.values()];
}

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
 * legenda inferior interativa. Usado nas abas do perfil do pesquisador.
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
  const displayBuckets = groupPointsByPeriod(sortedPoints);
  const maxValue = Math.max(1, ...displayBuckets.map((b) => b.value));

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
                className="flex w-full items-end justify-center gap-1 pt-2 sm:gap-1.5"
              >
                {displayBuckets.map((bucket) => {
                  const segments = activeSeries
                    .map((s) => ({
                      series: s,
                      count: bucket.groups[s.key] ?? 0,
                    }))
                    .filter((seg) => seg.count > 0);

                  const totalPx = Math.max(
                    10,
                    Math.round((bucket.value / maxValue) * CHART_HEIGHT_PX),
                  );

                  const summary = segments
                    .map((seg) => `${seg.series.label}: ${seg.count}`)
                    .join(', ');

                  const isDense = displayBuckets.length > 14;

                  return (
                    <div
                      key={bucket.key}
                      title={
                        summary
                          ? `${bucket.tooltipPeriod} — Total: ${bucket.value} (${summary})`
                          : `${bucket.tooltipPeriod} — Total: ${bucket.value}`
                      }
                      className="flex max-w-12 min-w-0 flex-1 flex-col items-center gap-1.5"
                    >
                      <div
                        className="flex w-full max-w-8 flex-col-reverse items-center gap-0.5"
                        style={{ height: `${CHART_HEIGHT_PX + 20}px` }}
                      >
                        {segments.length > 0 ? (
                          segments.map((seg) => {
                            const segPx = Math.max(
                              4,
                              Math.round((seg.count / bucket.value) * totalPx),
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
                                aria-label={`${bucket.tooltipPeriod} ${seg.series.label}: ${seg.count}`}
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
                        <span className="mb-1 text-center text-[11px] leading-none font-semibold text-foreground tabular-nums sm:text-xs">
                          {bucket.value}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'h-3.5 text-center leading-none font-medium whitespace-nowrap text-muted-foreground tabular-nums',
                          isDense ? 'text-[9px] sm:text-[10px]' : 'text-[11px]',
                        )}
                      >
                        {bucket.label}
                      </span>
                    </div>
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
