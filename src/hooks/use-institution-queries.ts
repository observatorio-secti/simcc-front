import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  getInstitutions,
  getInstitutionByIdOrAcronym,
  getInstitutionResearcherMetrics,
  getInstitutionResearchers,
  getInstitutionGraduatePrograms,
  getInstitutionResearchGroups,
  getInstitutionResearchGroupMetrics,
  getInstitutionBolsistas,
  getInstitutionBolsistaScholarshipMetrics,
  PesquisadorInstitution,
  ResearchGroupItem,
} from '../services/institution';

export const useInstitutions = () => {
  return useQuery({
    queryKey: ['institutions'],
    queryFn: getInstitutions,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
};

export const useInstitution = (identifier?: string) => {
  return useQuery({
    queryKey: ['institution', identifier],
    queryFn: () => getInstitutionByIdOrAcronym(identifier!),
    enabled: !!identifier,
    staleTime: 1000 * 60 * 10,
  });
};

export const useInstitutionResearcherMetrics = (institutionId?: string) => {
  return useQuery({
    queryKey: ['institution-researcher-metrics', institutionId],
    queryFn: () => getInstitutionResearcherMetrics(institutionId!),
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInstitutionResearchers = (institutionId?: string, page: number = 1) => {
  return useQuery({
    queryKey: ['institution-researchers', institutionId, page],
    queryFn: () => getInstitutionResearchers(institutionId!, page),
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook de busca paginada sob demanda para pesquisadores/docentes de uma instituição (100 por página)
 */
export const useInstitutionResearchersInfinite = (institutionId?: string) => {
  return useInfiniteQuery<PesquisadorInstitution[], Error>({
    queryKey: ['institution-researchers-infinite', institutionId],
    queryFn: ({ pageParam = 1 }) =>
      getInstitutionResearchers(institutionId!, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage || lastPage.length < 100) return undefined;
      return (lastPageParam as number) + 1;
    },
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useInstitutionGraduatePrograms = () => {
  return useQuery({
    queryKey: ['institution-graduate-programs'],
    queryFn: getInstitutionGraduatePrograms,
    staleTime: 1000 * 60 * 10,
  });
};

export const useInstitutionResearchGroups = (institutionId?: string, page: number = 1) => {
  return useQuery({
    queryKey: ['institution-research-groups', institutionId, page],
    queryFn: () => getInstitutionResearchGroups(institutionId, page),
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
};

/**
 * Hook de busca paginada sob demanda para grupos de pesquisa de uma instituição (100 por página)
 */
export const useInstitutionResearchGroupsInfinite = (institutionId?: string) => {
  return useInfiniteQuery<ResearchGroupItem[], Error>({
    queryKey: ['institution-research-groups-infinite', institutionId],
    queryFn: ({ pageParam = 1 }) =>
      getInstitutionResearchGroups(institutionId, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage || lastPage.length < 100) return undefined;
      return (lastPageParam as number) + 1;
    },
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useInstitutionResearchGroupMetrics = (institutionId?: string) => {
  return useQuery({
    queryKey: ['institution-research-group-metrics', institutionId],
    queryFn: () => getInstitutionResearchGroupMetrics(institutionId),
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useInstitutionBolsistas = (institutionId?: string) => {
  return useQuery({
    queryKey: ['institution-bolsistas', institutionId],
    queryFn: () => getInstitutionBolsistas(institutionId),
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useInstitutionBolsistaScholarshipMetrics = (institutionId?: string) => {
  return useQuery({
    queryKey: ['institution-bolsista-scholarship-metrics', institutionId],
    queryFn: () => getInstitutionBolsistaScholarshipMetrics(institutionId),
    enabled: !!institutionId,
    staleTime: 1000 * 60 * 10,
  });
};
