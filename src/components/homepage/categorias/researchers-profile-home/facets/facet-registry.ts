// Registro dos facets da busca por perfil (/v2/researcher).
//
// Cada entrada descreve um facet devolvido pela API e qual filtro ele alimenta.
// Para expor um novo facet basta adicioná-lo aqui: a requisição, o estado na URL,
// a barra lateral e os badges de filtros aplicados são derivados deste registro.
import { FacetItemV2, FacetKeyV2 } from '../../../../../types/researcher-v2';

/**
 * Como o facet se liga aos filtros da requisição:
 * - `multi`: lista de valores (checkbox), enviada como chaves repetidas (`param=a&param=b`).
 * - `range`: intervalo numérico (`startParam` / `endParam`).
 * - `none`: apenas informativo, não há filtro correspondente na API.
 */
export type FacetFilterBinding =
  | { kind: 'multi'; param: string }
  | { kind: 'range'; startParam: string; endParam: string }
  | { kind: 'none' };

export interface FacetDefinition {
  key: FacetKeyV2;
  title: string;
  filter: FacetFilterBinding;
  /**
   * Onde o facet aparece: barra de filtros, resumo do resultado ou mapa.
   */
  placement: 'sidebar' | 'summary' | 'map';
  /** Também deve ser solicitado na consulta própria do mapa (com limite expandido). */
  supportsMap?: boolean;
  /** A API só calcula esse facet quando há busca textual (`q`). */
  requiresQuery?: boolean;
  /** Exibe campo de busca local dentro da lista de valores. */
  searchable?: boolean;
  /** Texto curto exibido no checkbox / badge. */
  formatLabel?: (item: FacetItemV2) => string;
}

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'Artigos',
  BOOK: 'Livros',
  BOOK_CHAPTER: 'Capítulos de livro',
  PATENT: 'Patentes',
  SOFTWARE: 'Softwares',
  BRAND: 'Marcas',
  ABSTRACT: 'Resumo do Lattes',
  EVENT: 'Participação em eventos',
  PARTICIPATION_EVENT: 'Participação em eventos',
  AREA: 'Áreas de especialidade',
  AREA_SPECIALTY: 'Áreas de especialidade',
};

export const formatSourceType = (value: string) =>
  SOURCE_TYPE_LABELS[value] ??
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ');

export const AREA_LABELS: Record<string, string> = {
  CIENCIAS_EXATAS_E_DA_TERRA: 'Ciências Exatas e da Terra',
  CIENCIAS_BIOLOGICAS: 'Ciências Biológicas',
  ENGENHARIAS: 'Engenharias',
  CIENCIAS_DA_SAUDE: 'Ciências da Saúde',
  CIENCIAS_AGRARIAS: 'Ciências Agrárias',
  CIENCIAS_SOCIAIS_APLICADAS: 'Ciências Sociais Aplicadas',
  CIENCIAS_HUMANAS: 'Ciências Humanas',
  LINGUISTICA_LETRAS_E_ARTES: 'Linguística, Letras e Artes',
  OUTROS: 'Outros',
};

export const formatArea = (value: string) => {
  const normalized = value.trim().toUpperCase().replace(/\s+/g, '_');
  return AREA_LABELS[normalized] ?? value;
};

/** "METROPOLITANA DE SALVADOR" -> "Metropolitana de Salvador". */
export const formatTerritory = (value: string) =>
  value
    .toLowerCase()
    .replace(
      /(^|[\s/(-])(\p{L})/gu,
      (_, sep, letter) => sep + letter.toUpperCase(),
    )
    .replace(/\b(De|Da|Do|Das|Dos|E)\b/g, (word) => word.toLowerCase())
    // Numerais romanos e siglas de UF ("Nordeste II", "Itaparica (BA/PE)").
    .replace(/\b(Ii|Iii|Iv|Ba|Pe)\b/g, (word) => word.toUpperCase());

export const FACET_DEFINITIONS: FacetDefinition[] = [
  {
    key: 'area',
    title: 'Grandes Áreas do Conhecimento',
    filter: { kind: 'multi', param: 'area' },
    placement: 'sidebar',
    searchable: true,
    formatLabel: (item) => formatArea(item.label || item.value),
  },
  {
    key: 'graduation',
    title: 'Maior Titulação',
    filter: { kind: 'multi', param: 'graduation' },
    placement: 'sidebar',
  },
  {
    key: 'classification',
    title: 'Classificação do Pesquisador',
    filter: { kind: 'multi', param: 'classification' },
    placement: 'sidebar',
  },
  {
    key: 'modality',
    title: 'Bolsas de Produtividade e Fomento',
    filter: { kind: 'multi', param: 'modality' },
    placement: 'sidebar',
    searchable: true,
  },
  {
    key: 'institution',
    title: 'Instituições',
    filter: { kind: 'multi', param: 'institution_id' },
    placement: 'sidebar',
    searchable: true,
    formatLabel: (item) => item.acronym || item.label,
  },
  {
    key: 'graduate_program',
    title: 'Programas de Pós-graduação',
    filter: { kind: 'multi', param: 'graduate_program_id' },
    placement: 'sidebar',
    searchable: true,
  },
  {
    key: 'city',
    title: 'Cidades',
    filter: { kind: 'multi', param: 'city_id' },
    placement: 'sidebar',
    supportsMap: true,
    searchable: true,
  },
  {
    key: 'identity_territory',
    title: 'Territórios de Identidade',
    filter: { kind: 'multi', param: 'identity_territory' },
    placement: 'sidebar',
    supportsMap: true,
    searchable: true,
    formatLabel: (item) => formatTerritory(item.label),
  },
  {
    key: 'source_type',
    title: 'Tipos de Produção',
    filter: { kind: 'multi', param: 'source_type' },
    placement: 'sidebar',
    formatLabel: (item) => formatSourceType(item.value),
  },
  {
    key: 'year',
    title: 'Ano de Produção',
    filter: { kind: 'range', startParam: 'year_start', endParam: 'year_end' },
    placement: 'sidebar',
  },
];

export const getFacetLabel = (definition: FacetDefinition, item: FacetItemV2) =>
  definition.formatLabel?.(item) ?? item.label;

/**
 * Facets a solicitar para a busca atual (respeitando `requiresQuery`).
 * `map` separa os facets do mapa, que vão numa consulta própria com limite expandido.
 */
export const facetsToRequest = (hasQuery: boolean, group: 'list' | 'map') => {
  if (group === 'map') {
    return FACET_DEFINITIONS.filter(
      (facet) => facet.placement === 'map' || facet.supportsMap,
    ).map((facet) => facet.key);
  }
  return FACET_DEFINITIONS.filter(
    (facet) =>
      facet.placement !== 'map' &&
      (hasQuery || !facet.requiresQuery),
  ).map((facet) => facet.key);
};

/** Todos os parâmetros de URL/API controlados por algum facet. */
export const facetFilterParams = () =>
  FACET_DEFINITIONS.flatMap(({ filter }) =>
    filter.kind === 'multi'
      ? [filter.param]
      : filter.kind === 'range'
        ? [filter.startParam, filter.endParam]
        : [],
  );
