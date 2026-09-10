import { useQuery } from '@tanstack/react-query';
import {
  getAllResearchers,
  getListagemExportData,
} from '../services/listagens';
import { Research } from '../types/researcher';

/**
 * Hook para buscar dados completos da listagem da aba ativa para exportação em CSV.
 * O React Query gerencia cache por aba com staleTime de 5 minutos.
 */
export const useListagemExport = (tab: string) => {
  return useQuery<any[], Error>({
    queryKey: ['listagem-export', tab],
    queryFn: () => getListagemExportData(tab),
    enabled: Boolean(tab),
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });
};

/**
 * Hook para buscar todos os pesquisadores cadastrados.
 */
export const useAllResearchers = (enabled: boolean = true) => {
  return useQuery<Research[], Error>({
    queryKey: ['all-researchers'],
    queryFn: getAllResearchers,
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });
};
