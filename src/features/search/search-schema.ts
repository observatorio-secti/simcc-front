import { z } from 'zod';
import type { QueryOf } from '@/api/types';
import { SEARCH_TYPE_COLORS } from '@/shared/lib/design-tokens';

/** Tipos de busca disponíveis no seletor da barra de busca. */
export const SEARCH_TYPES = [
  'profile',
  'article',
  'book',
  'patent',
  'software',
  'speaker',
  'area',
  'name',
  'abstract',
] as const;

export type SearchType = (typeof SEARCH_TYPES)[number];

export const SEARCH_TYPE_GROUPS = {
  primary: ['profile'] as const satisfies readonly SearchType[],
  secondary: [
    'article',
    'book',
    'patent',
    'software',
    'speaker',
    'area',
    'name',
    'abstract',
  ] as const satisfies readonly SearchType[],
};

export const searchTypeSchema = z.enum(SEARCH_TYPES).catch('profile');

export const homeSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  type: searchTypeSchema.optional().catch(undefined),
});

export type HomeSearch = z.infer<typeof homeSearchSchema>;

export function searchTypeLabel(type: SearchType): string {
  return SEARCH_TYPE_COLORS[type].label;
}

export function searchTypeBgClass(type: SearchType): string {
  return SEARCH_TYPE_COLORS[type].bg;
}

type SuggestionSourceType = NonNullable<QueryOf<'/suggestion'>['source_type']>;

const SUGGESTION_SOURCE_MAP: Partial<Record<SearchType, SuggestionSourceType>> =
  {
    article: ['article'],
    book: ['book', 'book_chapter'],
    patent: ['patent'],
    speaker: ['speaker'],
    abstract: ['abstract'],
  };

/** Mapeia o tipo de busca da UI para `source_type` de `/v2/suggestion`. */
export function suggestionSourceTypesFor(
  type: SearchType,
): SuggestionSourceType | undefined {
  return SUGGESTION_SOURCE_MAP[type];
}

/** Monta a URL de `/busca` com os search params padronizados. */
export function buildBuscaHref({
  q,
  type = 'profile',
}: {
  q: string;
  type?: SearchType;
}): string {
  const trimmed = q.trim();
  const params = new URLSearchParams();
  if (trimmed) {
    params.set('q', trimmed);
  }
  if (type !== 'profile') {
    params.set('type', type);
  }
  const query = params.toString();
  return query ? `/busca?${query}` : '/busca';
}
