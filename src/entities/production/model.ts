import type {
  DetailData,
  DetailPath,
  FacetResult,
  ListFilters,
  ListItem,
  ListPath,
  ListResponse,
  PathParamsOf,
  QueryOf,
  ResponseOf,
  Schema,
} from '@/api/types';
import {
  STATUS_COLORS,
  normalizeKey,
  statusKey,
} from '@/shared/lib/design-tokens';

/** Todos os tipos de produção suportados pelas rotas `/v2/production/*`. */
export const PRODUCTION_KINDS = [
  'article',
  'book',
  'book_chapter',
  'software',
  'patent',
  'event',
  'research_project',
  'brand',
  'guidance',
  'report',
  'magazine_text',
  'event_work',
] as const;

/** Enum único de tipo de produção da API v2 (`snake_case`). */
export type ProductionKind = ResponseOf<'/metrics/production/{kind}'>['kind'];

/** Mapa de `ProductionKind` para o caminho de listagem na API v2. */
export type ProductionListPathByKind = {
  article: '/production/article';
  book: '/production/book';
  book_chapter: '/production/book-chapter';
  software: '/production/software';
  patent: '/production/patent';
  event: '/production/event';
  research_project: '/production/research-project';
  brand: '/production/brand';
  guidance: '/production/guidance';
  report: '/production/report';
  magazine_text: '/production/magazine-text';
  event_work: '/production/event-work';
};

/** Mapa de `ProductionKind` para o caminho de detalhe na API v2. */
export type ProductionDetailPathByKind = {
  article: '/production/article/{article_id}';
  book: '/production/book/{book_id}';
  book_chapter: '/production/book-chapter/{chapter_id}';
  software: '/production/software/{software_id}';
  patent: '/production/patent/{patent_id}';
  event: '/production/event/{event_id}';
  research_project: '/production/research-project/{project_id}';
  brand: '/production/brand/{item_id}';
  guidance: '/production/guidance/{item_id}';
  report: '/production/report/{item_id}';
  magazine_text: '/production/magazine-text/{item_id}';
  event_work: '/production/event-work/{item_id}';
};

export interface ProductionEndpointConfig<
  L extends ListPath = ListPath,
  D extends DetailPath = DetailPath,
> {
  readonly listPath: L;
  readonly detailPath: D;
  readonly idParam: keyof PathParamsOf<D>;
}

export const PRODUCTION_ENDPOINTS = {
  article: {
    listPath: '/production/article',
    detailPath: '/production/article/{article_id}',
    idParam: 'article_id',
  },
  book: {
    listPath: '/production/book',
    detailPath: '/production/book/{book_id}',
    idParam: 'book_id',
  },
  book_chapter: {
    listPath: '/production/book-chapter',
    detailPath: '/production/book-chapter/{chapter_id}',
    idParam: 'chapter_id',
  },
  software: {
    listPath: '/production/software',
    detailPath: '/production/software/{software_id}',
    idParam: 'software_id',
  },
  patent: {
    listPath: '/production/patent',
    detailPath: '/production/patent/{patent_id}',
    idParam: 'patent_id',
  },
  event: {
    listPath: '/production/event',
    detailPath: '/production/event/{event_id}',
    idParam: 'event_id',
  },
  research_project: {
    listPath: '/production/research-project',
    detailPath: '/production/research-project/{project_id}',
    idParam: 'project_id',
  },
  brand: {
    listPath: '/production/brand',
    detailPath: '/production/brand/{item_id}',
    idParam: 'item_id',
  },
  guidance: {
    listPath: '/production/guidance',
    detailPath: '/production/guidance/{item_id}',
    idParam: 'item_id',
  },
  report: {
    listPath: '/production/report',
    detailPath: '/production/report/{item_id}',
    idParam: 'item_id',
  },
  magazine_text: {
    listPath: '/production/magazine-text',
    detailPath: '/production/magazine-text/{item_id}',
    idParam: 'item_id',
  },
  event_work: {
    listPath: '/production/event-work',
    detailPath: '/production/event-work/{item_id}',
    idParam: 'item_id',
  },
} as const satisfies {
  [K in ProductionKind]: ProductionEndpointConfig<
    ProductionListPathByKind[K],
    ProductionDetailPathByKind[K]
  >;
};

/** Mapa fortemente tipado dos resumos (cards/listagens) por tipo da v2. */
export type ProductionSummaryByKind = {
  [K in ProductionKind]: ListItem<ProductionListPathByKind[K]>;
};

