import React from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
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
import { EtlRunStatus, EtlRunSummary } from '../../../types/etl';
import { etlService } from '../../../services/etl';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const getStatusBadge = (status: EtlRunStatus) => {
    switch (status) {
      case 'RUNNING':
        return (
          <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 text-[11px] font-semibold py-0.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Executando
          </Badge>
        );
      case 'SUCCEEDED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 text-[11px] font-semibold py-0.5">
            <CheckCircle2 className="w-3 h-3" />
            Sucesso
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 text-[11px] font-semibold py-0.5">
            <AlertCircle className="w-3 h-3" />
            Falha
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 text-[11px] font-semibold py-0.5">
            <Clock className="w-3 h-3" />
            Na Fila
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[11px] py-0.5">
            {status}
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
    if (!endStr) return 'Em andamento';
    try {
      const start = parseISO(startStr);
      const end = parseISO(endStr);
      return formatDistanceStrict(end, start, { locale: ptBR });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Histórico Recente de Execuções
          </h3>
          <p className="text-xs text-neutral-500">
            Clique em uma execução para carregar os logs e métricas correspondentes.
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
            Atualizar
          </Button>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-neutral-50 dark:bg-neutral-800/50">
            <TableRow>
              <TableHead className="text-xs">ID da Execução</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Disparado Por</TableHead>
              <TableHead className="text-xs">Rotinas</TableHead>
              <TableHead className="text-xs">Início</TableHead>
              <TableHead className="text-xs">Duração</TableHead>
              <TableHead className="text-xs text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-xs text-neutral-500"
                >
                  Nenhuma execução encontrada no histórico.
                </TableCell>
              </TableRow>
            ) : (
              runs.map((run) => {
                const isSelected = run.id === selectedRunId;
                return (
                  <TableRow
                    key={run.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 font-medium'
                        : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    }`}
                    onClick={() => onSelectRun(run.id)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                      {run.id}
                    </TableCell>
                    <TableCell>{getStatusBadge(run.status)}</TableCell>
                    <TableCell className="text-xs text-neutral-600 dark:text-neutral-300">
                      {run.triggered_by || 'Sistema'}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500">
                      {run.routines && run.routines.length > 0
                        ? `${run.routines.length} rotinas`
                        : 'Padrão (todas)'}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500 font-mono">
                      {formatRunDate(run.started_at)}
                    </TableCell>
                    <TableCell className="text-xs text-neutral-500">
                      {calculateDuration(run.started_at, run.ended_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant={isSelected ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => onSelectRun(run.id)}
                          className={`h-7 px-2 text-xs gap-1 ${
                            isSelected
                              ? 'bg-[#559FB8] hover:bg-[#07677e] text-white'
                              : 'text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isSelected ? 'Ativo' : 'Inspecionar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(etlService.getDownloadUrl(run.id), '_blank')
                          }
                          className="h-7 px-2 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                          title="Baixar log .jsonl"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
