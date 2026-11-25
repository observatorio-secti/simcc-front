import type {
  DetailData,
  DetailResponse,
  ListFilters,
  ListItem,
  ListResponse,
  QueryOf,
  Schema,
} from '@/api/types';
import {
  AREA_COLORS,
  FALLBACK_COLOR,
  areaKey,
  normalizeKey,
  type AreaKey,
  type DictionaryColor,
} from '@/shared/lib/design-tokens';

export type GraduateProgramSummary = ListItem<'/graduate-program'>;
export type GraduateProgramListResponse = ListResponse<'/graduate-program'>;
export type GraduateProgramSearch = QueryOf<'/graduate-program'>;
export type GraduateProgramFilter = ListFilters<'/graduate-program'>;

export type GraduateProgramDetail =
  DetailData<'/graduate-program/{program_id}'>;
export type GraduateProgramDetailResponse =
  DetailResponse<'/graduate-program/{program_id}'>;

export type GraduateProgramRef = Schema<'GraduateProgramRef'>;
export type GraduateProgramLink = Schema<'GraduateProgramLink'>;
export type GraduateProgramCounts = Schema<'GraduateProgramCounts'>;
export type GraduateProgramInstitutionRef = Schema<'InstitutionRef'>;
export type ResearchLine = Schema<'ResearchLine'>;
export type GraduateProgramSortBy = NonNullable<
  GraduateProgramSearch['sort_by']
>;

/** Subconjunto aceito por cartões e resumos de programa (lista ou detalhe). */
export type ProgramCardData = Pick<GraduateProgramSummary, 'id' | 'name'> &
  Partial<
    Omit<
      GraduateProgramSummary &
        Pick<
          GraduateProgramDetail,
          'institution' | 'counts' | 'research_lines'
        >,
      'id' | 'name'
    >
  >;

const EMPTY_SENTINELS = new Set(['', 'none', 'null', 'undefined']);
const PORTUGUESE_PARTICLES = new Set([
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'na',
  'nas',
  'no',
  'nos',
  'para',
]);
const ROMAN_NUMERALS = new Set(['I', 'II', 'III', 'IV']);

const ptBrNumberFormat = new Intl.NumberFormat('pt-BR');

const MODALITY_LABELS: Record<string, string> = {
  ACADEMICO: 'Acadêmico',
  PROFISSIONAL: 'Profissional',
  PRESENCIAL: 'Presencial',
  EAD: 'A distância',
  'A DISTANCIA': 'A distância',
};

const PROGRAM_TYPE_LABELS: Record<string, string> = {
  MESTRADO: 'Mestrado',
  DOUTORADO: 'Doutorado',
  'MESTRADO DOUTORADO': 'Mestrado e doutorado',
  'MESTRADO E DOUTORADO': 'Mestrado e doutorado',
  'MESTRADO PROFISSIONAL': 'Mestrado profissional',
  'DOUTORADO PROFISSIONAL': 'Doutorado profissional',
  'MESTRADO PROFISSIONAL DOUTORADO PROFISSIONAL':
    'Mestrado e doutorado profissional',
  'MESTRADO PROFISSIONAL E DOUTORADO PROFISSIONAL':
    'Mestrado e doutorado profissional',
  'POS DOUTORADO': 'Pós-doutorado',
};

