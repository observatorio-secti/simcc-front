import { useQueries, useQuery } from '@tanstack/react-query';
import {
  productionMetricQueryOptions,
  type ProductionMetricGroupBy,
  type ProductionMetricPoint,
  type ProductionMetricQuery,
} from '@/entities/production/metric-queries';
import type { ProductionKind } from '@/entities/production/model';
import { productionColor } from '@/shared/lib/design-tokens';
import { productionYearChartData } from './production-year-chart-data';
import {
  StackedYearChart,
  type StackedYearPoint,
  type StackedYearSeries,
} from './stacked-year-chart';

/** Recorte da série: filtros de `/v2/metrics/production/{kind}` sem o agrupamento. */
export type ProductionYearChartQuery = Omit<ProductionMetricQuery, 'group_by'>;

export interface ProductionYearChartProps {
  title: string;
  ariaLabel?: string;
  kind: ProductionKind;
  /** Série já carregada (ex.: a mesma que alimenta os KPIs da `/busca`). */
  metric: readonly ProductionMetricPoint[] | undefined;
  isLoading?: boolean;
  /** Agrupamento com que a série foi pedida. */
  groupBy?: ProductionMetricGroupBy;
  singleSeriesLabel?: string;
  selectedKeys?: readonly string[];
  onToggleKey?: (key: string) => void;
}

/** Gráfico de colunas empilhadas por ano a partir de uma série já carregada. */
export function ProductionYearChart({
  title,
  ariaLabel,
  kind,
  metric,
  isLoading = false,
  groupBy,
  singleSeriesLabel,
  selectedKeys,
  onToggleKey,
}: ProductionYearChartProps) {
  const { points, series } = productionYearChartData(
    kind,
    metric ?? [],
    groupBy,
    singleSeriesLabel,
  );
  return (
    <StackedYearChart
      title={title}
      ariaLabel={ariaLabel}
      points={points}
      series={series}
      isLoading={isLoading}
      selectedKeys={selectedKeys}
      onToggleKey={onToggleKey}
      hideLegend={!groupBy}
    />
  );
}

export interface ProductionMetricYearChartProps extends Omit<
  ProductionYearChartProps,
  'metric' | 'isLoading'
> {
  query: ProductionYearChartQuery;
}

/**
 * Gráfico por ano de um tipo de produção que busca a própria série em
 * `GET /v2/metrics/production/{kind}?group_by=...`.
 */
export function ProductionMetricYearChart({
  kind,
  query,
  groupBy,
  ...props
}: ProductionMetricYearChartProps) {
  const { data, isLoading } = useQuery(
    productionMetricQueryOptions(kind, {
      ...query,
      ...(groupBy ? { group_by: groupBy } : {}),
    }),
  );
  return (
    <ProductionYearChart
      {...props}
      kind={kind}
      groupBy={groupBy}
      metric={data?.data}
      isLoading={isLoading}
    />
  );
}

export interface MultiKindSeriesConfig {
  kind: ProductionKind;
  label: string;
}

export interface MultiKindYearChartProps {
  title: string;
  query: ProductionYearChartQuery;
  kinds: readonly MultiKindSeriesConfig[];
}

/**
 * Combina séries anuais de múltiplos tipos de produção (`/v2/metrics/production/{kind}`)
 * em um único gráfico de colunas empilhadas por ano.
 */
export function MultiKindYearChart({
  title,
  query,
  kinds,
}: MultiKindYearChartProps) {
  const queries = useQueries({
    queries: kinds.map(({ kind }) => productionMetricQueryOptions(kind, query)),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const byPeriod = new Map<number, StackedYearPoint>();

  kinds.forEach(({ kind }, idx) => {
    const data = queries[idx]?.data?.data ?? [];
    for (const point of data) {
      if (point.value <= 0) continue;
      const existing = byPeriod.get(point.period) ?? {
        period: point.period,
        value: 0,
        groups: {},
      };
      existing.value += point.value;
      existing.groups = {
        ...existing.groups,
        [kind]: (existing.groups?.[kind] ?? 0) + point.value,
      };
      byPeriod.set(point.period, existing);
    }
  });

  const series: StackedYearSeries[] = kinds.map(({ kind, label }) => ({
    key: kind,
    label,
    bgClassName: productionColor(kind).bg,
  }));

  return (
    <StackedYearChart
      title={title}
      points={[...byPeriod.values()]}
      series={series}
      isLoading={isLoading}
    />
  );
}
