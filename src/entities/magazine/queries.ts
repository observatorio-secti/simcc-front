import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { MagazineListParams } from './model';

/**
 * Queries da revista. Keys `['magazine', '<operação>', params]`.
 *
 * - `list`: catálogo paginado (`/v2/magazine`), com busca por nome (`q`),
 *   `issn`, `qualis` (estrato ou `not_rated`/`not_applicable`), ordenação por
 *   `name` ou `jcr` e faceta `qualis`;
 * - `detail`: uma revista (`/v2/magazine/{magazine_id}`), no envelope
 *   `{ data, meta }`.
 */
export const magazineQueries = {
  all: () => ['magazine'] as const,

  list: (params: MagazineListParams = {}) =>
    queryOptions({
      queryKey: [...magazineQueries.all(), 'list', params] as const,
      queryFn: ({ signal }) =>
        unwrap(simcc.GET('/magazine', { params: { query: params }, signal })),
    }),

  detail: (magazineId: string) =>
    queryOptions({
      queryKey: [...magazineQueries.all(), 'detail', magazineId] as const,
      queryFn: ({ signal }) =>
        unwrap(
          simcc.GET('/magazine/{magazine_id}', {
            params: { path: { magazine_id: magazineId } },
            signal,
          }),
        ),
    }),
};
