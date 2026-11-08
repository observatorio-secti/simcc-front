import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  Hourglass,
  Layers,
  Loader2,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { StepMetric } from '../../../types/etl';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';

interface EtlStepperProps {
  routines: string[];
  steps: Record<string, StepMetric>;
  currentRoutine: string | null;
}

export function EtlStepper({ routines, steps, currentRoutine }: EtlStepperProps) {
  const formatDuration = (ms?: number) => {
    if (!ms && ms !== 0) return null;
    if (ms < 1000) return `${ms}ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const min = Math.floor(sec / 60);
    const remSec = Math.round(sec % 60);
    return `${min}m ${remSec}s`;
  };

  // Ícone por status do step
  const renderStatusIcon = (status: StepMetric['status']) => {
    switch (status) {
      case 'RUNNING':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'SUCCEEDED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      case 'PENDING':
      default:
        return <Hourglass className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getStepBorderClass = (status: StepMetric['status']) => {
    switch (status) {
      case 'RUNNING':
        return 'border-blue-400 dark:border-blue-700 bg-blue-50/40 dark:bg-blue-950/20';
      case 'SUCCEEDED':
        return 'border-emerald-200 dark:border-emerald-800/60 bg-white dark:bg-neutral-900';
      case 'FAILED':
        return 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20';
      case 'PENDING':
      default:
        return 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 opacity-75';
    }
  };

  // Se não houver rotinas especificadas, usa as chaves presentes em steps
  const activeRoutines =
    routines && routines.length > 0 ? routines : Object.keys(steps || {});

  if (activeRoutines.length === 0) {
    return (
      <Card className="border-neutral-200 dark:border-neutral-800 p-6 text-center text-xs text-neutral-500">
        Nenhuma etapa registrada para esta execução.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-[#559FB8]" />
          Etapas do Pipeline ({activeRoutines.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {activeRoutines.map((routineName, idx) => {
          const stepData = steps?.[routineName] || {
            status: routineName === currentRoutine ? 'RUNNING' : 'PENDING',
          };
          const isCurrent = routineName === currentRoutine;
          const duration = formatDuration(stepData.duration_ms);

          return (
            <div
              key={routineName}
              className={`p-3.5 rounded-lg border transition-all ${getStepBorderClass(
                stepData.status,
              )}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {/* Lado Esquerdo: Número da etapa, Ícone e Nome da rotina */}
                <div className="flex items-center gap-3">
                  <div className="shrink-0 flex items-center justify-center">
                    {renderStatusIcon(stepData.status)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-neutral-400">
                        #{idx + 1}
                      </span>
                      <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100 font-mono">
                        {routineName}
                      </span>
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-[10px] py-0 px-1.5 font-semibold animate-pulse"
                        >
                          Ativa
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado Direito: Métricas (Duração, Found, Succeeded, Failed) */}
                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  {duration && (
                    <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded font-mono">
                      <Clock className="w-3 h-3" />
                      {duration}
                    </span>
                  )}

                  {stepData.found !== undefined && (
                    <Badge variant="outline" className="text-[11px] font-normal py-0">
                      Encontrados:{' '}
                      <strong className="font-mono ml-1">{stepData.found}</strong>
                    </Badge>
                  )}

                  {stepData.succeeded !== undefined && (
                    <Badge
                      variant="outline"
                      className="text-[11px] font-normal py-0 border-emerald-300 text-emerald-700 dark:text-emerald-400"
                    >
                      Sucesso:{' '}
                      <strong className="font-mono ml-1">{stepData.succeeded}</strong>
                    </Badge>
                  )}

                  {stepData.failed !== undefined && stepData.failed > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-[11px] font-normal py-0"
                    >
                      Falhas:{' '}
                      <strong className="font-mono ml-1">{stepData.failed}</strong>
                    </Badge>
                  )}
                </div>
              </div>

              {/* Erro da etapa se existir */}
              {stepData.error && (
                <div className="mt-2.5 p-2 bg-rose-100/60 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded text-xs text-rose-800 dark:text-rose-200 font-mono break-all">
                  <strong>Erro:</strong> {stepData.error}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
