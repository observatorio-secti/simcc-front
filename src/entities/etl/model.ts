import { z } from 'zod';
import type { AdminSchemas } from '@/api/admin';
import { isApiError } from '@/api/errors';
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

export const ETL_RUN_STATUS_OPTIONS = [
  { value: 'RUNNING', label: 'Em execução' },
  { value: 'ACCEPTED', label: 'Na fila' },
  { value: 'SUCCEEDED', label: 'Sucesso' },
  { value: 'FAILED', label: 'Falha' },
] as const;

const VALID_ETL_STATUSES = new Set<string>(
  ETL_RUN_STATUS_OPTIONS.map((o) => o.value),
);

function parsePositiveInt(raw: unknown, fallback: number): number {
  const num =
    typeof raw === 'number'
      ? raw
      : typeof raw === 'string' && raw.trim() !== ''
        ? Number(raw)
        : NaN;
  if (!Number.isFinite(num) || !Number.isInteger(num) || num < 1) {
    return fallback;
  }
  return num;
}

/** Search params de `/console/etl` validados com zod na rota. */
export const etlRunsSearchSchema = z.object({
  page: z.preprocess((v) => parsePositiveInt(v, 1), z.number().int().min(1)),
  per_page: z.preprocess(
    (v) => Math.min(100, parsePositiveInt(v, 20)),
    z.number().int().min(1).max(100),
  ),
  status: z.preprocess((v) => {
    if (typeof v !== 'string') return undefined;
    const trimmed = v.trim().toUpperCase();
    return VALID_ETL_STATUSES.has(trimmed) ? trimmed : undefined;
  }, z.string().optional()),
});

export type EtlRunsSearch = z.infer<typeof etlRunsSearchSchema>;

export function etlRunsListParams(search: EtlRunsSearch): EtlRunListParams {
  return {
    page: search.page,
    per_page: search.per_page,
    ...(search.status ? { status: search.status } : {}),
  };
}

/** Search params de `/console/etl/$runId` validados com zod na rota. */
export const etlRunDetailSearchSchema = z.object({
  tab: z.enum(['etapas', 'logs']).catch('etapas'),
  level: z.enum(['all', 'error', 'warning']).catch('all'),
  q: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() ? v.trim() : undefined),
    z.string().optional(),
  ),
});

export type EtlRunDetailSearch = z.infer<typeof etlRunDetailSearchSchema>;

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

/** Abrevia UUID de execução para exibição tabular e em títulos. */
export function formatShortRunId(runId?: string | null): string {
  if (!runId) return '#------';
  const clean = runId.replace(/[^a-zA-Z0-9]/g, '');
  return `#${clean.slice(0, 6)}`;
}

// ---------------------------------------------------------------------------
// Catálogo de rotinas (fallback amigável para `GET /etl/routines`)
// ---------------------------------------------------------------------------

export interface EtlRoutineInfo {
  id: string;
  title: string;
  shortDescription: string;
  category: string;
}

