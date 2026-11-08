import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { etlService } from '../services/etl';
import {
  EtlRunDetail,
  EtlRunSummary,
  LogLine,
  RoutineCatalogItem,
  RunLogsResponse,
  TriggerRunPayload,
  TriggerRunResponse,
} from '../types/etl';

const POLL_INTERVAL = Number(import.meta.env.VITE_ETL_POLL_INTERVAL_MS) || 2500;

/**
 * Hook para verificar a saúde da API do ETL
 */
export function useEtlHealth() {
  return useQuery({
    queryKey: ['etl', 'health'],
    queryFn: () => etlService.getHealth(),
    retry: 1,
    refetchInterval: 30000,
  });
}

/**
 * Hook para carregar o catálogo de rotinas registradas
 */
export function useEtlRoutines() {
  return useQuery<RoutineCatalogItem[]>({
    queryKey: ['etl', 'routines'],
    queryFn: () => etlService.getRoutines(),
    staleTime: 1000 * 60 * 10, // 10 minutos de cache
  });
}

/**
 * Hook para listar o histórico paginado de execuções
 */
export function useEtlRunsHistory(limit = 20, offset = 0) {
  return useQuery<EtlRunSummary[]>({
    queryKey: ['etl', 'runs', limit, offset],
    queryFn: () => etlService.getRuns(limit, offset),
    refetchInterval: 10000, // Atualiza a cada 10s para refletir novos runs
  });
}

/**
 * Hook para disparar um novo pipeline de ETL em background
 */
export function useTriggerEtlRun() {
  const queryClient = useQueryClient();

  return useMutation<TriggerRunResponse, any, TriggerRunPayload>({
    mutationFn: (payload: TriggerRunPayload) => etlService.triggerRun(payload),
    onSuccess: (data) => {
      toast.success('Pipeline de ETL iniciado com sucesso!', {
        description: `Run ID: ${data.run_id}`,
      });
      // Invalida o histórico para incluir a nova run
      queryClient.invalidateQueries({ queryKey: ['etl', 'runs'] });
    },
    onError: (err: any) => {
      const status = err?.response?.status;
      const detail = err?.response?.data?.detail || err?.response?.data?.message;

      if (status === 409 || err?.message?.includes('409')) {
        toast.error('Já existe uma rotina de ETL em execução!', {
          description:
            detail ||
            'O PostgreSQL Advisory Lock está ativo. Aguarde o pipeline atual finalizar para iniciar outro.',
        });
      } else {
        toast.error('Erro ao iniciar o pipeline de ETL', {
          description: detail || err.message || 'Falha de comunicação com o servidor.',
        });
      }
    },
  });
}

/**
 * Hook de monitoramento em tempo real de uma execução com polling inteligente
 */
export function useEtlRunMonitor(runId: string | null) {
  const [run, setRun] = useState<EtlRunDetail | null>(null);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef<number>(0);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef<boolean>(false);
  const queryClient = useQueryClient();

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const fetchRunStatusAndLogs = useCallback(async () => {
    if (!runId || isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // 1. Busca detalhes e steps da execução
      const dataRun = await etlService.getRunDetail(runId);
      setRun(dataRun);
      setError(null);

      // Se finalizou (SUCCEEDED ou FAILED), encerra o polling
      if (dataRun.status === 'SUCCEEDED' || dataRun.status === 'FAILED') {
        stopPolling();
        queryClient.invalidateQueries({ queryKey: ['etl', 'runs'] });
      }

      // 2. Busca logs estruturados incrementais usando offset
      const dataLogs: RunLogsResponse = await etlService.getRunLogs(
        runId,
        offsetRef.current,
        300,
      );

      if (dataLogs && Array.isArray(dataLogs.lines) && dataLogs.lines.length > 0) {
        setLogs((prev) => [...prev, ...dataLogs.lines]);
        offsetRef.current = dataLogs.next_offset;
      }
    } catch (err: any) {
      console.error('Falha ao sincronizar dados da execução do ETL:', err);
      setError(err?.response?.data?.detail || err.message || 'Falha ao buscar status do ETL');
    } finally {
      isFetchingRef.current = false;
    }
  }, [runId, stopPolling, queryClient]);

  useEffect(() => {
    if (!runId) {
      setRun(null);
      setLogs([]);
      offsetRef.current = 0;
      stopPolling();
      return;
    }

    // Reset para novo monitoramento
    setRun(null);
    setLogs([]);
    offsetRef.current = 0;
    setError(null);
    setIsLoading(true);

    fetchRunStatusAndLogs().finally(() => {
      setIsLoading(false);
    });

    // Inicia polling
    setIsPolling(true);
    pollTimerRef.current = setInterval(fetchRunStatusAndLogs, POLL_INTERVAL);

    return () => {
      stopPolling();
    };
  }, [runId, fetchRunStatusAndLogs, stopPolling]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const refetchNow = useCallback(() => {
    return fetchRunStatusAndLogs();
  }, [fetchRunStatusAndLogs]);

  return {
    run,
    logs,
    isLoading,
    isPolling,
    error,
    clearLogs,
    refetchNow,
    stopPolling,
  };
}
