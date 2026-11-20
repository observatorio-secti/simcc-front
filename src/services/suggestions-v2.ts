import { api } from '../lib/api';
import { serializeParams } from './researchers-v2';
import {
  SuggestionSourceTypeV2,
  SuggestionV2,
} from '../types/suggestion-v2';

/**
 * Dicionários consultados por tipo de busca. `[]` soma todos os dicionários;
 * tipos ausentes (nome, área, software) não têm dicionário na v2.
 */
const SUGGESTION_SOURCES: Record<string, SuggestionSourceTypeV2[]> = {
  profile: [],
  name: [],
  area: [],
  article: ['ARTICLE'],
  book: ['BOOK', 'BOOK_CHAPTER'],
  patent: ['PATENT'],
  speaker: ['SPEAKER'],
  abstract: ['ABSTRACT'],
};

export const suggestionSourcesFor = (
  searchType?: string | null,
): SuggestionSourceTypeV2[] | undefined =>
  searchType ? SUGGESTION_SOURCES[searchType] : undefined;

/**
 * Sugere termos que começam com `q` (GET /v2/suggestion).
 * A API casa uma palavra só: `q` com espaço não retorna nada.
 */
export const listSuggestionsV2 = async (
  q: string,
  sourceTypes: SuggestionSourceTypeV2[] = [],
  limit = 10,
  signal?: AbortSignal,
): Promise<SuggestionV2[]> => {
  const { data } = await api.get('v2/suggestion', {
    params: { q, source_type: sourceTypes, limit },
    paramsSerializer: { serialize: serializeParams },
    signal,
  });
  return data.data;
};
