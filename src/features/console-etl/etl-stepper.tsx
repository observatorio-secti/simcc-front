import { useState } from 'react';
import { ChevronDown, ChevronUp, Layers } from 'lucide-react';
import {
  formatDuration,
  getEtlRoutineInfo,
  parseEtlStepMetric,
  type EtlRun,
} from '@/entities/etl/model';
import { RunStatusBadge } from '@/entities/etl/ui/run-status-badge';
import { cn } from '@/shared/lib/cn';
import { runStatusKey } from '@/shared/lib/design-tokens';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';

export interface EtlStepperProps {
  run: Pick<EtlRun, 'routines' | 'steps' | 'current_routine' | 'status'>;
}

/** Lista de etapas do pipeline ETL com rótulos amigáveis e métricas expandíveis. */
export function EtlStepper({ run }: EtlStepperProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const routineIds =
    run.routines && run.routines.length > 0
      ? run.routines
      : Object.keys(run.steps ?? {});

  if (routineIds.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Layers}
          title="Nenhuma etapa registrada"
          description="As etapas desta execução ainda não foram informadas pelo ETL."
        />
      </Card>
    );
  }

  function toggle(routineId: string) {
    setExpanded((prev) => ({ ...prev, [routineId]: !prev[routineId] }));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Etapas da atualização ({routineIds.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {routineIds.map((routineId, index) => {
          const metric = parseEtlStepMetric(run.steps?.[routineId]);
          const isCurrent = run.current_routine === routineId;
          const inferredStatus =
            metric.status ?? (isCurrent ? 'RUNNING' : 'PENDING');
          const statusKey = runStatusKey(inferredStatus);
          const info = getEtlRoutineInfo(routineId);

          const hasMetrics =
            metric.duration_ms !== undefined ||
            metric.found !== undefined ||
            metric.succeeded !== undefined ||
            metric.failed !== undefined ||
            metric.error !== undefined ||
            metric.extras.length > 0;

          const isExpanded = Boolean(expanded[routineId]);

          return (
            <div
              key={routineId}
              className={cn(
                'rounded-md border p-3 transition-colors',
                isCurrent && 'border-primary/60 bg-primary/5',
                statusKey === 'failed' &&
                  'border-destructive/40 bg-destructive/5',
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="mt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
                    #{index + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{info.title}</span>
                      <Badge variant="outline" size="sm">
                        {info.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {info.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {metric.duration_ms !== undefined && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDuration(metric.duration_ms)}
                    </span>
                  )}
                  <RunStatusBadge status={inferredStatus} />
                  {hasMetrics && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Ocultar métricas de ${info.title}`
                          : `Ver métricas de ${info.title}`
                      }
                      onClick={() => toggle(routineId)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="size-4" aria-hidden />
                      ) : (
                        <ChevronDown className="size-4" aria-hidden />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && hasMetrics && (
                <div className="mt-3 border-t pt-3">
                  <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    <div>
                      <dt className="text-muted-foreground">Rotina</dt>
                      <dd className="font-mono">{routineId}</dd>
                    </div>
                    {metric.duration_ms !== undefined && (
                      <div>
                        <dt className="text-muted-foreground">Duração</dt>
                        <dd className="tabular-nums">
                          {formatDuration(metric.duration_ms)} (
                          {metric.duration_ms} ms)
                        </dd>
                      </div>
                    )}
                    {metric.found !== undefined && (
                      <div>
                        <dt className="text-muted-foreground">Encontrados</dt>
                        <dd className="tabular-nums">{metric.found}</dd>
                      </div>
                    )}
                    {metric.succeeded !== undefined && (
                      <div>
                        <dt className="text-muted-foreground">Sucesso</dt>
                        <dd className="tabular-nums">{metric.succeeded}</dd>
                      </div>
                    )}
                    {metric.failed !== undefined && (
                      <div>
                        <dt className="text-muted-foreground">Falhas</dt>
                        <dd className="tabular-nums">{metric.failed}</dd>
                      </div>
                    )}
                    {metric.extras.map((extra) => (
                      <div key={extra.key}>
                        <dt className="text-muted-foreground">{extra.key}</dt>
                        <dd className="tabular-nums">{extra.value}</dd>
                      </div>
                    ))}
                  </dl>
                  {metric.error && (
                    <p className="mt-2 rounded-sm border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                      {metric.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
