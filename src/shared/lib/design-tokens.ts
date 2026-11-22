// Cor por dado: o ÚNICO lugar que escolhe a cor de um valor de dicionário
// (DESIGN.md §2.3, components.md §Mapeamentos). Os valores das cores estão em
// design-kit/tokens/tailwind.css; aqui ficam só os nomes das classes do tema.
//
// O Tailwind só gera classes que aparecem LITERALMENTE no código. Por isso cada
// entrada traz as strings completas (`bg-area-saude`), e nunca uma montagem como
// `bg-area-${key}`.

/** Classes de uma cor de dicionário. */
export interface DictionaryColor {
  /** Rótulo em pt-BR, para legenda e texto ao lado da cor. */
  label: string;
  /** Fundo: badge sólido, dot, barra. */
  bg: string;
  /** Texto na cor (ex.: termo buscado em destaque). */
  text: string;
  /** Borda esquerda do card de produção (`border-l-[6px]`). */
  borderLeft: string;
  /**
   * Cor clara: não use como fundo de texto branco; prefira dot, borda ou
   * barra (DESIGN.md §2.4).
   */
  light?: boolean;
}

/** Cor neutra para valor ausente ou fora do dicionário (`sc-dot`, `sc-prod`). */
export const FALLBACK_COLOR: DictionaryColor = {
  label: 'Não informado',
  bg: 'bg-neutral-400',
  text: 'text-neutral-500',
  borderLeft: 'border-l-neutral-300',
};

