import { api } from '../lib/api';

export interface Institution {
  id: string;
  name: string;
  count_r: string;
  count_gp: string;
  count_gpr: string;
  count_gps: string;
  count_d: string;
  count_t: string;
  acronym: string;
  researchers: string[];
  image: string | null;
  cover: string | null;
}

export interface TotalDocentesMetrics {
  researcher_count: number;
  orcid_count: number;
  scopus_count: number;
  among: number;
}

export interface BolsistaSubsidy {
  aid_quantity: string;
  call_title: string;
  funding_program_name: string;
  modality_code: string;
  category_level_code: string;
  institute_name: string;
  modality_name: string;
  scholarship_quantity: string;
}

export interface GraduateProgramSummary {
  graduate_program_id: string;
  name: string;
}

export interface PesquisadorInstitution {
  among: number;
  articles: number;
  book: number;
  book_chapters: number;
  id: string;
  name: string;
  university: string;
  lattes_id: string;
  area: string;
  lattes_10_id: string;
  abstract: string;
  city: string;
  orcid: string;
  image: string;
  graduation: string;
  patent: string;
  software: string;
  brand: string;
  lattes_update: Date;
  ufmg?: any;
  h_index: string;
  relevance_score: string;
  works_count: string;
  cited_by_count: string;
  i10_index: string;
  scopus: string;
  openalex: string;
  departament: string;
  subsidy: BolsistaSubsidy[];
  graduate_programs: GraduateProgramSummary[];
  departments: string;
}

export interface GraduateProgramItem {
  area: string;
  code: string;
  graduate_program_id: string;
  modality: string;
  name: string;
  rating: string;
  type: string;
  city: string;
  state: string;
  acronym: string;
  instituicao: string;
  url_image: string;
  region: string;
  sigla: string;
  latitude: string;
  longitude: string;
  visible: boolean;
  qtd_discente: string;
  qtd_colaborador: string;
  qtd_permanente: string;
  create_at: string;
  institution: string;
  researchers: string[];
}

export interface ResearchGroupItem {
  area: string;
  institution: string;
  first_leader: string;
  first_leader_id: string;
  second_leader: string;
  second_leader_id: string;
  name: string;
  id: string;
}

export interface BolsistaItem {
  among: number;
  satus: boolean;
  articles: number;
  book: number;
  book_chapters: number;
  id: string;
  name: string;
  university: string;
  lattes_id: string;
  area: string;
  lattes_10_id: string;
  abstract: string;
  city: string;
  orcid: string;
  image: string;
  graduation: string;
  patent: string;
  software: string;
  brand: string;
  lattes_update: Date;
  h_index: string;
  relevance_score: string;
  works_count: string;
  cited_by_count: string;
  i10_index: string;
  scopus: string;
  openalex: string;
  subsidy: BolsistaSubsidy[];
  graduate_programs: GraduateProgramSummary[];
  departments: any[];
  speaker: string;
}

/**
 * Busca todas as instituições cadastradas
 */
export const getInstitutions = async (): Promise<Institution[]> => {
  const { data } = await api.get('institution');
  return Array.isArray(data) ? data : [];
};

/**
 * Busca os dados de uma instituição específica por ID
 */
export const getInstitutionById = async (id: string): Promise<Institution> => {
  const { data } = await api.get(`institution/${id}`);
  return data;
};