/** Mapa fortemente tipado dos dossiês de detalhe por tipo da v2. */
export type ProductionDetailByKind = {
  [K in ProductionKind]: DetailData<ProductionDetailPathByKind[K]>;
};

/** Mapa fortemente tipado dos query params aceitos por cada listagem da v2. */
export type ProductionQueryByKind = {
  [K in ProductionKind]: QueryOf<ProductionListPathByKind[K]>;
};

/** Mapa fortemente tipado dos envelopes completos de resposta paginada por tipo. */
export type ProductionListResponseByKind = {
  [K in ProductionKind]: ListResponse<ProductionListPathByKind[K]>;
};

/** Mapa fortemente tipado dos filtros aplicados retornados em `filters_applied`. */
export type ProductionFiltersByKind = {
  [K in ProductionKind]: ListFilters<ProductionListPathByKind[K]>;
};

/** Mapa das chaves de ordenação aceitas por cada rota `/production/*`. */
export type ProductionSortByKind = {
  [K in ProductionKind]: QueryOf<ProductionListPathByKind[K]> extends {
    sort_by?: infer S;
  }
    ? NonNullable<S>
    : never;
};

export type ProductionSortBy = ProductionSortByKind[ProductionKind];

export type ProductionSummary<K extends ProductionKind = ProductionKind> =
  ProductionSummaryByKind[K];

export type ProductionDetail<K extends ProductionKind = ProductionKind> =
  ProductionDetailByKind[K];

export type ProductionQuery<K extends ProductionKind = ProductionKind> =
  ProductionQueryByKind[K];

export type ProductionItem<K extends ProductionKind = ProductionKind> =
  ProductionSummaryByKind[K] | ProductionDetailByKind[K];

/** União discriminada para listas ou estados heterogêneos de resumo. */
export type ProductionSummaryEntry = {
  [K in ProductionKind]: { kind: K; item: ProductionSummaryByKind[K] };
}[ProductionKind];

/** União discriminada para dossiês heterogêneos de detalhe. */
export type ProductionDetailEntry = {
  [K in ProductionKind]: { kind: K; item: ProductionDetailByKind[K] };
}[ProductionKind];

export type ProductionAuthorRef = Schema<'ResearcherRef'>;
export type ProductionAuthorName = Schema<'AuthorName'>;
export type ProductionMatch = Schema<'ArticleMatch'>;
export type ProductionMagazineRef = Schema<'MagazineRef'>;
export type ProductionQualis = NonNullable<ProductionMagazineRef['qualis']>;
export type ProductionQualisStatus = NonNullable<
  ProductionMagazineRef['qualis_status']
>;
export type ResearchProjectFoment = Schema<'ResearchProjectFoment'>;
export type ResearchProjectComponent = Schema<'ResearchProjectComponent'>;
export type ResearchProjectProduction = Schema<'ResearchProjectProduction'>;
export type ProductionFacetResult = FacetResult;

const PRODUCTION_KIND_SET: ReadonlySet<string> = new Set(PRODUCTION_KINDS);

/** Converte slugs com hífen (`book-chapter`, `magazine-text`) ou caixa variada para `ProductionKind`. */
export function normalizeProductionKind(
  value: string | null | undefined,
): ProductionKind | null {
  const normalized = (value ?? '').trim().toLowerCase().replace(/-/g, '_');
  return PRODUCTION_KIND_SET.has(normalized)
    ? (normalized as ProductionKind)
    : null;
}

/** Valida URL externa garantindo protocolo `http:` ou `https:`. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** Normaliza um DOI (código puro, `doi:` ou URL) para link `https://doi.org/...`. */
export function doiUrl(doi: string): string | null {
  const clean = doi
    .trim()
    .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i, '');
  if (!clean) return null;
  return `https://doi.org/${clean}`;
}

/** Caminho público do perfil do pesquisador respeitando `BASE_URL`. */
export function researcherHref(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/pesquisadores/${encodeURIComponent(id)}`;
}

/** Formata período (`start_year` / `end_year`) de projetos de pesquisa. */
export function formatYearRange(
  startYear?: number | null,
  endYear?: number | null,
): string | null {
  if (startYear != null && endYear != null) {
    return startYear === endYear
      ? String(startYear)
      : `${startYear}–${endYear}`;
  }
  if (startYear != null) return `${startYear}–atual`;
  if (endYear != null) return `até ${endYear}`;
  return null;
}

/** Formata intervalo de páginas de capítulos de livro. */
export function formatPageRange(
  startPage?: string | null,
  endPage?: string | null,
): string | null {
  const start = startPage?.trim();
  const end = endPage?.trim();
  if (start && end) return start === end ? start : `${start}–${end}`;
  return start || end || null;
}

/** Formata contagem com singular/plural e separador de milhar pt-BR. */
export function formatCountNoun(
  count: number,
  noun: readonly [singular: string, plural: string],
): string {
  const [singular, plural] = noun;
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : plural}`;
}

