import {
  resultsSearch,
  SEARCH_TYPES,
  type ResultsSearch,
} from '@/features/search';
import type { SearchTabId, SearchType } from '@/features/search';
import type { InstitutionDetailTab } from '@/features/institutions/search-schema';
import {
  researcherProfileSearchSchema,
  type ResearcherProfileSearch,
} from '@/features/researcher-profile/search-schema';
import { territoryCode } from '@/entities/territory/model';

// Tradução dos parâmetros das URLs do legado (`legado-v1:src/App.tsx`) para
// os search params das rotas novas (V2). Funções puras: as rotas de redirect
// (`beforeLoad`) passam o `location.search` já lido pelo router e chamam
// estas funções. Parâmetro sem equivalente é descartado. A tabela completa
// está em `docs/legado/inventario.md`.

function appendValue(params: URLSearchParams, key: string, value: unknown) {
  if (value === undefined || value === null || value === '') return;
  if (Array.isArray(value)) {
    for (const item of value) appendValue(params, key, item);
    return;
  }
  params.append(
    key,
    typeof value === 'object' ? JSON.stringify(value) : String(value),
  );
}

/**
 * Search da URL antiga como `URLSearchParams`. O parser do router já juntou
 * chaves repetidas em lista e converteu números; aqui tudo volta a ser texto.
 */
export function legacyParams(search: Record<string, unknown>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    appendValue(params, key, value);
  }
  return params;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

/** Ids da v2 são UUIDs; o resto (sigla, lattes) precisa ser resolvido. */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

/** Primeiro valor não vazio de uma das chaves, já sem espaços nas pontas. */
export function firstParam(
  params: URLSearchParams,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = params.get(key)?.trim();
    if (value) return value;
  }
  return undefined;
}

/**
 * Converte os termos do legado (`a;b|c`, `;` = e, `|` = ou, parênteses de
 * agrupamento) para o `q` da v2 (espaço = e, `or` = ou). Mesma regra de
 * `legado-v1:src/lib/search-types.ts` (`termsToQuery`).
 */
export function termsToQuery(terms: string | undefined): string | undefined {
  if (!terms) return undefined;
  const q = terms
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
  return q || undefined;
}

const SEARCH_TYPE_SET: ReadonlySet<string> = new Set(SEARCH_TYPES);

/** `type_search` do legado para o tipo de busca novo (mesmos ids). */
export function legacySearchType(
  value: string | undefined,
): SearchType | undefined {
  return value && SEARCH_TYPE_SET.has(value)
    ? (value as SearchType)
    : undefined;
}

/** Abas de `/resultados` (`result-home-v2.tsx`) que têm aba em `/busca`. */
const LEGACY_RESULTS_TABS: Readonly<Record<string, SearchTabId>> = {
  'researchers-home': 'researchers',
  mapa: 'map',
  'articles-home': 'articles',
  'book-home': 'books',
  'patent-home': 'patents',
  'software-home': 'software',
  'speaker-home': 'events',
};

/** `source_type` da v2 antiga (maiúsculo) para o enum atual. */
const LEGACY_SOURCE_TYPES: Readonly<Record<string, string>> = {
  ARTICLE: 'article',
  BOOK: 'book',
  BOOK_CHAPTER: 'book_chapter',
  PATENT: 'patent',
  SOFTWARE: 'software',
  PARTICIPATION_EVENT: 'event',
  AREA_SPECIALTY: 'area_specialty',
};

/** Filtros da busca por perfil do legado que já usavam o nome da v2. */
const LEGACY_MULTI_FILTERS = [
  'area',
  'institution_id',
  'graduate_program_id',
  'city_id',
  'identity_territory',
  'graduation',
  'classification',
  'modality',
  'qualis',
] as const;

/**
 * `/resultados` e `/resultados-perfil` → search params de `/busca`.
 *
 * - `terms` → `q`; `type_search` → `type` (perfil quando ausente ou inválido);
 * - `tab` (`articles-home`, `mapa`…) → `tab`; a aba de instituições não existe;
 * - `identity_territory` por nome → código SEI (a v2 aceita os dois, mas o
 *   painel de facetas marca a opção pelo código);
 * - filtros com o nome da v2 (lista repetida) e `year_start`/`year_end`;
 * - `source_type` em maiúsculas → minúsculas;
 * - `sort_by` (pesquisadores) ou `production_sort` (aba de produção) → `sort_by`.
 *
 * O resultado passa pelo schema zod de `/busca`, que descarta o inválido.
 */
