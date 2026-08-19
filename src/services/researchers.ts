import axios from 'axios';
import { api } from '../lib/api';
import { Research, ResearchOpenAlex } from '../types/researcher';

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
  const { searchType, terms = '', idGraduateProgram = '', page = 1 } = params;
  const cleanTerms = terms.replace(/[;|()]/g, '');
  const gradProgramId = idGraduateProgram === '0' ? '' : idGraduateProgram;

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
        terms,
        university: '',
        type: 'ARTICLE',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'book':
      endpoint = 'researcherBook';
      queryParams = {
        term: terms,
        university: '',
        type: 'BOOK',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'area':
      endpoint = 'researcherArea_specialty';
      queryParams = {
        area_specialty: terms,
        university: '',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'speaker':
      endpoint = 'researcherParticipationEvent';
      queryParams = {
        term: terms,
        university: '',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'patent':
      endpoint = 'researcherPatent';
      queryParams = {
        term: terms,
        university: '',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    case 'abstract':
      endpoint = 'researcher';
      queryParams = {
        terms,
        university: '',
        type: 'ABSTRACT',
        graduate_program_id: gradProgramId,
        page,
      };
      break;
    default:
      endpoint = 'researcher';
      queryParams = {
        terms,
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
  const cleanTerms = terms.replace(/[()|;]/g, '').trim();
  if (!cleanTerms) return [];

  const { data } = await axios.get('https://api.openalex.org/authors', {
    params: {
      filter: `display_name.search:${cleanTerms}`,
    },
  });

  return Array.isArray(data?.results) ? data.results : [];
};
