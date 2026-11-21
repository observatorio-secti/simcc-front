import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { InstitutionQuery } from './model';

export const institutionKeys = {
  all: ['institution'] as const,
  list: (params: InstitutionQuery = {}) =>
    ['institution', 'list', params] as const,
  detail: (institutionId: string) =>
    ['institution', 'detail', institutionId] as const,
};

export function institutionListQueryOptions(params: InstitutionQuery = {}) {
  return queryOptions({
    queryKey: institutionKeys.list(params),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/institution', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

export function institutionDetailQueryOptions(institutionId: string) {
  return queryOptions({
    queryKey: institutionKeys.detail(institutionId),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/institution/{institution_id}', {
          params: { path: { institution_id: institutionId } },
          signal,
        }),
      ),
    enabled: institutionId.length > 0,
  });
}
