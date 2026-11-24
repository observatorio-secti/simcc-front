import type { ReactNode, Ref } from 'react';
import { Database } from 'lucide-react';
import type { BlockOrigin } from '@/entities/conversation/model';
import { cn } from '@/shared/lib/cn';
import { formatQueriedAt } from './answer-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

// Peças comuns aos blocos de dados de uma resposta (gráfico, tabela, cards).

const numberFormat = new Intl.NumberFormat('pt-BR');

export function BlockTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground">{children}</h3>;
}

/** Superfície dos blocos de dados: card branco, sem sombra. */
export function BlockCard({
  children,
  className,
  slot,
  ref,
}: {
  children: ReactNode;
  className?: string;
  slot: string;
  ref?: Ref<HTMLElement>;
}) {
  return (
    <section
      ref={ref}
      data-slot={slot}
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-lg border bg-card p-4',
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Rodapé curto: fonte, hora da consulta e aviso de corte. */
export function OriginNote({
  origin,
  total,
  shown,
  truncated,
  children,
}: {
  origin?: BlockOrigin | null;
  total?: number;
  shown?: number;
  truncated?: boolean;
  /** Ações à direita (ex.: "Ver dados"). */
  children?: ReactNode;
}) {
  const parts: string[] = [];
  if (origin?.sources.length) parts.push(origin.sources.join(', '));
  const when = formatQueriedAt(origin?.queried_at);
  if (when) parts.push(when);
  if (total != null && shown != null && total > shown) {
    parts.push(
      `${numberFormat.format(shown)} de ${numberFormat.format(total)}`,
    );
  } else if (truncated) {
    parts.push('resultado cortado');
  }
  if (parts.length === 0 && !children) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {parts.length > 0 && (
        <span
          className="flex min-w-0 items-center gap-1.5"
          title={origin?.description}
        >
          <Database className="size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0">{parts.join(' · ')}</span>
        </span>
      )}
      {children}
    </div>
  );
}

export interface DataColumn {
  key: string;
  label: string;
  type?: string;
}

function formatCell(value: unknown, type?: string): string {
  if (value == null || value === '') return '—';
  if (type === 'number' && typeof value === 'number') {
    return numberFormat.format(value);
  }
  return String(value);
}

export function DataTable({
  columns,
  rows,
}: {
  columns: readonly DataColumn[];
  rows: readonly Record<string, unknown>[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              className={cn(column.type === 'number' && 'text-right')}
            >
              {column.label}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className={cn(
                  column.type === 'number' && 'text-right tabular-nums',
                )}
              >
                {formatCell(row[column.key], column.type)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
