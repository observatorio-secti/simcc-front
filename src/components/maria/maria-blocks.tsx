// Renderização dos blocos `chart` e `table` da Maria e utilitários comuns
// (rodapé de origem, aviso de corte e exportação CSV).
import { AlertCircle, BarChart3, Download, Table2 } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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
import type {
  MariaBlockOrigin,
  MariaChartBlock,
  MariaTableBlock,
} from '../../types/maria';
import { downloadCsv, originText, truncationText } from './maria-utils';

// Paleta derivada dos tokens do Design System (primary, primary-container, secondary…).
const MARIA_CHART_COLORS = [
  '#07677e',
  '#559FB8',
  '#F59E0B',
  '#37637d',
  '#E11D48',
  '#10B981',
  '#8B5CF6',
];

const numberFormat = (value: unknown, digits = 2) =>
  typeof value === 'number'
    ? value.toLocaleString('pt-BR', { maximumFractionDigits: digits })
    : String(value ?? '—');

export function BlockFooter({
  origin,
  truncated,
  count,
  grouped,
}: {
  origin?: MariaBlockOrigin | null;
  truncated?: boolean;
  count: number;
  grouped?: boolean;
}) {
  if (!origin && !truncated) return null;
  return (
    <div className="space-y-1 pt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
      {truncated && (
        <p className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          {truncationText(count, grouped)}
        </p>
      )}
      {origin && <p className="leading-relaxed">{originText(origin)}</p>}
    </div>
  );
}

export function CsvButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-[11px] text-[#07677e] dark:text-[#559FB8] hover:underline font-medium"
    >
      <Download className="w-3 h-3" />
      Baixar CSV
    </button>
  );
}

function BlockHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: any;
  title?: string | null;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 font-lexend flex items-center gap-1.5 min-w-0">
        <Icon className="w-3.5 h-3.5 text-[#07677e] dark:text-[#559FB8] shrink-0" />
        <span className="truncate">{title}</span>
      </h4>
      {action}
    </div>
  );
}

// --- Gráfico -----------------------------------------------------------------------

const seriesLabel = (s: { label: string; unit?: string | null }) =>
  s.unit ? `${s.label} (${s.unit})` : s.label;

