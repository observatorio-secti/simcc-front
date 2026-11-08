import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Loader2,
  PlayCircle,
  User,
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { Card, CardContent } from '../../ui/card';
import { EtlRunDetail, EtlRunStatus } from '../../../types/etl';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EtlHeaderSummaryProps {
  run: EtlRunDetail;
  isPolling?: boolean;
}

export function EtlHeaderSummary({ run, isPolling }: EtlHeaderSummaryProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Calcula tempo decorrido ao vivo caso a execução esteja rodando
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

  const formatSeconds = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const remainingSeconds = sec % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  // Cálculo de progresso de etapas
  const totalSteps = run.routines?.length || Object.keys(run.steps || {}).length || 1;
  const completedSteps = Object.values(run.steps || {}).filter(
    (s) => s.status === 'SUCCEEDED',
  ).length;

  const progressPercent = Math.min(
    100,
    Math.round((completedSteps / Math.max(1, totalSteps)) * 100),
  );

  const getStatusBadge = (status: EtlRunStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <Badge className="bg-blue-500/15 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 gap-1.5 py-1 px-2.5 text-xs font-semibold animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Em andamento...
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge className="bg-amber-500/15 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 gap-1.5 py-1 px-2.5 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Aguardando Lock / Fila
          </Badge>
        );
      case 'SUCCEEDED':
        return (
          <Badge className="bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 gap-1.5 py-1 px-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Concluído com Sucesso
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-rose-500/15 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 gap-1.5 py-1 px-2.5 text-xs font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            Falha na Execução
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-neutral-500 gap-1.5 py-1 px-2.5 text-xs">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden bg-white dark:bg-neutral-900">
      <CardContent className="p-5 space-y-4">
        {/* Linha Superior: Status e Metadados */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {getStatusBadge(run.status)}
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
              ID: {run.id}
            </span>
            {isPolling && (
              <span className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Sync
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            {run.triggered_by && (
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                Disparado por:{' '}
                <strong className="text-neutral-800 dark:text-neutral-200">
                  {run.triggered_by}
                </strong>
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              Tempo:{' '}
              <strong className="font-mono text-neutral-800 dark:text-neutral-200">
                {formatSeconds(elapsedSeconds)}
              </strong>
            </span>
          </div>
        </div>

        {/* Barra de Progresso do Pipeline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#559FB8]" />
              {run.current_routine ? (
                <>
                  Etapa {completedSteps + 1} de {totalSteps}:{' '}
                  <code className="text-[#07677e] dark:text-[#559FB8] font-mono font-semibold">
                    {run.current_routine}
                  </code>
                </>
              ) : run.status === 'SUCCEEDED' ? (
                'Todas as etapas foram concluídas'
              ) : (
                `Progresso geral: ${completedSteps} de ${totalSteps} etapas`
              )}
            </span>
            <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
              {progressPercent}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-neutral-100 dark:bg-neutral-800" />
        </div>

        {/* Mensagem de Erro Geral se houver */}
        {run.error_message && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-md text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="font-semibold">Erro no processamento:</p>
              <p className="font-mono mt-0.5 break-all">{run.error_message}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
