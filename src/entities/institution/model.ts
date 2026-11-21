import type {
  DetailData,
  ListFilters,
  ListItem,
  ListResponse,
  QueryOf,
  Schema,
} from '@/api/types';
import { normalizeKey } from '@/shared/lib/design-tokens';
import logoEbmspDark from './assets/logo-ebmsp-dark.png';
import logoEbmsp from './assets/logo-ebmsp.png';
import logoFiocruzDark from './assets/logo-fiocruz-dark.png';
import logoFiocruz from './assets/logo-fiocruz.png';
import logoIfba from './assets/logo-ifba.png';
import logoUefsDark from './assets/logo-uefs-dark.png';
import logoUefs from './assets/logo-uefs.png';
import logoUesbDark from './assets/logo-uesb-dark.png';
import logoUesb from './assets/logo-uesb.png';
import logoUesc from './assets/logo-uesc.png';
import logoUfbaDark from './assets/logo-ufba-dark.png';
import logoUfba from './assets/logo-ufba.png';
import logoUfobDark from './assets/logo-ufob-dark.png';
import logoUfob from './assets/logo-ufob.png';
import logoUfrbDark from './assets/logo-ufrb-dark.png';
import logoUfrb from './assets/logo-ufrb.png';
import logoUfsbDark from './assets/logo-ufsb-dark.png';
import logoUfsb from './assets/logo-ufsb.png';
import logoUnebDark from './assets/logo-uneb-dark.png';
import logoUneb from './assets/logo-uneb.png';

export type InstitutionSummary = ListItem<'/institution'>;
export type InstitutionDetail = DetailData<'/institution/{institution_id}'>;
export type InstitutionCounts = Schema<'InstitutionCounts'>;
export type InstitutionQuery = QueryOf<'/institution'>;
export type InstitutionFilters = ListFilters<'/institution'>;
export type InstitutionListResponse = ListResponse<'/institution'>;
export type InstitutionSortBy = NonNullable<InstitutionQuery['sort_by']>;

export interface InstitutionLogo {
  acronym: InstitutionAcronym;
  light: string;
  dark?: string;
  /**
   * Logo opaco com fundo branco no arquivo original (ex.: IFBA). Mantém fundo
   * claro no quadrado do tema escuro para preservar o contraste da marca.
   */
  lightSurface?: boolean;
}

/**
 * Logos institucionais recuperados de `legado-v1:src/assets/` (os mesmos do
 * carrossel de instituições da plataforma). Arquivos do legado ligados à UFMG
 * (`logo_4*`, `logo_email_1..4`), Estado da Bahia (`logo_cimatec*`) e rodapé de
 * e-mail (`logo_email_5`) ficaram de fora.
 */
export const INSTITUTION_LOGOS = {
  UFBA: { acronym: 'UFBA', light: logoUfba, dark: logoUfbaDark },
  EBMSP: { acronym: 'EBMSP', light: logoEbmsp, dark: logoEbmspDark },
  UESB: { acronym: 'UESB', light: logoUesb, dark: logoUesbDark },
  UFOB: { acronym: 'UFOB', light: logoUfob, dark: logoUfobDark },
  UFSB: { acronym: 'UFSB', light: logoUfsb, dark: logoUfsbDark },
  UEFS: { acronym: 'UEFS', light: logoUefs, dark: logoUefsDark },
  UESC: { acronym: 'UESC', light: logoUesc },
  UFRB: { acronym: 'UFRB', light: logoUfrb, dark: logoUfrbDark },
  UNEB: { acronym: 'UNEB', light: logoUneb, dark: logoUnebDark },
  IFBA: { acronym: 'IFBA', light: logoIfba, lightSurface: true },
  FIOCRUZ: { acronym: 'FIOCRUZ', light: logoFiocruz, dark: logoFiocruzDark },
} as const satisfies Record<
  string,
  Omit<InstitutionLogo, 'acronym'> & { acronym: string }
>;

export type InstitutionAcronym = keyof typeof INSTITUTION_LOGOS;

const INSTITUTION_ACRONYM_BY_NAME: Record<string, string> = {
  'UNIVERSIDADE FEDERAL DA BAHIA': 'UFBA',
  'ESCOLA BAHIANA DE MEDICINA E SAUDE PUBLICA': 'EBMSP',
  'UNIVERSIDADE ESTADUAL DO SUDOESTE DA BAHIA': 'UESB',
  'UNIVERSIDADE FEDERAL DO OESTE DA BAHIA': 'UFOB',
  'UNIVERSIDADE FEDERAL DO SUL DA BAHIA': 'UFSB',
  'UNIVERSIDADE ESTADUAL DE FEIRA DE SANTANA': 'UEFS',
  'UNIVERSIDADE ESTADUAL DE SANTA CRUZ': 'UESC',
  'UNIVERSIDADE FEDERAL DO RECONCAVO DA BAHIA': 'UFRB',
  'UNIVERSIDADE DO ESTADO DA BAHIA': 'UNEB',
  'INSTITUTO FEDERAL DA BAHIA': 'IFBA',
  'INSTITUTO FEDERAL DE EDUCACAO CIENCIA E TECNOLOGIA DA BAHIA': 'IFBA',
  'FUNDACAO OSWALDO CRUZ': 'FIOCRUZ',
  'CENTRO UNIVERSITARIO SENAI CIMATEC': 'CIMATEC',
};

