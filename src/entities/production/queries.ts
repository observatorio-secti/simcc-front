import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { DetailResponse } from '@/api/types';
import type {
  ProductionDetailPathByKind,
  ProductionKind,
  ProductionListResponseByKind,
  ProductionQuery,
} from './model';

type ListFetcherMap = {
  [K in ProductionKind]: (
    query: ProductionQuery<K>,
    signal?: AbortSignal,
  ) => Promise<ProductionListResponseByKind[K]>;
};

type DetailFetcherMap = {
  [K in ProductionKind]: (
    id: string,
    signal?: AbortSignal,
  ) => Promise<DetailResponse<ProductionDetailPathByKind[K]>>;
};

const LIST_FETCHERS: ListFetcherMap = {
  article: (query, signal) =>
    unwrap(simcc.GET('/production/article', { params: { query }, signal })),
  book: (query, signal) =>
    unwrap(simcc.GET('/production/book', { params: { query }, signal })),
  book_chapter: (query, signal) =>
    unwrap(
      simcc.GET('/production/book-chapter', { params: { query }, signal }),
    ),
  software: (query, signal) =>
    unwrap(simcc.GET('/production/software', { params: { query }, signal })),
  patent: (query, signal) =>
    unwrap(simcc.GET('/production/patent', { params: { query }, signal })),
  event: (query, signal) =>
    unwrap(simcc.GET('/production/event', { params: { query }, signal })),
  research_project: (query, signal) =>
    unwrap(
      simcc.GET('/production/research-project', { params: { query }, signal }),
    ),
  brand: (query, signal) =>
    unwrap(simcc.GET('/production/brand', { params: { query }, signal })),
  guidance: (query, signal) =>
    unwrap(simcc.GET('/production/guidance', { params: { query }, signal })),
  report: (query, signal) =>
    unwrap(simcc.GET('/production/report', { params: { query }, signal })),
  magazine_text: (query, signal) =>
    unwrap(
      simcc.GET('/production/magazine-text', { params: { query }, signal }),
    ),
  event_work: (query, signal) =>
    unwrap(simcc.GET('/production/event-work', { params: { query }, signal })),
};

const DETAIL_FETCHERS: DetailFetcherMap = {
  article: (article_id, signal) =>
    unwrap(
      simcc.GET('/production/article/{article_id}', {
        params: { path: { article_id } },
        signal,
      }),
    ),
  book: (book_id, signal) =>
    unwrap(
      simcc.GET('/production/book/{book_id}', {
        params: { path: { book_id } },
        signal,
      }),
    ),
  book_chapter: (chapter_id, signal) =>
    unwrap(
      simcc.GET('/production/book-chapter/{chapter_id}', {
        params: { path: { chapter_id } },
        signal,
      }),
    ),
  software: (software_id, signal) =>
    unwrap(
      simcc.GET('/production/software/{software_id}', {
        params: { path: { software_id } },
        signal,
      }),
    ),
  patent: (patent_id, signal) =>
    unwrap(
      simcc.GET('/production/patent/{patent_id}', {
        params: { path: { patent_id } },
        signal,
      }),
    ),
  event: (event_id, signal) =>
    unwrap(
      simcc.GET('/production/event/{event_id}', {
        params: { path: { event_id } },
        signal,
      }),
    ),
  research_project: (project_id, signal) =>
    unwrap(
      simcc.GET('/production/research-project/{project_id}', {
        params: { path: { project_id } },
        signal,
      }),
    ),
  brand: (item_id, signal) =>
    unwrap(
      simcc.GET('/production/brand/{item_id}', {
        params: { path: { item_id } },
        signal,
      }),
    ),
  guidance: (item_id, signal) =>
    unwrap(
      simcc.GET('/production/guidance/{item_id}', {
        params: { path: { item_id } },
        signal,
      }),
    ),
  report: (item_id, signal) =>
    unwrap(
      simcc.GET('/production/report/{item_id}', {
        params: { path: { item_id } },
        signal,
      }),
    ),
  magazine_text: (item_id, signal) =>
    unwrap(
      simcc.GET('/production/magazine-text/{item_id}', {
        params: { path: { item_id } },
        signal,
      }),
    ),
  event_work: (item_id, signal) =>
    unwrap(
      simcc.GET('/production/event-work/{item_id}', {
        params: { path: { item_id } },
        signal,
      }),
    ),
};

const EMPTY_QUERY = {} as const;

export const productionKeys = {
  all: ['production'] as const,
  kind: <K extends ProductionKind>(kind: K) => ['production', kind] as const,
  list: <K extends ProductionKind>(kind: K, params?: ProductionQuery<K>) =>
    ['production', kind, 'list', params ?? EMPTY_QUERY] as const,
  detail: <K extends ProductionKind>(kind: K, id: string) =>
    ['production', kind, 'detail', id] as const,
};

/** `queryOptions` tipada para listagem paginada `/v2/production/{kind}`. */
export function productionListQueryOptions<K extends ProductionKind>(
  kind: K,
  params?: ProductionQuery<K>,
) {
  const query: ProductionQuery<K> = params ?? EMPTY_QUERY;
  return queryOptions({
    queryKey: productionKeys.list(kind, query),
    queryFn: ({ signal }) => LIST_FETCHERS[kind](query, signal),
  });
}

/** `queryOptions` tipada para detalhe `/v2/production/{kind}/{id}`. */
export function productionDetailQueryOptions<K extends ProductionKind>(
  kind: K,
  id: string,
) {
  return queryOptions({
    queryKey: productionKeys.detail(kind, id),
    queryFn: ({ signal }) => DETAIL_FETCHERS[kind](id, signal),
  });
}
