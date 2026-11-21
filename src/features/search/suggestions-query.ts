import { queryOptions } from '@tanstack/react-query';
import { simcc, unwrap } from '@/api/simcc';
import type { QueryOf, ResponseOf, Schema } from '@/api/types';

export type SuggestionQuery = QueryOf<'/suggestion'>;
export type SuggestionResponse = ResponseOf<'/suggestion'>;
export type SuggestionItem = Schema<'Suggestion'>;

export const suggestionKeys = {
  all: ['suggestion'] as const,
  list: (params: SuggestionQuery) => ['suggestion', 'list', params] as const,
};

export function suggestionsQueryOptions(params: SuggestionQuery) {
  return queryOptions({
    queryKey: suggestionKeys.list(params),
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/suggestion', {
          params: { query: params },
          signal,
        }),
      ),
    staleTime: 60_000,
  });
}
