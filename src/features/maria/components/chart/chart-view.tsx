import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type Ref,
} from 'react';
import type { ChartBlock } from '@/entities/conversation/model';
import { cn } from '@/shared/lib/cn';
import { chartSeriesColor } from '@/shared/lib/design-tokens';
import {
  abbreviate,
  buildChartFrame,
  formatPercent,
  formatTick,
  formatValue,
  niceTicks,
  pieSlices,
  positionExtent,
  rowShares,
  stackRow,
  valueExtent,
  wrapLabel,
  chartLegend,
  type ChartFrame,
  type LegendItem,
  type PieSlice,
} from './chart-model';

// Gráfico SVG próprio para os 6 tipos da MarIA (bar, line, area, pie, donut,
// scatter). Segue o kit (DESIGN.md §2.4) e as regras de visualização: marcas
// finas, barras de até 24px com ponta arredondada, linhas de 2px, grade
// discreta, legenda a partir de 2 séries e tooltip ao passar o mouse ou ao
// navegar com as setas do teclado.

const VERTICAL_HEIGHT = 260;
const MARGIN = { top: 12, right: 16, bottom: 34 };
const BAR_MAX = 24;
const GAP = 2;
const RADIUS = 4;
const CHAR_WIDTH = 6.4;
const DEFAULT_WIDTH = 640;

/** Largura do container, acompanhando redimensionamentos. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      if (element.clientWidth > 0) setWidth(element.clientWidth);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

type BarEnd = 'top' | 'bottom' | 'left' | 'right' | null;

/** Retângulo com cantos de 4px só na ponta do dado (quadrado na base). */
function barPath(
  x: number,
  y: number,
  width: number,
  height: number,
  end: BarEnd,
): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  const r = Math.min(RADIUS, w / 2, h / 2);
  if (!end || r <= 0) return `M${x},${y}h${w}v${h}h${-w}Z`;
  switch (end) {
    case 'top':
      return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
    case 'bottom':
      return `M${x},${y}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w - r}Q${x + w},${y + h} ${x + w},${y + h - r}V${y}Z`;
    case 'right':
      return `M${x},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h - r}Q${x + w},${y + h} ${x + w - r},${y + h}H${x}Z`;
    case 'left':
      return `M${x + w},${y}H${x + r}Q${x},${y} ${x},${y + r}V${y + h - r}Q${x},${y + h} ${x + r},${y + h}H${x + w}Z`;
  }
}

function linear(domain: [number, number], range: [number, number]) {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const span = d1 - d0 || 1;
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0);
}

/** Uma linha de série no tooltip. */
interface TooltipRow {
  label: string;
  color: string;
  value: string;
}

interface TooltipState {
  title: string;
  rows: TooltipRow[];
  x: number;
  y: number;
}

