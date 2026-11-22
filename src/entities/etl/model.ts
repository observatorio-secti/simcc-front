import type { AdminSchemas } from '@/api/admin';
import { runStatusKey } from '@/shared/lib/design-tokens';

// Execuções do ETL, sempre pela API de admin (`/etl/*`): o navegador nunca
// fala com o ETL (ADR 0008). Tipos do OpenAPI da API de admin. A cor e o
// rótulo do status vêm de `runStatusColor` (`src/shared/lib/design-tokens.ts`).

export type EtlRun = AdminSchemas['EtlRunDetail'];
export type EtlRunList = AdminSchemas['EtlRunListResponse'];
export type EtlRunLogs = AdminSchemas['EtlRunLogsResponse'];
export type EtlRunTriggerInput = AdminSchemas['EtlRunTriggerRequest'];
export type EtlRunTriggerResult = AdminSchemas['EtlRunTriggerResponse'];

/** Parâmetros aceitos por `GET /etl/runs`. */
export interface EtlRunListParams {
  page?: number;
  per_page?: number;
  status?: string;
}

/** Parâmetros aceitos por `GET /etl/runs/{run_id}/logs`. */
export interface EtlRunLogsParams {
  offset?: number;
  limit?: number;
}

/** Enquanto o run não termina, a tela continua consultando. */
export function isEtlRunActive(status: string | null | undefined): boolean {
  const key = runStatusKey(status);
  return key === 'running' || key === 'queued';
}

/** Duração em milissegundos; sem `ended_at`, conta até `now`. */
export function etlRunDurationMs(
  run: Pick<EtlRun, 'started_at' | 'ended_at'>,
  now: number = Date.now(),
): number | null {
  const start = Date.parse(run.started_at);
  if (Number.isNaN(start)) return null;
  const end = run.ended_at ? Date.parse(run.ended_at) : now;
  if (Number.isNaN(end)) return null;
  return Math.max(0, end - start);
}

/** "45 s", "3 min 12 s", "1 h 05 min". */
export function formatDuration(ms: number | null): string {
  if (ms === null) return '—';
  const totalSeconds = Math.round(ms / 1000);
  if (totalSeconds < 60) return `${totalSeconds} s`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return seconds ? `${minutes} min ${seconds} s` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  return `${hours} h ${String(minutes % 60).padStart(2, '0')} min`;
}

/** Escopo do run: base completa ou lista de currículos. */
export function etlRunScopeLabel(run: Pick<EtlRun, 'lattes_ids'>): string {
  const count = run.lattes_ids?.length ?? 0;
  if (count === 0) return 'Base completa';
  return count === 1 ? '1 currículo' : `${count} currículos`;
}
