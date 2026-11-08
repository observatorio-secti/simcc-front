import { apiEtl, baseURLEtl } from '../lib/api';
import {
  EtlRunDetail,
  EtlRunSummary,
  RoutineCatalogItem,
  RunLogsResponse,
  TriggerRunPayload,
  TriggerRunResponse,
} from '../types/etl';

export const etlService = {
  /**
   * Checagem de disponibilidade do serviço SimCC ETL
   */
  async getHealth(): Promise<{ status: string }> {
    const response = await apiEtl.get<{ status: string }>('health');
    return response.data;
  },

  /**
   * Lista o catálogo de todas as rotinas registradas no pipeline
   */
  async getRoutines(): Promise<RoutineCatalogItem[]> {
    const response = await apiEtl.get<RoutineCatalogItem[] | string[]>('routines');
    const data = response.data;

    // Normaliza caso venha como array simples de strings ou array de objetos
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        if (typeof item === 'string') {
          return {
            id: item,
            name: item,
            order: index + 1,
          };
        }
        return item;
      });
    }

    return [];
  },

  /**
   * Dispara um novo pipeline de ETL em background (HTTP 202 Accepted)
   */
  async triggerRun(payload: TriggerRunPayload): Promise<TriggerRunResponse> {
    const response = await apiEtl.post<TriggerRunResponse>('runs', payload);
    return response.data;
  },

  /**
   * Obtém histórico paginado das últimas execuções
   */
  async getRuns(limit = 20, offset = 0): Promise<EtlRunSummary[]> {
    const response = await apiEtl.get<EtlRunSummary[]>('runs', {
      params: { limit, offset },
    });
    return response.data;
  },

  /**
   * Busca estado atualizado, métricas e etapas de uma execução específica
   */
  async getRunDetail(runId: string): Promise<EtlRunDetail> {
    const response = await apiEtl.get<EtlRunDetail>(`runs/${runId}`);
    return response.data;
  },

  /**
   * Obtém logs estruturados incrementais paginados com controle de offset
   */
  async getRunLogs(
    runId: string,
    offset = 0,
    limit = 300,
  ): Promise<RunLogsResponse> {
    const response = await apiEtl.get<RunLogsResponse>(`runs/${runId}/logs`, {
      params: { offset, limit },
    });
    return response.data;
  },

  /**
   * Gera a URL completa para download direto do arquivo bruto .jsonl
   */
  getDownloadUrl(runId: string): string {
    const cleanBase = baseURLEtl.endsWith('/') ? baseURLEtl : `${baseURLEtl}/`;
    return `${cleanBase}dashboard/api/runs/${runId}/download`;
  },
};
