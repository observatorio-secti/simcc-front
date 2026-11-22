import type { ChartBlock } from '@/entities/conversation/model';
import { CHART_SERIES_MAX, chartSeriesColor } from '@/shared/lib/design-tokens';

// Modelo dos gráficos da MarIA: transforma um `ChartBlock` em categorias,
// séries e valores numéricos, e calcula empilhamento, escalas e rótulos. Sem
// React, para ser testado isolado.
//
// Formato confirmado com a API: `data` já vem "pivotado", uma linha por valor
// de `x` e uma coluna por série (`series[].key`). `group` só informa qual
// coluna da fonte separou as séries (vira o título da legenda).

const numberFormat = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 2,
});
const compactFormat = new Intl.NumberFormat('pt-BR', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const percentFormat = new Intl.NumberFormat('pt-BR', {
  style: 'percent',
  maximumFractionDigits: 1,
});
const dateFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const monthFormat = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
});

export type ChartKind = ChartBlock['chart_type'];
export type AxisType = ChartBlock['x']['type'];

export interface ChartCategory {
  /** Valor cru de `x` na linha. */
  raw: unknown;
  /** Rótulo pronto para o eixo e o tooltip. */
  label: string;
  /** Posição numérica (eixo `number` ou `date`); `null` em categoria. */
  position: number | null;
}

export interface ChartSeriesInfo {
  key: string;
  label: string;
  unit: string | null;
  /** Posição na paleta categórica (0 a 7). */
  colorIndex: number;
}

export interface ChartFrame {
  kind: ChartKind;
  axisType: AxisType;
  categories: ChartCategory[];
  series: ChartSeriesInfo[];
  /** `values[linha][série]`; `null` quando a célula não é número. */
  values: (number | null)[][];
  /** Séries que não couberam na paleta (só aparecem na tabela e no CSV). */
  hiddenSeries: number;
  stacking: 'absolute' | 'percent' | null;
  horizontal: boolean;
}

/** Número de uma célula: aceita número ou texto numérico ("12,5" não). */
export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

/** "1.234,5" (pt-BR). */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** Valor com a unidade da série: "1.234 bolsas". */
export function formatValue(value: number | null, unit?: string | null) {
  if (value === null) return '—';
  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

export function formatPercent(fraction: number): string {
  return percentFormat.format(fraction);
}

/** Rótulo de marcação de eixo: compacto a partir de 10 mil ("12 mil"). */
export function formatTick(value: number, percent = false): string {
  if (percent) return percentFormat.format(value / 100);
  return Math.abs(value) >= 10000
    ? compactFormat.format(value)
    : numberFormat.format(value);
}

function isYear(value: number) {
  return Number.isInteger(value) && value >= 1000 && value <= 2999;
}

function parseDate(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  // "2024" e "2024-03" também são datas.
  if (/^\d{4}$/.test(value)) return Date.UTC(Number(value), 0, 1);
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);
    return Date.UTC(year ?? 0, (month ?? 1) - 1, 1);
  }
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
}

/** Rótulo de um valor de `x` conforme o tipo do eixo. */
export function formatAxisValue(value: unknown, type: AxisType): string {
  if (value === null || value === undefined || value === '') return '—';
  if (type === 'number') {
    const number = toNumber(value);
    if (number === null) return String(value);
    // Ano chega como número: "2024", não "2.024".
    return isYear(number) ? String(number) : formatNumber(number);
  }
  if (type === 'date') {
    if (typeof value === 'string' && /^\d{4}$/.test(value)) return value;
    if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
      const time = parseDate(value);
      return time === null ? value : monthFormat.format(time);
    }
    const time = parseDate(value);
    return time === null ? String(value) : dateFormat.format(time);
  }
  return String(value);
}

function categoryPosition(value: unknown, type: AxisType): number | null {
  if (type === 'number') return toNumber(value);
  if (type === 'date') return parseDate(value);
  return null;
}

/** Normaliza o bloco: séries que cabem na paleta, valores numéricos e `x`. */
export function buildChartFrame(block: ChartBlock): ChartFrame {
  const pie = block.chart_type === 'pie' || block.chart_type === 'donut';
  const usable = pie ? block.series.slice(0, 1) : block.series;
  const series = usable.slice(0, CHART_SERIES_MAX).map((item, index) => ({
    key: item.key,
    label: item.label,
    unit: item.unit ?? null,
    colorIndex: index,
  }));
  const categories = block.data.map((row) => ({
    raw: row[block.x.key],
    label: formatAxisValue(row[block.x.key], block.x.type),
    position: categoryPosition(row[block.x.key], block.x.type),
  }));
  const values = block.data.map((row) =>
    series.map((item) => toNumber(row[item.key])),
  );
  return {
    kind: block.chart_type,
    axisType: block.x.type,
    categories,
    series,
    values,
    hiddenSeries: usable.length - series.length,
    stacking: pie ? null : (block.stacking ?? null),
    horizontal:
      block.chart_type === 'bar' && block.orientation === 'horizontal',
  };
}

/** Participação de cada série na linha (0 a 1). Linha sem total vira zeros. */
export function rowShares(row: readonly (number | null)[]): number[] {
  const total = row.reduce<number>(
    (sum, value) => sum + Math.max(0, value ?? 0),
    0,
  );
  return row.map((value) => (total > 0 ? Math.max(0, value ?? 0) / total : 0));
}

export interface StackSegment {
  start: number;
  end: number;
}

