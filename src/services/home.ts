import { api } from '../lib/api';

export const getDepartamentRt = async () => {
  const { data } = await api.get('departament/rt');
  return data;
};

export const getVisaoPrograma = async () => {
  const { data } = await api.get('graduate_program_production', {
    params: {
      graduate_program_id: '0',
      year: '1900',
    },
  });
  return data;
};

export const getResearcherDadosGerais = async (year: number) => {
  const { data } = await api.get('ResearcherData/DadosGerais', {
    params: { year },
  });
  return data;
};

export const getMetricsResearcherScholarship = async () => {
  const { data } = await api.get('metrics/researcher/scholarship');
  return data;
};

export const getWordsResearcher = async () => {
  const { data } = await api.get('lists_word_researcher', {
    params: {
      graduate_program_id: '',
      researcher_id: '',
    },
  });
  return data;
};

export const getFoment = async () => {
  const { data } = await api.get('foment');
  return data;
};

export const getOutstandingResearchers = async () => {
  const { data } = await api.get('outstanding_researchers');
  return data;
};