export function legacyResultsToBusca(params: URLSearchParams): ResultsSearch {
  const type = legacySearchType(
    firstParam(params, 'type_search', 'search_type'),
  );
  const tabParam = firstParam(params, 'tab');
  const tab = tabParam ? LEGACY_RESULTS_TABS[tabParam] : undefined;
  const raw: Record<string, unknown> = {
    q: termsToQuery(firstParam(params, 'terms')),
    type,
    tab,
  };
  for (const key of LEGACY_MULTI_FILTERS) {
    const values = params.getAll(key).filter(Boolean);
    if (values.length > 0) raw[key] = values;
  }
  if (Array.isArray(raw.identity_territory)) {
    raw.identity_territory = (raw.identity_territory as string[]).map(
      (value) => territoryCode(value) ?? value,
    );
  }
  const sourceTypes = params
    .getAll('source_type')
    .map((value) => LEGACY_SOURCE_TYPES[value] ?? value)
    .filter(Boolean);
  if (sourceTypes.length > 0) raw.source_type = sourceTypes;
  raw.year_start = firstParam(params, 'year_start');
  raw.year_end = firstParam(params, 'year_end');
  const isProductionTab =
    tab !== undefined && tab !== 'researchers' && tab !== 'map';
  raw.sort_by = isProductionTab
    ? firstParam(params, 'production_sort')
    : firstParam(params, 'sort_by');
  return compact(resultsSearch.schema.parse(raw));
}

/** Abas de `visualizacao-instituicao.tsx` (`?pagina=`) com aba no detalhe novo. */
const LEGACY_INSTITUTION_TABS: Readonly<
  Record<string, InstitutionDetailTab | undefined>
> = {
  docentes: undefined, // pesquisadores, a aba padrão
  programas_pos: 'programs',
};

/** `?pagina=` do legado para a aba de `/instituicoes/$id` (ou nenhuma). */
export function legacyInstitutionTab(
  pagina: string | undefined,
): InstitutionDetailTab | undefined {
  return pagina ? LEGACY_INSTITUTION_TABS[pagina] : undefined;
}

/** Normaliza para comparar sigla ou nome sem caixa nem acento. */
export function normalizeLabel(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();
}

/** Item cuja sigla (ou, na falta, o nome) é igual ao identificador. */
export function matchByAcronymOrName<
  T extends { id: string; acronym?: string | null; name?: string | null },
>(items: readonly T[], identifier: string): T | undefined {
  const target = normalizeLabel(identifier);
  return (
    items.find(
      (item) => item.acronym && normalizeLabel(item.acronym) === target,
    ) ?? items.find((item) => item.name && normalizeLabel(item.name) === target)
  );
}

/** Pesquisador cujo nome é igual ao procurado (sem caixa nem acento). */
export function matchByName<T extends { id: string; name: string }>(
  items: readonly T[],
  name: string,
): T | undefined {
  const target = normalizeLabel(name);
  return items.find((item) => normalizeLabel(item.name) === target);
}

/**
 * Search params do perfil a partir de `/researcher`: `terms` → `q` e o tipo
 * (`type_search` ou `search_type`) → `search_type`, só quando há termo.
 * Passa pelo schema zod do perfil (os padrões saem pelo middleware da rota).
 */
export function legacyResearcherProfileSearch(
  params: URLSearchParams,
): ResearcherProfileSearch {
  const q = termsToQuery(firstParam(params, 'terms'));
  const type = q
    ? legacySearchType(firstParam(params, 'type_search', 'search_type'))
    : undefined;
  return compact(researcherProfileSearchSchema.parse({ q, search_type: type }));
}

/** Tira chaves `undefined` para o redirect não levar `?chave=` vazia. */
function compact<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined),
  ) as T;
}
