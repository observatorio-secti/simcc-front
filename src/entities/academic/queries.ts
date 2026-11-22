import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { unwrap } from '@/api/simcc';
import {
  COUNT_PARAMS,
  type AcademicCollectionCreateInput,
  type AcademicCollectionUpdateInput,
  type AcademicInstitutionCreateInput,
  type AcademicInstitutionUpdateInput,
  type AcademicListParams,
  type AcademicResearcherCreateInput,
  type AcademicResearcherListParams,
  type AcademicResearcherUpdateInput,
} from './model';

export const academicKeys = {
  all: ['academic'] as const,
  institutions: (params: AcademicListParams = {}) =>
    ['academic', 'institutions', 'list', params] as const,
  institutionDetail: (id: string) =>
    ['academic', 'institutions', 'detail', id] as const,
  researchers: (params: AcademicResearcherListParams = {}) =>
    ['academic', 'researchers', 'list', params] as const,
  researcherDetail: (id: string) =>
    ['academic', 'researchers', 'detail', id] as const,
  collections: (params: AcademicListParams = {}) =>
    ['academic', 'collections', 'list', params] as const,
  collectionDetail: (id: string) =>
    ['academic', 'collections', 'detail', id] as const,
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

export function academicInstitutionDetailQueryOptions(institutionId: string) {
  return queryOptions({
    queryKey: academicKeys.institutionDetail(institutionId),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/academic/institutions/{institution_id}', {
          params: { path: { institution_id: institutionId } },
          signal,
        }),
      ),
    enabled: institutionId.length > 0,
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

export function academicResearcherDetailQueryOptions(researcherId: string) {
  return queryOptions({
    queryKey: academicKeys.researcherDetail(researcherId),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/academic/researchers/{researcher_id}', {
          params: { path: { researcher_id: researcherId } },
          signal,
        }),
      ),
    enabled: researcherId.length > 0,
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

export function academicCollectionDetailQueryOptions(collectionId: string) {
  return queryOptions({
    queryKey: academicKeys.collectionDetail(collectionId),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/academic/collections/{collection_id}', {
          params: { path: { collection_id: collectionId } },
          signal,
        }),
      ),
    enabled: collectionId.length > 0,
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

export function createInstitutionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'institutions', 'create'],
    mutationFn: (input: AcademicInstitutionCreateInput) =>
      unwrap(adminApi().POST('/academic/institutions', { body: input })),
  });
}

export function updateInstitutionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'institutions', 'update'],
    mutationFn: ({
      institutionId,
      input,
    }: {
      institutionId: string;
      input: AcademicInstitutionUpdateInput;
    }) =>
      unwrap(
        adminApi().PUT('/academic/institutions/{institution_id}', {
          params: { path: { institution_id: institutionId } },
          body: input,
        }),
      ),
  });
}

export function deleteInstitutionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'institutions', 'delete'],
    mutationFn: (institutionId: string) =>
      unwrap(
        adminApi().DELETE('/academic/institutions/{institution_id}', {
          params: { path: { institution_id: institutionId } },
        }),
      ),
  });
}

export function createResearcherMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'researchers', 'create'],
    mutationFn: (input: AcademicResearcherCreateInput) =>
      unwrap(adminApi().POST('/academic/researchers', { body: input })),
  });
}

export function updateResearcherMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'researchers', 'update'],
    mutationFn: ({
      researcherId,
      input,
    }: {
      researcherId: string;
      input: AcademicResearcherUpdateInput;
    }) =>
      unwrap(
        adminApi().PUT('/academic/researchers/{researcher_id}', {
          params: { path: { researcher_id: researcherId } },
          body: input,
        }),
      ),
  });
}

export function deleteResearcherMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'researchers', 'delete'],
    mutationFn: (researcherId: string) =>
      unwrap(
        adminApi().DELETE('/academic/researchers/{researcher_id}', {
          params: { path: { researcher_id: researcherId } },
        }),
      ),
  });
}

export function addResearcherAffiliationMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'researchers', 'add-affiliation'],
    mutationFn: ({
      researcherId,
      institutionId,
    }: {
      researcherId: string;
      institutionId: string;
    }) =>
      unwrap(
        adminApi().POST(
          '/academic/researchers/{researcher_id}/institutions/{institution_id}',
          {
            params: {
              path: {
                researcher_id: researcherId,
                institution_id: institutionId,
              },
            },
          },
        ),
      ),
  });
}

export function removeResearcherAffiliationMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'researchers', 'remove-affiliation'],
    mutationFn: ({
      researcherId,
      institutionId,
    }: {
      researcherId: string;
      institutionId: string;
    }) =>
      unwrap(
        adminApi().DELETE(
          '/academic/researchers/{researcher_id}/institutions/{institution_id}',
          {
            params: {
              path: {
                researcher_id: researcherId,
                institution_id: institutionId,
              },
            },
          },
        ),
      ),
  });
}

export function addResearcherCollectionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'researchers', 'add-collection'],
    mutationFn: ({
      researcherId,
      collectionId,
    }: {
      researcherId: string;
      collectionId: string;
    }) =>
      unwrap(
        adminApi().POST(
          '/academic/researchers/{researcher_id}/collections/{collection_id}',
          {
            params: {
              path: {
                researcher_id: researcherId,
                collection_id: collectionId,
              },
            },
          },
        ),
      ),
  });
}

export function removeResearcherCollectionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'researchers', 'remove-collection'],
    mutationFn: ({
      researcherId,
      collectionId,
    }: {
      researcherId: string;
      collectionId: string;
    }) =>
      unwrap(
        adminApi().DELETE(
          '/academic/researchers/{researcher_id}/collections/{collection_id}',
          {
            params: {
              path: {
                researcher_id: researcherId,
                collection_id: collectionId,
              },
            },
          },
        ),
      ),
  });
}

export function createCollectionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'collections', 'create'],
    mutationFn: (input: AcademicCollectionCreateInput) =>
      unwrap(adminApi().POST('/academic/collections', { body: input })),
  });
}

export function updateCollectionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'collections', 'update'],
    mutationFn: ({
      collectionId,
      input,
    }: {
      collectionId: string;
      input: AcademicCollectionUpdateInput;
    }) =>
      unwrap(
        adminApi().PUT('/academic/collections/{collection_id}', {
          params: { path: { collection_id: collectionId } },
          body: input,
        }),
      ),
  });
}

export function deleteCollectionMutationOptions() {
  return mutationOptions({
    mutationKey: ['academic', 'collections', 'delete'],
    mutationFn: (collectionId: string) =>
      unwrap(
        adminApi().DELETE('/academic/collections/{collection_id}', {
          params: { path: { collection_id: collectionId } },
        }),
      ),
  });
}
