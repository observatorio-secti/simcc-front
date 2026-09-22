import { api, apiOda, hasOdaBase } from '../lib/api';

export interface Patrimonio {
  area: string;
  institution: string;
  first_leader: string;
  first_leader_id: string;
  second_leader: string;
  second_leader_id: string;
  name: string;
  id: string;
  census?: string | null;
  start_of_collection?: string | null;
  end_of_collection?: string | null;
  group_identifier?: string | null;
  year?: string | null;
  institution_name?: string | null;
  category?: string | null;
}

export interface OdaInstituicao {
  id: string;
  nome: string;
  sigla: string;
  tipoRelacao?: string;
  imageUrl?: string | null;
  unidade?: { nome?: string | null; uf?: string | null } | null;
  estado?: { id?: string; sigla?: string; nome?: string; regiao?: string } | null;
}

export interface OdaAreaConhecimento {
  id?: string;
  nome?: string;
  nomeNormalizado?: string;
  tipo?: string | null;
  areaPaiId?: string | null;
  relacao?: string;
  metodoInferencia?: string | null;
  confianca?: number | null;
  justificativa?: string | null;
}

interface OdaMembro {
  id: string;
  nome: string;
  eLider?: boolean;
  lattesId?: string | null;
}

export interface OdaGrupo {
  id: string;
  nome: string;
  areaPredominante?: string | null;
  dgpId?: string | string[] | null;
  anoFormacao?: number | number[] | null;
  situacao?: string | null;
  repercussao?: string | null;
  email?: string | string[] | null;
  telefone?: string | string[] | null;
  website?: string | string[] | null;
  logradouro?: string | string[] | null;
  numero?: string | string[] | null;
  complemento?: string | string[] | null;
  bairro?: string | string[] | null;
  cidade?: string | string[] | null;
  uf?: string | string[] | null;
  cep?: string | string[] | null;
  latitude?: number | number[] | null;
  longitude?: number | number[] | null;
  instituicoes?: OdaInstituicao[];
  areaConhecimento?: OdaAreaConhecimento | null;
  areasConhecimento?: OdaAreaConhecimento[];
  membros?: OdaMembro[];
  linhasPesquisa?: Array<{ titulo: string; objetivo?: string | null }>;
}

interface OdaPaginated {
  data: OdaGrupo[];
  meta?: { page: number; size: number; totalItems: number; totalPages: number };
}

export function firstOdaValue<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

const getSede = (g: OdaGrupo): OdaInstituicao | undefined => {
  if (!Array.isArray(g.instituicoes) || g.instituicoes.length === 0)
    return undefined;
  return (
    g.instituicoes.find((i) => i.tipoRelacao === 'SEDE') || g.instituicoes[0]
  );
};