export const ROUTINE_CATALOG: Record<string, Omit<EtlRoutineInfo, 'id'>> = {
  soap_lattes: {
    title: 'Coleta de Currículos Lattes',
    shortDescription:
      'Sincroniza os currículos oficiais do CNPq com a base de dados.',
    category: 'Coleta',
  },
  lattes: {
    title: 'Coleta de Currículos Lattes',
    shortDescription:
      'Sincroniza os currículos oficiais do CNPq com a base de dados.',
    category: 'Coleta',
  },
  hop_seed: {
    title: 'Carga Inicial de Dados',
    shortDescription: 'Prepara o ambiente inicial de extração de dados.',
    category: 'Coleta',
  },
  hop_index: {
    title: 'Extração Estruturada dos Currículos',
    shortDescription:
      'Processa os arquivos Lattes e organiza produções, vínculos e artigos.',
    category: 'Tratamento',
  },
  import_capes_programs: {
    title: 'Programas de Pós-Graduação',
    shortDescription:
      'Atualiza informações e áreas dos programas de pós-graduação.',
    category: 'Coleta',
  },
  import_capes_ratings: {
    title: 'Conceitos CAPES',
    shortDescription:
      'Atualiza notas e avaliações dos programas de pós-graduação.',
    category: 'Indicadores',
  },
  import_capes_researchers: {
    title: 'Docentes da Pós-Graduação',
    shortDescription:
      'Mapeia os pesquisadores vinculados a programas de pós-graduação.',
    category: 'Consolidação',
  },
  sanitize_lattes_data: {
    title: 'Padronização e Limpeza',
    shortDescription:
      'Higieniza dados, normaliza caracteres e remove duplicidades.',
    category: 'Tratamento',
  },
  aggregate_researcher_production: {
    title: 'Consolidação de Produções',
    shortDescription:
      'Unifica produções bibliográficas, técnicas e artísticas por autor.',
    category: 'Consolidação',
  },
  calculate_researcher_indprod: {
    title: 'Produtividade de Pesquisadores',
    shortDescription: 'Calcula índices de produtividade individuais.',
    category: 'Indicadores',
  },
  calculate_graduate_program_indprod: {
    title: 'Produtividade de Programas',
    shortDescription:
      'Calcula índices agregados dos programas de pós-graduação.',
    category: 'Indicadores',
  },
  calculate_research_group_indprod: {
    title: 'Produtividade de Grupos',
    shortDescription: 'Calcula índices dos grupos de pesquisa cadastrados.',
    category: 'Indicadores',
  },
  calculate_production_index: {
    title: 'Cálculo de Indicadores',
    shortDescription:
      'Consolida os indicadores de produção científica de toda a plataforma.',
    category: 'Indicadores',
  },
  indprod: {
    title: 'Cálculo de Indicadores',
    shortDescription: 'Consolida os indicadores de produção científica.',
    category: 'Indicadores',
  },
  classify_researchers: {
    title: 'Classificação de Especialidades',
    shortDescription:
      'Identifica áreas e especialidades predominantes de cada pesquisador.',
    category: 'Consolidação',
  },
  build_search_dictionary: {
    title: 'Dicionário de Termos e Busca',
    shortDescription:
      'Otimiza o vocabulário para buscas instantâneas na plataforma.',
    category: 'Consolidação',
  },
  resolve_cnpq_lattes_id: {
    title: 'Resolução de Identificadores',
    shortDescription:
      'Confirma identificadores Lattes junto às bases de referência.',
    category: 'Tratamento',
  },
  enrich_from_openalex: {
    title: 'Enriquecimento com OpenAlex',
    shortDescription:
      'Cruza dados com a base global OpenAlex para ampliar métricas e citações.',
    category: 'Integração',
  },
  openalex: {
    title: 'Enriquecimento com OpenAlex',
    shortDescription:
      'Cruza dados com a base global OpenAlex para ampliar métricas e citações.',
    category: 'Integração',
  },
  import_program_research_lines: {
    title: 'Linhas de Pesquisa',
    shortDescription:
      'Importa as linhas de pesquisa associadas a cada programa.',
    category: 'Consolidação',
  },
  export_oda_research_groups: {
    title: 'Sincronização com ODA',
    shortDescription:
      'Atualiza grupos de pesquisa e dados de interoperabilidade do observatório.',
    category: 'Integração',
  },
  classify_article_themes: {
    title: 'Classificação Temática',
    shortDescription:
      'Categoriza publicações conforme áreas temáticas e de inovação.',
    category: 'Consolidação',
  },
  publish_to_read_db: {
    title: 'Publicação na Base de Consulta',
    shortDescription:
      'Publica os dados atualizados para acesso dos usuários na plataforma.',
    category: 'Consolidação',
  },
  refresh_search_views: {
    title: 'Atualização de Visualizações',
    shortDescription:
      'Atualiza tabelas e visualizações otimizadas de consulta.',
    category: 'Consolidação',
  },
};

