import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, FileSpreadsheet, ImageIcon, Table2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartBlock } from '@/entities/conversation/model';
import { cn } from '@/shared/lib/cn';
import { downloadFile, fileSlug, toCsv } from '@/shared/lib/download';
import { Button } from '@/shared/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  BlockCard,
  BlockTitle,
  DataTable,
  OriginNote,
  type DataColumn,
} from './block-parts';
import {
  chartRows,
  formatCategory,
  formatCompact,
  formatNumber,
  formatPercent,
  pieSlices,
  rowTotal,
  seriesColor,
  toNumber,
  type PieSlice,
} from './chart-data';

// Bloco `chart` da MarIA: barras (verticais ou horizontais, agrupadas ou
// empilhadas em valor ou percentual), linha, área, pizza, rosca e dispersão.

const AXIS_TICK = { fontSize: 11, fill: 'var(--muted-foreground)' };
const GRID_STROKE = 'var(--border)';

interface TooltipEntry {
  name?: string | number;
  value?: unknown;
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
  payload?: Record<string, unknown>;
}

interface TooltipBoxProps {
  active?: boolean;
  label?: unknown;
  payload?: readonly TooltipEntry[];
}

function TooltipBox({
  title,
  lines,
}: {
  title?: string;
  lines: { key: string; color?: string; label: string; value: string }[];
}) {
  return (
    <div className="flex min-w-36 flex-col gap-1 rounded-md border bg-card px-3 py-2 text-xs shadow-sm">
      {title && <span className="font-semibold text-foreground">{title}</span>}
      {lines.map((line) => (
        <span key={line.key} className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-[2px]"
            style={{ background: line.color }}
          />
          <span className="text-muted-foreground">{line.label}</span>
          <span className="ml-auto pl-3 font-medium text-foreground tabular-nums">
            {line.value}
          </span>
        </span>
      ))}
    </div>
  );
}

