import type {
  DetailData,
  ListItem,
  PathParamsOf,
  QueryOf,
  Schema,
} from '@/api/types';
import { normalizeKey } from '@/shared/lib/design-tokens';

// Programa de pós-graduação (`/v2/graduate-program`). Os tipos derivam do
// contrato gerado (ADR 0003); aqui ficam só rótulos e formatação.

/** Item da lista `/graduate-program` (sem instituição nem contagens). */
export type GraduateProgramSummary = ListItem<'/graduate-program'>;

/** Detalhe `/graduate-program/{program_id}`: instituição, linhas e contagens. */
export type GraduateProgramDetail =
  DetailData<'/graduate-program/{program_id}'>;

/** Referência curta a um programa (ex.: vínculos do pesquisador). */
export type GraduateProgramRef = Schema<'GraduateProgramRef'>;

export type ResearchLine = Schema<'ResearchLine'>;

/** Instituição embutida no detalhe do programa. */
export type GraduateProgramInstitution = Schema<'InstitutionRef'>;

/** Query string da lista (filtros, paginação, ordenação, facetas). */
export type GraduateProgramListSearch = QueryOf<'/graduate-program'>;

export type GraduateProgramId =
  PathParamsOf<'/graduate-program/{program_id}'>['program_id'];

/**
 * Caminho público do detalhe do programa. A rota é da T5 (`/pos-graduacao/$id`,
 * ver docs/legado/inventario.md) e ainda não existe; por isso o link é uma
 * âncora comum, montada só aqui. Quando a rota existir, `ProgramRef` passa a
 * usar o `Link` tipado do router e esta função some.
 */
export function programHref(id: GraduateProgramId): string {
  return `/pos-graduacao/${encodeURIComponent(id)}`;
}

/** Nome com a sigla, quando houver: "Ciência da Computação (PGCOMP)". */
export function programDisplayName({
  name,
  acronym,
}: Pick<GraduateProgramRef, 'name' | 'acronym'>): string {
  const trimmed = acronym?.trim();
  return trimmed ? `${name} (${trimmed})` : name;
}

const MODALITY_LABELS: Record<string, string> = {
  ACADEMICO: 'Acadêmico',
  PROFISSIONAL: 'Profissional',
};

/** Primeira letra maiúscula e o resto minúsculo ("ACADÊMICO" → "Acadêmico"). */
function sentenceCase(value: string): string {
  const lower = value.trim().toLocaleLowerCase('pt-BR');
  return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
}

/** Modalidade em sentence case. A v2 manda em caixa alta ("PROFISSIONAL"). */
export function modalityLabel(
  modality: string | null | undefined,
): string | null {
  if (!modality?.trim()) return null;
  return MODALITY_LABELS[normalizeKey(modality)] ?? sentenceCase(modality);
}

/** Conceito CAPES: "Conceito 5". */
export function ratingLabel(rating: string | null | undefined): string | null {
  const trimmed = rating?.trim();
  return trimmed ? `Conceito ${trimmed}` : null;
}

/** "Ilhéus, BA", só a cidade ou só a UF. */
export function locationLabel({
  city,
  state,
}: Pick<GraduateProgramSummary, 'city' | 'state'>): string | null {
  const parts = [city?.trim(), state?.trim()].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

const integer = new Intl.NumberFormat('pt-BR');

/** "1 pesquisador", "1.204 pesquisadores", "Nenhum pesquisador". */
export function researcherCountLabel(count: number): string {
  if (count <= 0) return 'Nenhum pesquisador';
  return `${integer.format(count)} ${count === 1 ? 'pesquisador' : 'pesquisadores'}`;
}

/** Período da linha: "2010–2020", "Desde 2010", "Até 2020" ou `null`. */
export function researchLinePeriod({
  start_year: start,
  end_year: end,
}: Pick<ResearchLine, 'start_year' | 'end_year'>): string | null {
  if (start && end) return start === end ? String(start) : `${start}–${end}`;
  if (start) return `Desde ${start}`;
  if (end) return `Até ${end}`;
  return null;
}

const monthYear = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * Data de início ("2015-08-03") como "agosto de 2015". Lida como data sem
 * fuso, para não voltar um dia. Valor que não é data volta como veio.
 */
export function programStartLabel(
  start: string | null | undefined,
): string | null {
  const trimmed = start?.trim();
  if (!trimmed) return null;
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(trimmed);
  if (!match) return trimmed;
  const [, year, month, day = '01'] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? trimmed : monthYear.format(date);
}

/**
 * URL do site do programa pronta para `href`. A base guarda endereços sem
 * protocolo ("www.uesc.br/ppgmc"); só `http(s)` é aceito, o resto vira `null`.
 */
export function programSiteUrl(site: string | null | undefined): string | null {
  const trimmed = site?.trim();
  if (!trimmed) return null;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}
