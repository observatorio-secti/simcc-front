import type { FacetItem, FacetResult } from '@/api/types';
import { titleCaseLabel } from '@/shared/lib/format';

/**
 * Faceta hierárquica da v2: território de identidade (código SEI) no primeiro
 * nível e município (código IBGE) em `children`. O `facet_limit` vale por
 * nível; o grupo de itens sem território vem por último, com `value: null`.
 */
export const TERRITORY_CITY_FACET = 'territory_city';

/** `facet_limit` que traz os 27 territórios e todos os municípios de cada um. */
export const TERRITORY_FACET_LIMIT = 100;

/** Território (1º nível) ou município (2º nível) de `territory_city`. */
export type TerritoryFacetItem = FacetItem;

/** Nomes dos 27 territórios pelo código SEI (divisão de 2019). */
export const TERRITORY_NAMES: Readonly<Record<string, string>> = {
  '1': 'IRECÊ',
  '2': 'VELHO CHICO',
  '3': 'CHAPADA DIAMANTINA',
  '4': 'SISAL',
  '5': 'LITORAL SUL',
  '6': 'BAIXO SUL',
  '7': 'EXTREMO SUL',
  '8': 'ITAPETINGA',
  '9': 'VALE DO JIQUIRIÇÁ',
  '10': 'SERTÃO DO SÃO FRANCISCO',
  '11': 'BACIA DO RIO GRANDE',
  '12': 'BACIA DA PARAMIRIM',
  '13': 'SERTÃO PRODUTIVO',
  '14': 'PIEMONTE DO PARAGUAÇU',
  '15': 'BACIA DO JACUÍPE',
  '16': 'PIEMONTE DA DIAMANTINA',
  '17': 'SEMI-ÁRIDO NORDESTE II',
  '18': 'AGRESTE DE ALAGOINHAS / LITORAL NORTE',
  '19': 'PORTAL DO SERTÃO',
  '20': 'VITÓRIA DA CONQUISTA',
  '21': 'RECÔNCAVO',
  '22': 'MÉDIO RIO DAS CONTAS',
  '23': 'BACIA DO RIO CORRENTE',
  '24': 'ITAPARICA (BA/PE)',
  '25': 'PIEMONTE NORTE DO ITAPICURU',
  '26': 'METROPOLITANA DE SALVADOR',
  '27': 'COSTA DO DESCOBRIMENTO',
};

/** Sem acento, caixa alta e só letras e números (ignora hífen e espaço). */
function nameKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');
}

const CODE_BY_NAME = new Map(
  Object.entries(TERRITORY_NAMES).map(([code, name]) => [nameKey(name), code]),
);

/**
 * Código SEI de um valor do filtro `identity_territory`: o próprio código ou
 * o nome do território (links do legado). `undefined` se não reconhecer.
 */
export function territoryCode(
  value: string | null | undefined,
): string | undefined {
  const raw = (value ?? '').trim();
  if (!raw) return undefined;
  if (raw in TERRITORY_NAMES) return raw;
  return CODE_BY_NAME.get(nameKey(raw));
}

/** "METROPOLITANA DE SALVADOR" → "Metropolitana de Salvador". */
export function formatTerritoryName(value: string): string {
  return titleCaseLabel(value);
}

/**
 * Separa `territory_city` das demais facetas. O painel de facetas desenharia
 * essa faceta (de `param` em lista) como intervalo, então ela vai só ao mapa.
 */
export function splitTerritoryFacet<F extends FacetResult>(
  facets: Record<string, F> | null | undefined,
): { territoryCity: F | undefined; rest: Record<string, F> | undefined } {
  if (!facets) return { territoryCity: undefined, rest: undefined };
  const { [TERRITORY_CITY_FACET]: territoryCity, ...rest } = facets;
  return { territoryCity, rest };
}

/** Liga ou desliga um código na lista do filtro (`undefined` quando vazia). */
export function toggleCode(
  current: readonly string[] | undefined,
  code: string,
): string[] | undefined {
  const list = current ?? [];
  const next = list.includes(code)
    ? list.filter((value) => value !== code)
    : [...list, code];
  return next.length > 0 ? next : undefined;
}
