import type { ChartBlock } from '@/entities/conversation/model';

// Dados de um bloco `chart` da MarIA prontos para o Recharts. Funções puras,
// para testar sem desenhar.

/**
 * Cores das séries. A primeira é a cor da MarIA; as demais saltam pela escala
 * neutra (DESIGN.md §2.4) para que séries vizinhas não fiquem parecidas.
 */
const SERIES_COLORS = [
  'var(--color-search-maria)',
  'var(--color-chart-neutral-1)',
  'var(--color-chart-neutral-6)',
  'var(--color-chart-neutral-3)',
  'var(--color-chart-neutral-5)',
  'var(--color-chart-neutral-2)',
  'var(--color-chart-neutral-4)',
] as const;

export function seriesColor(index: number): string {
  const size = SERIES_COLORS.length;
  return SERIES_COLORS[((index % size) + size) % size] as string;
}

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
const dateFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

export function formatCompact(value: number): string {
  return Math.abs(value) >= 10000
    ? compactFormat.format(value)
    : numberFormat.format(value);
}

export function formatPercent(ratio: number): string {
  return percentFormat.format(ratio);
}

/** Rótulo do eixo x: datas em dd/mm/aaaa, o resto como veio. */
export function formatCategory(
  value: unknown,
  type: ChartBlock['x']['type'],
): string {
  if (value == null) return '—';
  if (type === 'date' && typeof value === 'string') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return dateFormat.format(date);
  }
  return String(value);
}

/** Soma das séries numa linha (base do empilhamento percentual). */
export function rowTotal(
  row: Record<string, unknown>,
  seriesKeys: readonly string[],
): number {
  return seriesKeys.reduce((sum, key) => sum + (toNumber(row[key]) ?? 0), 0);
}

/**
 * Linhas com o eixo x como texto e as séries como número (`null` quando
 * falta), que é o que o Recharts espera.
 */
export function chartRows(block: ChartBlock): Record<string, unknown>[] {
  return block.data.map((row) => {
    const next: Record<string, unknown> = {
      ...row,
      [block.x.key]:
        block.chart_type === 'scatter'
          ? toNumber(row[block.x.key])
          : formatCategory(row[block.x.key], block.x.type),
    };
    for (const series of block.series) {
      next[series.key] = toNumber(row[series.key]);
    }
    return next;
  });
}

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

const MAX_PIE_SLICES = 6;

/**
 * Fatias da pizza: a primeira série por categoria do eixo x, maiores
 * primeiro. Acima de 6, as menores viram "Outros".
 */
export function pieSlices(block: ChartBlock): PieSlice[] {
  const series = block.series[0];
  if (!series) return [];
  const slices = block.data
    .map((row) => ({
      name: formatCategory(row[block.x.key], block.x.type),
      value: toNumber(row[series.key]) ?? 0,
    }))
    .filter((slice) => slice.value > 0)
    .sort((a, b) => b.value - a.value);

  const visible =
    slices.length > MAX_PIE_SLICES
      ? [
          ...slices.slice(0, MAX_PIE_SLICES - 1),
          {
            name: 'Outros',
            value: slices
              .slice(MAX_PIE_SLICES - 1)
              .reduce((sum, slice) => sum + slice.value, 0),
          },
        ]
      : slices;

  return visible.map((slice, index) => ({
    ...slice,
    color: seriesColor(index),
  }));
}
