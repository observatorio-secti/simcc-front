import { describe, expect, it } from 'vitest';
import { TRUNCATED_CSV_NOTE, chartCsv, fileSlug, toCsv } from './block-export';

describe('CSV dos blocos', () => {
  it('usa ";", decimal com vírgula e escapa aspas', () => {
    const csv = toCsv(
      [
        { key: 'nome', label: 'Nome' },
        { key: 'valor', label: 'Valor' },
      ],
      [
        { nome: 'Ana; "Bia"', valor: 1.5 },
        { nome: null, valor: 2 },
      ],
    );
    expect(csv).toBe('Nome;Valor\r\n"Ana; ""Bia""";1,5\r\n;2\r\n');
  });

  it('gráfico exporta x e séries com unidade e avisa o corte', () => {
    const csv = chartCsv({
      type: 'chart',
      chart_type: 'bar',
      title: 'T',
      x: { key: 'ano', label: 'Ano', type: 'number' },
      series: [{ key: 'm', label: 'Mestrado', unit: 'bolsas' }],
      data: [{ ano: 2021, m: 410 }],
      orientation: 'vertical',
      stacking: 'percent',
      truncated: true,
    });
    expect(csv.split('\r\n')).toEqual([
      'Ano;Mestrado (bolsas)',
      '2021;410',
      TRUNCATED_CSV_NOTE,
      '',
    ]);
  });

  it('nome de arquivo sem acento', () => {
    expect(fileSlug('Bolsas por ano e modalidade (2021–2024)')).toBe(
      'bolsas-por-ano-e-modalidade-2021-2024',
    );
    expect(fileSlug('')).toBe('dados-maria');
  });
});
