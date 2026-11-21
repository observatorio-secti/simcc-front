import { queryOptions } from '@tanstack/react-query';
import { isApiError } from '@/api/errors';
import { simcc, unwrap } from '@/api/simcc';
import type { ListResponse, Schema } from '@/api/types';

export function isNotFoundApiError(error: unknown): boolean {
  return isApiError(error) && error.status === 404;
}

export type ScholarshipItem = Schema<'Scholarship'>;
export type ScholarshipListResponse = ListResponse<'/scholarship'>;

export const scholarshipKeys = {
  all: ['scholarship'] as const,
  byResearcher: (researcherId: string) =>
    ['scholarship', 'by-researcher', researcherId] as const,
};

/** Bolsas de fomento do pesquisador em `/v2/scholarship`. */
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
