import { z } from 'zod';
import type { PathParamsOf, QueryOf } from '@/api/types';
import {
  PRODUCTION_KINDS,
  type ProductionKind,
} from '@/entities/production/model';

export const DEFAULT_INDICATOR_KIND: ProductionKind = 'article';

const optionalYearSchema = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}, z.coerce.number().int().min(1900).max(2100).optional());

const optionalTextSchema = z.preprocess((value) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

export const indicatorsSearchSchema = z.object({
  kind: z.enum(PRODUCTION_KINDS).optional().catch(undefined),
  q: optionalTextSchema.catch(undefined),
  year_start: optionalYearSchema.catch(undefined),
  year_end: optionalYearSchema.catch(undefined),
  area: optionalTextSchema.catch(undefined),
});

export type IndicatorsSearch = z.infer<typeof indicatorsSearchSchema>;

export type ProductionMetricPathKind =
  PathParamsOf<'/metrics/production/{kind}'>['kind'];

export type ProductionMetricQuery = QueryOf<'/metrics/production/{kind}'>;

const METRIC_PATH_KIND_MAP: Record<ProductionKind, ProductionMetricPathKind> = {
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
};

/** Converte `ProductionKind` (`snake_case`) para o segmento de URL da rota v2 (`kebab-case`). */
export function toMetricPathKind(
  kind: ProductionKind,
): ProductionMetricPathKind {
  return METRIC_PATH_KIND_MAP[kind];
}

/** Constrói a query tipada para `/v2/metrics/production/{kind}` a partir dos search params da URL. */
export function toProductionMetricQuery(
  search: IndicatorsSearch,
): ProductionMetricQuery {
  const query: NonNullable<ProductionMetricQuery> = {};
  if (search.q) query.q = search.q;
  if (search.year_start !== undefined) query.year_start = search.year_start;
  if (search.year_end !== undefined) query.year_end = search.year_end;
  if (search.area) query.area = [search.area];
  return query;
}
