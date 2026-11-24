import { describe, expect, it } from 'vitest';
import type { FacetResult } from '@/api/types';
import {
  formatTerritoryName,
  splitTerritoryFacet,
  territoryCode,
  toggleCode,
} from './model';

describe('modelo de território', () => {
  it('aceita o código SEI ou o nome, sem acento, caixa ou hífen', () => {
    expect(territoryCode('5')).toBe('5');
    expect(territoryCode('Litoral Sul')).toBe('5');
    expect(territoryCode('EXTREMO SUL')).toBe('7');
    expect(territoryCode('Costa do Descobrimento')).toBe('27');
    expect(territoryCode('semiárido nordeste ii')).toBe('17');
    expect(territoryCode('Atlântida')).toBeUndefined();
    expect(territoryCode('')).toBeUndefined();
  });

  it('formata o nome em sentence case', () => {
    expect(formatTerritoryName('METROPOLITANA DE SALVADOR')).toBe(
      'Metropolitana de Salvador',
    );
  });

  it('separa territory_city das facetas do painel', () => {
    const facet: FacetResult = { total: 0, items: [] };
    const { territoryCity, rest } = splitTerritoryFacet({
      territory_city: facet,
      area: facet,
    });
    expect(territoryCity).toBe(facet);
    expect(Object.keys(rest ?? {})).toEqual(['area']);
    expect(splitTerritoryFacet(null)).toEqual({
      territoryCity: undefined,
      rest: undefined,
    });
  });

  it('liga e desliga um código na lista do filtro', () => {
    expect(toggleCode(undefined, '5')).toEqual(['5']);
    expect(toggleCode(['5', '26'], '5')).toEqual(['26']);
    expect(toggleCode(['5'], '5')).toBeUndefined();
  });
});
