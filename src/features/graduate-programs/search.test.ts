import { describe, expect, it } from 'vitest';
import {
  GRADUATE_PROGRAM_FACETS,
  graduateProgramListSearch,
  toGraduateProgramQueryParams,
} from './search';

describe('graduateProgramListSearch', () => {
  it('aplica padrões de página, ordenação e omite extras da API', () => {
    const parsed = graduateProgramListSearch.parse({ view: 'table' });
    expect(parsed).toEqual({
      page: 1,
      per_page: 20,
      sort_by: 'name',
      sort_order: 'asc',
      view: 'table',
    });

    expect(toGraduateProgramQueryParams(parsed)).toEqual({
      page: 1,
      per_page: 20,
      sort_by: 'name',
      sort_order: 'asc',
      facets: [...GRADUATE_PROGRAM_FACETS],
    });
  });

  it('faz round-trip de filtros repetidos na URL e reseta página ao filtrar', () => {
    const initial = graduateProgramListSearch.fromURLSearchParams(
      '?q=computa%C3%A7%C3%A3o&city=Salvador&city=Feira+de+Santana&page=3',
    );
    expect(initial).toMatchObject({
      q: 'computação',
      city: ['Salvador', 'Feira de Santana'],
      page: 3,
    });

    const updated = graduateProgramListSearch.toggleFilter(
      initial,
      'rating',
      '5',
    );
    expect(updated.page).toBe(1);
    expect(updated.rating).toEqual(['5']);

    const usp = graduateProgramListSearch.toURLSearchParams(updated);
    expect(usp.getAll('city')).toEqual(['Salvador', 'Feira de Santana']);
    expect(usp.getAll('rating')).toEqual(['5']);
    expect(usp.get('page')).toBeNull();
  });

  it('limpa todos os filtros preservando busca textual', () => {
    const state = graduateProgramListSearch.parse({
      q: 'saúde',
      area: ['CIÊNCIAS DA SAÚDE'],
      city: ['Salvador'],
      page: 2,
    });

    const cleared = graduateProgramListSearch.clearFilters(state);
    expect(cleared).toEqual({
      q: 'saúde',
      page: 1,
      per_page: 20,
      sort_by: 'name',
      sort_order: 'asc',
    });
  });
});