function shortLabel(value: unknown, max = 22) {
  const text = String(value ?? '');
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export function MariaChart({
  block,
  isDark,
}: {
  block: MariaChartBlock;
  isDark: boolean;
}) {
  const percent = block.stacking === 'percent';
  const stackId = block.stacking ? 'stack' : undefined;
  const horizontal = block.orientation === 'horizontal';
  const xKey = block.x.key;

  // Participação de cada série no total da linha; nulo conta como zero.
  const data = percent
    ? block.data.map((row) => {
        const total = block.series.reduce(
          (sum, s) => sum + (Number(row[s.key]) || 0),
          0,
        );
        const shares = Object.fromEntries(
          block.series.map((s) => [
            s.key,
            total ? ((Number(row[s.key]) || 0) / total) * 100 : 0,
          ]),
        );
        return { ...row, ...shares };
      })
    : block.data;

  const text = isDark ? '#94a3b8' : '#64748b';
  const grid = isDark ? '#262626' : '#e2e8f0';
  const tick = { fill: text, fontSize: 11 };
  const height = horizontal ? Math.max(260, block.data.length * 28 + 90) : 280;
  const valueFormatter = (value: unknown) =>
    percent ? `${numberFormat(value, 1)}%` : numberFormat(value);
  const tooltip = (
    <Tooltip
      formatter={(value: unknown) => valueFormatter(value)}
      contentStyle={{
        fontSize: 12,
        borderRadius: 8,
        background: isDark ? '#0a0a0a' : '#ffffff',
        border: `1px solid ${grid}`,
      }}
    />
  );
  const legend = <Legend wrapperStyle={{ fontSize: 11 }} />;
  const categoryAxisProps = {
    dataKey: xKey,
    tick,
    stroke: grid,
    tickFormatter: (v: unknown) => shortLabel(v),
  };
  const valueAxisProps = {
    tick,
    stroke: grid,
    tickFormatter: (v: unknown) => (percent ? `${v}%` : numberFormat(v, 1)),
    ...(percent ? { domain: [0, 100] as [number, number] } : {}),
  };

  let chart: React.ReactElement;
  if (block.chart_type === 'pie' || block.chart_type === 'donut') {
    const serie = block.series[0];
    chart = (
      <PieChart>
        <Pie
          data={block.data}
          dataKey={serie.key}
          nameKey={xKey}
          innerRadius={block.chart_type === 'donut' ? '55%' : 0}
          outerRadius="80%"
          paddingAngle={1}
        >
          {block.data.map((_, i) => (
            <Cell
              key={i}
              fill={MARIA_CHART_COLORS[i % MARIA_CHART_COLORS.length]}
            />
          ))}
        </Pie>
        {tooltip}
        {legend}
      </PieChart>
    );
  } else if (block.chart_type === 'scatter') {
    chart = (
      <ScatterChart>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name={block.x.label}
          tick={tick}
          stroke={grid}
        />
        <YAxis type="number" dataKey="y" tick={tick} stroke={grid} />
        {tooltip}
        {legend}
        {block.series.map((s, i) => (
          <Scatter
            key={s.key}
            name={seriesLabel(s)}
            data={block.data.map((row) => ({ x: row[xKey], y: row[s.key] }))}
            fill={MARIA_CHART_COLORS[i % MARIA_CHART_COLORS.length]}
          />
        ))}
      </ScatterChart>
    );
  } else if (block.chart_type === 'line' || block.chart_type === 'area') {
    const Chart = block.chart_type === 'area' ? AreaChart : LineChart;
    chart = (
      <Chart data={data}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis {...categoryAxisProps} />
        <YAxis {...valueAxisProps} width={56} />
        {tooltip}
        {legend}
        {block.series.map((s, i) => {
          const color = MARIA_CHART_COLORS[i % MARIA_CHART_COLORS.length];
          return block.chart_type === 'area' ? (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={seriesLabel(s)}
              stackId={stackId}
              stroke={color}
              fill={color}
              fillOpacity={0.25}
              connectNulls
            />
          ) : (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={seriesLabel(s)}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2.5 }}
              connectNulls
            />
          );
        })}
      </Chart>
    );
  } else {
    chart = (
      <BarChart data={data} layout={horizontal ? 'vertical' : 'horizontal'}>
        <CartesianGrid
          stroke={grid}
          strokeDasharray="3 3"
          vertical={horizontal}
          horizontal={!horizontal}
        />
        {horizontal ? (
          <>
            <XAxis type="number" {...valueAxisProps} />
            <YAxis
              type="category"
              {...categoryAxisProps}
              width={140}
              interval={0}
            />
          </>
        ) : (
          <>
            <XAxis {...categoryAxisProps} />
            <YAxis {...valueAxisProps} width={56} />
          </>
        )}
        {tooltip}
        {block.series.length > 1 && legend}
        {block.series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={seriesLabel(s)}
            stackId={stackId}
            fill={MARIA_CHART_COLORS[i % MARIA_CHART_COLORS.length]}
            radius={stackId ? 0 : horizontal ? [0, 3, 3, 0] : [3, 3, 0, 0]}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-lg border border-slate-200/80 dark:border-neutral-800/80">
      <BlockHeader
        icon={BarChart3}
        title={block.title}
        action={
          <CsvButton
            onClick={() =>
              downloadCsv([block.x, ...block.series], block.data, block)
            }
          />
        }
      />
      <div style={{ height }} role="img" aria-label={block.title}>
        <ResponsiveContainer width="100%" height="100%">
          {chart}
        </ResponsiveContainer>
      </div>
      <BlockFooter
        origin={block.origin}
        truncated={block.truncated}
        count={block.data.length}
        grouped={!!block.group}
      />
    </div>
  );
}

// --- Tabela ------------------------------------------------------------------------

export function MariaTable({ block }: { block: MariaTableBlock }) {
  return (
    <div className="bg-white dark:bg-neutral-950 p-3.5 rounded-lg border border-slate-200/80 dark:border-neutral-800/80">
      <BlockHeader
        icon={Table2}
        title={block.title || 'Tabela'}
        action={
          <CsvButton
            onClick={() => downloadCsv(block.columns, block.rows, block)}
          />
        }
      />
      <div className="overflow-x-auto max-h-96 rounded-md border border-slate-100 dark:border-neutral-900">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-50 dark:bg-neutral-900">
            <tr>
              {block.columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-2.5 py-1.5 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap ${
                    col.type === 'number' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-slate-100 dark:border-neutral-900 hover:bg-slate-50/60 dark:hover:bg-neutral-900/50"
              >
                {block.columns.map((col) => {
                  const value = row[col.key];
                  const isNumber = col.type === 'number';
                  return (
                    <td
                      key={col.key}
                      className={`px-2.5 py-1.5 text-slate-700 dark:text-slate-300 ${
                        isNumber ? 'text-right font-mono tabular-nums' : ''
                      }`}
                    >
                      {isNumber && typeof value === 'number'
                        ? numberFormat(value)
                        : String(value ?? '—')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BlockFooter
        origin={block.origin}
        truncated={block.truncated}
        count={block.rows.length}
      />
    </div>
  );
}
