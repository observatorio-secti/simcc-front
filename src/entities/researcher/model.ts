import type {
  DetailData,
  DetailResponse,
  ListItem,
  ListResponse,
  QueryOf,
  ResponseOf,
  Schema,
} from '@/api/types';

export type ResearcherSummary = ListItem<'/researcher'>;
export type ResearcherListResponse = ListResponse<'/researcher'>;
export type ResearcherSearch = QueryOf<'/researcher'>;

export type ResearcherDetail = DetailData<'/researcher/{researcher_id}'>;
export type ResearcherDetailResponse =
  DetailResponse<'/researcher/{researcher_id}'>;
export type ResearcherDetailQuery = QueryOf<'/researcher/{researcher_id}'>;

export type ResearcherTermsQuery = QueryOf<'/researcher/{researcher_id}/terms'>;
export type ResearcherTermsResponse =
  ResponseOf<'/researcher/{researcher_id}/terms'>;
export type ResearcherTerm = Schema<'Term'>;

export type ResearcherReference = Schema<'ResearcherRef'>;
export type ResearcherAffiliation = Schema<'Affiliation'>;
export type ResearcherInstitutionRef = Schema<'InstitutionRef'>;
export type ResearcherCounts = Schema<'ResearcherCounts'>;
export type ResearcherIdentifiers = Schema<'ResearcherIdentifiers'>;
export type ResearcherBibliometrics = Schema<'Bibliometrics'>;
export type ResearcherGraduateProgramLink = Schema<'GraduateProgramLink'>;
export type ResearcherGroupRef = Schema<'ResearchGroupRef'>;
export type ResearcherEducation = Schema<'Education'>;
export type ResearcherExperience = Schema<'ProfessionalExperience'>;
export type ResearcherFoment = Schema<'Foment'>;
export type ResearcherMatches = Schema<'MatchesSummary'>;
export type ResearcherMatchItem = Schema<'MatchItem'>;
export type ResearcherClassification = NonNullable<
  ResearcherSearch['classification']
>[number];
export type ResearcherSourceType = NonNullable<
  ResearcherSearch['source_type']
>[number];

export const ABSTRACT_COLLAPSE_THRESHOLD = 320;

const ptBrNumberFormat = new Intl.NumberFormat('pt-BR');
const ptBrDateFormat = new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' });

const EMPTY_SENTINELS = new Set(['', 'none', 'null', 'undefined']);