function withUnit(value: number, unit?: string | null): string {
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

/** Tooltip das séries: valor absoluto e, no empilhado em %, a proporção. */
function seriesTooltip(block: ChartBlock) {
  const seriesKeys = block.series.map((series) => series.key);
  const units = new Map(block.series.map((s) => [s.key, s.unit]));
  const percent = block.stacking === 'percent';

  return function SeriesTooltip({ active, label, payload }: TooltipBoxProps) {
    if (!active || !payload?.length) return null;
    const row = payload[0]?.payload ?? {};
    const total = percent ? rowTotal(row, seriesKeys) : 0;
    return (
      <TooltipBox
        title={label == null ? undefined : String(label)}
        lines={payload.map((entry, index) => {
          const key = String(entry.dataKey ?? index);
          const value = toNumber(row[key]) ?? toNumber(entry.value) ?? 0;
          return {
            key,
            color: entry.color,
            label: String(entry.name ?? key),
            value:
              percent && total > 0
                ? `${withUnit(value, units.get(key))} (${formatPercent(value / total)})`
                : withUnit(value, units.get(key)),
          };
        })}
      />
    );
  };
}

function Legend({
  items,
}: {
  items: readonly { key: string; label: string; color: string }[];
}) {
  if (items.length < 2) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.key} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-[2px]"
            style={{ background: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function truncateLabel(value: unknown, max: number): string {
  const text = String(value ?? '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function BarView({ block }: { block: ChartBlock }) {
  const rows = chartRows(block);
  const horizontal = block.orientation === 'horizontal';
  const stacked = block.stacking != null || undefined;
  const percent = block.stacking === 'percent';
  const valueTick = (value: number) =>
    percent ? formatPercent(value) : formatCompact(value);
  const dense = !horizontal && rows.length > 8;
  const height = horizontal ? Math.max(200, rows.length * 32 + 40) : 260;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={rows}
        layout={horizontal ? 'vertical' : 'horizontal'}
        stackOffset={percent ? 'expand' : undefined}
        margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        barCategoryGap="20%"
      >
        <CartesianGrid
          stroke={GRID_STROKE}
          vertical={horizontal}
          horizontal={!horizontal}
        />
        {horizontal ? (
          <>
            <XAxis
              type="number"
              tick={AXIS_TICK}
              tickFormatter={valueTick}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey={block.x.key}
              width={150}
              tick={AXIS_TICK}
              tickFormatter={(value) => truncateLabel(value, 24)}
              axisLine={false}
              tickLine={false}
            />
          </>
        ) : (
          <>
            <XAxis
              dataKey={block.x.key}
              tick={AXIS_TICK}
              tickFormatter={(value) => truncateLabel(value, 16)}
              angle={dense ? -35 : 0}
              textAnchor={dense ? 'end' : 'middle'}
              height={dense ? 64 : 28}
              interval={0}
              axisLine={{ stroke: GRID_STROKE }}
              tickLine={false}
            />
            <YAxis
              tick={AXIS_TICK}
              tickFormatter={valueTick}
              width={48}
              axisLine={false}
              tickLine={false}
            />
          </>
        )}
        <Tooltip
          content={seriesTooltip(block)}
          cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
        />
        {block.series.map((series, index) => (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.label}
            fill={seriesColor(index)}
            stackId={stacked && 'stack'}
            radius={stacked ? 0 : horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            maxBarSize={48}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function CartesianAxes({ block }: { block: ChartBlock }) {
  const percent = block.stacking === 'percent';
  // Linha mostra a variação: o eixo y acompanha os dados em vez de partir do 0.
  const yDomain =
    block.chart_type === 'line' ? (['auto', 'auto'] as const) : undefined;
  return (
    <>
      <CartesianGrid stroke={GRID_STROKE} vertical={false} />
      <XAxis
        dataKey={block.x.key}
        tick={AXIS_TICK}
        axisLine={{ stroke: GRID_STROKE }}
        tickLine={false}
        minTickGap={12}
      />
      <YAxis
        domain={yDomain ? [...yDomain] : undefined}
        tick={AXIS_TICK}
        tickFormatter={(value: number) =>
          percent ? formatPercent(value) : formatCompact(value)
        }
        width={48}
        axisLine={false}
        tickLine={false}
      />
      <Tooltip
        content={seriesTooltip(block)}
        cursor={{ stroke: GRID_STROKE }}
      />
    </>
  );
}

function LineView({ block }: { block: ChartBlock }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart
        data={chartRows(block)}
        margin={{ top: 12, right: 16, bottom: 0, left: 0 }}
      >
        {CartesianAxes({ block })}
        {block.series.map((series, index) => (
          <Line
            key={series.key}
            type="linear"
            dataKey={series.key}
            name={series.label}
            stroke={seriesColor(index)}
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: seriesColor(index), strokeWidth: 0 }}
            activeDot={{ r: 5 }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function AreaView({ block }: { block: ChartBlock }) {
  const stacked = block.stacking != null || undefined;
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart
        data={chartRows(block)}
        stackOffset={block.stacking === 'percent' ? 'expand' : undefined}
        margin={{ top: 12, right: 16, bottom: 0, left: 0 }}
      >
        {CartesianAxes({ block })}
        {block.series.map((series, index) => (
          <Area
            key={series.key}
            type="linear"
            dataKey={series.key}
            name={series.label}
            stackId={stacked && 'stack'}
            stroke={seriesColor(index)}
            fill={seriesColor(index)}
            fillOpacity={stacked ? 0.7 : 0.2}
            strokeWidth={2}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ScatterView({ block }: { block: ChartBlock }) {
  const rows = chartRows(block);
  const xLabel = block.x.label;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 4, left: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} />
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          domain={['auto', 'auto']}
          tick={AXIS_TICK}
          tickFormatter={formatCompact}
          axisLine={{ stroke: GRID_STROKE }}
          tickLine={false}
        />
        <YAxis
          type="number"
          dataKey="y"
          domain={['auto', 'auto']}
          tick={AXIS_TICK}
          tickFormatter={formatCompact}
          width={48}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: GRID_STROKE }}
          content={({ active, payload }: TooltipBoxProps) => {
            const point = payload?.[0]?.payload;
            if (!active || !point) return null;
            return (
              <TooltipBox
                lines={[
                  {
                    key: 'x',
                    label: xLabel,
                    value: formatNumber(Number(point.x)),
                  },
                  {
                    key: 'y',
                    color: payload?.[0]?.color,
                    label: String(point.series),
                    value: formatNumber(Number(point.y)),
                  },
                ]}
              />
            );
          }}
        />
        {block.series.map((series, index) => (
          <Scatter
            key={series.key}
            name={series.label}
            fill={seriesColor(index)}
            isAnimationActive={false}
            data={rows
              .map((row) => ({
                x: toNumber(row[block.x.key]),
                y: toNumber(row[series.key]),
                series: series.label,
              }))
              .filter((point) => point.x != null && point.y != null)}
          />
        ))}
      </ScatterChart>
    </ResponsiveContainer>
  );
}

function PieView({ block, donut }: { block: ChartBlock; donut: boolean }) {
  const slices = pieSlices(block);
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const unit = block.series[0]?.unit;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
      <div className="relative size-52 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={donut ? '62%' : 0}
              outerRadius="100%"
              paddingAngle={donut ? 1.5 : 0}
              stroke="var(--card)"
              strokeWidth={donut ? 0 : 1.5}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }: TooltipBoxProps) => {
                const slice = payload?.[0]?.payload as PieSlice | undefined;
                if (!active || !slice) return null;
                return (
                  <TooltipBox
                    lines={[
                      {
                        key: slice.name,
                        color: slice.color,
                        label: slice.name,
                        value: `${withUnit(slice.value, unit)} (${formatPercent(slice.value / total)})`,
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {donut && (
          <span className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-semibold tabular-nums">
              {formatCompact(total)}
            </span>
            <span className="text-[11px] text-muted-foreground">total</span>
          </span>
        )}
      </div>
      <ul className="flex w-full min-w-0 flex-col gap-1.5 text-xs">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-[2px]"
              style={{ background: slice.color }}
            />
            <span className="min-w-0 truncate text-muted-foreground">
              {slice.name}
            </span>
            <span className="ml-auto pl-2 font-medium tabular-nums">
              {formatPercent(slice.value / total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartView({ block }: { block: ChartBlock }) {
  switch (block.chart_type) {
    case 'bar':
      return <BarView block={block} />;
    case 'line':
      return <LineView block={block} />;
    case 'area':
      return <AreaView block={block} />;
    case 'scatter':
      return <ScatterView block={block} />;
    case 'pie':
      return <PieView block={block} donut={false} />;
    case 'donut':
      return <PieView block={block} donut />;
    default:
      return null;
  }
}

function chartColumns(block: ChartBlock): DataColumn[] {
  return [
    { key: block.x.key, label: block.x.label },
    ...block.series.map((series) => ({
      key: series.key,
      label: series.unit ? `${series.label} (${series.unit})` : series.label,
      type: 'number',
    })),
  ];
}

/** Gráfico com legenda, fonte e a tabela dos mesmos dados sob demanda. */
function chartTableRows(block: ChartBlock) {
  return block.data.map((row) => ({
    ...row,
    [block.x.key]: formatCategory(row[block.x.key], block.x.type),
  }));
}

/** Nós marcados com `data-export-ignore` (botões, tabela) ficam fora do PNG. */
function keepInExport(node: HTMLElement): boolean {
  return !(node instanceof HTMLElement && 'exportIgnore' in node.dataset);
}

async function downloadChartPng(node: HTMLElement, title: string) {
  const background = getComputedStyle(node).backgroundColor;
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: background,
    filter: keepInExport,
  });
  downloadFile(dataUrl, `${fileSlug(title, 'grafico')}.png`);
}

function downloadChartCsv(block: ChartBlock) {
  const csv = toCsv(chartColumns(block), chartTableRows(block));
  downloadFile(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
    `${fileSlug(block.title, 'grafico')}.csv`,
  );
}

function DownloadMenu({
  onPng,
  onCsv,
}: {
  onPng: () => void;
  onCsv: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <Download aria-hidden />
          Baixar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onPng}>
          <ImageIcon aria-hidden />
          Imagem (PNG)
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onCsv}>
          <FileSpreadsheet aria-hidden />
          Dados (CSV)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Gráfico com legenda, fonte, a tabela sob demanda e os downloads. */
export function ChartBlockView({ block }: { block: ChartBlock }) {
  const [showData, setShowData] = useState(false);
  const cardRef = useRef<HTMLElement>(null);
  const isPie = block.chart_type === 'pie' || block.chart_type === 'donut';
  const empty = block.data.length === 0 || block.series.length === 0;

  return (
    <BlockCard slot="maria-chart" ref={cardRef}>
      <BlockTitle>{block.title}</BlockTitle>
      {empty ? (
        <p className="text-sm text-muted-foreground">Sem dados para mostrar.</p>
      ) : (
        <>
          <div role="img" aria-label={block.title} className="min-w-0">
            <ChartView block={block} />
          </div>
          {!isPie && (
            <Legend
              items={block.series.map((series, index) => ({
                key: series.key,
                label: series.label,
                color: seriesColor(index),
              }))}
            />
          )}
        </>
      )}
      {showData && !empty && (
        <div data-export-ignore>
          <DataTable
            columns={chartColumns(block)}
            rows={chartTableRows(block)}
          />
        </div>
      )}
      <OriginNote origin={block.origin} truncated={block.truncated}>
        {!empty && (
          <span data-export-ignore className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn('h-7 px-2 text-xs', showData && 'bg-muted')}
              aria-pressed={showData}
              onClick={() => setShowData((open) => !open)}
            >
              <Table2 aria-hidden />
              {showData ? 'Ocultar dados' : 'Ver dados'}
            </Button>
            <DownloadMenu
              onPng={() => {
                if (cardRef.current) {
                  void downloadChartPng(cardRef.current, block.title);
                }
              }}
              onCsv={() => downloadChartCsv(block)}
            />
          </span>
        )}
      </OriginNote>
    </BlockCard>
  );
}
