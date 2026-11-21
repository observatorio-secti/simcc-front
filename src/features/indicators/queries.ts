import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { ProductionKind } from '@/entities/production/model';
import { toMetricPathKind, type ProductionMetricQuery } from './search-schema';

const EMPTY_QUERY: NonNullable<ProductionMetricQuery> = {};

export const indicatorKeys = {
  all: ['indicators'] as const,
  productionMetric: (kind: ProductionKind, query?: ProductionMetricQuery) =>
    ['indicators', 'production-metric', kind, query ?? EMPTY_QUERY] as const,
};

/** `queryOptions` para a série anual `/v2/metrics/production/{kind}`. */
export function productionMetricQueryOptions(
  kind: ProductionKind,
  query?: ProductionMetricQuery,
) {
  const normalizedQuery = query ?? EMPTY_QUERY;
  const pathKind = toMetricPathKind(kind);

  return queryOptions({
    queryKey: indicatorKeys.productionMetric(kind, normalizedQuery),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/metrics/production/{kind}', {
          params: {
            path: { kind: pathKind },
            query: normalizedQuery,
          },
          signal,
        }),
      ),
  });
}
