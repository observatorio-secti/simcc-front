export type EtlRunStatus =
  | 'ACCEPTED'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'UNKNOWN';

export interface StepMetric {
  status: 'SUCCEEDED' | 'FAILED' | 'RUNNING' | 'PENDING';
  duration_ms?: number;
  found?: number;
  succeeded?: number;
  failed?: number;
  error?: string;
}

export interface EtlRunDetail {
  id: string;
  status: EtlRunStatus;
  started_at: string;
  ended_at: string | null;
  triggered_by: string;
  current_routine: string | null;
  routines: string[];
  lattes_ids: string[] | null;
  steps: Record<string, StepMetric>;
  error_message: string | null;
}

export interface EtlRunSummary {
  id: string;
  status: EtlRunStatus;
  started_at: string;
  ended_at: string | null;
  triggered_by: string;
  routines?: string[];
  error_message?: string | null;
}

export interface LogLine {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  event: string;
  routine?: string;
  run_id?: string;
  duration_ms?: number;
  [key: string]: any;
}

export interface RunLogsResponse {
  lines: LogLine[];
  next_offset: number;
  status: EtlRunStatus;
}

export interface TriggerRunPayload {
  routines?: string[]; // Vazio = executa todas as rotinas padrão
  lattes_ids?: string[]; // Vazio = executa para todos os pesquisadores
  triggered_by?: string; // Ex: "admin", "usuario@dominio.com"
}

export interface TriggerRunResponse {
  run_id: string;
  status: EtlRunStatus;
  message?: string;
}

export interface RoutineCatalogItem {
  id: string;
  name: string;
  description?: string;
  order?: number;
  category?: string;
}