function cleanText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (EMPTY_SENTINELS.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

/**
 * Caminho público para o perfil do pesquisador respeitando `BASE_URL`.
 */
// TODO(T3): migrar usos de `researcherHref` para <Link to="/pesquisadores/$id">
export function researcherHref(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/pesquisadores/${encodeURIComponent(id)}`;
}

/** Iniciais usadas no fallback do avatar pequeno (`ResearcherAvatar`). */
export function researcherInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0] ?? '';
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? '';
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/** Siglas (ou nomes como fallback) das instituições de vínculo, sem duplicatas. */
export function formatAffiliationAcronyms(
  affiliations: readonly ResearcherAffiliation[] | null | undefined,
): string {
  if (!affiliations?.length) return '';
  const labels: string[] = [];
  const seen = new Set<string>();
  for (const item of affiliations) {
    const label =
      cleanText(item.institution.acronym) ?? cleanText(item.institution.name);
    if (!label || seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels.join(' / ');
}

/** Nomes completos das instituições de vínculo, sem duplicatas. */
export function formatAffiliationNames(
  affiliations: readonly ResearcherAffiliation[] | null | undefined,
): string {
  if (!affiliations?.length) return '';
  const names: string[] = [];
  const seen = new Set<string>();
  for (const item of affiliations) {
    const name = cleanText(item.institution.name);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names.join(' · ');
}

/** Cidades únicas extraídas dos vínculos do pesquisador. */
export function extractAffiliationCities(
  affiliations: readonly ResearcherAffiliation[] | null | undefined,
): string[] {
  if (!affiliations?.length) return [];
  const cities: string[] = [];
  const seen = new Set<string>();
  for (const item of affiliations) {
    const city = cleanText(item.city?.name);
    if (!city || seen.has(city)) continue;
    seen.add(city);
    cities.push(city);
  }
  return cities;
}

/** Formata `lattes_update` (ISO 8601 ou DD/MM/AAAA) em `DD/MM/AAAA`. */
export function formatLattesUpdate(
  value: string | null | undefined,
): string | null {
  const cleaned = cleanText(value);
  if (!cleaned) return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(cleaned)) return cleaned;
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) {
    return ptBrDateFormat.format(parsed);
  }
  return cleaned;
}

/**
 * Rótulos pt-BR para os níveis de formação que o Lattes entrega em inglês
 * (`DOCTORATE`, `MASTERS-DEGREE`, `UNDERGRADUATE`…). Valores já traduzidos ou
 * desconhecidos são preservados como vieram da API.
 */
const EDUCATION_DEGREE_LABELS: Record<string, string> = {
  UNDERGRADUATE: 'Graduação',
  'UNDERGRADUATE-DEGREE': 'Graduação',
  GRADUATION: 'Graduação',
  BACHELOR: 'Graduação',
  'BACHELORS-DEGREE': 'Graduação',
  SPECIALIZATION: 'Especialização',
  SPECIALIST: 'Especialização',
  'LATO-SENSU': 'Especialização',
  MBA: 'MBA',
  'MASTERS-DEGREE': 'Mestrado',
  MASTERS: 'Mestrado',
  MASTER: 'Mestrado',
  'MASTER-DEGREE': 'Mestrado',
  DOCTORATE: 'Doutorado',
  'DOCTORATE-DEGREE': 'Doutorado',
  DOCTORAL: 'Doutorado',
  PHD: 'Doutorado',
  'POST-DOCTORATE': 'Pós-Doutorado',
  POSTDOCTORATE: 'Pós-Doutorado',
  'POST-DOCTORAL': 'Pós-Doutorado',
  'HIGH-SCHOOL': 'Ensino médio',
  SECONDARY: 'Ensino médio',
  'ELEMENTARY-SCHOOL': 'Ensino fundamental',
  PRIMARY: 'Ensino fundamental',
  'TECHNICAL-COURSE': 'Curso técnico',
  TECHNICAL: 'Curso técnico',
  TECHNOLOGIST: 'Tecnólogo',
  RESIDENCY: 'Residência',
};

function normalizeEducationKey(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/** Traduz o nível de formação acadêmica do Lattes para pt-BR. */
export function formatDegreeLabel(
  degree: string | null | undefined,
): string | null {
  const cleaned = cleanText(degree);
  if (!cleaned) return null;
  return EDUCATION_DEGREE_LABELS[normalizeEducationKey(cleaned)] ?? cleaned;
}

/**
 * Traduz a situação da formação acadêmica para pt-BR. Diferente do status de
 * orientações/projetos, aqui o rótulo concorda com "curso" (Concluído).
 */
export function formatEducationStatus(
  status: string | null | undefined,
): string | null {
  const cleaned = cleanText(status);
  if (!cleaned) return null;
  const normalized = normalizeEducationKey(cleaned);
  if (/CONCLU|COMPLET|FINISH/.test(normalized)) return 'Concluído';
  if (/ANDAMENTO|IN-PROGRESS|ONGOING|CURSANDO|EM-CURSO/.test(normalized)) {
    return 'Em andamento';
  }
  return cleaned;
}

/** Formata contagem inteira no padrão pt-BR (`1.234`). */
export function formatCount(value: number): string {
  return ptBrNumberFormat.format(value);
}

/** Rótulo de evidências para o badge do card de pesquisador. */
export function formatEvidenceCount(count: number): string {
  return count === 1 ? '1 evidência' : `${formatCount(count)} evidências`;
}

/** Normaliza ORCID para `0000-0000-0000-0000` (aceita URL ou dígitos). */
export function normalizeOrcid(
  value: string | null | undefined,
): string | null {
  const cleaned = cleanText(value);
  if (!cleaned || cleaned === '0') return null;
  const stripped = cleaned
    .replace(/^https?:\/\/(?:www\.)?orcid\.org\//i, '')
    .replace(/[^0-9xX]/g, '')
    .toUpperCase();
  if (!/^\d{15}[\dX]$/.test(stripped)) return null;
  return `${stripped.slice(0, 4)}-${stripped.slice(4, 8)}-${stripped.slice(8, 12)}-${stripped.slice(12, 16)}`;
}

export function orcidProfileUrl(
  value: string | null | undefined,
): string | null {
  const orcid = normalizeOrcid(value);
  return orcid ? `https://orcid.org/${orcid}` : null;
}

export function scopusProfileUrl(
  value: string | null | undefined,
): string | null {
  const cleaned = cleanText(value);
  if (!cleaned || cleaned === '0') return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://www.scopus.com/authid/detail.uri?authorId=${encodeURIComponent(cleaned)}`;
}

export function lattesProfileUrl(
  lattesId: string | null | undefined,
): string | null {
  const cleaned = cleanText(lattesId);
  if (!cleaned || cleaned === '0') return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://lattes.cnpq.br/${encodeURIComponent(cleaned)}`;
}

export function openAlexProfileUrl(
  value: string | null | undefined,
): string | null {
  const cleaned = cleanText(value);
  if (!cleaned || cleaned === '0') return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://openalex.org/${encodeURIComponent(cleaned)}`;
}

export function linkedinSearchUrl(name: string): string {
  return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name.trim())}`;
}

const HTML_ENTITIES: Record<string, string> = {
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&nbsp;': ' ',
};

/** Remove marcação HTML e entidades comuns do texto vindo do Lattes. */
export function normalizeResearcherText(
  value: string | null | undefined,
): string {
  const cleaned = cleanText(value);
  if (!cleaned) return '';
  const decoded = cleaned.replace(
    /&(?:quot|apos|#39|lt|gt|amp|nbsp);/gi,
    (entity) => HTML_ENTITIES[entity.toLowerCase()] ?? entity,
  );
  return decoded
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type HighlightSegment = {
  text: string;
  highlighted: boolean;
};

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Divide `text` em trechos destacados/normais casando os termos sem considerar
 * acentos nem caixa, preservando a grafia original.
 */
export function splitHighlightSegments(
  text: string,
  query: string | readonly string[] | null | undefined,
): HighlightSegment[] {
  if (!text) return [];
  const rawTerms = Array.isArray(query)
    ? query
    : typeof query === 'string'
      ? query.split(/\s+/)
      : [];
  const terms = Array.from(
    new Set(
      rawTerms.map((term) => normalizeForMatch(term).trim()).filter(Boolean),
    ),
  );
  if (terms.length === 0) return [{ text, highlighted: false }];

  // Mapeia cada posição da string normalizada para o intervalo original [start, end).
  let normalized = '';
  const origStarts: number[] = [];
  const origEnds: number[] = [];
  for (let i = 0; i < text.length;) {
    const codePoint = text.codePointAt(i) ?? 0;
    const step = codePoint > 0xffff ? 2 : 1;
    const slice = text.slice(i, i + step);
    const normSlice = normalizeForMatch(slice);
    for (let j = 0; j < normSlice.length; j += 1) {
      normalized += normSlice[j];
      origStarts.push(i);
      origEnds.push(i + step);
    }
    i += step;
  }

  const ranges: Array<[number, number]> = [];
  for (const term of terms) {
    let from = 0;
    while (from <= normalized.length - term.length) {
      const idx = normalized.indexOf(term, from);
      if (idx === -1) break;
      const start = origStarts[idx];
      const end = origEnds[idx + term.length - 1];
      if (start !== undefined && end !== undefined) {
        ranges.push([start, end]);
      }
      from = idx + term.length;
    }
  }

  if (ranges.length === 0) return [{ text, highlighted: false }];

  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const [start, end] of merged) {
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), highlighted: false });
    }
    segments.push({ text: text.slice(start, end), highlighted: true });
    cursor = end;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), highlighted: false });
  }
  return segments;
}