const normalizeInstitutionString = (str?: string) =>
  (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const cleanAlphanumeric = (str?: string) =>
  normalizeInstitutionString(str).replace(/[^a-z0-9]/g, '');

/**
 * Resolve os dados da instituição por Acrônimo (sigla), Nome ou ID de forma 100% dinâmica.
 * Suporta correspondência exata, variações com hífen (ex: FIOCRUZ-IGM),
 * prefixos, siglas embutidas no nome e IDs diretos.
 */
export const getInstitutionByIdOrAcronym = async (
  identifier: string,
): Promise<Institution | null> => {
  if (!identifier) return null;

  let cleanIdentifier = identifier.trim();
  try {
    cleanIdentifier = decodeURIComponent(cleanIdentifier).trim();
  } catch {
    // fallback se decode falhar
  }

  const normalized = normalizeInstitutionString(cleanIdentifier);
  const alphaNormalized = cleanAlphanumeric(cleanIdentifier);

  if (!normalized && !alphaNormalized) return null;

  try {
    const institutions = await getInstitutions();
    if (Array.isArray(institutions) && institutions.length > 0) {
      // 1. Correspondência exata por ID
      const byId = institutions.find(
        (inst) => inst.id && inst.id.toLowerCase() === cleanIdentifier.toLowerCase(),
      );
      if (byId) return byId;

      // 2. Correspondência exata por Acrônimo / Sigla
      const byExactAcronym = institutions.find((inst: any) => {
        const acr = normalizeInstitutionString(inst.acronym || inst.sigla || inst.institution_acronym);
        return acr && (acr === normalized || cleanAlphanumeric(acr) === alphaNormalized);
      });
      if (byExactAcronym) return byExactAcronym;

      // 3. Correspondência exata por Nome
      const byExactName = institutions.find((inst) => {
        const name = normalizeInstitutionString(inst.name);
        return name && (name === normalized || cleanAlphanumeric(name) === alphaNormalized);
      });
      if (byExactName) return byExactName;

      // 4. Correspondência de prefixo / sufixo no acrônimo (ex: FIOCRUZ vs FIOCRUZ-IGM)
      const byAcronymVariation = institutions.find((inst: any) => {
        const acr = normalizeInstitutionString(inst.acronym || inst.sigla || inst.institution_acronym);
        if (!acr) return false;
        const acrAlpha = cleanAlphanumeric(acr);
        if (!acrAlpha || !alphaNormalized) return false;

        if (acrAlpha === alphaNormalized) return true;
        if (alphaNormalized.startsWith(acrAlpha) || acrAlpha.startsWith(alphaNormalized)) return true;

        const acrParts = acr.split(/[\s\-_/–:]+/).filter(Boolean);
        const searchParts = normalized.split(/[\s\-_/–:]+/).filter(Boolean);
        return (
          acrParts.some((p) => searchParts.includes(p)) ||
          searchParts.some((p) => acrParts.includes(p))
        );
      });
      if (byAcronymVariation) return byAcronymVariation;

      // 5. Acrônimo ou sigla no início ou formato "(SIGLA)" dentro do nome da instituição
      const byNamePattern = institutions.find((inst) => {
        const name = normalizeInstitutionString(inst.name);
        if (!name) return false;

        if (
          name.startsWith(normalized + ' ') ||
          name.startsWith(normalized + '-') ||
          name.startsWith(normalized + '–') ||
          name.startsWith(normalized + ':') ||
          name.includes(`(${normalized})`) ||
          name.includes(`[${normalized}]`)
        ) {
          return true;
        }

        const words = name.split(/[\s\-_/–:(),.]+/).filter(Boolean);
        return words.includes(normalized);
      });
      if (byNamePattern) return byNamePattern;

      // 6. Busca por substring se o termo tiver pelo menos 3 caracteres
      if (normalized.length >= 3) {
        const bySubstring = institutions.find((inst: any) => {
          const name = normalizeInstitutionString(inst.name);
          const acr = normalizeInstitutionString(inst.acronym || inst.sigla);
          return (
            (acr && (acr.includes(normalized) || normalized.includes(acr))) ||
            (name && name.includes(normalized))
          );
        });
        if (bySubstring) return bySubstring;
      }
    }
  } catch (error) {
    console.error('Erro ao buscar lista de instituições para resolver identificador:', error);
  }

  // 7. Fallback: tentativa direta via API caso o identificador seja um ID direto
  try {
    const data = await getInstitutionById(cleanIdentifier);
    if (data && data.id) return data;
  } catch (error) {
    console.error(`Erro na chamada direta a institution/${cleanIdentifier}:`, error);
  }

  return null;
};

/**
 * Métricas de pesquisadores / docentes da instituição
 */
export const getInstitutionResearcherMetrics = async (
  institutionId: string,
): Promise<TotalDocentesMetrics> => {
  const { data } = await api.get('researcher_metrics', {
    params: {
      type: '',
      term: '',
      area: '',
      graduate_program: '',
      city: '',
      institution: '',
      modality: '',
      graduation: '',
      departament: '',
      year: '1900',
      institution_id: institutionId,
    },
  });
  return Array.isArray(data) ? data[0] : data;
};

/**
 * Lista de pesquisadores / docentes da instituição com suporte a paginação backend
 */
export const getInstitutionResearchers = async (
  institutionId: string,
): Promise<PesquisadorInstitution[]> => {
  const allResearchers: PesquisadorInstitution[] = [];
  let page = 1;
  let batch: PesquisadorInstitution[] = [];
  do {
    const { data } = await api.get('researcher', {
      params: {
        terms: '',
        university: '',
        institution_id: institutionId,
        page: page,
      },
    });
    batch = Array.isArray(data) ? data : [];
    allResearchers.push(...batch);
    page++;
    if (page > 100) break;
  } while (batch.length > 0);
  return allResearchers;
};

/**
 * Programas de pós-graduação
 */
export const getInstitutionGraduatePrograms = async (): Promise<GraduateProgramItem[]> => {
  const { data } = await api.get('graduate_program_profnit', {
    params: { id: '' },
  });
  return Array.isArray(data) ? data : [];
};

/**
 * Grupos de pesquisa
 */
export const getInstitutionResearchGroups = async (): Promise<ResearchGroupItem[]> => {
  const { data } = await api.get('research_group');
  return Array.isArray(data) ? data : [];
};

/**
 * Bolsistas de produtividade / fomento
 */
export const getInstitutionBolsistas = async (): Promise<BolsistaItem[]> => {
  const { data } = await api.get('researcher/foment');
  return Array.isArray(data) ? data : [];
};
