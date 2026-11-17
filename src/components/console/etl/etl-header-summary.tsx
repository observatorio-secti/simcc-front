import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Terminal,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { EtlRunDetail } from '../../../types/etl';
import { getFriendlyStatusText, getRoutineMetadata } from '../../../lib/etl-routines-catalog';

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
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = sec % 60;
    if (minutes > 0) {
      return `${minutes} min e ${remainingSeconds} seg`;
    }
    return `${remainingSeconds} seg`;
  };

  const totalSteps = run.routines?.length || Object.keys(run.steps || {}).length || 1;
  const completedSteps = Object.values(run.steps || {}).filter(
    (s) => s.status === 'SUCCEEDED',
  ).length;

  const progressPercent = Math.min(
    100,
    Math.round((completedSteps / Math.max(1, totalSteps)) * 100),
  );

  const statusMeta = getFriendlyStatusText(run.status);
  const currentMeta = run.current_routine
    ? getRoutineMetadata(run.current_routine)
    : null;

  return (
    <div className="sm-card p-5 space-y-4">
      {/* Linha Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sm-wave-gray pb-3">
        <div className="flex items-center gap-2">
          {run.status === 'RUNNING' ? (
            <span className="sm-tag font-semibold flex items-center gap-1.5 bg-sm-wash text-sm-navy">
              <Loader2 className="w-3 h-3 animate-spin text-sm-navy" />
              Sincronização em andamento
            </span>
          ) : run.status === 'SUCCEEDED' ? (
            <span className="sm-tag sm-tag--strong font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-white" />
              Atualizado
            </span>
          ) : run.status === 'FAILED' ? (
            <span className="sm-tag bg-sm-red-100 text-sm-red-700 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3 text-sm-red-700" />
              Incompleto
            </span>
          ) : (
            <span className="sm-tag font-semibold">
              {statusMeta.label}
            </span>
          )}

          <span className="text-xs text-sm-navy-600 font-mono">
            Início: {new Date(run.started_at).toLocaleTimeString('pt-BR')}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-sm-navy-600">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Duração: <b>{formatSecondsHuman(elapsedSeconds)}</b>
          </span>

          {onOpenTechnicalSheet && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTechnicalSheet}
              className="h-7 text-xs border-sm-wave-gray text-sm-navy gap-1"
            >
              <Terminal className="w-3 h-3" />
              Logs técnicos
            </Button>
          )}
        </div>
      </div>

      {/* Andamento */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-sm-navy font-semibold">
            {run.status === 'RUNNING' && currentMeta ? (
              <>Etapa: {currentMeta.title} ({completedSteps + 1} de {totalSteps})</>
            ) : run.status === 'SUCCEEDED' ? (
              'Todas as rotinas foram concluídas com sucesso.'
            ) : run.status === 'FAILED' ? (
              'A sincronização foi interrompida com inconformidades.'
            ) : (
              'Aguardando início do processamento.'
            )}
          </span>
          <span className="font-mono font-extrabold text-sm-navy">
            {progressPercent}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-1.5 bg-sm-wash [&>div]:bg-sm-navy" />
      </div>

      {run.error_message && (
        <div className="p-3 bg-sm-red-100/40 border border-sm-red-100 rounded text-xs text-sm-red-700">
          <b>Inconformidade:</b> {run.error_message}
        </div>
      )}
    </div>
  );
}
