import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  ListFilter,
  Sparkles,
} from 'lucide-react';
import { LogLine } from '../../../types/etl';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { getRoutineMetadata } from '../../../lib/etl-routines-catalog';

interface EtlActivityFeedProps {
  logs: LogLine[];
  onOpenTechnicalSheet: () => void;
}

export function EtlActivityFeed({ logs, onOpenTechnicalSheet }: EtlActivityFeedProps) {
  // Pega os eventos mais recentes relevantes (últimos 8)
  const recentLogs = [...logs].reverse().slice(0, 8);

  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts;
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return ts;
    }
  };

  const getEventIcon = (level?: string) => {
    const lvl = (level || 'info').toLowerCase();
    if (lvl.includes('error')) {
      return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    }
    if (lvl.includes('warn')) {
      return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
    return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <Card className="border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900 overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#559FB8]" />
            Atividades Recentes do Pipeline
          </CardTitle>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Registro simplificado das ações que o sistema está executando.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenTechnicalSheet}
          className="text-xs gap-1.5 h-8 text-neutral-700 dark:text-neutral-300"
        >
          <ListFilter className="w-3.5 h-3.5" />
          Ver Todos os Registros ({logs.length})
        </Button>
      </CardHeader>

      <CardContent className="p-5">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            Aguardando início dos eventos do pipeline...
          </div>
        ) : (
          <div className="space-y-3">
            {recentLogs.map((log, index) => {
              const routineMeta = log.routine
                ? getRoutineMetadata(log.routine)
                : null;

              return (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="mt-0.5 shrink-0">{getEventIcon(log.level)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                        {routineMeta ? routineMeta.title : log.event}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>

                    {routineMeta && log.event && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                        {log.event}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
