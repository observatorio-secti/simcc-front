import type {
  DetailData,
  DetailResponse,
  ListFilters,
  ListItem,
  ListResponse,
  PathParamsOf,
  QueryOf,
  Schema,
} from '@/api/types';
import {
  FALLBACK_COLOR,
  normalizeKey,
  qualisColor,
  qualisKey,
  type DictionaryColor,
  type QualisKey,
} from '@/shared/lib/design-tokens';

/** Revista no catálogo (`/magazine` e `/magazine/{magazine_id}`). */
export type Magazine = ListItem<'/magazine'>;
export type MagazineDetail = DetailData<'/magazine/{magazine_id}'>;
export type MagazineRefData = Schema<'MagazineRef'>;
export type MagazineQuery = QueryOf<'/magazine'>;
export type MagazineListResponse = ListResponse<'/magazine'>;
export type MagazineDetailResponse = DetailResponse<'/magazine/{magazine_id}'>;
export type MagazineFilters = ListFilters<'/magazine'>;
export type MagazinePathParams = PathParamsOf<'/magazine/{magazine_id}'>;

export type MagazineSortBy = NonNullable<MagazineQuery['sort_by']>;
export type MagazineQualis = NonNullable<Schema<'Magazine'>['qualis']>;
export type MagazineQualisStatus = NonNullable<
  Schema<'Magazine'>['qualis_status']
>;
export type MagazineQualisFilter = NonNullable<MagazineQuery['qualis']>[number];

/** Aceita tanto `Magazine` completa quanto `MagazineRef` vinda de artigos. */
export type MagazineLike = MagazineRefData &
  Partial<Pick<Magazine, 'id' | 'jcr_link' | 'reference_period'>>;

export type QualisClassificationStatus =
  'rated' | 'not_rated' | 'not_applicable';

export type QualisInput =
  Pick<MagazineRefData, 'qualis' | 'qualis_status'> | string | null | undefined;

export interface QualisInfo {
  status: QualisClassificationStatus;
  /** Estrato quando avaliada (`A1`–`C`, incluindo `B5`), ou `null`. */
  stratum: MagazineQualis | null;
  /** Chave no dicionário do kit (`A1`–`C`, `SQ`), ou `null` (`B5`). */
  key: QualisKey | null;
  color: DictionaryColor;
  /** Rótulo completo em pt-BR (ex.: `Qualis A1`, `Sem Qualis`, `Não se aplica`). */
  label: string;
  /** Rótulo curto para marcadores compactos (ex.: `A1`, `B5`, `SQ`). */
  shortLabel: string;
  /**
   * Indica que não deve usar fundo sólido com texto branco (`DESIGN.md` §2.4):
   * cores claras (`A3`, `A4`) ou estrato sem token no kit (`B5`).
   */
  isLight: boolean;
}

export const MAGAZINE_SORT_OPTIONS: ReadonlyArray<{
  value: MagazineSortBy;
  label: string;
  defaultOrder: NonNullable<MagazineQuery['sort_order']>;
}> = [
  { value: 'name', label: 'Nome', defaultOrder: 'asc' },
  { value: 'jcr', label: 'JCR', defaultOrder: 'desc' },
];

const jcrFormatter = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 3,
});

const UNRATED_TOKENS = new Set(['', 'SQ', 'NP', 'NONE', 'NULL', 'NOTRATED']);
const RATED_STRATA: ReadonlySet<string> = new Set<MagazineQualis>([
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'C',
]);

function normalizeText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || /^(none|null)$/i.test(trimmed)) return null;
  return trimmed;
}

function buildAbsenceQualis(
  status: 'not_rated' | 'not_applicable',
  tokenForColor: string,
): QualisInfo {
  const color = qualisColor(tokenForColor);
  const key = qualisKey(tokenForColor);
  if (status === 'not_applicable') {
    return {
      status,
      stratum: null,
      key,
      color,
      label: 'Não se aplica',
      shortLabel: 'Não se aplica',
      isLight: Boolean(color.light),
    };
  }
  return {
    status: 'not_rated',
    stratum: null,
    key,
    color,
    label: color.label,
    shortLabel: 'SQ',
    isLight: Boolean(color.light),
  };
}

function interpretQualisString(raw: string | null | undefined): QualisInfo {
  const compact = normalizeKey(raw).replace(/ /g, '');

  if (compact === 'NOTAPPLICABLE') {
    return buildAbsenceQualis('not_applicable', 'not_applicable');
  }

  if (UNRATED_TOKENS.has(compact)) {
    return buildAbsenceQualis('not_rated', compact || 'SQ');
  }

  if (RATED_STRATA.has(compact)) {
    const stratum = compact as MagazineQualis;
    const key = qualisKey(stratum);
    const color = qualisColor(stratum);
    return {
      status: 'rated',
      stratum,
      key,
      color,
      label: `Qualis ${stratum}`,
      shortLabel: stratum,
      // B5 ainda não tem token no kit (FALLBACK_COLOR.bg é bg-neutral-400).
      isLight: Boolean(color.light) || key === null,
    };
  }

  const trimmed = normalizeText(raw);
  return {
    status: 'not_rated',
    stratum: null,
    key: null,
    color: FALLBACK_COLOR,
    label: trimmed ?? FALLBACK_COLOR.label,
    shortLabel: trimmed ?? FALLBACK_COLOR.label,
    isLight: true,
  };
}

/**
 * Interpreta o estrato `qualis` e o motivo de ausência `qualis_status` da v2
 * (incluindo `B5`, `SQ`, `not_rated` e `not_applicable`) usando os tokens do kit.
 */
export function interpretQualis(input: QualisInput): QualisInfo {
  if (typeof input === 'string' || input == null) {
    return interpretQualisString(input);
  }

  const normalizedQualis = normalizeKey(input.qualis).replace(/ /g, '');
  if (RATED_STRATA.has(normalizedQualis)) {
    return interpretQualisString(normalizedQualis);
  }

  if (input.qualis_status === 'not_applicable') {
    return buildAbsenceQualis('not_applicable', 'not_applicable');
  }

  return buildAbsenceQualis('not_rated', input.qualis_status ?? 'SQ');
}

/** Formata ISSN de 8 dígitos (`1234567X` → `1234-567X`). */
export function formatIssn(issn: string | null | undefined): string | null {
  const trimmed = normalizeText(issn);
  if (!trimmed) return null;

  const compact = trimmed.replace(/[\s-]+/g, '').toUpperCase();
  if (/^\d{7}[\dX]$/.test(compact)) {
    return `${compact.slice(0, 4)}-${compact.slice(4)}`;
  }

  return trimmed;
}

/** Formata o fator de impacto JCR em `pt-BR`, ou `null` quando ausente. */
export function formatJcr(jcr: number | null | undefined): string | null {
  if (jcr == null || !Number.isFinite(jcr)) return null;
  return jcrFormatter.format(jcr);
}

/** Nome legível da revista, com fallback em pt-BR. */
export function formatMagazineName(name: string | null | undefined): string {
  return normalizeText(name) ?? 'Revista não informada';
}

/** Aceita apenas URLs externas `http:` / `https:` para `jcr_link`. */
export function safeExternalHref(
  url: string | null | undefined,
): string | null {
  const trimmed = normalizeText(url);
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return null;
  } catch {
    return null;
  }
}
