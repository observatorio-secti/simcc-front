import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  Check,
  Copy,
  Download,
  Filter,
  Search,
  Terminal as TerminalIcon,
  Trash2,
} from 'lucide-react';
import { LogLine } from '../../../types/etl';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { toast } from 'sonner';
import { etlService } from '../../../services/etl';

interface EtlLogTerminalProps {
  runId: string;
  logs: LogLine[];
  onClearLogs?: () => void;
}

export function EtlLogTerminal({ runId, logs, onClearLogs }: EtlLogTerminalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warning' | 'error'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const [unreadNewLogsCount, setUnreadNewLogsCount] = useState(0);

  const terminalRef = useRef<HTMLDivElement>(null);
  const prevLogsLengthRef = useRef<number>(logs.length);

  // Filtragem local
  const filteredLogs = useMemo(() => {
    return logs.filter((line) => {
      // Filtro por nível
      if (levelFilter !== 'all') {
        const lineLevel = (line.level || 'info').toLowerCase();
        if (levelFilter === 'warning' && !lineLevel.includes('warn')) return false;
        if (levelFilter === 'error' && !lineLevel.includes('error')) return false;
        if (levelFilter === 'info' && !lineLevel.includes('info')) return false;
      }

      // Filtro por texto
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

  // Detector de scroll manual pelo usuário
  const handleScroll = () => {
    if (!terminalRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 40;

    if (isAtBottom) {
      setAutoScroll(true);
      setUnreadNewLogsCount(0);
    } else {
      setAutoScroll(false);
    }
  };

  // Efeito de auto-scroll inteligente quando chegam novas linhas
  useEffect(() => {
    const diff = logs.length - prevLogsLengthRef.current;
    prevLogsLengthRef.current = logs.length;

    if (diff > 0) {
      if (autoScroll) {
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
      } else {
        setUnreadNewLogsCount((prev) => prev + diff);
      }
    }
  }, [logs.length, autoScroll]);

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
    setAutoScroll(true);
    setUnreadNewLogsCount(0);
  };

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
        <span className="text-red-400 font-bold bg-red-950/40 px-1 rounded text-[11px]">
          [ERROR]
        </span>
      );
    }
    if (lvl.includes('warn')) {
      return (
        <span className="text-amber-400 font-bold bg-amber-950/40 px-1 rounded text-[11px]">
          [WARN]
        </span>
      );
    }
    if (lvl.includes('debug')) {
      return (
        <span className="text-purple-400 font-semibold bg-purple-950/40 px-1 rounded text-[11px]">
          [DEBUG]
        </span>
      );
    }
    return (
      <span className="text-cyan-400 font-semibold bg-cyan-950/40 px-1 rounded text-[11px]">
        [INFO]
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-[#0d1117] text-neutral-200 overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Top Bar do Terminal */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-[#161b22] border-b border-neutral-800 text-xs">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-emerald-400" />
          <span className="font-mono font-semibold text-neutral-300">
            Console de Execução
          </span>
          <span className="font-mono text-[11px] text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded-full">
            {logs.length} linhas
          </span>
        </div>

        {/* Barra de Ações: Filtros, Cópia, Download */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Busca textual rápida */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-neutral-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filtrar eventos..."
              className="h-7 w-36 sm:w-48 pl-7 text-xs bg-[#0d1117] border-neutral-700 text-neutral-200 focus-visible:ring-emerald-500"
            />
          </div>

          {/* Filtro por Nível */}
          <div className="flex items-center bg-[#0d1117] border border-neutral-700 rounded p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setLevelFilter('all')}
              className={`px-2 py-0.5 rounded transition ${
                levelFilter === 'all'
                  ? 'bg-neutral-700 text-white font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('error')}
              className={`px-2 py-0.5 rounded transition ${
                levelFilter === 'error'
                  ? 'bg-red-900/60 text-red-200 font-semibold'
                  : 'text-neutral-400 hover:text-red-300'
              }`}
            >
              Erros
            </button>
            <button
              type="button"
              onClick={() => setLevelFilter('warning')}
              className={`px-2 py-0.5 rounded transition ${
                levelFilter === 'warning'
                  ? 'bg-amber-900/60 text-amber-200 font-semibold'
                  : 'text-neutral-400 hover:text-amber-300'
              }`}
            >
              Avisos
            </button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800"
            title="Copiar logs"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            Copiar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadJsonl}
            className="h-7 px-2 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800"
            title="Baixar arquivo bruto .jsonl"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-[#559FB8]" />
            .jsonl
          </Button>

          {onClearLogs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearLogs}
              className="h-7 px-2 text-xs text-neutral-400 hover:text-rose-400 hover:bg-neutral-800"
              title="Limpar tela"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo dos Logs com Auto-scroll */}
      <div
        ref={terminalRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs leading-relaxed select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-500 italic">
            {logs.length === 0
              ? 'Aguardando logs da rotina...'
              : 'Nenhum log encontrado para os filtros selecionados.'}
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const hasDetails =
              log.duration_ms !== undefined ||
              Object.keys(log).some(
                (k) =>
                  !['timestamp', 'level', 'event', 'routine', 'run_id'].includes(k),
              );

            return (
              <div
                key={index}
                className="group hover:bg-[#161b22]/70 px-2 py-0.5 rounded transition-colors flex items-start gap-2.5 break-all"
              >
                {/* Timestamp formatado */}
                <span className="text-neutral-500 shrink-0 select-none">
                  {formatTimestamp(log.timestamp)}
                </span>

                {/* Level badge */}
                <span className="shrink-0">{renderLevelBadge(log.level)}</span>

                {/* Routine tag se existir */}
                {log.routine && (
                  <span className="text-blue-400 font-semibold shrink-0">
                    [{log.routine}]
                  </span>
                )}

                {/* Evento principal */}
                <span className="text-neutral-200 font-sans sm:font-mono">
                  {log.event}
                </span>

                {/* Duração se existir */}
                {log.duration_ms !== undefined && (
                  <span className="text-neutral-400 text-[11px] bg-neutral-800/60 px-1 rounded shrink-0">
                    +{log.duration_ms}ms
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Botão Flutuante de Auto-scroll ao rolar para cima */}
      {!autoScroll && (
        <div className="absolute bottom-4 right-6 z-20">
          <Button
            size="sm"
            onClick={scrollToBottom}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg text-xs gap-1.5 h-8 font-mono animate-bounce"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            {unreadNewLogsCount > 0
              ? `Rolar para o final (${unreadNewLogsCount} novos logs)`
              : 'Rolar para o final'}
          </Button>
        </div>
      )}
    </div>
  );
}
