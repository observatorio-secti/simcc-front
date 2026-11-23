import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { PathParamsOf, QueryOf, ResponseOf } from '@/api/types';
import type { ProductionKind } from './model';

/**
 * Query params aceitos por `/v2/metrics/production/{kind}`. `granted`
 * (patentes concedidas ou não) já é aceito pela rota e está no OpenAPI do
 * backend, mas ainda não nos tipos gerados: sai daqui quando
 * `npm run api:types` o trouxer.
 */
export type ProductionMetricQuery = NonNullable<
  QueryOf<'/metrics/production/{kind}'>
> & { granted?: boolean };

export type ProductionMetricResponse = ResponseOf<'/metrics/production/{kind}'>;

export type ProductionMetricPoint = ProductionMetricResponse['data'][number];

type MetricPathKind = PathParamsOf<'/metrics/production/{kind}'>['kind'];

// O path da métrica usa hífen (`book-chapter`, `magazine-text`); o enum do front, sublinhado.
const METRIC_PATH_KIND = {
  article: 'article',
  book: 'book',
  book_chapter: 'book-chapter',
  software: 'software',
  patent: 'patent',
  event: 'event',
  research_project: 'research-project',
  brand: 'brand',
  guidance: 'guidance',
  report: 'report',
  magazine_text: 'magazine-text',
  event_work: 'event-work',
} as const satisfies Record<ProductionKind, MetricPathKind>;

/** Dimensões de `group_by` usadas nos gráficos por ano. */
export type ProductionMetricGroupBy =
  'qualis' | 'nature' | 'status' | 'type_participation';

const DEFAULT_METRIC_GROUP_BY: Partial<
  Record<ProductionKind, ProductionMetricGroupBy>
> = {
  article: 'qualis',
  event: 'nature',
  guidance: 'nature',
  research_project: 'status',
};

/** Agrupamento padrão do gráfico por ano de um tipo (sem agrupamento: só o total). */
export function defaultMetricGroupBy(
  kind: ProductionKind,
): ProductionMetricGroupBy | undefined {
  return DEFAULT_METRIC_GROUP_BY[kind];
}

const EMPTY_QUERY: ProductionMetricQuery = {};

export const productionMetricKeys = {
  metric: (kind: ProductionKind, query: ProductionMetricQuery = EMPTY_QUERY) =>
    ['production', kind, 'metric', query] as const,
};

/** Série anual de `/v2/metrics/production/{kind}` com os mesmos filtros da listagem. */
export function productionMetricQueryOptions(
  kind: ProductionKind,
  query: ProductionMetricQuery = EMPTY_QUERY,
) {
  return queryOptions({
    queryKey: productionMetricKeys.metric(kind, query),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/metrics/production/{kind}', {
          params: { path: { kind: METRIC_PATH_KIND[kind] }, query },
          signal,
        }),
      ),
  });
}

/** Ano com mais produções na série (o mais recente em caso de empate). */
export function peakMetricPoint(
  points: readonly ProductionMetricPoint[],
): ProductionMetricPoint | null {
  let peak: ProductionMetricPoint | null = null;
  for (const point of points) {
    if (
      !peak ||
      point.value > peak.value ||
      (point.value === peak.value && point.period > peak.period)
    ) {
      peak = point;
    }
  }
  return peak;
}

/** Soma da série a partir de `fromPeriod` (inclusive). */
export function sumMetricSince(
  points: readonly ProductionMetricPoint[],
  fromPeriod: number,
): number {
  return points.reduce(
    (total, point) =>
      point.period >= fromPeriod ? total + point.value : total,
    0,
  );
}