export function formatInstituicao(
  sigla?: string | null,
  nome?: string | null,
): string {
  const s = (sigla || '').trim();
  const n = (nome || '').trim();
  if (!s) return n;
  if (!n) return s;
  const lowerNome = n.toLowerCase();
  const lowerSigla = s.toLowerCase();
  if (lowerNome === lowerSigla) return s;
  if (lowerNome.startsWith(`${lowerSigla} - `)) return `${s} - ${n.slice(s.length + 3).trim()}`;
  if (lowerNome.startsWith(`${lowerSigla} `)) return `${s} - ${n.slice(s.length).trim()}`;
  if (
    lowerNome.endsWith(` - ${lowerSigla}`) ||
    lowerNome.endsWith(` (${lowerSigla})`) ||
    lowerNome.endsWith(` [${lowerSigla}]`)
  ) {
    const idx = lowerNome.lastIndexOf(lowerSigla);
    const base = n.slice(0, idx).replace(/[\s\-–—:(\[]+$/, '').trim();
    if (!base) return s;
    return `${s} - ${base}`;
  }
  return `${s} - ${n}`;
}

export function normalizeOdaGrupo(g: OdaGrupo): Patrimonio {
  const sede = getSede(g);
  const lideres = (g.membros || []).filter((m) => m.eLider);
  const first = lideres[0];
  const second = lideres[1];
  const dgpId = Array.isArray(g.dgpId) ? g.dgpId[0] : g.dgpId;
  const ano = Array.isArray(g.anoFormacao) ? g.anoFormacao[0] : g.anoFormacao;
  return {
    id: g.id,
    name: g.nome || '',
    area: g.areaPredominante || '',
    institution: sede ? formatInstituicao(sede.sigla, sede.nome) : '',
    first_leader: first?.nome || '',
    first_leader_id: first?.id || first?.lattesId || '',
    second_leader: second?.nome || '',
    second_leader_id: second?.id || second?.lattesId || '',
    group_identifier: dgpId || null,
    year: ano != null ? String(ano) : null,
    institution_name: sede?.sigla || null,
    census: null,
    start_of_collection: null,
    end_of_collection: null,
    category: null,
  };
}

function extractOdaList(raw: any): {
  items: OdaGrupo[];
  totalPages?: number;
} {
  if (Array.isArray(raw)) return { items: raw as OdaGrupo[] };
  if (Array.isArray(raw?.data))
    return { items: raw.data, totalPages: raw.meta?.totalPages };
  if (Array.isArray(raw?.items)) return { items: raw.items };
  return { items: [] };
}

async function fetchOdaPage(
  page: number,
  size: number,
  signal?: AbortSignal,
): Promise<{ items: Patrimonio[]; totalPages?: number }> {
  const { data, status } = await apiOda.get<OdaPaginated | OdaGrupo[]>(
    'grupos-pesquisa/simcc',
    { params: { page, size }, signal },
  );
  if (status !== 200) throw new Error(`ODA status ${status}`);
  const { items, totalPages } = extractOdaList(data);
  return { items: items.map(normalizeOdaGrupo), totalPages };
}

async function fetchLegacyPage(
  page: number,
  signal?: AbortSignal,
): Promise<Patrimonio[]> {
  const { data, status } = await api.get('research_group', {
    params: { page },
    signal,
  });
  if (status !== 200) throw new Error(`Legacy status ${status}`);
  const arr = Array.isArray(data) ? data : data?.data;
  if (!Array.isArray(arr)) throw new Error('Legacy not array');
  return arr as Patrimonio[];
}

export const normalizeText = (s?: string | null) =>
  (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Exceção isolada: Fiocruz-BA (IGM) não possui grupos SEDE na ODA, só
 * participações. Chaves seguras (igualdade exata, sem substring/prefixo
 * genérico) para não vazar para outras instituições.
 */
const FIOCRUZ_ALIASES = new Set([
  'fiocruz',
  'fiocruz-igm',
  'instituto goncalo moniz',
  'fundacao oswaldo cruz',
]);

export function isFiocruzKey(acronymOrName?: string | null): boolean {
  return FIOCRUZ_ALIASES.has(normalizeText(acronymOrName));
}

function matchesFiocruzVinculo(i: OdaInstituicao): boolean {
  return (
    normalizeText(i.sigla) === 'fiocruz' ||
    normalizeText(i.nome) === 'instituto goncalo moniz'
  );
}

export function filterSimccGroupsByInstitution(
  raw: OdaGrupo[],
  acronymOrName?: string | null,
): OdaGrupo[] {
  const key = normalizeText(acronymOrName);
  if (!key) return [];
  const fiocruzException = isFiocruzKey(key);
  return raw.filter((g) => {
    const insts = Array.isArray(g.instituicoes) ? g.instituicoes : [];
    if (fiocruzException) {
      // Só Fiocruz: aceita qualquer vínculo Fiocruz (SEDE ou PARCEIRA).
      return insts.some(matchesFiocruzVinculo);
    }
    // Paridade com o legado (FK institution_id = sede): só grupos
    // sediados na instituição; parceiras não entram na lista.
    return insts.some(
      (i) =>
        i.tipoRelacao === 'SEDE' &&
        (normalizeText(i.sigla) === key || normalizeText(i.nome) === key),
    );
  });
}

export function countSimccGroupsBySigla(raw: OdaGrupo[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const g of raw) {
    const sede = getSede(g);
    if (!sede) continue;
    const keys = new Set(
      [normalizeText(sede.sigla), normalizeText(sede.nome)].filter(Boolean),
    );
    for (const k of keys) map.set(k, (map.get(k) ?? 0) + 1);
  }
  // Exceção Fiocruz (sem SEDE na ODA): conta participações sob as chaves
  // alias para header/listagem exibirem o total. Demais IES inalteradas.
  const fiocruzCount = raw.filter((g) =>
    (Array.isArray(g.instituicoes) ? g.instituicoes : []).some(
      matchesFiocruzVinculo,
    ),
  ).length;
  for (const alias of FIOCRUZ_ALIASES) {
    if (!map.has(alias)) map.set(alias, fiocruzCount);
  }
  return map;
}

export function lookupSimccCount(
  totals: Map<string, number> | undefined,
  acronym?: string | null,
  name?: string | null,
): number | undefined {
  if (!totals) return undefined;
  return totals.get(normalizeText(acronym)) ?? totals.get(normalizeText(name));
}

export async function fetchSimccGroupsRaw(
  signal?: AbortSignal,
): Promise<OdaGrupo[]> {
  if (!hasOdaBase()) throw new Error('ODA unavailable');
  const size = 100;
  const first = await apiOda.get<OdaPaginated>('grupos-pesquisa/simcc', {
    params: { page: 1, size },
    signal,
  });
  if (first.status !== 200) throw new Error(`ODA status ${first.status}`);
  const { items: firstItems, totalPages } = extractOdaList(first.data);
  if (firstItems.length === 0) throw new Error('ODA empty');
  const all = [...firstItems];
  const tp = Math.min(totalPages ?? 1, 100);
  const rest: number[] = [];
  for (let p = 2; p <= tp; p++) rest.push(p);
  for (let i = 0; i < rest.length; i += 4) {
    const batch = rest.slice(i, i + 4);
    const results = await Promise.all(
      batch.map((p) =>
        apiOda.get<OdaPaginated>('grupos-pesquisa/simcc', {
          params: { page: p, size },
          signal,
        }),
      ),
    );
    for (const r of results) {
      if (r.status !== 200) throw new Error(`ODA status ${r.status}`);
      const { items } = extractOdaList(r.data);
      all.push(...items);
    }
  }
  return all;
}

export async function fetchSimccGroupsByInstitution(
  acronymOrName?: string | null,
  signal?: AbortSignal,
): Promise<{ items: Patrimonio[]; fromOda: boolean }> {
  const raw = await fetchSimccGroupsRaw(signal);
  return {
    items: filterSimccGroupsByInstitution(raw, acronymOrName).map(
      normalizeOdaGrupo,
    ),
    fromOda: true,
  };
}

export async function fetchAllResearchGroups(
  signal?: AbortSignal,
): Promise<{ items: Patrimonio[]; fromOda: boolean }> {
  if (hasOdaBase()) {
    try {
      const size = 100;
      const all: Patrimonio[] = [];
      let page = 1;
      let totalPages = Infinity;
      while (page <= totalPages && page <= 100) {
        const { items, totalPages: tp } = await fetchOdaPage(page, size, signal);
        if (page === 1 && items.length === 0) throw new Error('ODA empty page 1');
        all.push(...items);
        if (tp != null) totalPages = tp;
        else if (items.length < size) break;
        if (page >= totalPages) break;
        page += 1;
      }
      if (all.length > 0) return { items: all, fromOda: true };
      throw new Error('ODA empty');
    } catch (err: any) {
      if (err?.name === 'CanceledError' || err?.name === 'AbortError') throw err;
    }
  }
  const all: Patrimonio[] = [];
  let page = 1;
  while (page <= 100) {
    const chunk = await fetchLegacyPage(page, signal);
    if (page === 1 && chunk.length === 0) return { items: [], fromOda: false };
    all.push(...chunk);
    if (chunk.length < 100) break;
    page += 1;
  }
  return { items: all, fromOda: false };
}
