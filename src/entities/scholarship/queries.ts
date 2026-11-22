import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { ScholarshipQuery } from './model';

/** Chaves padronizadas do cache de bolsas no TanStack Query. */
export const scholarshipKeys = {
  all: ['scholarship'] as const,
  lists: () => [...scholarshipKeys.all, 'list'] as const,
  list: (params: ScholarshipQuery = {}) =>
    [...scholarshipKeys.lists(), params] as const,
  byResearcher: (researcherId: string) =>
    [...scholarshipKeys.all, 'by-researcher', researcherId] as const,
};

/** Consulta paginada de bolsas e auxílios (`/scholarship`). */
export function scholarshipListQueryOptions(params: ScholarshipQuery = {}) {
  return queryOptions({
    queryKey: scholarshipKeys.list(params),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/scholarship', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

/** Bolsas de fomento de um pesquisador (perfil, T3). */
export function researcherScholarshipsQueryOptions(researcherId: string) {
  return queryOptions({
    queryKey: scholarshipKeys.byResearcher(researcherId),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/scholarship', {
          params: {
            query: {
              researcher_id: [researcherId],
              per_page: 50,
            },
          },
          signal,
        }),
      ),
  });
}
