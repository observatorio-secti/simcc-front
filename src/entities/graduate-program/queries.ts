import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { GraduateProgramSearch } from './model';

/** Chaves padronizadas de cache do TanStack Query para programas de pós-graduação. */
export const graduateProgramKeys = {
  all: ['graduate-program'] as const,
  lists: () => ['graduate-program', 'list'] as const,
  list: (params: GraduateProgramSearch = {}) =>
    ['graduate-program', 'list', params] as const,
  details: () => ['graduate-program', 'detail'] as const,
  detail: (id: string) => ['graduate-program', 'detail', id] as const,
};

/** Consulta paginada de programas de pós-graduação (`GET /v2/graduate-program`). */
export function graduateProgramListQueryOptions(
  params: GraduateProgramSearch = {},
) {
  return queryOptions({
    queryKey: graduateProgramKeys.list(params),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/graduate-program', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

/** Consulta detalhada de um programa com linhas de pesquisa (`GET /v2/graduate-program/{program_id}`). */
export function graduateProgramDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: graduateProgramKeys.detail(id),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/graduate-program/{program_id}', {
          params: { path: { program_id: id } },
          signal,
        }),
      ),
  });
}
