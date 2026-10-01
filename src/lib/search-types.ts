// Tipo de busca que consulta o perfil inteiro do pesquisador (API v2).
// Os demais tipos (article, book, name...) buscam em uma camada só e seguem em /resultados.
export const PROFILE_SEARCH_TYPE = 'profile';
export const PROFILE_RESULTS_PATH = '/resultados-perfil';
export const LEGACY_RESULTS_PATH = '/resultados';

export const isProfileSearch = (searchType?: string | null) =>
  searchType === PROFILE_SEARCH_TYPE;

/** Página de resultados correspondente ao tipo de busca. */
export const resultsPathFor = (searchType?: string | null) =>
  isProfileSearch(searchType) ? PROFILE_RESULTS_PATH : LEGACY_RESULTS_PATH;

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
