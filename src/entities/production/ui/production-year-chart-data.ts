import type {
  ProductionMetricGroupBy,
  ProductionMetricPoint,
} from '@/entities/production/metric-queries';
import type { ProductionKind } from '@/entities/production/model';
import {
  chartNeutralBg,
  PATENT_GRANT_COLORS,
  eventNatureColor,
  eventNatureKey,
  orientationColor,
  orientationKey,
  productionColor,
  qualisColor,
  statusColor,
  statusKey,
} from '@/shared/lib/design-tokens';
import type { MultiKindSeriesConfig } from './production-year-charts';
import type { StackedYearPoint, StackedYearSeries } from './stacked-year-chart';

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
    return { period: point.period, value: point.value, groups };
  });
}

function groupedSeries(
  points: readonly StackedYearPoint[],
  kind: ProductionKind,
  groupBy: ProductionMetricGroupBy,
): StackedYearSeries[] {
  const keys = new Set<string>();
  for (const point of points) {
    if (!point.groups) continue;
    for (const [key, count] of Object.entries(point.groups)) {
      if (count > 0) keys.add(key);
    }
  }

  let neutralIdx = 0;
  return [...keys].map((key) => {
    if (kind === 'guidance' && groupBy === 'nature' && orientationKey(key)) {
      const color = orientationColor(key);
      return { key, label: color.label, bgClassName: color.bg };
    }
    if (kind === 'event' && groupBy === 'nature' && eventNatureKey(key)) {
      return { key, label: key, bgClassName: eventNatureColor(key).bg };
    }
    if (groupBy === 'status' && statusKey(key)) {
      const color = statusColor(key);
      return { key, label: color.label, bgClassName: color.bg };
    }
    return { key, label: key, bgClassName: chartNeutralBg(neutralIdx++) };
  });
}

export interface ProductionYearChartData {
  points: StackedYearPoint[];
  series: StackedYearSeries[];
}

/**
 * Converte a série de `/v2/metrics/production/{kind}` em pontos e séries do
 * gráfico. Sem `groupBy`, a série única tem a cor do tipo.
 */
export function productionYearChartData(
  kind: ProductionKind,
  metric: readonly ProductionMetricPoint[],
  groupBy?: ProductionMetricGroupBy,
  singleSeriesLabel?: string,
): ProductionYearChartData {
  if (!groupBy) {
    return {
      points: metric.map((p) => ({
        period: p.period,
        value: p.value,
        groups: { [kind]: p.value },
      })),
      series: [
        {
          key: kind,
          label: singleSeriesLabel ?? productionColor(kind).label,
          bgClassName: productionColor(kind).bg,
        },
      ],
    };
  }
  if (groupBy === 'qualis') {
    return {
      points: normalizeQualisPoints(metric),
      series: [...QUALIS_SERIES],
    };
  }
  const points = [...metric];
  return { points, series: groupedSeries(points, kind, groupBy) };
}

/**
 * Patentes em duas séries, uma requisição cada: concedidas (`granted=true`)
 * e só depositadas (`granted=false`). Somadas, dão o total de patentes.
 */
export function patentGrantSeries(
  labelPrefix?: string,
): MultiKindSeriesConfig[] {
  const label = (text: string) =>
    labelPrefix ? `${labelPrefix} ${text.toLowerCase()}` : text;
  return [
    {
      kind: 'patent',
      key: 'patent_granted',
      label: label(PATENT_GRANT_COLORS.granted.label),
      filter: { granted: true },
      bgClassName: PATENT_GRANT_COLORS.granted.bg,
    },
    {
      kind: 'patent',
      key: 'patent_filed',
      label: label(PATENT_GRANT_COLORS.filed.label),
      filter: { granted: false },
      bgClassName: PATENT_GRANT_COLORS.filed.bg,
    },
  ];
}