// Áreas de avaliação CAPES que não contêm o nome da grande área no texto.
// Regras mais específicas (ex.: `EDUCACAO FISICA`, `MEDICINA VETERINARIA`)
// vêm antes das genéricas (`EDUCACAO`, `MEDICINA`).
const CAPES_AREA_MATCHERS: ReadonlyArray<readonly [string, AreaKey]> = [
  ['EDUCACAO FISICA', 'saude'],
  ['FISIOTERAPIA', 'saude'],
  ['FONOAUDIOLOGIA', 'saude'],
  ['TERAPIA OCUPACIONAL', 'saude'],
  ['MEDICINA VETERINARIA', 'agrarias'],
  ['ZOOTECNIA', 'agrarias'],
  ['RECURSOS PESQUEIROS', 'agrarias'],
  ['CIENCIA DE ALIMENTOS', 'agrarias'],
  ['MATEMATICA', 'exatas'],
  ['PROBABILIDADE', 'exatas'],
  ['ESTATISTICA', 'exatas'],
  ['ASTRONOMIA', 'exatas'],
  ['FISICA', 'exatas'],
  ['QUIMICA', 'exatas'],
  ['GEOCIENCIAS', 'exatas'],
  ['COMPUTACAO', 'exatas'],
  ['BIODIVERSIDADE', 'biologicas'],
  ['MEDICINA', 'saude'],
  ['NUTRICAO', 'saude'],
  ['ODONTOLOGIA', 'saude'],
  ['FARMACIA', 'saude'],
  ['ENFERMAGEM', 'saude'],
  ['ADMINISTRACAO', 'sociais'],
  ['CIENCIAS CONTABEIS', 'sociais'],
  ['TURISMO', 'sociais'],
  ['DIREITO', 'sociais'],
  ['ECONOMIA', 'sociais'],
  ['ARQUITETURA', 'sociais'],
  ['URBANISMO', 'sociais'],
  ['PLANEJAMENTO URBANO', 'sociais'],
  ['DEMOGRAFIA', 'sociais'],
  ['COMUNICACAO', 'sociais'],
  ['MUSEOLOGIA', 'sociais'],
  ['SERVICO SOCIAL', 'sociais'],
  ['FILOSOFIA', 'humanas'],
  ['TEOLOGIA', 'humanas'],
  ['CIENCIAS DA RELIGIAO', 'humanas'],
  ['SOCIOLOGIA', 'humanas'],
  ['ANTROPOLOGIA', 'humanas'],
  ['ARQUEOLOGIA', 'humanas'],
  ['HISTORIA', 'humanas'],
  ['GEOGRAFIA', 'humanas'],
  ['PSICOLOGIA', 'humanas'],
  ['CIENCIA POLITICA', 'humanas'],
  ['RELACOES INTERNACIONAIS', 'humanas'],
  ['EDUCACAO', 'humanas'],
  ['LETRAS', 'linguistica'],
  ['ARTES', 'linguistica'],
  ['MUSICA', 'linguistica'],
  ['INTERDISCIPLINAR', 'outros'],
  ['MULTIDISCIPLINAR', 'outros'],
  ['ENSINO', 'outros'],
  ['MATERIAIS', 'outros'],
  ['BIOTECNOLOGIA', 'outros'],
  ['CIENCIAS AMBIENTAIS', 'outros'],
  ['CIENCIAS E HUMANIDADES', 'outros'],
];

/** Remove espaços extras e valores sentinela da API/Lattes. */
export function cleanProgramText(
  value: string | null | undefined,
): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (EMPTY_SENTINELS.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

function isUniformCase(value: string): boolean {
  return value === value.toUpperCase() || value === value.toLowerCase();
}

function toSentenceCase(value: string): string {
  const lower = value.toLocaleLowerCase('pt-BR');
  return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
}

function toPortugueseTitleCase(value: string): string {
  return value
    .toLocaleLowerCase('pt-BR')
    .split(' ')
    .map((word, index) => {
      if (index > 0 && PORTUGUESE_PARTICLES.has(word)) return word;
      return word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1);
    })
    .join(' ');
}

function preserveRomanNumerals(value: string): string {
  return value.replace(/\b(i|ii|iii|iv)\b/gi, (match) => {
    const upper = match.toUpperCase();
    return ROMAN_NUMERALS.has(upper) ? upper : match;
  });
}

/**
 * Caminho público para o detalhe do programa de pós-graduação respeitando
 * `BASE_URL`.
 */
