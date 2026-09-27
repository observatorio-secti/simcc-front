import axios from 'axios';
import { api } from '../lib/api';
import {
  Research,
  ResearchOpenAlex,
  ResearcherFilterApiResponse,
  ResearcherMetrics,
} from '../types/researcher';

export interface SearchResearchersParams {
  searchType: string;
  terms?: string;
  idGraduateProgram?: string;
  page?: number;
}

/**
 * Busca pesquisadores paginados (100 por página) de acordo com o tipo de busca selecionado.
 */
export const getSearchResearchersPage = async (
  params: SearchResearchersParams,
): Promise<Research[]> => {
  const { searchType, page = 1 } = params;
  const safeTerms = params.terms ?? '';
  const cleanTerms = safeTerms.replace(/[;|()]/g, '');
  const gradProgramId =
    params.idGraduateProgram === '0' || !params.idGraduateProgram
      ? ''
      : params.idGraduateProgram;

  let endpoint = 'researcher';
  let queryParams: Record<string, any> = { page };

  switch (searchType) {
    case 'name':
      endpoint = 'researcherName';
      queryParams = { name: cleanTerms, page };
      break;
    case 'article':
      endpoint = 'researcher';
      queryParams = {
        terms: safeTerms,
        university: '',
        type: 'ARTICLE',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'book':
      endpoint = 'researcherBook';
      queryParams = {
        term: safeTerms,
        university: '',
        type: 'BOOK',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'area':
      endpoint = 'researcherArea_specialty';
      queryParams = {
        area_specialty: safeTerms,
        university: '',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'speaker':
      endpoint = 'researcherParticipationEvent';
      queryParams = {
        term: safeTerms,
        university: '',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'patent':
      endpoint = 'researcherPatent';
      queryParams = {
        term: safeTerms,
        university: '',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'abstract':
      endpoint = 'researcher';
      queryParams = {
        terms: safeTerms,
        university: '',
        type: 'ABSTRACT',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    default:
      endpoint = 'researcher';
      queryParams = {
        terms: safeTerms,
        university: '',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
  }

  try {
    const { data } = await api.get(endpoint, { params: queryParams });
    return Array.isArray(data) ? data : [];
  } catch (error) {
    // Se a busca paginada falhar na primeira página, tenta fallback sem o parâmetro page
    if (page === 1) {
      try {
        const fallbackParams = { ...queryParams };
        delete fallbackParams.page;
        const { data } = await api.get(endpoint, { params: fallbackParams });
        return Array.isArray(data) ? data : [];
      } catch (fallbackError) {
        console.error('Erro ao buscar pesquisadores (fallback):', fallbackError);
        throw fallbackError;
      }
    }
    console.error('Erro ao buscar pesquisadores:', error);
    throw error;
  }
};

/**
 * Consulta autores na base do OpenAlex
 */
export const getOpenAlexResearchers = async (
  terms?: string,
): Promise<ResearchOpenAlex[]> => {
  if (!terms) return [];
  const cleanTerms = String(terms).replace(/[()|;]/g, '').trim();
  if (!cleanTerms) return [];

  const { data } = await axios.get('https://api.openalex.org/authors', {
    params: {
      filter: `display_name.search:${cleanTerms}`,
    },
  });

  return Array.isArray(data?.results) ? data.results : [];
};

/**
 * Busca opções de filtros disponíveis diretamente do endpoint /researcher_filter
 */
export const getResearcherFilterOptions = async (
  params?: Record<string, any>,
): Promise<ResearcherFilterApiResponse> => {
  try {
    const { data } = await api.get('researcher_filter', { params });
    return data ?? {
      area: [],
      graduation: [],
      city: [],
      institution: [],
      modality: [],
      graduate_program: [],
      departament: [],
      identity_territory: [],
    };
  } catch (error) {
    console.error('Erro ao buscar opções de filtros em /researcher_filter:', error);
    return {
      area: [],
      graduation: [],
      city: [],
      institution: [],
      modality: [],
      graduate_program: [],
      departament: [],
      identity_territory: [],
    };
  }
};

/**
 * Consulta métricas globais consolidadas dos pesquisadores em /metrics/researcher/chart
 */
export const getResearcherMetrics = async (
  params: Record<string, any>,
): Promise<ResearcherMetrics | null> => {
  try {
    const { data } = await api.get('metrics/researcher/chart', {
      params,
    });
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar métricas de pesquisador em /metrics/researcher/chart:', error);
    return null;
  }
};
