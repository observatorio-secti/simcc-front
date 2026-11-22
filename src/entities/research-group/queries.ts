import { queryOptions } from '@tanstack/react-query';
import { oda } from '@/api/oda';

export interface ResearchGroupListParams {
  page?: number;
  size?: number;
  all?: boolean;
}

export const researchGroupKeys = {
  all: ['research-group'] as const,
  lists: () => ['research-group', 'list'] as const,
  list: (params: ResearchGroupListParams = {}) =>
    ['research-group', 'list', params] as const,
  details: () => ['research-group', 'detail'] as const,
  detail: (id: string) => ['research-group', 'detail', id] as const,
  researchers: (
    id: string,
    params: Omit<ResearchGroupListParams, 'all'> = {},
  ) =>
    [
      'research-group',
      'detail',
      { id, relation: 'researchers', ...params },
    ] as const,
};

/** Página de grupos de pesquisa SIMCC na API ODA. */
export function researchGroupListQueryOptions(
  params: Omit<ResearchGroupListParams, 'all'> = {},
) {
  return queryOptions({
    queryKey: researchGroupKeys.list(params),
    queryFn: ({ signal }) => oda.listGroupsPage({ ...params, signal }),
  });
}

/** Detalhe de um grupo de pesquisa na API ODA. */
export function researchGroupDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: researchGroupKeys.detail(id),
    queryFn: ({ signal }) => oda.getGroup(id, { signal }),
    enabled: id.trim().length > 0,
  });
}

/** Pesquisadores vinculados a um grupo de pesquisa na API ODA. */
export function researchGroupResearchersQueryOptions(
  id: string,
  params: Omit<ResearchGroupListParams, 'all'> = {},
) {
  return queryOptions({
    queryKey: researchGroupKeys.researchers(id, params),
    queryFn: ({ signal }) =>
      oda.listGroupResearchers(id, { ...params, signal }),
    enabled: id.trim().length > 0,
  });
}
