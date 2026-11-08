import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Layers,
  Loader2,
  Terminal,
  User,
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Card, CardContent } from '../../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { EtlRunDetail, EtlRunStatus } from '../../../types/etl';
import { formatShortRunId, getFriendlyStatusText, getRoutineMetadata } from '../../../lib/etl-routines-catalog';
import { toast } from 'sonner';

interface EtlHeaderSummaryProps {
  run: EtlRunDetail;
  isPolling?: boolean;
  onOpenTechnicalSheet?: () => void;
}

export function EtlHeaderSummary({
  run,
  isPolling,
  onOpenTechnicalSheet,
}: EtlHeaderSummaryProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!run.started_at) return;

    const startMs = new Date(run.started_at).getTime();

    const updateTimer = () => {
      const nowMs = run.ended_at ? new Date(run.ended_at).getTime() : Date.now();
      const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();

    if (run.status === 'RUNNING' || run.status === 'ACCEPTED') {
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [run.started_at, run.ended_at, run.status]);

  const formatSecondsHuman = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSeconds = sec % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes} min e ${remainingSeconds} seg`;
    }
    return `${remainingSeconds} segundos`;
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(run.id);
    setCopiedId(true);
    toast.success('ID completo da execução copiado');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const totalSteps = run.routines?.length || Object.keys(run.steps || {}).length || 1;
  const completedSteps = Object.values(run.steps || {}).filter(
    (s) => s.status === 'SUCCEEDED',
  ).length;

  const progressPercent = Math.min(
    100,
    Math.round((completedSteps / Math.max(1, totalSteps)) * 100),
  );

  const shortId = formatShortRunId(run.id);
  const statusMeta = getFriendlyStatusText(run.status);
  const currentMeta = run.current_routine
    ? getRoutineMetadata(run.current_routine)
    : null;

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
      <CardContent className="p-6 space-y-5">
        {/* Linha Superior: Status Geral e Identificação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {run.status === 'RUNNING' && (
              <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 gap-1.5 py-1 px-3 text-xs font-semibold animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
                {statusMeta.label}
              </Badge>
            )}
            {run.status === 'SUCCEEDED' && (
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 gap-1.5 py-1 px-3 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {statusMeta.label}
              </Badge>
            )}
            {run.status === 'FAILED' && (
              <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 gap-1.5 py-1 px-3 text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                {statusMeta.label}
              </Badge>
            )}
            {run.status === 'ACCEPTED' && (
              <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 gap-1.5 py-1 px-3 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                {statusMeta.label}
              </Badge>
            )}

            {/* ID Contraído com Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 px-2.5 py-1 rounded transition-colors"
                  >
                    <span>ID: {shortId}</span>
                    {copiedId ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 text-neutral-400" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs font-mono">
                  Clique para copiar o ID completo: {run.id}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isPolling && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Sincronizando em tempo real
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            {run.triggered_by && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                Iniciado por:{' '}
                <strong className="text-neutral-800 dark:text-neutral-200 font-medium">
                  {run.triggered_by}
                </strong>
              </span>
            )}

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Tempo total:{' '}
              <strong className="text-neutral-800 dark:text-neutral-200 font-medium">
                {formatSecondsHuman(elapsedSeconds)}
              </strong>
            </span>

            {onOpenTechnicalSheet && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenTechnicalSheet}
                className="h-8 text-xs gap-1.5 text-[#07677e] dark:text-[#559FB8] border-[#559FB8]/40 hover:bg-[#559FB8]/10"
              >
                <Terminal className="w-3.5 h-3.5" />
                Auditoria e Logs Técnicos
              </Button>
            )}
          </div>
        </div>

        {/* Mensagem Humanizada de Estado */}
        <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-[#559FB8]" />
            <span className="text-xs md:text-sm text-neutral-800 dark:text-neutral-200">
              {run.status === 'RUNNING' && currentMeta ? (
                <>
                  Etapa atual:{' '}
                  <strong className="font-semibold text-[#07677e] dark:text-[#559FB8]">
                    {currentMeta.title}
                  </strong>{' '}
                  ({completedSteps + 1} de {totalSteps})
                </>
              ) : run.status === 'SUCCEEDED' ? (
                'Todas as rotinas programadas foram executadas e os dados acadêmicos estão atualizados.'
              ) : run.status === 'FAILED' ? (
                'O pipeline foi interrompido devido a uma inconformidade durante o processamento.'
              ) : (
                'Aguardando início do processamento das rotinas selecionadas.'
              )}
            </span>
          </div>
          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            {progressPercent}% concluído
          </span>
        </div>

        {/* Barra de Progresso */}
        <Progress value={progressPercent} className="h-2 bg-neutral-100 dark:bg-neutral-800" />

        {/* Mensagem de Erro se houver */}
        {run.error_message && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">Inconformidade identificada:</p>
              <p className="mt-0.5">{run.error_message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
