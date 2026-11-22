import { queryOptions } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { unwrap } from '@/api/simcc';
import {
  COUNT_PARAMS,
  type AcademicListParams,
  type AcademicResearcherListParams,
} from './model';

export const academicKeys = {
  all: ['academic'] as const,
  institutions: (params: AcademicListParams = {}) =>
    ['academic', 'institutions', 'list', params] as const,
  researchers: (params: AcademicResearcherListParams = {}) =>
    ['academic', 'researchers', 'list', params] as const,
  collections: (params: AcademicListParams = {}) =>
    ['academic', 'collections', 'list', params] as const,
};

export function academicInstitutionsQueryOptions(
  params: AcademicListParams = {},
) {
  return queryOptions({
    queryKey: academicKeys.institutions(params),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/academic/institutions', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

export function academicResearchersQueryOptions(
  params: AcademicResearcherListParams = {},
) {
  return queryOptions({
    queryKey: academicKeys.researchers(params),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/academic/researchers', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

export function academicCollectionsQueryOptions(
  params: AcademicListParams = {},
) {
  return queryOptions({
    queryKey: academicKeys.collections(params),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/academic/collections', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

/** Totais da visão geral do console: compartilham o cache das listas de 1 item. */
export const academicCountQueryOptions = {
  institutions: () =>
    queryOptions({
      ...academicInstitutionsQueryOptions(COUNT_PARAMS),
      select: (data) => data.pagination.total_items,
    }),
  researchers: () =>
    queryOptions({
      ...academicResearchersQueryOptions(COUNT_PARAMS),
      select: (data) => data.pagination.total_items,
    }),
  collections: () =>
    queryOptions({
      ...academicCollectionsQueryOptions(COUNT_PARAMS),
      select: (data) => data.pagination.total_items,
    }),
};
