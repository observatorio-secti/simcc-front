import { queryOptions } from '@tanstack/react-query';
import { simcc, simccV2BaseUrl, unwrap } from '@/api/simcc';
import { env } from '@/config/env';
import type { ResearcherSearch, ResearcherTermsQuery } from './model';

/** Seções opcionais carregadas por padrão no detalhe do pesquisador. */
export const RESEARCHER_DETAIL_INCLUDES = [
  'education',
  'experience',
  'foment',
] as const;

export type ResearcherDetailInclude =
  (typeof RESEARCHER_DETAIL_INCLUDES)[number];

export const researcherKeys = {
  all: ['researcher'] as const,
  lists: () => ['researcher', 'list'] as const,
  list: (params: ResearcherSearch = {}) =>
    ['researcher', 'list', params] as const,
  details: () => ['researcher', 'detail'] as const,
  detail: (
    id: string,
    include: readonly string[] = RESEARCHER_DETAIL_INCLUDES,
  ) => ['researcher', 'detail', id, { include }] as const,
  terms: (id: string, params: ResearcherTermsQuery = {}) =>
    ['researcher', 'terms', id, params] as const,
};

export function researcherListQueryOptions(params: ResearcherSearch = {}) {
  return queryOptions({
    queryKey: researcherKeys.list(params),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/researcher', {
          params: { query: params },
          signal,
        }),
      ),
  });
}

export function researcherDetailQueryOptions(
  id: string,
  include: readonly string[] = RESEARCHER_DETAIL_INCLUDES,
) {
  return queryOptions({
    queryKey: researcherKeys.detail(id, include),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/researcher/{researcher_id}', {
          params: {
            path: { researcher_id: id },
            query: include.length > 0 ? { include: [...include] } : undefined,
          },
          signal,
        }),
      ),
  });
}

export function researcherTermsQueryOptions(
  id: string,
  params: ResearcherTermsQuery = {},
) {
  return queryOptions({
    queryKey: researcherKeys.terms(id, params),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/researcher/{researcher_id}/terms', {
          params: {
            path: { researcher_id: id },
            query: params,
          },
          signal,
        }),
      ),
  });
}

/** URL da foto do pesquisador na API v2 (`/v2/researcher/{id}/image`). */
export function researcherImageUrl(id: string): string {
  return `${simccV2BaseUrl(env.simccApiUrl)}/researcher/${encodeURIComponent(id)}/image`;
}
