import type {
  OdaGroupDetailResponseRaw,
  OdaGroupListResponseRaw,
  OdaGroupRaw,
  OdaGroupResearcherRaw,
  OdaGroupResearchersResponseRaw,
  OdaInstitutionListResponseRaw,
  OdaInstitutionRaw,
  OdaKnowledgeAreaListResponseRaw,
  OdaPaginationMetaRaw,
  OdaStateListResponseRaw,
} from './schemas';

export interface OdaPaginationMeta {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ResearchGroupInstitution {
  id: string | null;
  name: string | null;
  acronym: string | null;
  relationship: string | null;
  isHeadquarters: boolean;
  imageUrl: string | null;
  unitName: string | null;
  unitState: string | null;
  stateAcronym: string | null;
  stateName: string | null;
  region: string | null;
}

export interface ResearchGroupMember {
  id: string;
  name: string;
  isLeader: boolean;
  lattesId: string | null;
}

export interface ResearchGroupLine {
  title: string;
  objective: string | null;
}

export interface ResearchGroupContact {
  email: string | null;
  phone: string | null;
  website: string | null;
}

export interface ResearchGroupAddress {
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ResearchGroup {
  id: string;
  name: string;
  area: string | null;
  knowledgeArea: string | null;
  knowledgeAreas: string[];
  dgpId: string | null;
  foundedYear: number | null;
  status: string | null;
  repercussion: string | null;
  headquarters: ResearchGroupInstitution | null;
  partnerInstitutions: ResearchGroupInstitution[];
  institutionLabel: string;
  institutionAcronym: string | null;
  leaders: ResearchGroupMember[];
  members: ResearchGroupMember[];
  memberCount: number;
  researchLines: ResearchGroupLine[];
  researchLineCount: number;
  contact: ResearchGroupContact;
  address: ResearchGroupAddress;
}

export interface ResearchGroupListResult {
  items: ResearchGroup[];
  meta: OdaPaginationMeta;
}

export interface ResearchGroupResearcher {
  id: string;
  name: string;
  graduation: string | null;
  lattesId: string | null;
  orcid: string | null;
  imageUrl: string | null;
  isLeader: boolean;
}

export interface ResearchGroupResearchersResult {
  items: ResearchGroupResearcher[];
  meta: OdaPaginationMeta;
}

export interface OdaStateOption {
  id: string;
  acronym: string;
  name: string;
  region: string | null;
}

export interface OdaKnowledgeAreaOption {
  id: string;
  name: string;
  type: string | null;
}

export interface OdaInstitutionOption {
  id: string;
  name: string;
  acronym: string | null;
  label: string;
  stateAcronym: string | null;
}

const PLACEHOLDER_TEXTS = new Set(['null', 'nan', 'none', 'undefined']);

/** Normaliza strings vazias e marcadores textuais nulos comuns no legado. */
export function cleanOdaText(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || PLACEHOLDER_TEXTS.has(trimmed.toLowerCase())) return null;
  return trimmed;
}

function cleanOdaNumber(value: number | null | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Campos escalares da ODA podem chegar como valor único, array ou `null`.
 * Devolve o primeiro item válido encontrado.
 */
export function firstOdaValue<T extends string | number>(
  value: T | ReadonlyArray<T | null> | null | undefined,
): T | null {
  if (value == null) return null;
  const candidates = Array.isArray(value) ? value : [value];
  for (const item of candidates) {
    if (typeof item === 'string') {
      const cleaned = cleanOdaText(item);
      if (cleaned !== null) return cleaned as T;
    } else if (typeof item === 'number') {
      if (Number.isFinite(item)) return item as T;
    }
  }
  return null;
}

/**
 * Formata sigla e nome da instituição sem repetir a sigla quando o nome já a
 * traz no início ou no fim (ex.: `"UFBA - Universidade Federal da Bahia"`).
 */
export function formatInstitutionLabel(
  acronym?: string | null,
  name?: string | null,
): string {
  const s = cleanOdaText(acronym) ?? '';
  const n = cleanOdaText(name) ?? '';
  if (!s) return n;
  if (!n) return s;

  const lowerName = n.toLowerCase();
  const lowerAcronym = s.toLowerCase();
  if (lowerName === lowerAcronym) return s;
  if (lowerName.startsWith(`${lowerAcronym} - `)) {
    return `${s} - ${n.slice(s.length + 3).trim()}`;
  }
  if (lowerName.startsWith(`${lowerAcronym} `)) {
    return `${s} - ${n.slice(s.length).trim()}`;
  }
  if (
    lowerName.endsWith(` - ${lowerAcronym}`) ||
    lowerName.endsWith(` (${lowerAcronym})`) ||
    lowerName.endsWith(` [${lowerAcronym}]`)
  ) {
    const idx = lowerName.lastIndexOf(lowerAcronym);
    const base = n
      .slice(0, idx)
      .replace(/[\s–—:([-]+$/, '')
      .trim();
    return base ? `${s} - ${base}` : s;
  }
  return `${s} - ${n}`;
}

/** Resolve URL de asset da ODA (relativa à base ou absoluta). */
export function resolveOdaAssetUrl(
  url: string | null | undefined,
  baseUrl?: string,
): string | null {
  const cleaned = cleanOdaText(url);
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (!baseUrl) return cleaned;
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const normalizedPath = cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  return `${normalizedBase}${normalizedPath}`;
}

function adaptOdaInstitution(
  raw: OdaInstitutionRaw,
  baseUrl?: string,
): ResearchGroupInstitution {
  const relationship = cleanOdaText(raw.tipoRelacao);
  return {
    id: cleanOdaText(raw.id),
    name: cleanOdaText(raw.nome),
    acronym: cleanOdaText(raw.sigla),
    relationship,
    isHeadquarters: relationship?.toUpperCase() === 'SEDE',
    imageUrl: resolveOdaAssetUrl(raw.imageUrl, baseUrl),
    unitName: cleanOdaText(raw.unidade?.nome),
    unitState: cleanOdaText(raw.unidade?.uf),
    stateAcronym: cleanOdaText(raw.estado?.sigla),
    stateName: cleanOdaText(raw.estado?.nome),
    region: cleanOdaText(raw.estado?.regiao),
  };
}

function collectKnowledgeAreas(raw: OdaGroupRaw): {
  primary: string | null;
  all: string[];
} {
  const names: string[] = [];
  const seen = new Set<string>();
  const add = (candidate: string | null | undefined) => {
    const cleaned = cleanOdaText(candidate);
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    names.push(cleaned);
  };

  add(raw.areaConhecimento?.nome);
  for (const item of raw.areasConhecimento ?? []) {
    add(item.nome);
  }

  return {
    primary: names[0] ?? null,
    all: names,
  };
}

/** Converte um registro bruto `OdaGrupo` para o modelo limpo `ResearchGroup`. */
export function adaptOdaGroup(
  raw: OdaGroupRaw,
  baseUrl?: string,
): ResearchGroup {
  const institutions = (raw.instituicoes ?? []).map((inst) =>
    adaptOdaInstitution(inst, baseUrl),
  );
  const headquarters =
    institutions.find((inst) => inst.isHeadquarters) ?? institutions[0] ?? null;
  const partnerInstitutions = institutions.filter(
    (inst) => inst !== headquarters,
  );

  const members: ResearchGroupMember[] = [];
  for (const member of raw.membros ?? []) {
    const name = cleanOdaText(member.nome);
    if (!name) continue;
    const lattesId = cleanOdaText(member.lattesId);
    members.push({
      id: cleanOdaText(member.id) ?? lattesId ?? name,
      name,
      isLeader: Boolean(member.eLider),
      lattesId,
    });
  }
  const leaders = members.filter((member) => member.isLeader);

  const researchLines: ResearchGroupLine[] = [];
  for (const line of raw.linhasPesquisa ?? []) {
    const title = cleanOdaText(line.titulo);
    if (!title) continue;
    researchLines.push({
      title,
      objective: cleanOdaText(line.objetivo),
    });
  }

  const rawYear = cleanOdaNumber(firstOdaValue(raw.anoFormacao));
  const knowledge = collectKnowledgeAreas(raw);

  return {
    id: raw.id.trim(),
    name: raw.nome.trim(),
    area: cleanOdaText(raw.areaPredominante),
    knowledgeArea: knowledge.primary,
    knowledgeAreas: knowledge.all,
    dgpId: firstOdaValue(raw.dgpId),
    foundedYear: rawYear !== null ? Math.trunc(rawYear) : null,
    status: cleanOdaText(raw.situacao),
    repercussion: cleanOdaText(raw.repercussao),
    headquarters,
    partnerInstitutions,
    institutionLabel: headquarters
      ? formatInstitutionLabel(headquarters.acronym, headquarters.name)
      : '',
    institutionAcronym: headquarters?.acronym ?? null,
    leaders,
    members,
    memberCount: members.length,
    researchLines,
    researchLineCount: researchLines.length,
    contact: {
      email: firstOdaValue(raw.email),
      phone: firstOdaValue(raw.telefone),
      website: firstOdaValue(raw.website),
    },
    address: {
      street: firstOdaValue(raw.logradouro),
      number: firstOdaValue(raw.numero),
      complement: firstOdaValue(raw.complemento),
      neighborhood: firstOdaValue(raw.bairro),
      city: firstOdaValue(raw.cidade),
      state: firstOdaValue(raw.uf),
      postalCode: firstOdaValue(raw.cep),
      latitude: cleanOdaNumber(firstOdaValue(raw.latitude)),
      longitude: cleanOdaNumber(firstOdaValue(raw.longitude)),
    },
  };
}

function normalizeMeta(
  rawMeta: OdaPaginationMetaRaw | null | undefined,
  itemCount: number,
  fallbackPage: number,
  fallbackSize: number,
): OdaPaginationMeta {
  const page = rawMeta?.page ?? fallbackPage;
  const size = rawMeta?.size ?? Math.max(fallbackSize, itemCount, 1);
  const totalItems = rawMeta?.totalItems ?? itemCount;
  const totalPages =
    rawMeta?.totalPages ?? Math.max(1, Math.ceil(totalItems / size));
  return { page, size, totalItems, totalPages };
}

/** Converte a resposta de lista da ODA (envelope `{ data, meta }`, `{ items }` ou array). */
export function adaptOdaGroupList(
  raw: OdaGroupListResponseRaw,
  fallbackPage = 1,
  fallbackSize = 100,
  baseUrl?: string,
): ResearchGroupListResult {
  const rawItems = Array.isArray(raw)
    ? raw
    : 'data' in raw
      ? raw.data
      : raw.items;
  const rawMeta = Array.isArray(raw) ? undefined : raw.meta;
  const items = rawItems.map((group) => adaptOdaGroup(group, baseUrl));
  return {
    items,
    meta: normalizeMeta(rawMeta, items.length, fallbackPage, fallbackSize),
  };
}

/** Converte a resposta de detalhe da ODA (objeto direto ou `{ data }`). */
export function adaptOdaGroupDetail(
  raw: OdaGroupDetailResponseRaw,
  baseUrl?: string,
): ResearchGroup {
  const group = 'data' in raw ? raw.data : raw;
  return adaptOdaGroup(group, baseUrl);
}

/** Converte um pesquisador vinculado ao grupo retornado pela ODA. */
export function adaptOdaGroupResearcher(
  raw: OdaGroupResearcherRaw,
  baseUrl?: string,
): ResearchGroupResearcher {
  return {
    id: raw.id.trim(),
    name: raw.nome.trim(),
    graduation: cleanOdaText(raw.formacaoAcademica),
    lattesId: cleanOdaText(raw.lattesId),
    orcid: cleanOdaText(raw.orcidId),
    imageUrl: resolveOdaAssetUrl(raw.imageUrl, baseUrl),
    isLeader: Boolean(raw.eLider),
  };
}

/** Converte a lista paginada de pesquisadores de um grupo na ODA. */
export function adaptOdaGroupResearchers(
  raw: OdaGroupResearchersResponseRaw,
  fallbackPage = 1,
  fallbackSize = 100,
  baseUrl?: string,
): ResearchGroupResearchersResult {
  const rawItems = Array.isArray(raw) ? raw : raw.data;
  const rawMeta = Array.isArray(raw) ? undefined : raw.meta;
  const items = rawItems.map((researcher) =>
    adaptOdaGroupResearcher(researcher, baseUrl),
  );
  return {
    items,
    meta: normalizeMeta(rawMeta, items.length, fallbackPage, fallbackSize),
  };
}

/** Converte a lista de UFs retornada pela ODA. */
export function adaptOdaStates(raw: OdaStateListResponseRaw): OdaStateOption[] {
  const items = Array.isArray(raw) ? raw : raw.data;
  return items
    .map((item) => ({
      id: item.id.trim(),
      acronym: item.sigla.trim().toUpperCase(),
      name: item.nome.trim(),
      region: cleanOdaText(item.regiao),
    }))
    .sort((a, b) => a.acronym.localeCompare(b.acronym, 'pt-BR'));
}

/** Converte a lista de áreas de conhecimento retornada pela ODA. */
export function adaptOdaKnowledgeAreas(
  raw: OdaKnowledgeAreaListResponseRaw,
): OdaKnowledgeAreaOption[] {
  const items = Array.isArray(raw) ? raw : raw.data;
  return items
    .map((item) => ({
      id: item.id.trim(),
      name: item.nome.trim(),
      type: cleanOdaText(item.tipo),
    }))
    .filter((item) => item.name.length > 0 && item.name !== '.')
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

/** Converte a lista de instituições retornada pela ODA. */
export function adaptOdaInstitutions(
  raw: OdaInstitutionListResponseRaw,
): OdaInstitutionOption[] {
  const items = Array.isArray(raw) ? raw : raw.data;
  return items
    .map((item) => {
      const name = item.nome.trim();
      const acronym = cleanOdaText(item.sigla);
      return {
        id: item.id.trim(),
        name,
        acronym,
        label: formatInstitutionLabel(acronym, name) || name,
        stateAcronym: cleanOdaText(item.estado?.sigla)?.toUpperCase() ?? null,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
}
