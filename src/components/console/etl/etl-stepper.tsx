import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Hourglass,
  Loader2,
} from 'lucide-react';
import { StepMetric } from '../../../types/etl';
import { Button } from '../../ui/button';
import { getRoutineMetadata } from '../../../lib/etl-routines-catalog';

interface EtlStepperProps {
  routines: string[];
  steps: Record<string, StepMetric>;
  currentRoutine: string | null;
}

export function EtlStepper({ routines, steps, currentRoutine }: EtlStepperProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStepDetails = (routineName: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [routineName]: !prev[routineName],
    }));
  };

  const formatDurationHuman = (ms?: number) => {
    if (!ms && ms !== 0) return null;
    if (ms < 1000) return `${ms}ms`;
    const sec = ms / 1000;
    if (sec < 60) return `${sec.toFixed(1)}s`;
    const min = Math.floor(sec / 60);
    const remSec = Math.round(sec % 60);
    return `${min}m ${remSec}s`;
  };

  const activeRoutines =
    routines && routines.length > 0 ? routines : Object.keys(steps || {});

  if (activeRoutines.length === 0) {
    return (
      <div className="sm-card p-4 text-center text-xs text-sm-navy-600">
        Nenhuma etapa registrada.
      </div>
    );
  }

  return (
    <div className="sm-card p-5 space-y-3">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-sm-navy border-b border-sm-wave-gray pb-2">
        Etapas da Atualização ({activeRoutines.length})
      </h3>

      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
        {activeRoutines.map((routineName, idx) => {
          const stepData = steps?.[routineName] || {
            status: routineName === currentRoutine ? 'RUNNING' : 'PENDING',
          };
          const isCurrent = routineName === currentRoutine;
          const meta = getRoutineMetadata(routineName);
          const isExpanded = Boolean(expandedSteps[routineName]);
          const duration = formatDurationHuman(stepData.duration_ms);

          const hasTechnicalData =
            stepData.found !== undefined ||
            stepData.succeeded !== undefined ||
            stepData.failed !== undefined ||
            stepData.error !== undefined ||
            duration;

          return (
            <div
              key={routineName}
              className={`p-2.5 rounded border transition-colors ${
                isCurrent
                  ? 'border-sm-navy bg-sm-wash/70'
                  : stepData.status === 'SUCCEEDED'
                  ? 'border-sm-wave-gray bg-white'
                  : stepData.status === 'FAILED'
                  ? 'border-sm-red-100 bg-sm-red-100/20'
                  : 'border-sm-wave-gray bg-white opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-[11px] text-sm-navy-600 w-5">
                    #{idx + 1}
                  </span>
                  <div className="truncate">
                    <span className="text-xs font-extrabold text-sm-navy block truncate">
                      {meta.title}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isCurrent || stepData.status === 'RUNNING' ? (
                    <span className="sm-tag text-[10px] py-0.5 px-1.5 bg-sm-wash text-sm-navy flex items-center gap-1">
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      Executando
                    </span>
                  ) : stepData.status === 'SUCCEEDED' ? (
                    <span className="sm-tag text-[10px] py-0.5 px-1.5 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5 text-sm-navy" />
                      Pronto
                    </span>
                  ) : stepData.status === 'FAILED' ? (
                    <span className="sm-tag text-[10px] py-0.5 px-1.5 bg-sm-red-100 text-sm-red-700 flex items-center gap-1">
                      <AlertCircle className="w-2.5 h-2.5 text-sm-red-700" />
                      Falhou
                    </span>
                  ) : (
                    <span className="sm-tag text-[10px] py-0.5 px-1.5 bg-sm-wash text-sm-navy-600 flex items-center gap-1">
                      <Hourglass className="w-2.5 h-2.5 text-sm-navy-600" />
                      Fila
                    </span>
                  )}

                  {hasTechnicalData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStepDetails(routineName)}
                      className="h-6 w-6 p-0 text-sm-navy-600 hover:text-sm-navy"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-sm-wave-gray grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {duration && (
                    <div className="p-1.5 rounded bg-sm-wash">
                      <span className="text-[10px] text-sm-navy-600 block">Duração</span>
                      <span className="font-mono text-sm-navy font-semibold">{duration}</span>
                    </div>
                  )}
                  {stepData.found !== undefined && (
                    <div className="p-1.5 rounded bg-sm-wash">
                      <span className="text-[10px] text-sm-navy-600 block">Itens</span>
                      <span className="font-mono text-sm-navy font-semibold">{stepData.found}</span>
                    </div>
                  )}
                  {stepData.succeeded !== undefined && (
                    <div className="p-1.5 rounded bg-sm-wash">
                      <span className="text-[10px] text-sm-navy-600 block">Processados</span>
                      <span className="font-mono text-sm-navy font-semibold">{stepData.succeeded}</span>
                    </div>
                  )}
                  {stepData.failed !== undefined && stepData.failed > 0 && (
                    <div className="p-1.5 rounded bg-sm-red-100/30 text-sm-red-700">
                      <span className="text-[10px] block">Erros</span>
                      <span className="font-mono font-semibold">{stepData.failed}</span>
                    </div>
                  )}
                  {stepData.error && (
                    <div className="col-span-full p-2 rounded bg-sm-red-100/40 text-sm-red-700 font-mono text-[11px] break-all">
                      {stepData.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
