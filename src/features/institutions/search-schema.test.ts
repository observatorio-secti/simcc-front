import { describe, expect, it } from 'vitest';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import {
  institutionDetailSearch,
  institutionListSearch,
} from './search-schema';

describe('institutionListSearch', () => {
  it('aplica padrões de paginação e ordenação', () => {
    const parsed = institutionListSearch.parse({});
    expect(parsed).toEqual({
      page: 1,
      per_page: 20,
      sort_by: 'name',
      sort_order: 'asc',
    });
  });

  it('remove view ao gerar parâmetros da API v2', () => {
    const parsed = institutionListSearch.parse({
      q: 'ufba',
      view: 'list',
      sort_by: 'acronym',
      sort_order: 'desc',
      page: 2,
    });
    expect(parsed.view).toBe('list');
    expect(institutionListSearch.toApiParams(parsed)).toEqual({
      q: 'ufba',
      sort_by: 'acronym',
      sort_order: 'desc',
      page: 2,
      per_page: 20,
    });
  });

  it('reseta page ao mudar busca e preserva ao trocar visualização', () => {
    const page3 = institutionListSearch.parse({ page: 3 });
    const withList = institutionListSearch.update(
      page3,
      { view: 'list' },
      { resetPage: false },
    );
    expect(withList.page).toBe(3);

    const withSearch = institutionListSearch.update(withList, { q: 'uesc' });
    expect(withSearch.page).toBe(1);
    expect(withSearch.q).toBe('uesc');
  });
});

describe('institutionDetailSearch', () => {
  it('remove tab ao gerar parâmetros da API v2', () => {
    const parsed = institutionDetailSearch.parse({
      tab: 'programs',
      q: 'computação',
      page: 2,
    });
    expect(parsed.tab).toBe('programs');
    expect(institutionDetailSearch.toApiParams(parsed)).toEqual({
      q: 'computação',
      page: 2,
      per_page: 12,
      sort_by: 'year',
      sort_order: 'desc',
      year_start: getDefaultYearStart(),
    });
  });

  it('ignora tab inválida na URL', () => {
    const parsed = institutionDetailSearch.parse({ tab: 'invalida' });
    expect(parsed.tab).toBeUndefined();
  });
});
