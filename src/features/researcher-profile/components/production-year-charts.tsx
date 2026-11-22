import { useQueries, useQuery } from '@tanstack/react-query';
import {
  productionMetricQueryOptions,
  type ProductionMetricPoint,
} from '@/entities/production/metric-queries';
import type { ProductionKind } from '@/entities/production/model';
import {
  chartNeutralBg,
  eventNatureColor,
  eventNatureKey,
  orientationColor,
  orientationKey,
  productionColor,
  qualisColor,
  statusColor,
  statusKey,
} from '@/shared/lib/design-tokens';
import type { QualisStratum } from '../search-schema';
import {
  StackedYearChart,
  type StackedYearPoint,
  type StackedYearSeries,
} from './stacked-year-chart';

const QUALIS_SERIES: readonly StackedYearSeries[] = [
  { key: 'A1', label: 'Qualis A1', bgClassName: qualisColor('A1').bg },
  { key: 'A2', label: 'Qualis A2', bgClassName: qualisColor('A2').bg },
  { key: 'A3', label: 'Qualis A3', bgClassName: qualisColor('A3').bg },
  { key: 'A4', label: 'Qualis A4', bgClassName: qualisColor('A4').bg },
  { key: 'B1', label: 'Qualis B1', bgClassName: qualisColor('B1').bg },
  { key: 'B2', label: 'Qualis B2', bgClassName: qualisColor('B2').bg },
  { key: 'B3', label: 'Qualis B3', bgClassName: qualisColor('B3').bg },
  { key: 'B4', label: 'Qualis B4', bgClassName: qualisColor('B4').bg },
  { key: 'C', label: 'Qualis C', bgClassName: qualisColor('C').bg },
  {
    key: 'not_rated',
    label: 'Sem qualis',
    bgClassName: qualisColor('SQ').bg,
  },
];

function normalizeQualisPoints(
  points: readonly ProductionMetricPoint[],
): StackedYearPoint[] {
  return points.map((point) => {
    const rawGroups = point.groups ?? {};
    const groups: Record<string, number> = {};
    for (const [key, count] of Object.entries(rawGroups)) {
      if (count <= 0) continue;
      const normalizedKey = key === 'not_applicable' ? 'not_rated' : key;
      groups[normalizedKey] = (groups[normalizedKey] ?? 0) + count;
    }
    return {
      period: point.period,
      value: point.value,
      groups,
    };
  });
}

export interface ArticlesQualisYearChartProps {
  researcherId: string;
  yearStart?: number;
  yearEnd?: number;
  selectedQualis?: readonly QualisStratum[];
  onToggleQualis?: (stratum: QualisStratum) => void;
}

/**
 * Gráfico de colunas empilhadas por ano e estrato Qualis para a aba de Artigos.
 */
export function ArticlesQualisYearChart({
  researcherId,
  yearStart,
  yearEnd,
  selectedQualis = [],
  onToggleQualis,
}: ArticlesQualisYearChartProps) {
  const { data, isLoading } = useQuery(
    productionMetricQueryOptions('article', {
      researcher_id: [researcherId],
      group_by: 'qualis',
      ...(yearStart !== undefined ? { year_start: yearStart } : {}),
      ...(yearEnd !== undefined ? { year_end: yearEnd } : {}),
    }),
  );

  const points = normalizeQualisPoints(data?.data ?? []);

  return (
    <StackedYearChart
      title="Gráfico de quantidade total por Qualis"
      ariaLabel="Distribuição anual de artigos por estrato Qualis"
      points={points}
      series={QUALIS_SERIES}
      isLoading={isLoading}
      selectedKeys={selectedQualis}
      onToggleKey={
        onToggleQualis
          ? (key) => onToggleQualis(key as QualisStratum)
          : undefined
      }
    />
  );
}

export interface MultiKindSeriesConfig {
  kind: ProductionKind;
  label: string;
}