function Tooltip({ state, width }: { state: TooltipState; width: number }) {
  const half = 120;
  const left = Math.min(Math.max(state.x, half), Math.max(half, width - half));
  return (
    <div
      role="presentation"
      className="pointer-events-none absolute z-10 w-max max-w-[240px] -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
      style={{ left, top: Math.max(0, state.y - 8) }}
    >
      <p className="mb-1 font-semibold">{state.title}</p>
      <ul className="flex flex-col gap-0.5">
        {state.rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: row.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {row.label}
            </span>
            <span className="font-medium tabular-nums">{row.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function seriesRows(frame: ChartFrame, rowIndex: number): TooltipRow[] {
  const row = frame.values[rowIndex] ?? [];
  const shares = rowShares(row);
  return frame.series.map((series, index) => {
    const value = row[index] ?? null;
    const formatted = formatValue(value, series.unit);
    return {
      label: series.label,
      color: chartSeriesColor(series.colorIndex),
      value:
        frame.stacking === 'percent' && value !== null
          ? `${formatPercent(shares[index] ?? 0)} · ${formatted}`
          : formatted,
    };
  });
}

export function ChartLegend({
  items,
  title,
}: {
  items: LegendItem[];
  title?: string | null;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs">
      {title && <span className="text-muted-foreground">{title}:</span>}
      <ul className="contents">
        {items.map((item) => (
          <li key={item.label} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-foreground">{item.label}</span>
            {item.detail && (
              <span className="text-muted-foreground tabular-nums">
                {item.detail}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Cartesiano (bar, line, area, scatter) -------------------------------------

interface CartesianProps {
  frame: ChartFrame;
  width: number;
  label: string;
  svgRef?: Ref<SVGSVGElement>;
}

function CartesianChart({ frame, width, label, svgRef }: CartesianProps) {
  const [active, setActive] = useState<number | null>(null);
  const descriptionId = useId();
  const count = frame.categories.length;
  const percent = frame.stacking === 'percent';
  const horizontal = frame.horizontal;
  const stacked = frame.stacking !== null;

  const [minValue, maxValue] = valueExtent(frame);
  const ticks = niceTicks(minValue, maxValue);
  const tickMin = ticks[0] ?? 0;
  const tickMax = ticks.at(-1) ?? 1;
  const tickLabelWidth =
    Math.max(...ticks.map((tick) => formatTick(tick, percent).length)) *
      CHAR_WIDTH +
    10;

  // Horizontal: rótulos das categorias à esquerda, quebrados em 2 linhas.
  const labelChars = horizontal
    ? Math.max(
        8,
        Math.min(
          Math.max(...frame.categories.map((c) => c.label.length)),
          Math.floor((width * 0.38) / CHAR_WIDTH),
          30,
        ),
      )
    : 0;
  const left = horizontal ? labelChars * CHAR_WIDTH + 12 : tickLabelWidth;
  const groupedBars =
    frame.kind === 'bar' && !stacked && frame.series.length > 1;
  const band = horizontal
    ? Math.max(32, groupedBars ? frame.series.length * 14 + 12 : 32)
    : 0;
  const height = horizontal
    ? MARGIN.top + count * band + MARGIN.bottom
    : VERTICAL_HEIGHT;

  const plot = {
    left,
    right: width - MARGIN.right,
    top: MARGIN.top,
    bottom: height - MARGIN.bottom,
  };

  // Posição ao longo das categorias (centro de cada uma).
  const numericX =
    !horizontal && frame.kind !== 'bar' ? positionExtent(frame) : null;
  const useNumeric = numericX !== null && numericX[0] !== numericX[1];
  const along = horizontal
    ? { start: plot.top, end: plot.bottom }
    : { start: plot.left, end: plot.right };
  const step = (along.end - along.start) / Math.max(1, count);
  const xNumeric = useNumeric
    ? linear(numericX, [along.start + 12, along.end - 12])
    : null;
  const center = (index: number) => {
    const position = frame.categories[index]?.position;
    if (xNumeric && position !== null && position !== undefined) {
      return xNumeric(position);
    }
    return along.start + step * (index + 0.5);
  };
  const value = horizontal
    ? linear([tickMin, tickMax], [plot.left, plot.right])
    : linear([tickMin, tickMax], [plot.bottom, plot.top]);
  const zero = value(Math.max(tickMin, Math.min(0, tickMax)));

  const stacks = useMemo(
    () =>
      frame.values.map((row) =>
        frame.stacking ? stackRow(row, frame.stacking) : null,
      ),
    [frame],
  );

  function nearest(pointer: number): number {
    let best = 0;
    let distance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < count; index += 1) {
      const gap = Math.abs(center(index) - pointer);
      if (gap < distance) {
        distance = gap;
        best = index;
      }
    }
    return best;
  }

  function handlePointer(event: PointerEvent<SVGRectElement>) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const scale = box.width > 0 ? width / box.width : 1;
    const pointer = horizontal
      ? (event.clientY - box.top) * scale
      : (event.clientX - box.left) * scale;
    setActive(nearest(pointer));
  }

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    const next = horizontal ? 'ArrowDown' : 'ArrowRight';
    const previous = horizontal ? 'ArrowUp' : 'ArrowLeft';
    if (event.key === next || event.key === previous) {
      event.preventDefault();
      const delta = event.key === next ? 1 : -1;
      setActive((current) =>
        Math.min(count - 1, Math.max(0, (current ?? -delta) + delta)),
      );
    } else if (event.key === 'Escape') {
      setActive(null);
    }
  }

  // Valor (início/fim) de cada série numa categoria.
  function extent(rowIndex: number, seriesIndex: number) {
    const stack = stacks[rowIndex];
    if (stack) {
      const segment = stack[seriesIndex];
      return segment ? [segment.start, segment.end] : [0, 0];
    }
    const raw = frame.values[rowIndex]?.[seriesIndex];
    return raw === null || raw === undefined ? null : [0, raw];
  }

  // Rótulos das categorias no eixo vertical: abrevia e pula quando não cabem.
  const maxLabelChars = Math.max(3, Math.floor(step / CHAR_WIDTH) - 1);
  const labelEvery = horizontal
    ? 1
    : Math.max(
        1,
        Math.ceil(
          count / Math.max(1, Math.floor((plot.right - plot.left) / 44)),
        ),
      );

  const bars =
    frame.kind === 'bar'
      ? frame.categories.flatMap((_, rowIndex) => {
          const middle = center(rowIndex);
          if (stacked) {
            const thickness = Math.min(BAR_MAX, step * 0.6);
            const stack = stacks[rowIndex] ?? [];
            let lastPositive = -1;
            let lastNegative = -1;
            stack.forEach((segment, index) => {
              if (segment.end > segment.start) lastPositive = index;
              if (segment.end < segment.start) lastNegative = index;
            });
            return frame.series.map((series, seriesIndex) => {
              const segment = stack[seriesIndex];
              if (!segment || segment.end === segment.start) return null;
              const positive = segment.end > segment.start;
              const outer =
                seriesIndex === (positive ? lastPositive : lastNegative);
              const a = value(segment.start);
              const b = value(segment.end);
              // Folga de 2px entre segmentos, na cor da superfície.
              const inset = Math.abs(b - a) > GAP * 2 ? GAP / 2 : 0;
              const end: BarEnd = outer
                ? horizontal
                  ? positive
                    ? 'right'
                    : 'left'
                  : positive
                    ? 'top'
                    : 'bottom'
                : null;
              const d = horizontal
                ? barPath(
                    Math.min(a, b) + inset,
                    middle - thickness / 2,
                    Math.abs(b - a) - inset * 2,
                    thickness,
                    end,
                  )
                : barPath(
                    middle - thickness / 2,
                    Math.min(a, b) + inset,
                    thickness,
                    Math.abs(b - a) - inset * 2,
                    end,
                  );
              return (
                <path
                  key={`${rowIndex}-${series.key}`}
                  d={d}
                  style={{ fill: chartSeriesColor(series.colorIndex) }}
                  opacity={active === null || active === rowIndex ? 1 : 0.45}
                />
              );
            });
          }
          const n = frame.series.length;
          const slot = (step * 0.8) / n;
          const thickness = Math.max(2, Math.min(BAR_MAX, slot - GAP));
          const groupSize = n * thickness + (n - 1) * GAP;
          return frame.series.map((series, seriesIndex) => {
            const range = extent(rowIndex, seriesIndex);
            if (!range) return null;
            const offset =
              middle - groupSize / 2 + seriesIndex * (thickness + GAP);
            const a = value(range[0] ?? 0);
            const b = value(range[1] ?? 0);
            const positive = (range[1] ?? 0) >= 0;
            const end: BarEnd = horizontal
              ? positive
                ? 'right'
                : 'left'
              : positive
                ? 'top'
                : 'bottom';
            const d = horizontal
              ? barPath(Math.min(a, b), offset, Math.abs(b - a), thickness, end)
              : barPath(
                  offset,
                  Math.min(a, b),
                  thickness,
                  Math.abs(b - a),
                  end,
                );
            return (
              <path
                key={`${rowIndex}-${series.key}`}
                d={d}
                style={{ fill: chartSeriesColor(series.colorIndex) }}
                opacity={active === null || active === rowIndex ? 1 : 0.45}
              />
            );
          });
        })
      : null;

  // Linhas, áreas e pontos: um caminho por série, quebrado em valores nulos.
  function seriesPoints(seriesIndex: number) {
    return frame.categories.map((_, rowIndex) => {
      const range = extent(rowIndex, seriesIndex);
      if (!range) return null;
      return {
        x: center(rowIndex),
        y: value(range[1] ?? 0),
        base: value(range[0] ?? 0),
      };
    });
  }

  const lines =
    frame.kind === 'line' || frame.kind === 'area'
      ? frame.series.map((series, seriesIndex) => {
          const points = seriesPoints(seriesIndex);
          const runs: { x: number; y: number; base: number }[][] = [];
          let run: { x: number; y: number; base: number }[] = [];
          for (const point of points) {
            if (point) run.push(point);
            else if (run.length) {
              runs.push(run);
              run = [];
            }
          }
          if (run.length) runs.push(run);
          const color = chartSeriesColor(series.colorIndex);
          return (
            <g key={series.key}>
              {frame.kind === 'area' &&
                runs.map((segment, index) => (
                  <path
                    key={`area-${index}`}
                    d={`M${segment.map((p) => `${p.x},${p.y}`).join('L')}L${[
                      ...segment,
                    ]
                      .reverse()
                      .map((p) => `${p.x},${p.base}`)
                      .join('L')}Z`}
                    style={{ fill: color }}
                    fillOpacity={stacked ? 0.28 : 0.1}
                  />
                ))}
              {runs.map((segment, index) => (
                <path
                  key={`line-${index}`}
                  d={`M${segment.map((p) => `${p.x},${p.y}`).join('L')}`}
                  fill="none"
                  style={{ stroke: color }}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
              {points.map((point, rowIndex) =>
                point && (count <= 24 || rowIndex === active) ? (
                  <circle
                    key={rowIndex}
                    cx={point.x}
                    cy={point.y}
                    r={rowIndex === active ? 5 : 4}
                    style={{ fill: color }}
                    className="stroke-card"
                    strokeWidth={2}
                  />
                ) : null,
              )}
            </g>
          );
        })
      : null;

  const dots =
    frame.kind === 'scatter'
      ? frame.series.map((series, seriesIndex) => (
          <g key={series.key}>
            {seriesPoints(seriesIndex).map((point, rowIndex) =>
              point ? (
                <circle
                  key={rowIndex}
                  cx={point.x}
                  cy={point.y}
                  r={rowIndex === active ? 6 : 4.5}
                  style={{ fill: chartSeriesColor(series.colorIndex) }}
                  className="stroke-card"
                  strokeWidth={2}
                  opacity={active === null || active === rowIndex ? 1 : 0.5}
                />
              ) : null,
            )}
          </g>
        ))
      : null;

  const tooltip: TooltipState | null =
    active !== null && frame.categories[active]
      ? {
          title: frame.categories[active].label,
          rows: seriesRows(frame, active),
          x: horizontal ? (plot.left + plot.right) / 2 : center(active),
          y: horizontal ? center(active) - band / 2 : plot.top,
        }
      : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        role="img"
        aria-label={label}
        aria-describedby={descriptionId}
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height={height}
        tabIndex={0}
        onKeyDown={handleKey}
        onBlur={() => setActive(null)}
        className="block overflow-visible text-foreground outline-none focus-visible:ring-2 focus-visible:ring-eng-blue"
        style={{ fontFamily: 'inherit' }}
      >
        {/* Grade e marcações do eixo de valores. */}
        <g className="text-[11px] tabular-nums">
          {ticks.map((tick) => {
            const position = value(tick);
            return horizontal ? (
              <g key={tick}>
                <line
                  x1={position}
                  x2={position}
                  y1={plot.top}
                  y2={plot.bottom}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={position}
                  y={plot.bottom + 16}
                  textAnchor="middle"
                  className="fill-muted-foreground"
                >
                  {formatTick(tick, percent)}
                </text>
              </g>
            ) : (
              <g key={tick}>
                <line
                  x1={plot.left}
                  x2={plot.right}
                  y1={position}
                  y2={position}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={plot.left - 8}
                  y={position}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-muted-foreground"
                >
                  {formatTick(tick, percent)}
                </text>
              </g>
            );
          })}
        </g>

        {/* Linha de base (zero). */}
        {horizontal ? (
          <line
            x1={zero}
            x2={zero}
            y1={plot.top}
            y2={plot.bottom}
            className="stroke-muted-foreground"
            strokeOpacity={0.5}
            strokeWidth={1}
          />
        ) : (
          <line
            x1={plot.left}
            x2={plot.right}
            y1={zero}
            y2={zero}
            className="stroke-muted-foreground"
            strokeOpacity={0.5}
            strokeWidth={1}
          />
        )}

        {/* Rótulos das categorias. */}
        <g className="text-[11px]">
          {frame.categories.map((category, index) => {
            if (index % labelEvery !== 0) return null;
            if (horizontal) {
              const lines = wrapLabel(category.label, labelChars, 2);
              const y = center(index) - ((lines.length - 1) * 13) / 2;
              return (
                <text
                  key={index}
                  x={plot.left - 8}
                  y={y}
                  textAnchor="end"
                  className="fill-muted-foreground"
                >
                  <title>{category.label}</title>
                  {lines.map((line, lineIndex) => (
                    <tspan
                      key={lineIndex}
                      x={plot.left - 8}
                      dy={lineIndex === 0 ? '0.32em' : 13}
                    >
                      {line}
                    </tspan>
                  ))}
                </text>
              );
            }
            return (
              <text
                key={index}
                x={center(index)}
                y={plot.bottom + 18}
                textAnchor="middle"
                className="fill-muted-foreground"
              >
                <title>{category.label}</title>
                {abbreviate(category.label, maxLabelChars * labelEvery)}
              </text>
            );
          })}
        </g>

        {/* Guia vertical da categoria ativa (linha e área). */}
        {active !== null &&
          !horizontal &&
          (frame.kind === 'line' || frame.kind === 'area') && (
            <line
              x1={center(active)}
              x2={center(active)}
              y1={plot.top}
              y2={plot.bottom}
              className="stroke-muted-foreground"
              strokeOpacity={0.6}
              strokeWidth={1}
            />
          )}

        {bars}
        {lines}
        {dots}

        {/* Área de captura do ponteiro (maior que as marcas). */}
        <rect
          x={plot.left}
          y={plot.top}
          width={Math.max(0, plot.right - plot.left)}
          height={Math.max(0, plot.bottom - plot.top)}
          fill="transparent"
          data-export="skip"
          onPointerMove={handlePointer}
          onPointerDown={handlePointer}
          onPointerLeave={() => setActive(null)}
        />
      </svg>
      <p id={descriptionId} className="sr-only">
        Use as setas do teclado para percorrer as categorias. Os valores também
        estão em &quot;Ver tabela&quot;.
      </p>
      {tooltip && <Tooltip state={tooltip} width={width} />}
    </div>
  );
}

// --- Pizza e rosca ------------------------------------------------------------

function arcPath(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  start: number,
  end: number,
): string {
  // Fatia única: dois semicírculos (o arco SVG não fecha 360°).
  if (end - start >= Math.PI * 2 - 1e-6) {
    const ring = (r: number, sweep: 0 | 1) =>
      `M${cx + r},${cy}A${r},${r} 0 1 ${sweep} ${cx - r},${cy}A${r},${r} 0 1 ${sweep} ${cx + r},${cy}Z`;
    return inner > 0 ? `${ring(outer, 1)}${ring(inner, 0)}` : ring(outer, 1);
  }
  const point = (r: number, angle: number) =>
    `${cx + r * Math.sin(angle)},${cy - r * Math.cos(angle)}`;
  const large = end - start > Math.PI ? 1 : 0;
  if (inner <= 0) {
    return `M${cx},${cy}L${point(outer, start)}A${outer},${outer} 0 ${large} 1 ${point(outer, end)}Z`;
  }
  return `M${point(outer, start)}A${outer},${outer} 0 ${large} 1 ${point(outer, end)}L${point(inner, end)}A${inner},${inner} 0 ${large} 0 ${point(inner, start)}Z`;
}

function PieChart({ frame, width, label, svgRef }: CartesianProps) {
  const [active, setActive] = useState<number | null>(null);
  const slices = pieSlices(frame);
  const size = Math.min(240, width);
  const cx = width / 2;
  const cy = size / 2;
  const outer = size / 2 - 4;
  const inner = frame.kind === 'donut' ? outer * 0.6 : 0;
  const unit = frame.series[0]?.unit ?? null;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const arcs = slices.reduce<
    { slice: PieSlice; index: number; start: number; end: number }[]
  >((list, slice, index) => {
    const start = list.at(-1)?.end ?? 0;
    return [
      ...list,
      { slice, index, start, end: start + slice.share * Math.PI * 2 },
    ];
  }, []);

  function handleKey(event: KeyboardEvent<SVGSVGElement>) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      setActive((current) =>
        Math.min(slices.length - 1, Math.max(0, (current ?? -delta) + delta)),
      );
    } else if (event.key === 'Escape') setActive(null);
  }

  const current = active !== null ? arcs[active] : undefined;
  const tooltip: TooltipState | null = current
    ? {
        title: current.slice.label,
        rows: [
          {
            label: frame.series[0]?.label ?? 'Valor',
            color: chartSeriesColor(current.slice.colorIndex ?? -1),
            value: `${formatPercent(current.slice.share)} · ${formatValue(current.slice.value, unit)}`,
          },
        ],
        x: cx,
        y: 8,
      }
    : null;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${size}`}
        width="100%"
        height={size}
        tabIndex={0}
        onKeyDown={handleKey}
        onBlur={() => setActive(null)}
        className="block text-foreground outline-none focus-visible:ring-2 focus-visible:ring-eng-blue"
      >
        {arcs.map(({ slice, index, start, end }) => (
          <path
            key={slice.label}
            d={arcPath(
              cx,
              cy,
              active === index ? outer + 3 : outer,
              inner,
              start,
              end,
            )}
            style={{ fill: chartSeriesColor(slice.colorIndex ?? -1) }}
            className="stroke-card"
            strokeWidth={slices.length > 1 ? GAP : 0}
            opacity={active === null || active === index ? 1 : 0.55}
            onPointerEnter={() => setActive(index)}
            onPointerDown={() => setActive(index)}
            onPointerLeave={() => setActive(null)}
          />
        ))}
        {inner > 0 && (
          <g>
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              className="fill-foreground text-base font-semibold"
            >
              {formatTick(total)}
            </text>
            <text
              x={cx}
              y={cy + 14}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {unit ?? 'total'}
            </text>
          </g>
        )}
      </svg>
      {tooltip && <Tooltip state={tooltip} width={width} />}
    </div>
  );
}

// --- Entrada ------------------------------------------------------------------

export interface ChartViewProps {
  block: ChartBlock;
  svgRef?: Ref<SVGSVGElement>;
  className?: string;
}

/** Desenha o gráfico de um bloco `chart`, com legenda quando há 2+ séries. */
export function ChartView({ block, svgRef, className }: ChartViewProps) {
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const frame = useMemo(() => buildChartFrame(block), [block]);
  const legend = chartLegend(frame);
  const pie = frame.kind === 'pie' || frame.kind === 'donut';
  const empty =
    frame.categories.length === 0 ||
    frame.series.length === 0 ||
    (pie && pieSlices(frame).length === 0);

  return (
    <div ref={containerRef} className={cn('flex flex-col gap-3', className)}>
      {empty ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Sem valores para desenhar o gráfico.
        </p>
      ) : pie ? (
        <PieChart
          frame={frame}
          width={width}
          label={block.title}
          svgRef={svgRef}
        />
      ) : (
        <CartesianChart
          frame={frame}
          width={width}
          label={block.title}
          svgRef={svgRef}
        />
      )}
      <ChartLegend
        items={legend}
        title={!pie ? (block.group?.label ?? null) : null}
      />
      {frame.hiddenSeries > 0 && (
        <p className="text-xs text-muted-foreground">
          Mais {frame.hiddenSeries}{' '}
          {frame.hiddenSeries === 1 ? 'série está' : 'séries estão'} só na
          tabela.
        </p>
      )}
    </div>
  );
}