function humanizeRoutineId(routineId: string): string {
  return routineId
    .split(/[_-]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function getEtlRoutineInfo(
  routineId: string,
  catalog?: readonly EtlRoutineInfo[],
): EtlRoutineInfo {
  const fromCatalog = catalog?.find((item) => item.id === routineId);
  if (fromCatalog) return fromCatalog;

  const fallback = ROUTINE_CATALOG[routineId.trim().toLowerCase()];
  if (fallback) {
    return { id: routineId, ...fallback };
  }

  return {
    id: routineId,
    title: humanizeRoutineId(routineId) || routineId,
    shortDescription:
      'Rotina de processamento e atualização integrada ao pipeline do Simcc.',
    category: 'Pipeline',
  };
}

function asNonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

/**
 * Normaliza a resposta `unknown[]` de `GET /etl/routines` com fallback para o
 * catálogo amigável local.
 */
export function normalizeEtlRoutines(raw: unknown): EtlRoutineInfo[] {
  if (!Array.isArray(raw)) {
    return Object.entries(ROUTINE_CATALOG).map(([id, meta]) => ({
      id,
      ...meta,
    }));
  }

  const seen = new Set<string>();
  const result: EtlRoutineInfo[] = [];

  for (const item of raw) {
    if (typeof item === 'string') {
      const id = item.trim();
      if (!id || seen.has(id)) continue;
      seen.add(id);
      result.push(getEtlRoutineInfo(id));
      continue;
    }

    if (item && typeof item === 'object') {
      const record = item as Record<string, unknown>;
      const id =
        asNonEmptyString(record.id) ??
        asNonEmptyString(record.name) ??
        asNonEmptyString(record.routine_id);
      if (!id || seen.has(id)) continue;
      seen.add(id);

      const fallback = getEtlRoutineInfo(id);
      result.push({
        id,
        title:
          asNonEmptyString(record.title) ??
          asNonEmptyString(record.label) ??
          fallback.title,
        shortDescription:
          asNonEmptyString(record.description) ??
          asNonEmptyString(record.short_description) ??
          fallback.shortDescription,
        category: asNonEmptyString(record.category) ?? fallback.category,
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Validação de Lattes IDs (exatamente 16 dígitos numéricos)
// ---------------------------------------------------------------------------

const LATTES_ID_PATTERN = /^\d{16}$/;

export function isValidLattesId(value: string): boolean {
  return LATTES_ID_PATTERN.test(value.trim());
}

export function parseLattesIdsInput(raw: string): {
  valid: string[];
  invalid: string[];
} {
  const tokens = raw
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];
  const seenValid = new Set<string>();
  const seenInvalid = new Set<string>();

  for (const token of tokens) {
    if (isValidLattesId(token)) {
      if (!seenValid.has(token)) {
        seenValid.add(token);
        valid.push(token);
      }
    } else if (!seenInvalid.has(token)) {
      seenInvalid.add(token);
      invalid.push(token);
    }
  }

  return { valid, invalid };
}

// ---------------------------------------------------------------------------
// Etapas e progresso
// ---------------------------------------------------------------------------

export interface EtlStepMetric {
  status?: string;
  duration_ms?: number;
  found?: number;
  succeeded?: number;
  failed?: number;
  error?: string;
  extras: Array<{ key: string; value: string }>;
}

const KNOWN_STEP_KEYS = new Set([
  'status',
  'duration_ms',
  'found',
  'succeeded',
  'failed',
  'error',
]);

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

export function parseEtlStepMetric(raw: unknown): EtlStepMetric {
  if (!raw || typeof raw !== 'object') {
    return { extras: [] };
  }
  const rec = raw as Record<string, unknown>;
  const extras: Array<{ key: string; value: string }> = [];
  for (const [key, value] of Object.entries(rec)) {
    if (KNOWN_STEP_KEYS.has(key) || value === null || value === undefined) {
      continue;
    }
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      extras.push({ key, value: String(value) });
    }
  }
  return {
    status: asNonEmptyString(rec.status),
    duration_ms: asFiniteNumber(rec.duration_ms),
    found: asFiniteNumber(rec.found),
    succeeded: asFiniteNumber(rec.succeeded),
    failed: asFiniteNumber(rec.failed),
    error: asNonEmptyString(rec.error),
    extras,
  };
}

export function etlRunProgress(
  run: Pick<EtlRun, 'status' | 'routines' | 'steps' | 'current_routine'>,
): { completed: number; total: number; percent: number } {
  const routines =
    run.routines && run.routines.length > 0
      ? run.routines
      : Object.keys(run.steps ?? {});
  const total = routines.length;

  const statusKey = runStatusKey(run.status);
  if (total === 0) {
    return {
      completed: 0,
      total: 0,
      percent: statusKey === 'succeeded' ? 100 : 0,
    };
  }

  if (statusKey === 'succeeded') {
    return { completed: total, total, percent: 100 };
  }

  let completed = 0;
  for (const routine of routines) {
    const stepStatus = runStatusKey(
      parseEtlStepMetric(run.steps?.[routine]).status,
    );
    if (stepStatus === 'succeeded' || stepStatus === 'failed') {
      completed += 1;
    }
  }

  if (completed === 0 && run.current_routine) {
    const currentIndex = routines.indexOf(run.current_routine);
    if (currentIndex > 0) {
      completed = currentIndex;
    }
  }

  const percent = Math.min(100, Math.round((completed / total) * 100));
  return { completed, total, percent };
}

// ---------------------------------------------------------------------------
// Logs
// ---------------------------------------------------------------------------

export interface EtlLogLine {
  timestamp?: string;
  level?: string;
  routine?: string;
  event?: string;
  message?: string;
  raw: Record<string, unknown>;
}

export function parseEtlLogLine(raw: Record<string, unknown>): EtlLogLine {
  return {
    timestamp: asNonEmptyString(raw.timestamp) ?? asNonEmptyString(raw.ts),
    level: asNonEmptyString(raw.level),
    routine: asNonEmptyString(raw.routine),
    event: asNonEmptyString(raw.event),
    message: asNonEmptyString(raw.message) ?? asNonEmptyString(raw.msg),
    raw,
  };
}

export function etlLogLevel(line: EtlLogLine): 'error' | 'warning' | 'info' {
  const normalized = (line.level ?? '').toLowerCase();
  if (
    normalized.includes('err') ||
    normalized.includes('crit') ||
    normalized.includes('fatal')
  ) {
    return 'error';
  }
  if (normalized.includes('warn')) {
    return 'warning';
  }
  return 'info';
}

export function formatEtlLogLineText(line: EtlLogLine): string {
  const ts = line.timestamp ? `[${line.timestamp}] ` : '';
  const lvl = `[${(line.level ?? 'INFO').toUpperCase()}] `;
  const routine = line.routine ? `[${line.routine}] ` : '';
  const body = line.message ?? line.event ?? JSON.stringify(line.raw);
  return `${ts}${lvl}${routine}${body}`;
}

export function etlTriggerErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 409) {
      return (
        error.message ||
        'Já existe uma sincronização em andamento (lock ativo). Aguarde a conclusão ou acompanhe a execução ativa.'
      );
    }
    if (error.status === 502 || error.status === 504) {
      return 'Serviço de sincronização indisponível no momento. Tente novamente em instantes.';
    }
    if (error.message) return error.message;
  }
  return error instanceof Error && error.message
    ? error.message
    : 'Não foi possível iniciar a sincronização.';
}