/**
 * Segmentos empilhados de uma linha, na ordem das séries. Em `percent` os
 * valores viram porcentagem (0 a 100) da linha. Negativos empilham para baixo.
 */
export function stackRow(
  row: readonly (number | null)[],
  mode: 'absolute' | 'percent',
): StackSegment[] {
  const values =
    mode === 'percent' ? rowShares(row).map((share) => share * 100) : row;
  let positive = 0;
  let negative = 0;
  return values.map((value) => {
    const amount = value ?? 0;
    if (amount >= 0) {
      const segment = { start: positive, end: positive + amount };
      positive += amount;
      return segment;
    }
    const segment = { start: negative, end: negative + amount };
    negative += amount;
    return segment;
  });
}

/** Menor e maior valor do eixo de valores, considerando o empilhamento. */
export function valueExtent(frame: ChartFrame): [number, number] {
  if (frame.stacking === 'percent') return [0, 100];
  let min = 0;
  let max = 0;
  for (const row of frame.values) {
    if (frame.stacking === 'absolute') {
      for (const segment of stackRow(row, 'absolute')) {
        min = Math.min(min, segment.end);
        max = Math.max(max, segment.end);
      }
    } else {
      for (const value of row) {
        if (value === null) continue;
        min = Math.min(min, value);
        max = Math.max(max, value);
      }
    }
  }
  return [min, max];
}

function niceStep(span: number, count: number): number {
  const raw = span / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  const nice = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  return nice * power;
}

/** Marcações "redondas" cobrindo `[min, max]` (ex.: 0, 500, 1.000…). */
export function niceTicks(min: number, max: number, count = 5): number[] {
  if (min === max) {
    if (min === 0) return [0, 1];
    return min > 0 ? niceTicks(0, min, count) : niceTicks(min, 0, count);
  }
  const step = niceStep(max - min, count);
  const start = Math.floor(min / step) * step;
  const end = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = start; value <= end + step / 2; value += step) {
    // Evita 0.30000000000000004.
    ticks.push(Number(value.toPrecision(12)));
  }
  return ticks;
}

/** Extensão de posições numéricas (eixo `number`/`date`) com folga zero. */
export function positionExtent(frame: ChartFrame): [number, number] | null {
  const positions = frame.categories
    .map((category) => category.position)
    .filter((value): value is number => value !== null);
  if (positions.length !== frame.categories.length || positions.length === 0)
    return null;
  return [Math.min(...positions), Math.max(...positions)];
}

/**
 * Fatias de pizza/rosca: a primeira série, só valores positivos. Mais fatias
 * que a paleta são agrupadas em "Outros" (nunca repetir cor).
 */
export interface PieSlice {
  label: string;
  value: number;
  share: number;
  /** Índice da paleta; `null` para "Outros". */
  colorIndex: number | null;
  /** Linhas de `data` que a fatia representa. */
  rows: number[];
}

export function pieSlices(frame: ChartFrame): PieSlice[] {
  const entries = frame.values
    .map((row, index) => ({ index, value: Math.max(0, row[0] ?? 0) }))
    .filter((entry) => entry.value > 0);
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);
  if (total === 0) return [];

  const keep =
    entries.length > CHART_SERIES_MAX ? CHART_SERIES_MAX - 1 : entries.length;
  const sorted =
    entries.length > CHART_SERIES_MAX
      ? [...entries].sort((a, b) => b.value - a.value)
      : entries;
  const slices: PieSlice[] = sorted.slice(0, keep).map((entry, position) => ({
    label: frame.categories[entry.index]?.label ?? '—',
    value: entry.value,
    share: entry.value / total,
    colorIndex: position,
    rows: [entry.index],
  }));
  const rest = sorted.slice(keep);
  if (rest.length > 0) {
    const value = rest.reduce((sum, entry) => sum + entry.value, 0);
    slices.push({
      label: 'Outros',
      value,
      share: value / total,
      colorIndex: null,
      rows: rest.map((entry) => entry.index),
    });
  }
  return slices;
}

/** Encurta um rótulo longo com reticências (o completo vai no tooltip). */
export function abbreviate(label: string, maxChars: number): string {
  if (label.length <= maxChars) return label;
  return `${label.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

/**
 * Quebra um rótulo em até `maxLines` linhas de `maxChars` caracteres, por
 * palavra. O que sobra vira reticências na última linha.
 */
export function wrapLabel(
  label: string,
  maxChars: number,
  maxLines = 2,
): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of label.trim().split(/\s+/).filter(Boolean)) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxChars || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) {
    return lines.map((line) => abbreviate(line, maxChars));
  }
  const kept = lines.slice(0, maxLines);
  const last = kept.length - 1;
  const tail = kept[last] ?? '';
  kept[last] =
    tail.length >= maxChars ? abbreviate(tail, maxChars) : `${tail}…`;
  return kept.map((line) => abbreviate(line, maxChars));
}

export interface LegendItem {
  label: string;
  color: string;
  detail?: string;
}

/** Itens de legenda do gráfico (também usados no PNG). */
export function chartLegend(frame: ChartFrame): LegendItem[] {
  if (frame.kind === 'pie' || frame.kind === 'donut') {
    return pieSlices(frame).map((slice) => ({
      label: slice.label,
      color: chartSeriesColor(slice.colorIndex ?? -1),
      detail: formatPercent(slice.share),
    }));
  }
  if (frame.series.length < 2) return [];
  return frame.series.map((series) => ({
    label: series.label,
    color: chartSeriesColor(series.colorIndex),
  }));
}
