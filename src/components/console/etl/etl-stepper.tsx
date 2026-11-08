import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Hourglass,
  Layers,
  Loader2,
  Workflow,
} from 'lucide-react';
import { StepMetric } from '../../../types/etl';
import { Badge } from '../../ui/badge';
import { Card, CardContent } from '../../ui/card';
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
    if (sec < 60) return `${sec.toFixed(1)} segundos`;
    const min = Math.floor(sec / 60);
    const remSec = Math.round(sec % 60);
    return `${min} min e ${remSec} seg`;
  };

  const renderStatusBadge = (status: StepMetric['status'], isCurrent: boolean) => {
    if (isCurrent || status === 'RUNNING') {
      return (
        <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 text-xs font-medium py-0.5 animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin mr-1 text-blue-500" />
          Processando...
        </Badge>
      );
    }
    switch (status) {
      case 'SUCCEEDED':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 text-xs font-medium py-0.5">
            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
            Concluído
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 text-xs font-medium py-0.5">
            <AlertCircle className="w-3 h-3 mr-1 text-rose-500" />
            Falhou
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="outline" className="text-neutral-500 text-xs font-normal py-0.5">
            <Hourglass className="w-3 h-3 mr-1 text-neutral-400" />
            Aguardando
          </Badge>
        );
    }
  };

  const activeRoutines =
    routines && routines.length > 0 ? routines : Object.keys(steps || {});

  if (activeRoutines.length === 0) {
    return (
      <Card className="border-neutral-200 dark:border-neutral-800 p-6 text-center text-xs text-neutral-500">
        Nenhuma etapa programada para esta execução.
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Workflow className="w-4 h-4 text-[#559FB8]" />
          Sequência de Etapas ({activeRoutines.length})
        </h3>
      </div>

      <div className="space-y-2.5">
        {activeRoutines.map((routineName, idx) => {
          const stepData = steps?.[routineName] || {
            status: routineName === currentRoutine ? 'RUNNING' : 'PENDING',
          };
          const isCurrent = routineName === currentRoutine;
          const meta = getRoutineMetadata(routineName);
          const Icon = meta.icon;
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
              className={`p-4 rounded-xl border transition-all ${
                isCurrent
                  ? 'border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm'
                  : stepData.status === 'SUCCEEDED'
                  ? 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                  : stepData.status === 'FAILED'
                  ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20'
                  : 'border-neutral-200 dark:border-neutral-800/80 bg-neutral-50/40 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Ícone, Nome em Português e Categoria */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300'
                        : stepData.status === 'SUCCEEDED'
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                        : stepData.status === 'FAILED'
                        ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
                        : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-neutral-400">
                        Etapa {idx + 1}
                      </span>
                      <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {meta.title}
                      </h4>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                      {meta.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Status e Ação de Expansão */}
                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                  {renderStatusBadge(stepData.status, isCurrent)}

                  {hasTechnicalData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStepDetails(routineName)}
                      className="h-7 px-2 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      {isExpanded ? (
                        <>
                          Menos <ChevronUp className="w-3 h-3 ml-1" />
                        </>
                      ) : (
                        <>
                          Detalhes <ChevronDown className="w-3 h-3 ml-1" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Detalhes Técnicos Expandíveis (Progressive Disclosure) */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {duration && (
                    <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-800/60">
                      <span className="text-[11px] text-neutral-400 block">Duração</span>
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                        {duration}
                      </span>
                    </div>
                  )}

                  {stepData.found !== undefined && (
                    <div className="p-2 rounded bg-neutral-50 dark:bg-neutral-800/60">
                      <span className="text-[11px] text-neutral-400 block">Itens Localizados</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {stepData.found}
                      </span>
                    </div>
                  )}

                  {stepData.succeeded !== undefined && (
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                      <span className="text-[11px] block">Processados com Sucesso</span>
                      <span className="font-semibold">{stepData.succeeded}</span>
                    </div>
                  )}

                  {stepData.failed !== undefined && stepData.failed > 0 && (
                    <div className="p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300">
                      <span className="text-[11px] block">Inconformidades</span>
                      <span className="font-semibold">{stepData.failed}</span>
                    </div>
                  )}

                  {stepData.error && (
                    <div className="col-span-full mt-1 p-2.5 rounded bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 font-mono text-xs break-all">
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
