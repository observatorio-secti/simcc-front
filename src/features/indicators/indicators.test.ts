import { describe, expect, it } from 'vitest';
import { PRODUCTION_KINDS } from '@/entities/production/model';
import { computeSeriesSummary } from './metrics';
import {
  indicatorsSearchSchema,
  toMetricPathKind,
  toProductionMetricQuery,
} from './search-schema';

describe('indicatorsSearchSchema', () => {
  it('aceita search vazio com todos os campos opcionais', () => {
    expect(indicatorsSearchSchema.parse({})).toEqual({
      kind: undefined,
      q: undefined,
      year_start: undefined,
      year_end: undefined,
      area: undefined,
    });
  });

  it('valida kind, anos e texto aparando espaços', () => {
    expect(
      indicatorsSearchSchema.parse({
        kind: 'patent',
        q: '  energia solar  ',
        year_start: '2018',
        year_end: 2024,
        area: 'Engenharias',
      }),
    ).toEqual({
      kind: 'patent',
      q: 'energia solar',
      year_start: 2018,
      year_end: 2024,
      area: 'Engenharias',
    });
  });

  it('descarta valores inválidos com catch seguro', () => {
    expect(
      indicatorsSearchSchema.parse({
        kind: 'invalido',
        year_start: 'abc',
        year_end: 1200,
        q: '   ',
      }),
    ).toEqual({
      kind: undefined,
      q: undefined,
      year_start: undefined,
      year_end: undefined,
      area: undefined,
    });
  });
});

describe('toMetricPathKind e toProductionMetricQuery', () => {
  it('converte todos os tipos de produção para o path da API v2', () => {
    const mapped = PRODUCTION_KINDS.map((kind) => toMetricPathKind(kind));
    expect(mapped).toContain('book-chapter');
    expect(mapped).toContain('research-project');
    expect(mapped).toHaveLength(10);
  });

  it('monta a query de /v2/metrics/production/{kind} apenas com filtros ativos', () => {
    expect(toProductionMetricQuery({})).toEqual({});
    expect(
      toProductionMetricQuery({
        kind: 'software',
        q: 'ia',
        year_start: 2020,
        year_end: 2024,
        area: 'Ciências exatas e da terra',
      }),
    ).toEqual({
      q: 'ia',
      year_start: 2020,
      year_end: 2024,
      area: ['Ciências exatas e da terra'],
    });
  });
});

describe('computeSeriesSummary', () => {
  it('retorna zeros e nulos para série vazia', () => {
    expect(computeSeriesSummary([])).toEqual({
      points: [],
      total: 0,
      peakYear: null,
      peakValue: 0,
      minYear: null,
      maxYear: null,
      yearsCount: 0,
    });
  });

  it('ordena pontos por ano crescente e calcula total, pico e intervalo', () => {
    const summary = computeSeriesSummary([
      { period: 2024, value: 380 },
      { period: 2022, value: 310 },
      { period: 2023, value: 420 },
    ]);

    expect(summary).toEqual({
      points: [
        { period: 2022, value: 310 },
        { period: 2023, value: 420 },
        { period: 2024, value: 380 },
      ],
      total: 1110,
      peakYear: 2023,
      peakValue: 420,
      minYear: 2022,
      maxYear: 2024,
      yearsCount: 3,
    });
  });
});
