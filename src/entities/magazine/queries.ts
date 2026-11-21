import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { MagazinePathParams, MagazineQuery } from './model';

/** Chaves padronizadas do cache de revistas no TanStack Query. */
export const magazineKeys = {
  all: ['magazine'] as const,
  lists: () => [...magazineKeys.all, 'list'] as const,
  list: (params: MagazineQuery = {}) =>
    [...magazineKeys.lists(), params] as const,
  details: () => [...magazineKeys.all, 'detail'] as const,
  detail: (magazineId: MagazinePathParams['magazine_id']) =>
    [...magazineKeys.details(), magazineId] as const,
};

/** Consulta paginada de revistas (`/magazine`). */
export function magazineListQueryOptions(params: MagazineQuery = {}) {
  return queryOptions({
    queryKey: magazineKeys.list(params),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/magazine', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

/** Detalhe de uma revista pelo identificador (`/magazine/{magazine_id}`). */
export function magazineDetailQueryOptions(
  magazineId: MagazinePathParams['magazine_id'],
) {
  return queryOptions({
    queryKey: magazineKeys.detail(magazineId),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/magazine/{magazine_id}', {
          params: { path: { magazine_id: magazineId } },
          signal,
        }),
      ),
    enabled: magazineId.trim().length > 0,
  });
}
