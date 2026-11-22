import type {
  ListFilters,
  ListItem,
  ListResponse,
  QueryOf,
  Schema,
} from '@/api/types';
import {
  FALLBACK_COLOR,
  normalizeKey,
  SCHOLARSHIP_COLORS,
  scholarshipKey,
  type DictionaryColor,
  type ScholarshipKey,
} from '@/shared/lib/design-tokens';

/** Bolsa ou auxílio de fomento de um pesquisador (`/scholarship`). */
export type Scholarship = ListItem<'/scholarship'>;
export type ScholarshipResearcher = Schema<'ScholarshipResearcher'>;
export type ScholarshipQuery = QueryOf<'/scholarship'>;
export type ScholarshipListResponse = ListResponse<'/scholarship'>;
export type ScholarshipFilters = ListFilters<'/scholarship'>;
export type ScholarshipSortBy = NonNullable<ScholarshipQuery['sort_by']>;

export const SCHOLARSHIP_SORT_OPTIONS: ReadonlyArray<{
  value: ScholarshipSortBy;
  label: string;
  defaultOrder: NonNullable<ScholarshipQuery['sort_order']>;
}> = [
  { value: 'researcher_name', label: 'Nome (A–Z)', defaultOrder: 'asc' },
  { value: 'modality', label: 'Modalidade', defaultOrder: 'asc' },
  { value: 'category_level', label: 'Nível', defaultOrder: 'asc' },
];

function cleanText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed ? trimmed : null;
}

/**
 * Chave do dicionário `bolsa-*` para a modalidade como a v2 devolve
 * ("Produtividade em Pesquisa - 2", "Produtividade Desen. Tec. e Extensão
 * Inovadora - C") e também para as siglas (`PQ-1A`, `DT 2`).
 */
export function scholarshipModalityKey(
  modality: string | null | undefined,
): ScholarshipKey | null {
  const bySigla = scholarshipKey(modality);
  if (bySigla) return bySigla;
  const normalized = normalizeKey(modality);
  if (normalized.startsWith('PRODUTIVIDADE EM PESQUISA')) return 'PQ';
  if (
    normalized.startsWith('PRODUTIVIDADE DESEN') ||
    normalized.startsWith('DESENVOLVIMENTO TECNOLOGICO')
  ) {
    return 'DT';
  }
  return null;
}

/** Cor da modalidade (`bolsa-PQ`, `bolsa-DT` ou neutra). */
export function scholarshipModalityColor(
  modality: string | null | undefined,
): DictionaryColor {
  const key = scholarshipModalityKey(modality);
  return key ? SCHOLARSHIP_COLORS[key] : FALLBACK_COLOR;
}

/**
 * Nome da modalidade sem o nível no fim, quando a v2 repete o nível
 * ("Produtividade em Pesquisa - 2" com `category_level` "2").
 */
export function formatScholarshipModality(
  item: Pick<Scholarship, 'modality' | 'category_level' | 'funding_program'>,
): string {
  const modality = cleanText(item.modality);
  const level = cleanText(item.category_level);
  if (modality && level) {
    const suffix = new RegExp(
      `\\s*[-–]\\s*${level.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      'i',
    );
    const stripped = modality.replace(suffix, '').trim();
    if (stripped) return stripped;
  }
  return modality ?? cleanText(item.funding_program) ?? 'Bolsa';
}

/** Rótulo do nível da bolsa ("Nível 1A"), ou `null` sem nível. */
export function formatScholarshipLevel(
  level: string | null | undefined,
): string | null {
  const cleaned = cleanText(level);
  return cleaned ? `Nível ${cleaned}` : null;
}

/** Quantidades de bolsas e auxílios em pt-BR ("1 bolsa · 2 auxílios"). */
export function formatScholarshipQuantities(
  item: Pick<Scholarship, 'scholarship_quantity' | 'aid_quantity'>,
): string | null {
  const parts: string[] = [];
  const scholarships = item.scholarship_quantity;
  const aids = item.aid_quantity;
  if (scholarships != null && scholarships > 0) {
    parts.push(
      `${scholarships.toLocaleString('pt-BR')} ${scholarships === 1 ? 'bolsa' : 'bolsas'}`,
    );
  }
  if (aids != null && aids > 0) {
    parts.push(
      `${aids.toLocaleString('pt-BR')} ${aids === 1 ? 'auxílio' : 'auxílios'}`,
    );
  }
  return parts.length > 0 ? parts.join(' · ') : null;
}
