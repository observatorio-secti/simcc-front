import { describe, expect, it } from 'vitest';
import type { ChartBlock } from '@/entities/conversation/model';
import {
  buildChartFrame,
  chartLegend,
  formatAxisValue,
  formatTick,
  niceTicks,
  pieSlices,
  rowShares,
  stackRow,
  valueExtent,
  wrapLabel,
} from './chart-model';

function chart(overrides: Partial<ChartBlock> = {}): ChartBlock {
  return {
    type: 'chart',
    chart_type: 'bar',
    title: 'Bolsas',
    x: { key: 'ano', label: 'Ano', type: 'number' },
    series: [
      { key: 'a', label: 'A', unit: 'bolsas' },
      { key: 'b', label: 'B' },
    ],
    data: [
      { ano: 2021, a: 30, b: 10 },
      { ano: 2022, a: '50', b: null },
    ],
    orientation: 'vertical',
    truncated: false,
    ...overrides,
  };
}

describe('buildChartFrame', () => {
  it('lê x e séries das linhas já pivotadas pela API', () => {
    const frame = buildChartFrame(chart());
    expect(frame.categories.map((c) => c.label)).toEqual(['2021', '2022']);
    expect(frame.values).toEqual([
      [30, 10],
      [50, null],
    ]);
    expect(frame.series[1]).toMatchObject({ unit: null, colorIndex: 1 });
  });

  it('pizza usa só a primeira série; horizontal só vale para bar', () => {
    expect(buildChartFrame(chart({ chart_type: 'pie' })).series).toHaveLength(
      1,
    );
    expect(
      buildChartFrame(chart({ chart_type: 'line', orientation: 'horizontal' }))
        .horizontal,
    ).toBe(false);
    expect(
      buildChartFrame(chart({ orientation: 'horizontal' })).horizontal,
    ).toBe(true);
  });

  it('séries além da paleta não repetem cor: ficam só na tabela', () => {
    const series = Array.from({ length: 10 }, (_, i) => ({
      key: `s${i}`,
      label: `S${i}`,
    }));
    const frame = buildChartFrame(chart({ series }));
    expect(frame.series).toHaveLength(8);
    expect(frame.hiddenSeries).toBe(2);
  });
});

describe('empilhamento', () => {
  it('percent calcula a participação de cada série na linha', () => {
    expect(rowShares([30, 10])).toEqual([0.75, 0.25]);
    expect(stackRow([30, 10], 'percent')).toEqual([
      { start: 0, end: 75 },
      { start: 75, end: 100 },
    ]);
    expect(rowShares([0, null])).toEqual([0, 0]);
  });

  it('absolute empilha e negativos descem', () => {
    expect(stackRow([5, -2, 3], 'absolute')).toEqual([
      { start: 0, end: 5 },
      { start: 0, end: -2 },
      { start: 5, end: 8 },
    ]);
  });

  it('a extensão segue o modo', () => {
    expect(
      valueExtent(buildChartFrame(chart({ stacking: 'percent' }))),
    ).toEqual([0, 100]);
    expect(
      valueExtent(buildChartFrame(chart({ stacking: 'absolute' }))),
    ).toEqual([0, 50]);
    expect(valueExtent(buildChartFrame(chart()))).toEqual([0, 50]);
  });
});

describe('eixos e rótulos', () => {
  it('marcações redondas', () => {
    expect(niceTicks(0, 1478)).toEqual([0, 500, 1000, 1500]);
    expect(niceTicks(0, 0)).toEqual([0, 1]);
    expect(niceTicks(0, 0.3)).toEqual([0, 0.1, 0.2, 0.3]);
  });

  it('formata em pt-BR, ano sem separador e datas', () => {
    expect(formatTick(1500)).toBe('1.500');
    expect(formatTick(25000)).toMatch(/25\s?mil/);
    expect(formatTick(50, true)).toBe('50%');
    expect(formatAxisValue(2024, 'number')).toBe('2024');
    expect(formatAxisValue(12345.5, 'number')).toBe('12.345,5');
    expect(formatAxisValue('2024-03-15T00:00:00Z', 'date')).toBe('15/03/2024');
    expect(formatAxisValue('2024', 'date')).toBe('2024');
  });

  it('quebra rótulos longos em 2 linhas com reticências', () => {
    expect(wrapLabel('Metropolitano de Salvador', 14)).toEqual([
      'Metropolitano',
      'de Salvador',
    ]);
    const lines = wrapLabel(
      'Universidade Estadual do Sudoeste da Bahia campus Vitória',
      14,
    );
    expect(lines).toHaveLength(2);
    expect(lines[1]?.endsWith('…')).toBe(true);
    expect(lines.every((line) => line.length <= 14)).toBe(true);
  });
});

describe('pizza e legenda', () => {
  it('fatias com porcentagem e "Outros" além da paleta', () => {
    const data = Array.from({ length: 10 }, (_, i) => ({
      nome: `T${i}`,
      v: 10 - i,
    }));
    const frame = buildChartFrame(
      chart({
        chart_type: 'donut',
        x: { key: 'nome', label: 'Território', type: 'category' },
        series: [{ key: 'v', label: 'Bolsas' }],
        data,
      }),
    );
    const slices = pieSlices(frame);
    expect(slices).toHaveLength(8);
    expect(slices.at(-1)).toMatchObject({ label: 'Outros', colorIndex: null });
    expect(slices.reduce((sum, s) => sum + s.share, 0)).toBeCloseTo(1);
    expect(chartLegend(frame)[0]?.detail).toMatch(/%$/);
  });

  it('sem legenda para série única de barras', () => {
    const frame = buildChartFrame(
      chart({ series: [{ key: 'a', label: 'A' }] }),
    );
    expect(chartLegend(frame)).toEqual([]);
  });
});