/** Formata fator de impacto JCR em pt-BR. */
export function formatJcr(jcr: number | null | undefined): string | null {
  if (jcr == null || Number.isNaN(jcr)) return null;
  return jcr.toLocaleString('pt-BR', { maximumFractionDigits: 3 });
}

/** Rótulo compacto de Qualis para o marcador do card de artigo. */
export function formatQualisLabel(
  magazine: ProductionMagazineRef | null | undefined,
): string {
  return magazine?.qualis ? `Qualis ${magazine.qualis}` : 'Sem Qualis';
}

/** Rótulo descritivo de Qualis para o dossiê de detalhe do artigo. */
export function formatQualisDetail(
  magazine: ProductionMagazineRef | null | undefined,
): string | null {
  if (!magazine) return null;
  if (magazine.qualis) return magazine.qualis;
  if (magazine.qualis_status === 'not_applicable') return 'Não se aplica';
  return 'Sem Qualis';
}

/** Converte status em snake_case/caixa alta da API para rótulo legível pt-BR. */
export function formatStatusLabel(
  status: string | null | undefined,
): string | null {
  const raw = status?.trim();
  if (!raw) return null;
  const key = statusKey(raw);
  if (key) return STATUS_COLORS[key].label;
  return raw;
}

const PROJECT_NATURE_LABELS: Record<string, string> = {
  PESQUISA: 'Pesquisa',
  EXTENSAO: 'Extensão',
  DESENVOLVIMENTO: 'Desenvolvimento',
  ENSINO: 'Ensino',
  OUTRA: 'Outra',
};

/** Converte naturezas em CAIXA_ALTA de projeto para rótulo em sentence case. */
export function formatNatureLabel(
  nature: string | null | undefined,
): string | null {
  const raw = nature?.trim();
  if (!raw) return null;
  const normalized = normalizeKey(raw);
  return PROJECT_NATURE_LABELS[normalized] ?? raw;
}

/**
 * Rótulo legível para valores de dicionário do Lattes em CAIXA_ALTA
 * (`RESUMO_EXPANDIDO` → "Resumo expandido"). Texto já legível passa direto.
 */
export function formatLattesLabel(
  value: string | null | undefined,
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  if (raw !== raw.toUpperCase()) return raw;
  const words = raw.replace(/_+/g, ' ').replace(/\s+/g, ' ').toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** "Sim"/"Não" para os indicadores booleanos do Lattes (`null` some). */
export function formatYesNo(value: boolean | null | undefined): string | null {
  if (value == null) return null;
  return value ? 'Sim' : 'Não';
}

/** Formata a lista de autores de publicação preferindo `authors[]` estruturado. */
export function formatAuthorsList(
  authors: readonly ProductionAuthorName[] | null | undefined,
  allAuthorsRaw: string | null | undefined,
): string | null {
  const structured = authors
    ?.map((author) => author.name.trim())
    .filter(Boolean);
  if (structured && structured.length > 0) return structured.join('; ');
  const raw = allAuthorsRaw?.trim();
  return raw || null;
}

/** Formata a quantidade de discentes envolvidos no projeto de pesquisa. */
export function formatProjectStudents(
  project: Pick<
    ProductionDetail<'research_project'>,
    | 'number_undergraduates'
    | 'number_specialists'
    | 'number_academic_masters'
    | 'number_phd'
  >,
): string | null {
  const counts: Array<readonly [string, number | null | undefined]> = [
    ['Graduação', project.number_undergraduates],
    ['Especialização', project.number_specialists],
    ['Mestrado', project.number_academic_masters],
    ['Doutorado', project.number_phd],
  ];
  const parts = counts.flatMap(([label, count]) =>
    count != null && count > 0
      ? [`${label}: ${count.toLocaleString('pt-BR')}`]
      : [],
  );
  return parts.length > 0 ? parts.join(' · ') : null;
}
