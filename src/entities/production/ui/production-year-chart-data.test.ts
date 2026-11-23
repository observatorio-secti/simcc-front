import { describe, expect, it } from 'vitest';
import {
  patentGrantSeries,
  productionYearChartData,
} from './production-year-chart-data';

describe('productionYearChartData', () => {
  it('sem agrupamento, usa uma série única com a cor do tipo', () => {
    const { points, series } = productionYearChartData('book', [
      { period: 2023, value: 3 },
    ]);
    expect(points).toEqual([{ period: 2023, value: 3, groups: { book: 3 } }]);
    expect(series.map((item) => item.key)).toEqual(['book']);
  });

  it('por Qualis, junta "não se aplica" em "sem qualis"', () => {
    const { points } = productionYearChartData(
      'article',
      [
        {
          period: 2024,
          value: 4,
          groups: { A1: 1, not_rated: 1, not_applicable: 2 },
        },
      ],
      'qualis',
    );
    expect(points[0]!.groups).toEqual({ A1: 1, not_rated: 3 });
  });

  it('por situação, usa o rótulo e a cor do tema para chaves conhecidas', () => {
    const { series } = productionYearChartData(
      'research_project',
      [{ period: 2024, value: 2, groups: { CONCLUIDO: 1, OUTRA: 1 } }],
      'status',
    );
    expect(series).toHaveLength(2);
    expect(series.find((item) => item.key === 'OUTRA')!.label).toBe('OUTRA');
  });

  it('divide patentes em concedidas e depositadas pelo filtro granted', () => {
    const series = patentGrantSeries('Patentes');
    expect(series.map((item) => [item.key, item.label, item.filter])).toEqual([
      ['patent_granted', 'Patentes concedidas', { granted: true }],
      ['patent_filed', 'Patentes depositadas', { granted: false }],
    ]);
  });
});