/** Normaliza para comparar: sem acento, caixa alta, só letras, números e espaço. */
export function normalizeKey(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Tipo de busca (`search-*`)
// ---------------------------------------------------------------------------

export const SEARCH_TYPE_COLORS = {
  profile: {
    label: 'Perfil do pesquisador',
    bg: 'bg-search-profile',
    text: 'text-search-profile',
    borderLeft: 'border-l-search-profile',
  },
  article: {
    label: 'Artigos',
    bg: 'bg-search-article',
    text: 'text-search-article',
    borderLeft: 'border-l-search-article',
  },
  book: {
    label: 'Livros e capítulos',
    bg: 'bg-search-book',
    text: 'text-search-book',
    borderLeft: 'border-l-search-book',
  },
  patent: {
    label: 'Patentes',
    bg: 'bg-search-patent',
    text: 'text-search-patent',
    borderLeft: 'border-l-search-patent',
  },
  software: {
    label: 'Softwares',
    bg: 'bg-search-software',
    text: 'text-search-software',
    borderLeft: 'border-l-search-software',
  },
  speaker: {
    label: 'Participação em eventos',
    bg: 'bg-search-speaker',
    text: 'text-search-speaker',
    borderLeft: 'border-l-search-speaker',
  },
  area: {
    label: 'Áreas de especialidade',
    bg: 'bg-search-area',
    text: 'text-search-area',
    borderLeft: 'border-l-search-area',
  },
  name: {
    label: 'Nome',
    bg: 'bg-search-name',
    text: 'text-search-name',
    borderLeft: 'border-l-search-name',
  },
  abstract: {
    label: 'Resumo',
    bg: 'bg-search-abstract',
    text: 'text-search-abstract',
    borderLeft: 'border-l-search-abstract',
  },
  maria: {
    label: 'MarIA',
    bg: 'bg-search-maria',
    text: 'text-search-maria',
    borderLeft: 'border-l-search-maria',
  },
} as const satisfies Record<string, DictionaryColor>;

export type SearchTypeKey = keyof typeof SEARCH_TYPE_COLORS;

// Valores da v2 (`source_type`) que não têm o mesmo nome do dicionário do kit.
const SEARCH_TYPE_ALIASES: Record<string, SearchTypeKey> = {
  book_chapter: 'book',
  event: 'speaker',
  area_specialty: 'area',
};

export function searchTypeKey(
  value: string | null | undefined,
): SearchTypeKey | null {
  const raw = (value ?? '').trim().toLowerCase().replace(/-/g, '_');
  if (raw in SEARCH_TYPE_COLORS) return raw as SearchTypeKey;
  return SEARCH_TYPE_ALIASES[raw] ?? null;
}

export function searchTypeColor(
  value: string | null | undefined,
): DictionaryColor {
  const key = searchTypeKey(value);
  return key ? SEARCH_TYPE_COLORS[key] : FALLBACK_COLOR;
}

// ---------------------------------------------------------------------------
// Grande área do conhecimento (`area-*`)
// ---------------------------------------------------------------------------

export const AREA_COLORS = {
  agrarias: {
    label: 'Ciências agrárias',
    bg: 'bg-area-agrarias',
    text: 'text-area-agrarias',
    borderLeft: 'border-l-area-agrarias',
  },
  exatas: {
    label: 'Ciências exatas e da terra',
    bg: 'bg-area-exatas',
    text: 'text-area-exatas',
    borderLeft: 'border-l-area-exatas',
    light: true,
  },
  saude: {
    label: 'Ciências da saúde',
    bg: 'bg-area-saude',
    text: 'text-area-saude',
    borderLeft: 'border-l-area-saude',
  },
  humanas: {
    label: 'Ciências humanas',
    bg: 'bg-area-humanas',
    text: 'text-area-humanas',
    borderLeft: 'border-l-area-humanas',
  },
  biologicas: {
    label: 'Ciências biológicas',
    bg: 'bg-area-biologicas',
    text: 'text-area-biologicas',
    borderLeft: 'border-l-area-biologicas',
  },
  engenharias: {
    label: 'Engenharias',
    bg: 'bg-area-engenharias',
    text: 'text-area-engenharias',
    borderLeft: 'border-l-area-engenharias',
  },
  sociais: {
    label: 'Ciências sociais aplicadas',
    bg: 'bg-area-sociais',
    text: 'text-area-sociais',
    borderLeft: 'border-l-area-sociais',
  },
  linguistica: {
    label: 'Linguística, letras e artes',
    bg: 'bg-area-linguistica',
    text: 'text-area-linguistica',
    borderLeft: 'border-l-area-linguistica',
  },
  outros: {
    label: 'Outros',
    bg: 'bg-area-outros',
    text: 'text-area-outros',
    borderLeft: 'border-l-area-outros',
  },
} as const satisfies Record<string, DictionaryColor>;

export type AreaKey = keyof typeof AREA_COLORS;

// Trecho do nome normalizado → chave. A ordem importa só se um trecho
// contiver outro; hoje nenhum contém.
const AREA_MATCHERS: ReadonlyArray<readonly [string, AreaKey]> = [
  ['AGRARIAS', 'agrarias'],
  ['EXATAS', 'exatas'],
  ['SAUDE', 'saude'],
  ['HUMANAS', 'humanas'],
  ['BIOLOGICAS', 'biologicas'],
  ['ENGENHARIA', 'engenharias'],
  ['SOCIAIS', 'sociais'],
  ['LINGUISTICA', 'linguistica'],
  ['OUTRO', 'outros'],
];

/** Aceita o nome da grande área em qualquer caixa, com ou sem acento e `_`. */
export function areaKey(value: string | null | undefined): AreaKey | null {
  const normalized = normalizeKey(value);
  if (!normalized) return null;
  return AREA_MATCHERS.find(([part]) => normalized.includes(part))?.[1] ?? null;
}

export function areaColor(value: string | null | undefined): DictionaryColor {
  const key = areaKey(value);
  return key ? AREA_COLORS[key] : FALLBACK_COLOR;
}

// ---------------------------------------------------------------------------
// Qualis (`qualis-*`)
// ---------------------------------------------------------------------------

export const QUALIS_COLORS = {
  A1: {
    label: 'A1',
    bg: 'bg-qualis-A1',
    text: 'text-qualis-A1',
    borderLeft: 'border-l-qualis-A1',
  },
  A2: {
    label: 'A2',
    bg: 'bg-qualis-A2',
    text: 'text-qualis-A2',
    borderLeft: 'border-l-qualis-A2',
  },
  A3: {
    label: 'A3',
    bg: 'bg-qualis-A3',
    text: 'text-qualis-A3',
    borderLeft: 'border-l-qualis-A3',
    light: true,
  },
  A4: {
    label: 'A4',
    bg: 'bg-qualis-A4',
    text: 'text-qualis-A4',
    borderLeft: 'border-l-qualis-A4',
    light: true,
  },
  B1: {
    label: 'B1',
    bg: 'bg-qualis-B1',
    text: 'text-qualis-B1',
    borderLeft: 'border-l-qualis-B1',
  },
  B2: {
    label: 'B2',
    bg: 'bg-qualis-B2',
    text: 'text-qualis-B2',
    borderLeft: 'border-l-qualis-B2',
  },
  B3: {
    label: 'B3',
    bg: 'bg-qualis-B3',
    text: 'text-qualis-B3',
    borderLeft: 'border-l-qualis-B3',
  },
  B4: {
    label: 'B4',
    bg: 'bg-qualis-B4',
    text: 'text-qualis-B4',
    borderLeft: 'border-l-qualis-B4',
  },
  C: {
    label: 'C',
    bg: 'bg-qualis-C',
    text: 'text-qualis-C',
    borderLeft: 'border-l-qualis-C',
  },
  SQ: {
    label: 'Sem Qualis',
    bg: 'bg-qualis-SQ',
    text: 'text-qualis-SQ',
    borderLeft: 'border-l-qualis-SQ',
  },
} as const satisfies Record<string, DictionaryColor>;

export type QualisKey = keyof typeof QUALIS_COLORS;

/**
 * Estrato Qualis da v2 (`A1`…`C`). Ausência (`null`, `not_rated`,
 * `not_applicable`, `SQ`, `NP`) vira `SQ`. `B5` existe na v2, mas não tem cor
 * no kit: devolve `null` (cor neutra) até o kit ganhar o token.
 */
export function qualisKey(value: string | null | undefined): QualisKey | null {
  const normalized = normalizeKey(value).replace(/ /g, '');
  if (
    !normalized ||
    normalized === 'NOTRATED' ||
    normalized === 'NOTAPPLICABLE' ||
    normalized === 'NP' ||
    normalized === 'NONE'
  ) {
    return 'SQ';
  }
  return normalized in QUALIS_COLORS ? (normalized as QualisKey) : null;
}

export function qualisColor(value: string | null | undefined): DictionaryColor {
  const key = qualisKey(value);
  return key ? QUALIS_COLORS[key] : FALLBACK_COLOR;
}

/**
 * Motivo de ausência de estrato da v2 (`qualis_status`), que também entra como
 * valor da faceta e do filtro `qualis`. Usa a cor `qualis-SQ` do kit, com o
 * rótulo do motivo.
 */
export const QUALIS_STATUS_COLORS = {
  not_rated: {
    label: 'Sem estrato',
    bg: 'bg-qualis-SQ',
    text: 'text-qualis-SQ',
    borderLeft: 'border-l-qualis-SQ',
  },
  not_applicable: {
    label: 'Não se aplica',
    bg: 'bg-qualis-SQ',
    text: 'text-qualis-SQ',
    borderLeft: 'border-l-qualis-SQ',
  },
} as const satisfies Record<string, DictionaryColor>;

export type QualisStatusKey = keyof typeof QUALIS_STATUS_COLORS;

export function qualisStatusKey(
  value: string | null | undefined,
): QualisStatusKey | null {
  const raw = (value ?? '').trim().toLowerCase();
  return raw in QUALIS_STATUS_COLORS ? (raw as QualisStatusKey) : null;
}

/**
 * Cor e rótulo de um valor da faceta `qualis`: estrato (`A1`…`C`) ou motivo
 * de ausência (`not_rated` → "Sem estrato", `not_applicable`).
 */
export function qualisFacetColor(
  value: string | null | undefined,
): DictionaryColor {
  const status = qualisStatusKey(value);
  return status ? QUALIS_STATUS_COLORS[status] : qualisColor(value);
}

// ---------------------------------------------------------------------------
// Tipo de produção (`prod-*`)
// ---------------------------------------------------------------------------

export const PRODUCTION_COLORS = {
  artigo: {
    label: 'Artigos',
    bg: 'bg-prod-artigo',
    text: 'text-prod-artigo',
    borderLeft: 'border-l-prod-artigo',
  },
  'livro-capitulo': {
    label: 'Livros e capítulos',
    bg: 'bg-prod-livro-capitulo',
    text: 'text-prod-livro-capitulo',
    borderLeft: 'border-l-prod-livro-capitulo',
  },
  livro: {
    label: 'Livros',
    bg: 'bg-prod-livro',
    text: 'text-prod-livro',
    borderLeft: 'border-l-prod-livro',
  },
  capitulo: {
    label: 'Capítulos de livro',
    bg: 'bg-prod-capitulo',
    text: 'text-prod-capitulo',
    borderLeft: 'border-l-prod-capitulo',
    light: true,
  },
  patente: {
    label: 'Patentes',
    bg: 'bg-prod-patente',
    text: 'text-prod-patente',
    borderLeft: 'border-l-prod-patente',
  },
  software: {
    label: 'Softwares',
    bg: 'bg-prod-software',
    text: 'text-prod-software',
    borderLeft: 'border-l-prod-software',
  },
  marca: {
    label: 'Marcas',
    bg: 'bg-prod-marca',
    text: 'text-prod-marca',
    borderLeft: 'border-l-prod-marca',
  },
  relatorio: {
    label: 'Relatórios técnicos',
    bg: 'bg-prod-relatorio',
    text: 'text-prod-relatorio',
    borderLeft: 'border-l-prod-relatorio',
  },
  congresso: {
    label: 'Congressos',
    bg: 'bg-prod-congresso',
    text: 'text-prod-congresso',
    borderLeft: 'border-l-prod-congresso',
  },
  simposio: {
    label: 'Simpósios',
    bg: 'bg-prod-simposio',
    text: 'text-prod-simposio',
    borderLeft: 'border-l-prod-simposio',
  },
  seminario: {
    label: 'Seminários',
    bg: 'bg-prod-seminario',
    text: 'text-prod-seminario',
    borderLeft: 'border-l-prod-seminario',
  },
  oficina: {
    label: 'Oficinas',
    bg: 'bg-prod-oficina',
    text: 'text-prod-oficina',
    borderLeft: 'border-l-prod-oficina',
    light: true,
  },
  'texto-revista': {
    label: 'Textos em revista',
    bg: 'bg-prod-texto-revista',
    text: 'text-prod-texto-revista',
    borderLeft: 'border-l-prod-texto-revista',
    light: true,
  },
  'trabalho-evento': {
    label: 'Trabalhos em eventos',
    bg: 'bg-prod-trabalho-evento',
    text: 'text-prod-trabalho-evento',
    borderLeft: 'border-l-prod-trabalho-evento',
  },
} as const satisfies Record<string, DictionaryColor>;

export type ProductionKey = keyof typeof PRODUCTION_COLORS;

// `kind` da v2 → chave do kit. `event`, `research_project` e `guidance` não
// têm cor própria no dicionário de produção: eventos usam a natureza
// (`eventNatureKey`) e orientações usam `orientationColor`.
const PRODUCTION_KIND_KEYS: Record<string, ProductionKey> = {
  article: 'artigo',
  book: 'livro',
  book_chapter: 'capitulo',
  patent: 'patente',
  software: 'software',
  brand: 'marca',
  report: 'relatorio',
  magazine_text: 'texto-revista',
  event_work: 'trabalho-evento',
};

/** Aceita o `kind` da v2 (`book_chapter` ou `book-chapter`) ou a chave do kit. */
export function productionKey(
  value: string | null | undefined,
): ProductionKey | null {
  const raw = (value ?? '').trim().toLowerCase();
  if (raw in PRODUCTION_COLORS) return raw as ProductionKey;
  return PRODUCTION_KIND_KEYS[raw.replace(/-/g, '_')] ?? null;
}

export function productionColor(
  value: string | null | undefined,
): DictionaryColor {
  const key = productionKey(value);
  return key ? PRODUCTION_COLORS[key] : FALLBACK_COLOR;
}

const EVENT_NATURE_MATCHERS: ReadonlyArray<readonly [string, ProductionKey]> = [
  ['CONGRESSO', 'congresso'],
  ['SIMPOSIO', 'simposio'],
  ['SEMINARIO', 'seminario'],
  ['OFICINA', 'oficina'],
];

/**
 * Natureza da participação em evento. "Encontro" e "Outra" não têm cor no kit
 * e devolvem `null` (cor neutra).
 */
export function eventNatureKey(
  value: string | null | undefined,
): ProductionKey | null {
  const normalized = normalizeKey(value);
  if (!normalized) return null;
  return (
    EVENT_NATURE_MATCHERS.find(([part]) => normalized.includes(part))?.[1] ??
    null
  );
}

export function eventNatureColor(
  value: string | null | undefined,
): DictionaryColor {
  const key = eventNatureKey(value);
  return key ? PRODUCTION_COLORS[key] : FALLBACK_COLOR;
}

// ---------------------------------------------------------------------------
// Orientação (`orient-*`)
// ---------------------------------------------------------------------------

export const ORIENTATION_COLORS = {
  ic: {
    label: 'Iniciação científica',
    bg: 'bg-orient-ic',
    text: 'text-orient-ic',
    borderLeft: 'border-l-orient-ic',
    light: true,
  },
  mestrado: {
    label: 'Dissertação de mestrado',
    bg: 'bg-orient-mestrado',
    text: 'text-orient-mestrado',
    borderLeft: 'border-l-orient-mestrado',
  },
  doutorado: {
    label: 'Tese de doutorado',
    bg: 'bg-orient-doutorado',
    text: 'text-orient-doutorado',
    borderLeft: 'border-l-orient-doutorado',
  },
  tcc: {
    label: 'Trabalho de conclusão de curso',
    bg: 'bg-orient-tcc',
    text: 'text-orient-tcc',
    borderLeft: 'border-l-orient-tcc',
  },
  outra: {
    label: 'Orientação de outra natureza',
    bg: 'bg-orient-outra',
    text: 'text-orient-outra',
    borderLeft: 'border-l-orient-outra',
  },
  monografia: {
    label: 'Monografia de especialização',
    bg: 'bg-orient-monografia',
    text: 'text-orient-monografia',
    borderLeft: 'border-l-orient-monografia',
  },
  posdoc: {
    label: 'Supervisão de pós-doutorado',
    bg: 'bg-orient-posdoc',
    text: 'text-orient-posdoc',
    borderLeft: 'border-l-orient-posdoc',
  },
} as const satisfies Record<string, DictionaryColor>;

export type OrientationKey = keyof typeof ORIENTATION_COLORS;

// Pós-doutorado vem antes de doutorado ("SUPERVISAO DE POS DOUTORADO" contém
// "DOUTORADO").
const ORIENTATION_MATCHERS: ReadonlyArray<readonly [RegExp, OrientationKey]> = [
  [/POS ?DOUTORADO/, 'posdoc'],
  [/INICIACAO/, 'ic'],
  [/MESTRADO/, 'mestrado'],
  [/DOUTORADO/, 'doutorado'],
  [/CONCLUSAO DE CURSO (DE )?GRADUACAO|\bTCC\b/, 'tcc'],
  [/MONOGRAFIA|APERFEICOAMENTO|ESPECIALIZACAO/, 'monografia'],
  [/OUTRA NATUREZA/, 'outra'],
];

/** Natureza da orientação, como vem do Lattes (com ou sem acento, `-` ou `_`). */
export function orientationKey(
  value: string | null | undefined,
): OrientationKey | null {
  const normalized = normalizeKey(value);
  if (!normalized) return null;
  return (
    ORIENTATION_MATCHERS.find(([pattern]) => pattern.test(normalized))?.[1] ??
    null
  );
}

export function orientationColor(
  value: string | null | undefined,
): DictionaryColor {
  const key = orientationKey(value);
  return key ? ORIENTATION_COLORS[key] : FALLBACK_COLOR;
}

// ---------------------------------------------------------------------------
// Status (orientação, projeto)
// ---------------------------------------------------------------------------

export const STATUS_COLORS = {
  concluida: {
    label: 'Concluída',
    bg: 'bg-status-concluida',
    text: 'text-status-concluida',
    borderLeft: 'border-l-status-concluida',
  },
  andamento: {
    label: 'Em andamento',
    bg: 'bg-status-andamento',
    text: 'text-status-andamento',
    borderLeft: 'border-l-status-andamento',
  },
} as const satisfies Record<string, DictionaryColor>;

export type StatusKey = keyof typeof STATUS_COLORS;

export function statusKey(value: string | null | undefined): StatusKey | null {
  const normalized = normalizeKey(value);
  if (!normalized) return null;
  if (/CONCLU|COMPLETED|FINISHED/.test(normalized)) return 'concluida';
  if (/ANDAMENTO|IN PROGRESS|ONGOING/.test(normalized)) return 'andamento';
  return null;
}

export function statusColor(value: string | null | undefined): DictionaryColor {
  const key = statusKey(value);
  return key ? STATUS_COLORS[key] : FALLBACK_COLOR;
}

// ---------------------------------------------------------------------------
// Estado de execução (`run-*`): runs e etapas do ETL no console
// ---------------------------------------------------------------------------

export const RUN_STATUS_COLORS = {
  succeeded: {
    label: 'Sucesso',
    bg: 'bg-run-succeeded',
    text: 'text-run-succeeded',
    borderLeft: 'border-l-run-succeeded',
  },
  failed: {
    label: 'Falha',
    bg: 'bg-run-failed',
    text: 'text-run-failed',
    borderLeft: 'border-l-run-failed',
  },
  running: {
    label: 'Em execução',
    bg: 'bg-run-running',
    text: 'text-run-running',
    borderLeft: 'border-l-run-running',
  },
  queued: {
    label: 'Na fila',
    bg: 'bg-run-queued',
    text: 'text-run-queued',
    borderLeft: 'border-l-run-queued',
  },
} as const satisfies Record<string, DictionaryColor>;

export type RunStatusKey = keyof typeof RUN_STATUS_COLORS;

/**
 * Status do ETL (`SUCCEEDED`, `FAILED`, `RUNNING`, `PENDING`, `ACCEPTED`…) na
 * chave do dicionário. Valor desconhecido devolve `null`.
 */
export function runStatusKey(
  value: string | null | undefined,
): RunStatusKey | null {
  const normalized = normalizeKey(value);
  if (!normalized) return null;
  if (/^(SUCCEEDED|SUCCESS|COMPLETED|DONE)$/.test(normalized)) {
    return 'succeeded';
  }
  if (/^(FAILED|FAILURE|ERROR)$/.test(normalized)) return 'failed';
  if (/^(RUNNING|IN PROGRESS|STARTED)$/.test(normalized)) return 'running';
  if (/^(PENDING|ACCEPTED|QUEUED)$/.test(normalized)) return 'queued';
  return null;
}

/** Cor do status; desconhecido usa o neutro com o rótulo "Desconhecido". */
export function runStatusColor(
  value: string | null | undefined,
): DictionaryColor {
  const key = runStatusKey(value);
  return key
    ? RUN_STATUS_COLORS[key]
    : { ...FALLBACK_COLOR, label: 'Desconhecido' };
}

// ---------------------------------------------------------------------------
// Bolsa CNPq (`bolsa-*`)
// ---------------------------------------------------------------------------

export const SCHOLARSHIP_COLORS = {
  PQ: {
    label: 'Produtividade em pesquisa (PQ)',
    bg: 'bg-bolsa-PQ',
    text: 'text-bolsa-PQ',
    borderLeft: 'border-l-bolsa-PQ',
  },
  DT: {
    label: 'Desenvolvimento tecnológico (DT)',
    bg: 'bg-bolsa-DT',
    text: 'text-bolsa-DT',
    borderLeft: 'border-l-bolsa-DT',
  },
} as const satisfies Record<string, DictionaryColor>;

export type ScholarshipKey = keyof typeof SCHOLARSHIP_COLORS;

/** Modalidade da bolsa: `PQ`, `PQ-1A`, `DT 2`… (o nível é ignorado). */
export function scholarshipKey(
  value: string | null | undefined,
): ScholarshipKey | null {
  const normalized = normalizeKey(value);
  if (/^PQ\b|^PQ\d/.test(normalized)) return 'PQ';
  if (/^DT\b|^DT\d/.test(normalized)) return 'DT';
  return null;
}

export function scholarshipColor(
  value: string | null | undefined,
): DictionaryColor {
  const key = scholarshipKey(value);
  return key ? SCHOLARSHIP_COLORS[key] : FALLBACK_COLOR;
}

// ---------------------------------------------------------------------------
// Gênero e escala neutra de gráficos (também no kit, §2.3)
// ---------------------------------------------------------------------------

export const GENDER_COLORS = {
  F: {
    label: 'Feminino',
    bg: 'bg-gender-f',
    text: 'text-gender-f',
    borderLeft: 'border-l-gender-f',
  },
  M: {
    label: 'Masculino',
    bg: 'bg-gender-m',
    text: 'text-gender-m',
    borderLeft: 'border-l-gender-m',
  },
} as const satisfies Record<string, DictionaryColor>;

export type GenderKey = keyof typeof GENDER_COLORS;

export function genderKey(value: string | null | undefined): GenderKey | null {
  const first = normalizeKey(value).charAt(0);
  return first === 'F' || first === 'M' ? first : null;
}

export function genderColor(value: string | null | undefined): DictionaryColor {
  const key = genderKey(value);
  return key ? GENDER_COLORS[key] : FALLBACK_COLOR;
}

/** Séries sem semântica, na ordem (DESIGN.md §2.4). */
export const CHART_NEUTRAL_BG = [
  'bg-chart-neutral-1',
  'bg-chart-neutral-2',
  'bg-chart-neutral-3',
  'bg-chart-neutral-4',
  'bg-chart-neutral-5',
  'bg-chart-neutral-6',
] as const;

/** Cor da série `index` (cíclica) na escala neutra. */
export function chartNeutralBg(index: number): string {
  const size = CHART_NEUTRAL_BG.length;
  return CHART_NEUTRAL_BG[((index % size) + size) % size] as string;
}

// ---------------------------------------------------------------------------
// Nível do índice do pesquisador (`index-*`)
// ---------------------------------------------------------------------------

export const INDEX_LEVEL_COLORS = {
  'A+': {
    label: 'Nível A+',
    bg: 'bg-index-a-plus',
    text: 'text-index-a-plus',
    borderLeft: 'border-l-index-a-plus',
  },
  A: {
    label: 'Nível A',
    bg: 'bg-index-a',
    text: 'text-index-a',
    borderLeft: 'border-l-index-a',
    light: true,
  },
  'B+': {
    label: 'Nível B+',
    bg: 'bg-index-b-plus',
    text: 'text-index-b-plus',
    borderLeft: 'border-l-index-b-plus',
    light: true,
  },
  B: {
    label: 'Nível B',
    bg: 'bg-index-b',
    text: 'text-index-b',
    borderLeft: 'border-l-index-b',
    light: true,
  },
  'C+': {
    label: 'Nível C+',
    bg: 'bg-index-c-plus',
    text: 'text-index-c-plus',
    borderLeft: 'border-l-index-c-plus',
    light: true,
  },
  C: {
    label: 'Nível C',
    bg: 'bg-index-c',
    text: 'text-index-c',
    borderLeft: 'border-l-index-c',
    light: true,
  },
  'D+': {
    label: 'Nível D+',
    bg: 'bg-index-d-plus',
    text: 'text-index-d-plus',
    borderLeft: 'border-l-index-d-plus',
    light: true,
  },
  D: {
    label: 'Nível D',
    bg: 'bg-index-d',
    text: 'text-index-d',
    borderLeft: 'border-l-index-d',
    light: true,
  },
  'E+': {
    label: 'Nível E+',
    bg: 'bg-index-e-plus',
    text: 'text-index-e-plus',
    borderLeft: 'border-l-index-e-plus',
    light: true,
  },
  E: {
    label: 'Nível E',
    bg: 'bg-index-e',
    text: 'text-index-e',
    borderLeft: 'border-l-index-e',
    light: true,
  },
} as const satisfies Record<string, DictionaryColor>;

export type IndexLevelKey = keyof typeof INDEX_LEVEL_COLORS;

/** Normaliza um nível do índice do pesquisador (`A+`, `a+`, `B`…). */
export function indexLevelKey(
  value: string | null | undefined,
): IndexLevelKey | null {
  const raw = (value ?? '').trim().toUpperCase();
  return raw in INDEX_LEVEL_COLORS ? (raw as IndexLevelKey) : null;
}

export function indexLevelColor(
  value: string | null | undefined,
): DictionaryColor {
  const key = indexLevelKey(value);
  return key ? INDEX_LEVEL_COLORS[key] : FALLBACK_COLOR;
}
