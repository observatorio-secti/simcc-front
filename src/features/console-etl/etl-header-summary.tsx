import { useEffect, useState, type ReactNode } from 'react';
import {
  etlRunDurationMs,
  etlRunProgress,
  etlRunScopeLabel,
  formatDuration,
  formatShortRunId,
  getEtlRoutineInfo,
  isEtlRunActive,
  type EtlRun,
} from '@/entities/etl/model';
import { RunStatusBadge } from '@/entities/etl/ui/run-status-badge';
import { cn } from '@/shared/lib/cn';
import { runStatusColor } from '@/shared/lib/design-tokens';
import { formatDateTime } from '@/shared/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';

function SummaryFact({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="truncate text-sm">{children}</dd>
    </div>
  );
}

/** Cabeçalho resumo de uma execução do ETL com timer em tempo real e progresso. */
export function EtlHeaderSummary({ run }: { run: EtlRun }) {
  const active = isEtlRunActive(run.status);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1_000);
    return () => clearInterval(interval);
  }, [active]);

  const progress = etlRunProgress(run);
  const statusColor = runStatusColor(run.status);
  const duration = formatDuration(
    etlRunDurationMs(run, active ? now : undefined),
  );

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle className="font-mono text-base">
            Execução {formatShortRunId(run.id)}
          </CardTitle>
          <RunStatusBadge status={run.status} />
        </div>
        {active && run.current_routine && (
          <span className="text-xs text-muted-foreground">
            Rotina atual: {getEtlRoutineInfo(run.current_routine).title}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {progress.total > 0
                ? `${progress.completed} de ${progress.total} etapas`
                : 'Progresso da execução'}
            </span>
            <span className="tabular-nums">{progress.percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso da execução"
            className="h-2 w-full overflow-hidden rounded-full bg-secondary"
          >
            <div
              className={cn(
                'h-full transition-all duration-300',
                statusColor.bg,
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryFact label="Início">
            <span className="tabular-nums">
              {formatDateTime(run.started_at)}
            </span>
          </SummaryFact>
          <SummaryFact label={active ? 'Em execução há' : 'Duração'}>
            <span data-testid="run-duration" className="tabular-nums">
              {duration}
            </span>
          </SummaryFact>
          <SummaryFact label="Escopo">{etlRunScopeLabel(run)}</SummaryFact>
          <SummaryFact label="Disparado por">
            <span title={run.triggered_by}>{run.triggered_by || '—'}</span>
          </SummaryFact>
        </dl>

        {run.error_message && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm break-words text-destructive"
          >
            {run.error_message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
