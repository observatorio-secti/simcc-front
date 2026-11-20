import type {
  DetailResponse,
  ListResponse,
  QueryOf,
  Schema,
} from '@/api/types';

// Revista (periódico). A v2 tem dois formatos:
// - `Magazine`: item do catálogo `/v2/magazine`, com `id`, `jcr_link` e o
//   período de referência do Qualis (a mesma revista aparece uma vez por
//   período);
// - `MagazineRef`: a revista embutida no artigo (`article.magazine`), sem `id`.
// Os campos de `MagazineRef` são um subconjunto dos de `Magazine`, então os
// componentes aceitam os dois.

export type Magazine = Schema<'Magazine'>;
export type MagazineRefData = Schema<'MagazineRef'>;

/** Qualquer revista que os componentes sabem mostrar. */
export type MagazineLike = MagazineRefData &
  Partial<Pick<Magazine, 'id' | 'jcr_link' | 'reference_period'>>;

export type MagazineListParams = QueryOf<'/magazine'>;
export type MagazineListResponse = ListResponse<'/magazine'>;
export type MagazineDetailResponse = DetailResponse<'/magazine/{magazine_id}'>;

/** Estrato Qualis da v2 (`A1`…`C`). */
export type QualisStratum = NonNullable<Magazine['qualis']>;
/** Motivo da ausência de estrato. */
export type QualisStatus = NonNullable<Magazine['qualis_status']>;

export const QUALIS_STATUS_LABELS = {
  not_rated: 'Sem Qualis',
  not_applicable: 'Qualis não se aplica',
} as const satisfies Record<QualisStatus, string>;

type QualisFields = Pick<MagazineRefData, 'qualis' | 'qualis_status'>;

/**
 * Rótulo do Qualis: "Qualis A1", ou o motivo da ausência. Sem estrato e sem
 * `qualis_status` (revistas do catálogo que só têm JCR) conta como "Sem Qualis".
 */
export function qualisLabel({ qualis, qualis_status }: QualisFields): string {
  if (qualis) return `Qualis ${qualis}`;
  return QUALIS_STATUS_LABELS[qualis_status ?? 'not_rated'];
}

const jcrFormat = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 3,
});

/** Fator de impacto JCR em pt-BR (`4,5`), ou `null` quando não há. */
export function formatJcr(jcr: number | null | undefined): string | null {
  return typeof jcr === 'number' && Number.isFinite(jcr)
    ? jcrFormat.format(jcr)
    : null;
}

const ISSN_PATTERN = /^(\d{4})-?(\d{3}[\dX])$/;

function compactIssn(issn: string | null | undefined): string {
  return (issn ?? '').trim().toUpperCase();
}

/**
 * ISSN com dígito verificador válido. A base traz ISSN sem hífen e, às vezes,
 * truncado ou trocado; só os válidos viram link.
 */
export function isValidIssn(issn: string | null | undefined): boolean {
  const match = ISSN_PATTERN.exec(compactIssn(issn));
  if (!match) return false;
  const digits = `${match[1]}${match[2]}`;
  const sum = [...digits.slice(0, 7)].reduce(
    (total, digit, index) => total + Number(digit) * (8 - index),
    0,
  );
  const check = (11 - (sum % 11)) % 11;
  return digits.charAt(7) === (check === 10 ? 'X' : String(check));
}

/**
 * ISSN no formato `0000-0000` quando tem oito caracteres; senão, como veio
 * (sem inventar zero à esquerda). `null` quando não há.
 */
export function formatIssn(issn: string | null | undefined): string | null {
  const value = compactIssn(issn);
  if (!value) return null;
  const match = ISSN_PATTERN.exec(value);
  return match ? `${match[1]}-${match[2]}` : value;
}

/** Página da revista no portal do ISSN, só para ISSN válido. */
export function issnPortalUrl(issn: string | null | undefined): string | null {
  if (!isValidIssn(issn)) return null;
  return `https://portal.issn.org/resource/ISSN/${formatIssn(issn)}`;
}
