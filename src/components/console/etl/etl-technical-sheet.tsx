import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  Search,
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
import { LogLine } from '../../../types/etl';
import { etlService } from '../../../services/etl';
import { toast } from 'sonner';

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
}: EtlTechnicalSheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [copied, setCopied] = useState(false);

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
      });
    } catch {
      return ts;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl lg:max-w-3xl flex flex-col p-0 bg-white border-l border-sm-wave-gray shadow-none"
      >
        <div className="p-5 border-b border-sm-wave-gray space-y-2 bg-sm-canvas/50">
          <p className="sm-eyebrow">AUDITORIA · <b>LOGS TÉCNICOS</b></p>
          <SheetTitle className="text-base font-extrabold text-sm-navy">
            Registros de Execução
          </SheetTitle>
          <SheetDescription className="text-xs text-sm-navy-600">
            Eventos brutos e detalhes gerados pelo processamento de atualização.
          </SheetDescription>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-sm-navy-600" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar registros..."
                  className="h-8 pl-8 text-xs border-sm-wave-gray rounded-sm bg-white"
                />
              </div>

              <div className="flex items-center border border-sm-wave-gray rounded-sm p-0.5 text-[11px] bg-white">
                <button
                  type="button"
                  onClick={() => setLevelFilter('all')}
                  className={`px-2 py-0.5 rounded-sm transition ${
                    levelFilter === 'all'
                      ? 'bg-sm-navy font-semibold text-white'
                      : 'text-sm-navy-600'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('error')}
                  className={`px-2 py-0.5 rounded-sm transition ${
                    levelFilter === 'error'
                      ? 'bg-sm-red-100 text-sm-red-700 font-semibold'
                      : 'text-sm-navy-600'
                  }`}
                >
                  Erros
                </button>
                <button
                  type="button"
                  onClick={() => setLevelFilter('warning')}
                  className={`px-2 py-0.5 rounded-sm transition ${
                    levelFilter === 'warning'
                      ? 'bg-sm-wash text-sm-navy font-semibold'
                      : 'text-sm-navy-600'
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
                className="h-8 text-xs gap-1 border-sm-wave-gray text-sm-navy"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-sm-navy" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copiar
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadJsonl}
                className="h-8 text-xs gap-1 border-sm-wave-gray text-sm-navy"
              >
                <Download className="w-3.5 h-3.5" />
                .jsonl
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs leading-relaxed bg-sm-canvas select-text">
          {filteredLogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm-navy-600 italic text-xs">
              {logs.length === 0
                ? 'Nenhum log registrado para esta execução.'
                : 'Nenhum registro corresponde aos filtros.'}
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isError = (log.level || '').toLowerCase().includes('error');
              const isWarn = (log.level || '').toLowerCase().includes('warn');

              return (
                <div
                  key={index}
                  className={`p-1.5 rounded transition-colors flex items-start gap-2 border-b border-sm-wave-gray/60 ${
                    isError
                      ? 'bg-sm-red-100/30 text-sm-red-700'
                      : isWarn
                      ? 'bg-sm-wash text-sm-navy'
                      : 'bg-white text-sm-navy'
                  }`}
                >
                  <span className="text-sm-navy-600 shrink-0 text-[11px]">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  {log.routine && (
                    <span className="font-extrabold shrink-0">
                      [{log.routine}]
                    </span>
                  )}
                  <span className="flex-1 break-all">
                    {log.event}
                  </span>
                  {log.duration_ms !== undefined && (
                    <span className="text-sm-navy-600 text-[10px] shrink-0 font-mono">
                      +{log.duration_ms}ms
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
