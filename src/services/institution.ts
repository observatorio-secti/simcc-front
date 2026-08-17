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

/**
 * Resolve os dados da instituição por Acrônimo (sigla) ou ID.
 * Dá prioridade à busca por acrônimo, permitindo busca case-insensitive,
 * com fallback para ID e correspondência de nome.
 */
export const getInstitutionByIdOrAcronym = async (
  identifier: string,
): Promise<Institution | null> => {
  if (!identifier) return null;

  const normalized = identifier.trim().toLowerCase();

  try {
    const institutions = await getInstitutions();
    if (Array.isArray(institutions) && institutions.length > 0) {
      // 1. Prioridade: busca por acrônimo (sigla)
      const foundByAcronym = institutions.find(
        (inst) => inst.acronym && inst.acronym.trim().toLowerCase() === normalized,
      );
      if (foundByAcronym) {
        return foundByAcronym;
      }

      // 2. Busca por ID
      const foundById = institutions.find(
        (inst) => inst.id && inst.id.toLowerCase() === normalized,
      );
      if (foundById) {
        return foundById;
      }

      // 3. Busca por correspondência no nome
      const foundByName = institutions.find(
        (inst) => inst.name && inst.name.trim().toLowerCase() === normalized,
      );
      if (foundByName) {
        return foundByName;
      }
    }
  } catch (error) {
    console.error('Erro ao buscar lista de instituições para resolver identificador:', error);
  }

  // 4. Fallback: tentativa direta via API caso o identificador seja um ID direto
  try {
    const data = await getInstitutionById(identifier);
    if (data && data.id) return data;
  } catch (error) {
    console.error(`Erro na chamada direta a institution/${identifier}:`, error);
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
