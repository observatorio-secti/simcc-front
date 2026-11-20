import {
  FALLBACK_COLOR,
  areaColor,
  areaKey,
  type DictionaryColor,
} from '@/shared/lib/design-tokens';
import type {
  OdaPaginationMeta,
  ResearchGroup,
  ResearchGroupAddress,
  ResearchGroupContact,
  ResearchGroupInstitution,
  ResearchGroupLine,
  ResearchGroupListResult,
  ResearchGroupMember,
  ResearchGroupResearcher,
  ResearchGroupResearchersResult,
} from '@/api/oda';

export type {
  OdaPaginationMeta,
  ResearchGroup,
  ResearchGroupAddress,
  ResearchGroupContact,
  ResearchGroupInstitution,
  ResearchGroupLine,
  ResearchGroupListResult,
  ResearchGroupMember,
  ResearchGroupResearcher,
  ResearchGroupResearchersResult,
};

/** Referência compacta compatível com `ResearchGroupRef` da v2 e `ResearchGroup`. */
export interface ResearchGroupRef {
  id: string;
  name?: string | null;
  institutionAcronym?: string | null;
}

export interface ResolvedGroupArea {
  label: string;
  color: DictionaryColor;
  matched: boolean;
}

export interface FormattedGroupStatus {
  label: string;
  isActive: boolean;
}

/** Constrói o caminho público do detalhe respeitando `BASE_URL`. */
export function researchGroupHref(id: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  // TODO(T6): migrar para <Link to="/grupos-pesquisa/$id">
  return `${base}/grupos-pesquisa/${encodeURIComponent(id)}`;
}

/** Espelho público do grupo no DGP CNPq, quando `dgpId` está disponível. */
export function researchGroupDgpUrl(
  dgpId: string | null | undefined,
): string | null {
  const trimmed = dgpId?.trim();
  if (!trimmed) return null;
  return `https://dgp.cnpq.br/dgp/espelhogrupo/${encodeURIComponent(trimmed)}`;
}

/**
 * Resolve o rótulo e a cor de grande área do grupo via `design-tokens.ts`.
 * Quando `area` é uma subárea específica (ex.: "Ciência da Computação"), tenta
 * mapear a cor pela grande área inferida pela ODA antes de cair no neutro.
 */
export function resolveGroupArea(
  group: Pick<ResearchGroup, 'area' | 'knowledgeArea' | 'knowledgeAreas'>,
): ResolvedGroupArea | null {
  const label =
    group.area ?? group.knowledgeArea ?? group.knowledgeAreas[0] ?? null;
  if (!label) return null;

  if (areaKey(group.area)) {
    return { label, color: areaColor(group.area), matched: true };
  }

  for (const candidate of [group.knowledgeArea, ...group.knowledgeAreas]) {
    if (candidate && areaKey(candidate)) {
      return { label, color: areaColor(candidate), matched: true };
    }
  }

  return { label, color: FALLBACK_COLOR, matched: false };
}

/** Formata os nomes dos líderes para exibição compacta no card. */
export function formatGroupLeaders(
  leaders: ReadonlyArray<Pick<ResearchGroupMember, 'name'>>,
  max = 2,
): string | null {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const leader of leaders) {
    const trimmed = leader.name.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    names.push(trimmed);
  }
  if (names.length === 0) return null;

  const limit = Math.max(1, max);
  const visible = names.slice(0, limit);
  const remaining = names.length - visible.length;
  return remaining > 0
    ? `${visible.join(', ')} (+${remaining})`
    : visible.join(', ');
}

const KNOWN_STATUS_LABELS: Record<string, string> = {
  ATIVO: 'Ativo',
  CERTIFICADO: 'Certificado',
  EM_PREENCHIMENTO: 'Em preenchimento',
  NAO_ATUALIZADO: 'Não atualizado',
  AGUARDANDO_CERTIFICACAO: 'Aguardando certificação',
  CERTIFICACAO_NEGADA: 'Certificação negada',
  EXCLUIDO: 'Excluído',
  EXTINTO: 'Extinto',
};

/** Formata a situação cadastral do grupo em sentence case. */
export function formatGroupStatus(
  status: string | null | undefined,
): FormattedGroupStatus | null {
  const cleaned = status?.trim();
  if (!cleaned) return null;
  const upper = cleaned.toUpperCase();
  const known = KNOWN_STATUS_LABELS[upper];
  const normalized = cleaned.replace(/_/g, ' ').toLowerCase();
  const label =
    known ?? normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return {
    label,
    isActive: upper === 'ATIVO' || upper === 'CERTIFICADO',
  };
}

/** Formata cidade e UF da sede do grupo (ex.: `"Salvador - BA"`). */
export function formatGroupLocation(
  address: Pick<ResearchGroupAddress, 'city' | 'state'>,
): string | null {
  const city = address.city?.trim() || null;
  const state = address.state?.trim() || null;
  if (city && state) return `${city} - ${state}`;
  return city ?? state;
}

export function formatGroupCount(count: number): string {
  return count.toLocaleString('pt-BR');
}

export function formatMembersLabel(count: number): string {
  return `${formatGroupCount(count)} ${count === 1 ? 'membro' : 'membros'}`;
}

export function formatLinesLabel(count: number): string {
  return `${formatGroupCount(count)} ${count === 1 ? 'linha de pesquisa' : 'linhas de pesquisa'}`;
}
