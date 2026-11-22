import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { adminApi, unwrapEmpty } from '@/api/admin';
import { unwrap } from '@/api/simcc';
import type { AdminCreateInput, AdminListParams } from './model';

export const adminKeys = {
  all: ['admin'] as const,
  lists: () => ['admin', 'list'] as const,
  list: (params: AdminListParams = {}) => ['admin', 'list', params] as const,
};

export function adminListQueryOptions(params: AdminListParams = {}) {
  return queryOptions({
    queryKey: adminKeys.list(params),
    queryFn: ({ signal }) =>
      unwrap(adminApi().GET('/admins', { params: { query: params }, signal })),
  });
}

/** Total de admins cadastrados (lista de 1 item, lê `total_items`). */
export function adminCountQueryOptions() {
  return queryOptions({
    ...adminListQueryOptions({ page: 1, per_page: 1 }),
    select: (data) => data.pagination.total_items,
  });
}

export function createAdminMutationOptions() {
  return mutationOptions({
    mutationKey: ['admin', 'create'],
    mutationFn: (input: AdminCreateInput) =>
      unwrap(adminApi().POST('/admins', { body: input })),
  });
}

export function deleteAdminMutationOptions() {
  return mutationOptions({
    mutationKey: ['admin', 'delete'],
    mutationFn: (adminId: string) =>
      unwrapEmpty(
        adminApi().DELETE('/admins/{admin_id}', {
          params: { path: { admin_id: adminId } },
        }),
      ),
  });
}
