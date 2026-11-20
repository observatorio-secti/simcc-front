import { useQuery } from '@tanstack/react-query';
import {
  getDepartamentRt,
  getVisaoPrograma,
  getResearcherDadosGerais,
  getMetricsResearcherScholarship,
  getWordsResearcher,
  getFoment,
  getOutstandingResearchers,
} from '../../../services/home';

export const useDepartamentRt = () => {
  return useQuery({
    queryKey: ['departament-rt'],
    queryFn: getDepartamentRt,
  });
};

export const useVisaoPrograma = () => {
  return useQuery({
    queryKey: ['visao-programa'],
    queryFn: getVisaoPrograma,
  });
};

export const useResearcherDadosGerais = (year: number) => {
  return useQuery({
    queryKey: ['researcher-dados-gerais', year],
    queryFn: () => getResearcherDadosGerais(year),
  });
};

export const useMetricsScholarship = () => {
  return useQuery({
    queryKey: ['metrics-scholarship'],
    queryFn: getMetricsResearcherScholarship,
  });
};

export const useWordsResearcher = () => {
  return useQuery({
    queryKey: ['words-researcher'],
    queryFn: getWordsResearcher,
  });
};

export const useFoment = () => {
  return useQuery({
    queryKey: ['foment'],
    queryFn: getFoment,
  });
};

export const useOutstandingResearchers = () => {
  return useQuery({
    queryKey: ['outstanding-researchers'],
    queryFn: getOutstandingResearchers,
  });
};
