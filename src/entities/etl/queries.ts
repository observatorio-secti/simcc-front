import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';
import { unwrap } from '@/api/simcc';
import type {
  EtlRunListParams,
  EtlRunLogsParams,
  EtlRunTriggerInput,
} from './model';

export const etlKeys = {
  all: ['etl'] as const,
  routines: () => ['etl', 'routines'] as const,
  runs: (params: EtlRunListParams = {}) => ['etl', 'runs', params] as const,
  run: (runId: string) => ['etl', 'run', runId] as const,
  logs: (runId: string, params: EtlRunLogsParams = {}) =>
    ['etl', 'logs', runId, params] as const,
};

/** Catálogo de rotinas (o OpenAPI não tipa os itens: `unknown[]`). */
export function etlRoutinesQueryOptions() {
  return queryOptions({
    queryKey: etlKeys.routines(),
    queryFn: ({ signal }) =>
      unwrap(adminApi().GET('/etl/routines', { signal })),
    staleTime: 60 * 60 * 1000,
  });
}

export function etlRunsQueryOptions(params: EtlRunListParams = {}) {
  return queryOptions({
    queryKey: etlKeys.runs(params),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/etl/runs', { params: { query: params }, signal }),
      ),
  });
}

/** Último run (o mais recente primeiro), ou `null` se nunca houve run. */
export function latestEtlRunQueryOptions() {
  return queryOptions({
    ...etlRunsQueryOptions({ page: 1, per_page: 1 }),
    select: (data) => data.data[0] ?? null,
  });
}

export function etlRunQueryOptions(runId: string) {
  return queryOptions({
    queryKey: etlKeys.run(runId),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/etl/runs/{run_id}', {
          params: { path: { run_id: runId } },
          signal,
        }),
      ),
    enabled: runId.length > 0,
  });
}

export function etlRunLogsQueryOptions(
  runId: string,
  params: EtlRunLogsParams = {},
) {
  return queryOptions({
    queryKey: etlKeys.logs(runId, params),
    queryFn: ({ signal }) =>
      unwrap(
        adminApi().GET('/etl/runs/{run_id}/logs', {
          params: { path: { run_id: runId }, query: params },
          signal,
        }),
      ),
    enabled: runId.length > 0,
  });
}

export function triggerEtlRunMutationOptions() {
  return mutationOptions({
    mutationKey: ['etl', 'trigger'],
    mutationFn: (input: EtlRunTriggerInput) =>
      unwrap(adminApi().POST('/etl/runs', { body: input })),
  });
}
