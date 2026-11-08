import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Filter,
  Search,
  Terminal,
  Trash2,
  X,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { LogLine } from '../../../types/etl';
import { etlService } from '../../../services/etl';
import { toast } from 'sonner';
import { formatShortRunId } from '../../../lib/etl-routines-catalog';

interface EtlTechnicalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: string;
  logs: LogLine[];
  onClearLogs?: () => void;
}

export function EtlTechnicalSheet({
  open,
  onOpenChange,
  runId,
  logs,
  onClearLogs,
}: EtlTechnicalSheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [copied, setCopied] = useState(false);

  const shortId = formatShortRunId(runId);

  const filteredLogs = useMemo(() => {
    return logs.filter((line) => {
      if (levelFilter !== 'all') {
        const lineLevel = (line.level || 'info').toLowerCase();
        if (levelFilter === 'warning' && !lineLevel.includes('warn')) return false;
        if (levelFilter === 'error' && !lineLevel.includes('error')) return false;
        if (levelFilter === 'info' && !lineLevel.includes('info')) return false;
      }

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesEvent = line.event?.toLowerCase().includes(query);
        const matchesRoutine = line.routine?.toLowerCase().includes(query);
        const matchesRaw = JSON.stringify(line).toLowerCase().includes(query);
        return matchesEvent || matchesRoutine || matchesRaw;
      }

      return true;
    });
  }, [logs, levelFilter, searchTerm]);

  const handleCopy = async () => {
    try {
      const text = filteredLogs
        .map(
          (l) =>
            `[${l.timestamp}] [${(l.level || 'INFO').toUpperCase()}] ${
              l.routine ? `[${l.routine}] ` : ''
            }${l.event || ''} ${JSON.stringify(l)}`,
        )
        .join('\n');
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Logs copiados para a área de transferência');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Não foi possível copiar os logs.');
    }
  };

  const handleDownloadJsonl = () => {
    const downloadUrl = etlService.getDownloadUrl(runId);
    window.open(downloadUrl, '_blank');
  };

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      if (isNaN(date.getTime())) return ts;
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        fractionalSecondDigits: 3,
      });
    } catch {
      return ts;
    }
  };

  const renderLevelBadge = (level?: string) => {
    const lvl = (level || 'info').toLowerCase();
    if (lvl.includes('error')) {
      return (
        <span className="text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 font-semibold px-1 rounded text-[10px]">
          [ERROR]
        </span>
      );
    }
    if (lvl.includes('warn')) {
      return (
        <span className="text-amber-700 bg-amber-100 dark:bg-amber-950/80 dark:text-amber-300 font-semibold px-1 rounded text-[10px]">
          [WARN]
        </span>
      );
    }
    return (
      <span className="text-blue-700 bg-blue-100 dark:bg-blue-950/80 dark:text-blue-300 font-semibold px-1 rounded text-[10px]">
        [INFO]
      </span>
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl flex flex-col p-0 bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800"
      >
        {/* Cabeçalho da Gaveta */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50/50 dark:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#559FB8]" />
              <SheetTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Auditoria e Logs Técnicos
              </SheetTitle>
              <Badge variant="outline" className="font-mono text-xs">
                {shortId}
              </Badge>
            </div>
          </div>
          <SheetDescription className="text-xs text-neutral-500 dark:text-neutral-400">
            Visualização detalhada para administradores técnicos. Registros brutos
            e eventos gerados pelo serviço de ETL.
          </SheetDescription>

          {/* Barra de Ações: Filtro e Download */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar nos logs..."
                  className="h-8 pl-8 text-xs bg-white dark:bg-neutral-950"
                />
              </div>

              {/* Filtro por nível */}
              <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded p-0.5 text-[11px] bg-white dark:bg-neutral-950">
                <button
                  type="button"
                  onClick={() => setLevelFilter('all')}
                  className={`px-2 py-0.5 rounded transition ${
                    levelFilter === 'all'
                      ? 'bg-neutral-200 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white'
                      : 'text-neutral-500'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('error')}
                  className={`px-2 py-0.5 rounded transition ${
                    levelFilter === 'error'
                      ? 'bg-rose-100 text-rose-800 font-semibold'
                      : 'text-neutral-500'
                  }`}
                >
                  Erros
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('warning')}
                  className={`px-2 py-0.5 rounded transition ${
                    levelFilter === 'warning'
                      ? 'bg-amber-100 text-amber-800 font-semibold'
                      : 'text-neutral-500'
                  }`}
                >
                  Avisos
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 text-xs gap-1"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copiar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJsonl}
                className="h-8 text-xs gap-1 text-[#07677e] dark:text-[#559FB8]"
              >
                <Download className="w-3.5 h-3.5" />
                .jsonl
              </Button>
            </div>
          </div>
        </div>

        {/* Lista de Linhas de Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 font-mono text-xs leading-relaxed bg-neutral-50/30 dark:bg-neutral-950/40 select-text">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-neutral-400 italic text-xs">
              {logs.length === 0
                ? 'Nenhum log registrado para esta execução.'
                : 'Nenhum registro corresponde aos filtros.'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className="p-1.5 rounded hover:bg-neutral-100/80 dark:hover:bg-neutral-800/60 transition-colors flex items-start gap-2 border-b border-neutral-100 dark:border-neutral-800/40 break-all"
              >
                <span className="text-neutral-400 shrink-0 text-[11px]">
                  {formatTimestamp(log.timestamp)}
                </span>
                <span className="shrink-0">{renderLevelBadge(log.level)}</span>
                {log.routine && (
                  <span className="text-neutral-600 dark:text-neutral-400 font-semibold shrink-0">
                    [{log.routine}]
                  </span>
                )}
                <span className="text-neutral-800 dark:text-neutral-200">
                  {log.event}
                </span>
                {log.duration_ms !== undefined && (
                  <span className="text-neutral-400 text-[10px] bg-neutral-200/60 dark:bg-neutral-800 px-1 rounded shrink-0">
                    +{log.duration_ms}ms
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
