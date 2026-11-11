import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Button } from '../../ui/button';
import { EtlRunStatus, EtlRunSummary } from '../../../types/etl';
import { formatDistanceStrict, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getFriendlyStatusText } from '../../../lib/etl-routines-catalog';

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
    const meta = getFriendlyStatusText(status);

    switch (status) {
      case 'RUNNING':
        return (
          <span className="sm-tag font-semibold flex items-center gap-1 bg-sm-wash text-sm-navy">
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            Em andamento
          </span>
        );
      case 'SUCCEEDED':
        return (
          <span className="sm-tag sm-tag--strong font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
            Sucesso
          </span>
        );
      case 'FAILED':
        return (
          <span className="sm-tag bg-sm-red-100 text-sm-red-700 font-semibold flex items-center gap-1">
            <AlertCircle className="w-2.5 h-2.5 text-sm-red-700" />
            Falhou
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="sm-tag font-semibold flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            Na fila
          </span>
        );
      default:
        return (
          <span className="sm-tag font-semibold">
            {meta.label}
          </span>
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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-sm-navy">
          Histórico de Atualizações
        </h3>

        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-7 text-xs text-sm-navy-600 hover:text-sm-navy gap-1.5"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        )}
      </div>

      <div className="rounded-md border border-sm-wave-gray bg-white overflow-hidden shadow-none">
        <Table className="sm-table">
          <thead>
            <tr>
              <TableHead className="w-44">Data e Hora</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead>Escopo</TableHead>
              <TableHead className="w-32">Duração</TableHead>
              <TableHead className="text-right w-24">Ação</TableHead>
            </tr>
          </thead>
          <TableBody>
            {runs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-xs text-sm-navy-600"
                >
                  Nenhuma execução registrada no histórico.
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
                        ? 'bg-sm-wash font-semibold'
                        : 'hover:bg-sm-wash/50'
                    }`}
                    onClick={() => onSelectRun(run.id)}
                  >
                    <TableCell className="font-mono text-xs text-sm-navy">
                      {formatRunDate(run.started_at)}
                    </TableCell>

                    <TableCell>{getStatusBadge(run.status)}</TableCell>

                    <TableCell className="text-xs text-sm-navy-600">
                      {run.routines && run.routines.length > 0 ? (
                        <span>{run.routines.length} etapas selecionadas</span>
                      ) : (
                        <span>Base completa</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-sm-navy-600">
                      {calculateDuration(run.started_at, run.ended_at)}
                    </TableCell>

                    <TableCell className="text-right">
                      <div
                        className="flex items-center justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectRun(run.id)}
                          className={`h-7 px-2 text-xs gap-1 ${
                            isSelected
                              ? 'text-sm-navy font-extrabold bg-sm-wave-gray/40'
                              : 'text-sm-navy-600 hover:text-sm-navy'
                          }`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isSelected ? 'Em foco' : 'Ver'}</span>
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
