import { queryOptions } from '@tanstack/react-query';
import {
  oda,
  type OdaGroupSortField,
  type OdaSortOrder,
} from '@/api/oda';

const REFERENCE_STALE_TIME_MS = 1000 * 60 * 30;

export interface ResearchGroupListParams {
  page?: number;
  size?: number;
  q?: string;
  situacao?: string;
  areaConhecimentoId?: string;
  estadoId?: string;
  uf?: string;
  instituicaoId?: string;
  cidade?: string;
  anoFormacao?: number;
  ordenarPor?: OdaGroupSortField;
  ordem?: OdaSortOrder;
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
  states: () => ['research-group', 'filters', 'states'] as const,
  areas: () => ['research-group', 'filters', 'areas'] as const,
  institutions: (params: { uf?: string; nome?: string } = {}) =>
    ['research-group', 'filters', 'institutions', params] as const,
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

/** Estados (UF) disponíveis na API ODA para filtro de grupos de pesquisa. */
export function researchGroupStatesQueryOptions() {
  return queryOptions({
    queryKey: researchGroupKeys.states(),
    queryFn: ({ signal }) => oda.listStates({ signal }),
    staleTime: REFERENCE_STALE_TIME_MS,
  });
}

/** Grandes áreas do conhecimento disponíveis na API ODA. */
export function researchGroupAreasQueryOptions() {
  return queryOptions({
    queryKey: researchGroupKeys.areas(),
    queryFn: ({ signal }) =>
      oda.listKnowledgeAreas({ tipo: 'GRANDE_AREA', size: 100, signal }),
    staleTime: REFERENCE_STALE_TIME_MS,
  });
}

/** Instituições disponíveis na API ODA, opcionalmente filtradas por UF ou nome. */
export function researchGroupInstitutionsQueryOptions(
  params: { uf?: string; nome?: string } = {},
) {
  return queryOptions({
    queryKey: researchGroupKeys.institutions(params),
    queryFn: ({ signal }) =>
      oda.listInstitutions({ ...params, size: 100, signal }),
    staleTime: REFERENCE_STALE_TIME_MS,
  });
}
