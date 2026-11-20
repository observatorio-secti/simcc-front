import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { GraduateProgramId, GraduateProgramListSearch } from './model';

/**
 * Queries do programa de pós-graduação. Keys no padrão
 * `['graduate-program', '<operação>', params]` (docs/arquitetura.md).
 */
export const graduateProgramQueries = {
  all: () => ['graduate-program'] as const,

  /** Catálogo paginado (`GET /v2/graduate-program`), com filtros e facetas. */
  list: (search: GraduateProgramListSearch = {}) =>
    queryOptions({
      queryKey: ['graduate-program', 'list', search] as const,
      queryFn: ({ signal }) =>
        unwrap(
          simcc.GET('/graduate-program', {
            params: { query: search },
            signal,
          }),
        ),
    }),

  /**
   * Detalhe (`GET /v2/graduate-program/{program_id}`): instituição, linhas de
   * pesquisa e contagens. Id inexistente rejeita com `ApiError` 404.
   */
  detail: (id: GraduateProgramId) =>
    queryOptions({
      queryKey: ['graduate-program', 'detail', id] as const,
      queryFn: ({ signal }) =>
        unwrap(
          simcc.GET('/graduate-program/{program_id}', {
            params: { path: { program_id: id } },
            signal,
          }),
        ),
    }),
};