const PORTUGUESE_PREPOSITIONS = new Set([
  'de',
  'da',
  'do',
  'das',
  'dos',
  'e',
  'em',
]);

export const INSTITUTION_SORT_OPTIONS: ReadonlyArray<{
  value: InstitutionSortBy;
  label: string;
}> = [
  { value: 'name', label: 'Nome' },
  { value: 'acronym', label: 'Sigla' },
];

/**
 * Resolve a sigla canônica a partir de `acronym` explícito ou do `name`
 * (ex.: `"UFBA - Universidade..."`, `"Universidade Estadual de Santa Cruz"`).
 */
export function resolveInstitutionAcronym(
  institution: Pick<InstitutionSummary, 'acronym' | 'name'>,
): string | null {
  const rawAcronym = institution.acronym?.trim();
  if (rawAcronym) {
    const byAcronymName = INSTITUTION_ACRONYM_BY_NAME[normalizeKey(rawAcronym)];
    return byAcronymName ?? rawAcronym.toUpperCase();
  }

  const normalizedName = normalizeKey(institution.name);
  if (!normalizedName) return null;

  const byFullName = INSTITUTION_ACRONYM_BY_NAME[normalizedName];
  if (byFullName) return byFullName;

  const rawName = institution.name.trim();
  const prefixMatch = rawName.match(/^([A-Z0-9]{2,12})\s*[-–:]\s+\S/);
  if (prefixMatch?.[1]) return prefixMatch[1];

  const suffixMatch = rawName.match(/\(([A-Z0-9]{2,12})\)\s*$/);
  if (suffixMatch?.[1]) return suffixMatch[1];

  return null;
}

/**
 * Devolve o par de logos (`light` / `dark`) para instituições mapeadas ou `null`
 * quando não há asset próprio (o componente usa `image` ou `Building2`).
 */
export function getInstitutionLogo(
  input:
    string | Pick<InstitutionSummary, 'acronym' | 'name'> | null | undefined,
): InstitutionLogo | null {
  if (!input) return null;

  const candidate =
    typeof input === 'string'
      ? (INSTITUTION_ACRONYM_BY_NAME[normalizeKey(input)] ??
        input.trim().toUpperCase())
      : resolveInstitutionAcronym(input);

  if (candidate && candidate in INSTITUTION_LOGOS) {
    return INSTITUTION_LOGOS[candidate as InstitutionAcronym];
  }

  if (typeof input !== 'string') {
    const byName = INSTITUTION_ACRONYM_BY_NAME[normalizeKey(input.name)];
    if (byName && byName in INSTITUTION_LOGOS) {
      return INSTITUTION_LOGOS[byName as InstitutionAcronym];
    }
  }

  return null;
}

/**
 * Ajusta preposições portuguesas em caixa alta vindas da base (ex.:
 * `"Universidade Estadual De Santa Cruz"` → `"Universidade Estadual de Santa Cruz"`).
 */
export function formatInstitutionName(name: string | null | undefined): string {
  const trimmed = name?.trim().replace(/\s+/g, ' ') ?? '';
  if (!trimmed) return '';

  // Mantém strings inteiras em maiúsculas sem misturar caixa nas preposições.
  if (!/[a-záàâãéêíóôõúüç]/.test(trimmed)) return trimmed;

  return trimmed
    .split(' ')
    .map((word, index, words) => {
      const prev = words[index - 1];
      if (index === 0 || prev === '-' || prev === '–' || prev === ':') {
        return word;
      }
      const lower = word.toLowerCase();
      return PORTUGUESE_PREPOSITIONS.has(lower) ? lower : word;
    })
    .join(' ');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Remove prefixo/sufixo redundante quando a sigla já é exibida à parte. */
export function stripAcronymFromName(
  name: string,
  acronym: string | null | undefined,
): string {
  const formatted = formatInstitutionName(name);
  const cleanAcronym = acronym?.trim();
  if (!formatted || !cleanAcronym) return formatted;

  const escaped = escapeRegExp(cleanAcronym);
  const withoutPrefix = formatted.replace(
    new RegExp(`^${escaped}\\s*[-–:]\\s*`, 'i'),
    '',
  );
  const withoutSuffix = withoutPrefix.replace(
    new RegExp(`\\s*\\(${escaped}\\)$`, 'i'),
    '',
  );

  return withoutSuffix.trim() || formatted;
}

export function formatInstitutionCount(
  value: number | null | undefined,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('pt-BR');
}

// TODO(T4): migrar para <Link to="/instituicoes/$id"> quando a rota existir.
export function institutionPath(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/instituicoes/${encodeURIComponent(id)}`;
}
