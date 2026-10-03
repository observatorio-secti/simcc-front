import { ProductionKindV2 } from '../types/production-v2';

// Tipo de busca que consulta o perfil inteiro do pesquisador (API v2).
// Os demais tipos (article, book, name...) buscam em uma camada só e seguem em /resultados.
export const PROFILE_SEARCH_TYPE = 'profile';
export const PROFILE_RESULTS_PATH = '/resultados-perfil';
export const LEGACY_RESULTS_PATH = '/resultados';

export const isProfileSearch = (searchType?: string | null) =>
  searchType === PROFILE_SEARCH_TYPE ||
  searchType === 'name' ||
  searchType === 'area' ||
  searchType === 'abstract';

/** Página de resultados correspondente ao tipo de busca. */
export const resultsPathFor = (searchType?: string | null) =>
  isProfileSearch(searchType) ? PROFILE_RESULTS_PATH : LEGACY_RESULTS_PATH;

export type SourceTypeV2 =
  | 'ARTICLE'
  | 'BOOK'
  | 'BOOK_CHAPTER'
  | 'PATENT'
  | 'SOFTWARE'
  | 'PARTICIPATION_EVENT'
  | 'AREA_SPECIALTY';

/** Como um tipo de busca de /resultados é atendido pela API v2. */
export interface ResultTypeConfig {
  /** `source_type` de /v2/researcher: restringe onde o termo pode casar. */
  sourceTypes: SourceTypeV2[];
  /** Aba de produções (/v2/production/*); ausente quando o tipo não tem obras. */
  productionTab?: { id: string; label: string; kinds: ProductionKindV2[] };
  /** Complemento de "Total de pesquisadores", antes dos termos buscados. */
  caption: string;
  /** Cor do tipo na barra de busca. */
  color: string;
}

export const RESULT_TYPE_CONFIG: Record<string, ResultTypeConfig> = {
  article: {
    sourceTypes: ['ARTICLE'],
    productionTab: {
      id: 'articles-home',
      label: 'Artigos',
      kinds: ['article'],
    },
    caption: 'com artigos relacionados a',
    color: 'bg-blue-500 dark:bg-blue-500',
  },
  book: {
    sourceTypes: ['BOOK', 'BOOK_CHAPTER'],
    productionTab: {
      id: 'book-home',
      label: 'Livros e capítulos',
      kinds: ['book', 'book-chapter'],
    },
    caption: 'com livros ou capítulos relacionados a',
    color: 'bg-pink-500 dark:bg-pink-500',
  },
  patent: {
    sourceTypes: ['PATENT'],
    productionTab: { id: 'patent-home', label: 'Patentes', kinds: ['patent'] },
    caption: 'com patentes relacionadas a',
    color: 'bg-cyan-500 dark:bg-cyan-500',
  },
  software: {
    sourceTypes: ['SOFTWARE'],
    productionTab: {
      id: 'software-home',
      label: 'Softwares',
      kinds: ['software'],
    },
    caption: 'com softwares relacionados a',
    color: 'bg-teal-600 dark:bg-teal-600',
  },
  speaker: {
    sourceTypes: ['PARTICIPATION_EVENT'],
    productionTab: {
      id: 'speaker-home',
      label: 'Participação em eventos',
      kinds: ['event'],
    },
    caption: 'com participações em eventos relacionadas a',
    color: 'bg-orange-500 dark:bg-orange-500',
  },
  area: {
    sourceTypes: ['AREA_SPECIALTY'],
    caption: 'com áreas de especialidade relacionadas a',
    color: 'bg-green-500 dark:bg-green-500',
  },
  name: {
    sourceTypes: [],
    caption: 'com nome relacionado a',
    color: 'bg-red-500 dark:bg-red-500',
  },
  abstract: {
    sourceTypes: [],
    caption: 'com resumo do Lattes relacionado a',
    color: 'bg-yellow-500 dark:bg-yellow-500',
  },
};

/**
 * Configuração v2 do tipo de busca. `undefined` para os tipos que a v2 ainda
 * não cobre (nome e resumo do Lattes), que seguem na página antiga.
 */
export const resultConfigFor = (
  searchType?: string | null,
): ResultTypeConfig | undefined =>
  searchType ? RESULT_TYPE_CONFIG[searchType] : undefined;

/**
 * Converte os termos da barra de busca ("a;b|c", onde `;` = e e `|` = ou)
 * para a sintaxe textual do parâmetro `q` da v2 (espaço = e, `or` = ou).
 */
export const termsToQuery = (terms: string) =>
  terms
    .replace(/[()]/g, '')
    .split('|')
    .map((group) =>
      group
        .split(';')
        .map((term) => term.trim())
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
    .join(' or ');
