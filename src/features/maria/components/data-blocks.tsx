import { useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  BarChart3,
  ClipboardCopy,
  Database,
  Download,
  ImageDown,
  Table2,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  BlockOrigin,
  ChartBlock,
  TableBlock,
} from '@/entities/conversation/model';
import { cn } from '@/shared/lib/cn';
import { formatDate, formatDateTime } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import {
  chartCsv,
  chartCsvColumns,
  downloadChartPng,
  downloadCsv,
  fileSlug,
  tableCsv,
} from '../block-export';
import {
  buildChartFrame,
  chartLegend,
  formatAxisValue,
  formatNumber,
} from './chart/chart-model';
import { ChartView } from './chart/chart-view';

export const TRUNCATED_NOTICE =
  'Resultado limitado a 100 linhas. Refine a pergunta para ver o restante.';

export function BlockTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground">{children}</h3>;
}

/** Aviso visível de corte pelo limite da consulta (`truncated`). */
export function TruncatedNotice({ children }: { children?: ReactNode }) {
  return (
    <p
      data-slot="maria-truncated"
      className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{children ?? TRUNCATED_NOTICE}</span>
    </p>
  );
}

/** Rodapé de origem: fontes, o que foi consultado, quando e a cobertura. */
export function OriginFooter({
  origin,
  extra,
}: {
  origin?: BlockOrigin | null;
  extra?: string | null;
}) {
  if (!origin && !extra) return null;
  const parts: string[] = [];
  if (extra) parts.push(extra);
  if (origin?.sources.length) parts.push(`Fonte: ${origin.sources.join(', ')}`);
  if (origin?.queried_at)
    parts.push(`Consultado em ${formatDateTime(origin.queried_at)}`);
  if (origin?.coverage) {
    const { found, keys } = origin.coverage;
    parts.push(
      `Cobertura: ${formatNumber(found)} de ${formatNumber(keys)} registros ligados entre as fontes`,
    );
  }
  return (
    <footer
      data-slot="maria-origin"
      className="flex flex-col gap-0.5 border-t pt-2 text-xs text-muted-foreground"
    >
      <p className="flex items-start gap-1.5">
        <Database className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{parts.join(' · ')}</span>
      </p>
      {origin?.description && <p className="pl-5">{origin.description}</p>}
    </footer>
  );
}

async function copyText(text: string, success: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(success);
  } catch {
    toast.error('Não foi possível copiar. Use "Baixar CSV".');
  }
}

function ActionButton({
  icon: Icon,
  children,
  onClick,
  pressed,
}: {
  icon: typeof Download;
  children: ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={onClick}
      aria-pressed={pressed}
    >
      <Icon aria-hidden />
      {children}
    </Button>
  );
}

interface Column {
  key: string;
  label: string;
  type?: string;
}

function formatCell(value: unknown, type?: string): string {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'number') {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(number) ? formatNumber(number) : String(value);
  }
  if (type === 'date' && typeof value === 'string') {
    // Ano sozinho (o backend normaliza colunas de ano como texto) fica igual.
    return /^\d{4}$/.test(value) ? value : formatDate(value);
  }
  return String(value);
}

function DataTable({
  columns,
  rows,
  caption,
}: {
  columns: Column[];
  rows: Record<string, unknown>[];
  caption?: string;
}) {
  return (
    <div className="max-h-[420px] overflow-auto rounded-md border">
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader className="sticky top-0 bg-card">
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
    </div>
  );
}

const CHART_TYPE_LABEL: Record<ChartBlock['chart_type'], string> = {
  bar: 'Gráfico de barras',
  line: 'Gráfico de linhas',
  area: 'Gráfico de área',
  pie: 'Gráfico de pizza',
  donut: 'Gráfico de rosca',
  scatter: 'Gráfico de dispersão',
};

/** Bloco `chart`: gráfico, legenda, ações de exportação e origem. */
export function ChartBlockView({ block }: { block: ChartBlock }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showTable, setShowTable] = useState(false);

  const tableColumns: Column[] = [
    { key: block.x.key, label: block.x.label, type: 'axis' },
    ...chartCsvColumns(block)
      .slice(1)
      .map((column) => ({ ...column, type: 'number' })),
  ];
  const tableRows = block.data.map((row) => ({
    ...row,
    [block.x.key]: formatAxisValue(row[block.x.key], block.x.type),
  }));

  async function savePng() {
    const svg = svgRef.current;
    if (!svg) {
      toast.error('Abra o gráfico para baixar a imagem.');
      return;
    }
    try {
      await downloadChartPng(svg, {
        title: block.title,
        legend: chartLegend(buildChartFrame(block)),
        footer: block.origin
          ? `Fonte: ${block.origin.sources.join(', ')} · ${formatDateTime(block.origin.queried_at)}`
          : undefined,
        filename: `${fileSlug(block.title)}.png`,
      });
    } catch {
      toast.error('Não foi possível gerar a imagem do gráfico.');
    }
  }

  return (
    <section
      data-slot="maria-chart"
      aria-label={`${CHART_TYPE_LABEL[block.chart_type]}: ${block.title}`}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <BlockTitle>{block.title}</BlockTitle>
        <div className="-mr-2 flex flex-wrap gap-0.5">
          <ActionButton
            icon={showTable ? BarChart3 : Table2}
            onClick={() => setShowTable((value) => !value)}
            pressed={showTable}
          >
            {showTable ? 'Ver gráfico' : 'Ver tabela'}
          </ActionButton>
          <ActionButton
            icon={ClipboardCopy}
            onClick={() => void copyText(chartCsv(block), 'CSV copiado.')}
          >
            Copiar CSV
          </ActionButton>
          <ActionButton
            icon={Download}
            onClick={() => downloadCsv(chartCsv(block), block.title)}
          >
            Baixar CSV
          </ActionButton>
          {!showTable && (
            <ActionButton icon={ImageDown} onClick={() => void savePng()}>
              Baixar PNG
            </ActionButton>
          )}
        </div>
      </header>
      {block.truncated && <TruncatedNotice />}
      {showTable ? (
        <DataTable
          columns={tableColumns}
          rows={tableRows}
          caption={block.title}
        />
      ) : (
        <ChartView block={block} svgRef={svgRef} />
      )}
      <OriginFooter origin={block.origin} />
    </section>
  );
}

/** Bloco `table`: números e datas em pt-BR, exportação e origem. */
export function TableBlockView({ block }: { block: TableBlock }) {
  const title = block.title ?? null;
  return (
    <section
      data-slot="maria-table"
      aria-label={title ?? 'Tabela'}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        {title ? <BlockTitle>{title}</BlockTitle> : <span />}
        <div className="-mr-2 flex flex-wrap gap-0.5">
          <ActionButton
            icon={ClipboardCopy}
            onClick={() => void copyText(tableCsv(block), 'CSV copiado.')}
          >
            Copiar CSV
          </ActionButton>
          <ActionButton
            icon={Download}
            onClick={() => downloadCsv(tableCsv(block), title ?? 'tabela')}
          >
            Baixar CSV
          </ActionButton>
        </div>
      </header>
      {block.truncated && <TruncatedNotice />}
      <DataTable
        columns={block.columns}
        rows={block.rows}
        caption={title ?? undefined}
      />
      <OriginFooter
        origin={block.origin}
        extra={`${formatNumber(block.rows.length)} ${block.rows.length === 1 ? 'linha' : 'linhas'}`}
      />
    </section>
  );
}