// TODO(T5): migrar usos de `programHref` para <Link to="/pos-graduacao/$id">
export function programHref(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/pos-graduacao/${encodeURIComponent(id)}`;
}

/** Extrai o valor numérico (1–7) do conceito CAPES quando aplicável. */
export function parseCapesRating(
  rating: string | null | undefined,
): number | null {
  const cleaned = cleanProgramText(rating);
  if (!cleaned) return null;
  const stripped = cleaned.replace(/^(conceito|nota)\s+/i, '').trim();
  if (!/^[1-7]$/.test(stripped)) return null;
  return Number(stripped);
}

/** Rótulo legível do conceito CAPES (ex.: `'5'` → `'Conceito 5'`). */
export function formatCapesRating(
  rating: string | null | undefined,
): string | null {
  const cleaned = cleanProgramText(rating);
  if (!cleaned) return null;
  const stripped = cleaned.replace(/^(conceito|nota)\s+/i, '').trim();
  if (!stripped) return null;
  const normalized = stripped.length <= 2 ? stripped.toUpperCase() : stripped;
  return `Conceito ${normalized}`;
}

/** Formata a modalidade do programa (ex.: `'ACADÊMICO'` → `'Acadêmico'`). */
export function formatProgramModality(
  modality: string | null | undefined,
): string | null {
  const cleaned = cleanProgramText(modality);
  if (!cleaned) return null;
  const normalized = normalizeKey(cleaned);
  return (
    MODALITY_LABELS[normalized] ??
    (isUniformCase(cleaned) ? toSentenceCase(cleaned) : cleaned)
  );
}

/** Formata o tipo do programa (ex.: `'MESTRADO'` → `'Mestrado'`). */
export function formatProgramType(
  type: string | null | undefined,
): string | null {
  const cleaned = cleanProgramText(type);
  if (!cleaned) return null;
  const deduped = cleaned.includes('/')
    ? Array.from(
        new Map(
          cleaned
            .split('/')
            .map((part) => part.trim())
            .filter(Boolean)
            .map((part) => [normalizeKey(part), part]),
        ).values(),
      ).join('/')
    : cleaned;
  const normalized = normalizeKey(deduped);
  return (
    PROGRAM_TYPE_LABELS[normalized] ??
    (isUniformCase(deduped) ? toSentenceCase(deduped) : deduped)
  );
}

/** Formata o nome da área CAPES sem manter grito em caixa alta. */
export function formatProgramArea(
  area: string | null | undefined,
): string | null {
  const cleaned = cleanProgramText(area);
  if (!cleaned) return null;
  if (!isUniformCase(cleaned)) return preserveRomanNumerals(cleaned);
  return preserveRomanNumerals(toSentenceCase(cleaned));
}

/**
 * Resolve a cor semântica da área de avaliação a partir de
 * `src/shared/lib/design-tokens.ts`.
 */
export function resolveProgramAreaColor(
  area: string | null | undefined,
): DictionaryColor {
  const directKey = areaKey(area);
  if (directKey) return AREA_COLORS[directKey];

  const normalized = normalizeKey(area);
  if (!normalized) return FALLBACK_COLOR;

  const matched = CAPES_AREA_MATCHERS.find(([part]) =>
    normalized.includes(part),
  )?.[1];
  return matched ? AREA_COLORS[matched] : FALLBACK_COLOR;
}

/** Formata cidade e UF (ex.: `'SALVADOR', 'ba'` → `'Salvador, BA'`). */
export function formatProgramLocation(
  city: string | null | undefined,
  state: string | null | undefined,
): string | null {
  const cleanCity = cleanProgramText(city);
  const cleanState = cleanProgramText(state);

  const formattedCity = cleanCity
    ? isUniformCase(cleanCity)
      ? toPortugueseTitleCase(cleanCity)
      : cleanCity
    : null;
  const formattedState = cleanState ? cleanState.toUpperCase() : null;

  if (formattedCity && formattedState) {
    return `${formattedCity}, ${formattedState}`;
  }
  return formattedCity ?? formattedState;
}

/** Rótulo curto da instituição (sigla preferencialmente, ou nome). */
export function formatInstitutionLabel(
  institution: GraduateProgramInstitutionRef | null | undefined,
  fallbackLabel?: string | null,
): string | null {
  const acronym = cleanProgramText(institution?.acronym);
  if (acronym) return acronym;
  const name = cleanProgramText(institution?.name);
  if (name) return name;
  return cleanProgramText(fallbackLabel);
}

/** Formata números inteiros no padrão `pt-BR`. */
export function formatCount(count: number): string {
  return ptBrNumberFormat.format(count);
}

/** Formata contagem de docentes vinculados ao programa. */
export function formatResearchersCount(
  count: number | null | undefined,
): string | null {
  if (count === null || count === undefined || Number.isNaN(count)) return null;
  const unit = count === 1 ? 'docente' : 'docentes';
  return `${formatCount(count)} ${unit}`;
}

/** Formata contagem de linhas de pesquisa do programa. */
export function formatResearchLinesCount(
  count: number | null | undefined,
): string | null {
  if (count === null || count === undefined || Number.isNaN(count)) return null;
  const unit = count === 1 ? 'linha de pesquisa' : 'linhas de pesquisa';
  return `${formatCount(count)} ${unit}`;
}

/** Formata o intervalo de vigência de uma linha de pesquisa. */
export function formatResearchLinePeriod(
  startYear: number | null | undefined,
  endYear: number | null | undefined,
): string | null {
  const hasStart = typeof startYear === 'number' && Number.isFinite(startYear);
  const hasEnd = typeof endYear === 'number' && Number.isFinite(endYear);

  if (hasStart && hasEnd) return `${startYear} – ${endYear}`;
  if (hasStart) return `${startYear} – atual`;
  if (hasEnd) return `Até ${endYear}`;
  return null;
}

/** Indica se a linha de pesquisa está ativa (possui início e sem término). */
export function isActiveResearchLine(
  line: Pick<ResearchLine, 'start_year' | 'end_year'>,
): boolean {
  return (
    typeof line.start_year === 'number' &&
    Number.isFinite(line.start_year) &&
    line.end_year == null
  );
}
