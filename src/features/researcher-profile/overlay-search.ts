import {
  parseSearchInput,
  toURLSearchParams,
} from '@/shared/lib/search-params';
import {
  cleanProfileSearch,
  getProfileSearchDefaults,
  researcherProfileSearchSchema,
  type ResearcherProfileSearch,
} from './search-schema';

// O perfil aberto como overlay sobre uma lista (ADR 0010) guarda o próprio
// estado (aba, filtros, página, produção aberta) num único parâmetro da lista
// hospedeira, como query string. O termo e o tipo de busca não entram nele:
// vêm da lista, que é a dona deles.

export interface ProfileOverlayContext {
  /** Termo da busca hospedeira, destacado no resumo do perfil. */
  q?: string;
  /** Tipo de busca hospedeira (cor do destaque). */
  searchType?: string;
}

/** Monta o estado do perfil a partir do parâmetro codificado e do contexto da lista. */
export function decodeProfileOverlaySearch(
  encoded: string | undefined,
  context: ProfileOverlayContext = {},
): ResearcherProfileSearch {
  const own = encoded ? parseSearchInput(encoded) : {};
  return researcherProfileSearchSchema.parse({
    ...own,
    q: context.q,
    search_type: context.q ? context.searchType : undefined,
  });
}

export interface EncodedProfileOverlaySearch {
  /** Valor do parâmetro na lista hospedeira (`undefined` quando tudo é padrão). */
  encoded: string | undefined;
  /** Search params da rota `/pesquisadores/$id` (para a máscara e o link). */
  routeSearch: Partial<ResearcherProfileSearch>;
}

/** Aplica um patch ao estado do perfil e devolve as duas formas de guardá-lo. */
export function encodeProfileOverlaySearch(
  current: ResearcherProfileSearch,
  patch: Partial<ResearcherProfileSearch> = {},
): EncodedProfileOverlaySearch {
  const routeSearch = cleanProfileSearch({ ...current, ...patch });
  const { q: _q, search_type: _searchType, ...own } = routeSearch;
  const encoded = toURLSearchParams(
    own as Record<string, unknown>,
    getProfileSearchDefaults() as Record<string, unknown>,
  ).toString();
  return { encoded: encoded || undefined, routeSearch };
}
