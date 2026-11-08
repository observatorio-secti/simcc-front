import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Eye,
  Layers,
  Loader2,
  RefreshCw,
  User,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { EtlRunStatus, EtlRunSummary } from '../../../types/etl';
import { etlService } from '../../../services/etl';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatShortRunId, getFriendlyStatusText, getRoutineMetadata } from '../../../lib/etl-routines-catalog';
import { toast } from 'sonner';

interface EtlHistoryTableProps {
  runs: EtlRunSummary[];
  selectedRunId: string | null;
  onSelectRun: (runId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function EtlHistoryTable({
  runs,
  selectedRunId,
  onSelectRun,
  onRefresh,
  isLoading = false,
}: EtlHistoryTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyFullId = (fullId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullId);
    setCopiedId(fullId);
    toast.success('Identificador completo copiado');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: EtlRunStatus) => {
    const meta = getFriendlyStatusText(status);

    switch (status) {
      case 'RUNNING':
        return (
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800 gap-1.5 text-xs font-medium py-0.5">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            {meta.label}
          </Badge>
        );
      case 'SUCCEEDED':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 gap-1.5 text-xs font-medium py-0.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            {meta.label}
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800 gap-1.5 text-xs font-medium py-0.5">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            {meta.label}
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800 gap-1.5 text-xs font-medium py-0.5">
            <Clock className="w-3 h-3 text-amber-500" />
            {meta.label}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs py-0.5">
            {meta.label}
          </Badge>
        );
    }
  };

  const formatRunDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const calculateDuration = (startStr: string, endStr: string | null) => {
    if (!endStr) return 'Em execução...';
    try {
      const start = parseISO(startStr);
      const end = parseISO(endStr);
      return formatDistanceStrict(end, start, { locale: ptBR });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Histórico Recente de Execuções
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Acompanhe o registro cronológico de todas as atualizações disparadas na plataforma.
          </p>
        </div>

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            Atualizar Lista
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <TooltipProvider>
          <Table>
            <TableHeader className="bg-neutral-50/80 dark:bg-neutral-800/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Identificador</TableHead>
                <TableHead className="text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Iniciado por</TableHead>
                <TableHead className="text-xs font-semibold">Rotinas Executadas</TableHead>
                <TableHead className="text-xs font-semibold">Início</TableHead>
                <TableHead className="text-xs font-semibold">Duração</TableHead>
                <TableHead className="text-xs font-semibold text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {runs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-xs text-neutral-500"
                  >
                    Nenhuma execução encontrada no histórico.
                  </TableCell>
                </TableRow>
              ) : (
                runs.map((run) => {
                  const isSelected = run.id === selectedRunId;
                  const shortId = formatShortRunId(run.id);

                  return (
                    <TableRow
                      key={run.id}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 font-medium'
                          : 'hover:bg-neutral-50/70 dark:hover:bg-neutral-800/50'
                      }`}
                      onClick={() => onSelectRun(run.id)}
                    >
                      {/* ID Contraído (6 caracteres) com Tooltip e Cópia */}
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => handleCopyFullId(run.id, e)}
                              className="group flex items-center gap-1.5 font-mono text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-[#559FB8] transition-colors"
                            >
                              <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                                {shortId}
                              </span>
                              {copiedId === run.id ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3 text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs font-mono">
                            <p>Clique para copiar o ID completo:</p>
                            <p className="text-neutral-400 mt-0.5">{run.id}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>

                      <TableCell>{getStatusBadge(run.status)}</TableCell>

                      <TableCell className="text-xs text-neutral-600 dark:text-neutral-300">
                        {run.triggered_by || 'Sistema'}
                      </TableCell>

                      <TableCell className="text-xs text-neutral-500">
                        {run.routines && run.routines.length > 0 ? (
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-neutral-400" />
                            {run.routines.length} rotinas
                          </span>
                        ) : (
                          'Todas as padrão'
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-neutral-500 font-mono">
                        {formatRunDate(run.started_at)}
                      </TableCell>

                      <TableCell className="text-xs text-neutral-600 dark:text-neutral-300">
                        {calculateDuration(run.started_at, run.ended_at)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onSelectRun(run.id)}
                            className={`h-7 px-2.5 text-xs gap-1.5 ${
                              isSelected
                                ? 'bg-[#559FB8] hover:bg-[#07677e] text-white'
                                : 'text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {isSelected ? 'Em foco' : 'Ver Detalhes'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TooltipProvider>
      </div>
    </div>
  );
}