export interface MultiKindYearChartProps {
  title: string;
  researcherId: string;
  yearStart?: number;
  yearEnd?: number;
  kinds: readonly MultiKindSeriesConfig[];
}

/**
 * Combina séries anuais de múltiplos tipos de produção (`/v2/metrics/production/{kind}`)
 * em um único gráfico de colunas empilhadas por ano.
 */
export function MultiKindYearChart({
  title,
  researcherId,
  yearStart,
  yearEnd,
  kinds,
}: MultiKindYearChartProps) {
  const queries = useQueries({
    queries: kinds.map(({ kind }) =>
      productionMetricQueryOptions(kind, {
        researcher_id: [researcherId],
        ...(yearStart !== undefined ? { year_start: yearStart } : {}),
        ...(yearEnd !== undefined ? { year_end: yearEnd } : {}),
      }),
    ),
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

export type MetricGroupDimension =
  | 'nature'
  | 'status'
  | 'type_participation'
  | 'none';

export interface GroupedMetricYearChartProps {
  title: string;
  researcherId: string;
  kind: ProductionKind;
  groupBy: MetricGroupDimension;
  yearStart?: number;
  yearEnd?: number;
  singleSeriesLabel?: string;
}

function buildDynamicSeries(
  points: readonly StackedYearPoint[],
  kind: ProductionKind,
  groupBy: MetricGroupDimension,
  singleSeriesLabel?: string,
): StackedYearSeries[] {
  if (groupBy === 'none') {
    return [
      {
        key: kind,
        label: singleSeriesLabel ?? productionColor(kind).label,
        bgClassName: productionColor(kind).bg,
      },
    ];
  }

  const keys = new Set<string>();
  for (const point of points) {
    if (!point.groups) continue;
    for (const [key, count] of Object.entries(point.groups)) {
      if (count > 0) keys.add(key);
    }
  }

  let neutralIdx = 0;
  return [...keys].map((key) => {
    if (kind === 'guidance' && groupBy === 'nature') {
      const matched = orientationKey(key);
      if (matched) {
        const color = orientationColor(key);
        return { key, label: color.label, bgClassName: color.bg };
      }
    }
    if (kind === 'event' && groupBy === 'nature') {
      const matched = eventNatureKey(key);
      if (matched) {
        const color = eventNatureColor(key);
        return { key, label: key, bgClassName: color.bg };
      }
    }
    if (groupBy === 'status') {
      const matched = statusKey(key);
      if (matched) {
        const color = statusColor(key);
        return { key, label: color.label, bgClassName: color.bg };
      }
    }
    return {
      key,
      label: key,
      bgClassName: chartNeutralBg(neutralIdx++),
    };
  });
}

/**
 * Gráfico de colunas empilhadas por ano para uma produção única usando
 * `GET /v2/metrics/production/{kind}?group_by=...`.
 */
export function GroupedMetricYearChart({
  title,
  researcherId,
  kind,
  groupBy,
  yearStart,
  yearEnd,
  singleSeriesLabel,
}: GroupedMetricYearChartProps) {
  const { data, isLoading } = useQuery(
    productionMetricQueryOptions(kind, {
      researcher_id: [researcherId],
      ...(groupBy !== 'none' ? { group_by: groupBy } : {}),
      ...(yearStart !== undefined ? { year_start: yearStart } : {}),
      ...(yearEnd !== undefined ? { year_end: yearEnd } : {}),
    }),
  );

  const rawPoints = data?.data ?? [];
  const points: StackedYearPoint[] =
    groupBy === 'none'
      ? rawPoints.map((p) => ({
          period: p.period,
          value: p.value,
          groups: { [kind]: p.value },
        }))
      : rawPoints;

  const series = buildDynamicSeries(points, kind, groupBy, singleSeriesLabel);

  return (
    <StackedYearChart
      title={title}
      points={points}
      series={series}
      isLoading={isLoading}
      hideLegend={groupBy === 'none'}
    />
  );
}
