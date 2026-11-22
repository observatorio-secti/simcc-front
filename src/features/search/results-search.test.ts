import { describe, expect, it } from 'vitest';
import {
  activeTab,
  applyQuery,
  countTabFilters,
  resolveSort,
  resultsSearch,
  switchTab,
  toProductionMetricQuery,
  toProductionQuery,
  toResearcherQuery,
  toResearcherRankingQuery,
} from './results-search';
import { resolveSearchTab, TABS_BY_SEARCH_TYPE } from './search-tabs';

describe('results-search (T2)', () => {
  it('faz o round-trip URL → estado → URL com listas como chave repetida', () => {
    const url =
      'q=rob%C3%B3tica&type=article&tab=articles&institution_id=a&institution_id=b&qualis=A1&year_start=2020&page=2';
    const search = resultsSearch.parse(url);

    expect(search).toMatchObject({
      q: 'robótica',
      type: 'article',
      tab: 'articles',
      institution_id: ['a', 'b'],
      qualis: ['A1'],
      year_start: 2020,
      page: 2,
      per_page: 20,
    });
    const roundTrip = resultsSearch.toURLSearchParams(search);
    expect(Object.fromEntries(roundTrip)).toEqual(
      Object.fromEntries(new URLSearchParams(url)),
    );
    expect(roundTrip.getAll('institution_id')).toEqual(['a', 'b']);
    expect(resultsSearch.parse(roundTrip)).toEqual(search);
  });

  it('descarta valores inválidos e inverte o intervalo de anos', () => {
    const search = resultsSearch.parse(
      'type=foo&tab=bar&classification=Z&classification=A&year_start=2024&year_end=2010&page=-3',
    );
    expect(search.type).toBeUndefined();
    expect(search.tab).toBeUndefined();
    expect(search.classification).toEqual(['A']);
    expect(search.year_start).toBe(2010);
    expect(search.year_end).toBe(2024);
    expect(search.page).toBe(1);
  });

  it('converte o estado em parâmetros de /v2/researcher sem conversão por tela', () => {
    const search = resultsSearch.parse(
      'q=solos&area=ENGENHARIAS&qualis=A1&graduation=Doutorado&page=3',
    );
    expect(toResearcherQuery(search)).toEqual({
      q: 'solos',
      page: 3,
      per_page: 20,
      area: ['ENGENHARIAS'],
      graduation: ['Doutorado'],
      sort_by: 'matches',
      sort_order: 'desc',
      facets: [
        'area',
        'institution',
        'graduate_program',
        'identity_territory',
        'city',
        'graduation',
        'classification',
        'modality',
        'year',
        'source_type',
      ],
      include: ['matches'],
      matches_limit: 1,
    });
  });

  it('fixa source_type pelo tipo de busca e ordena por nome sem termo', () => {
    const typed = toResearcherQuery(
      resultsSearch.parse('q=redes&type=book&source_type=patent'),
    );
    expect(typed.source_type).toEqual(['book', 'book_chapter']);
    expect(typed.facets).not.toContain('source_type');

    const catalog = toResearcherQuery(resultsSearch.parse(''));
    expect(catalog).toMatchObject({ sort_by: 'name', sort_order: 'asc' });
    expect(catalog.q).toBeUndefined();
    expect(catalog.include).toBeUndefined();
  });

  it('monta o ranking com o mesmo recorte, ordenado por ocorrências', () => {
    const ranking = toResearcherRankingQuery(
      resultsSearch.parse('q=solos&sort_by=name&page=4&institution_id=x'),
    );
    expect(ranking).toMatchObject({
      q: 'solos',
      institution_id: ['x'],
      page: 1,
      per_page: 10,
      sort_by: 'matches',
      sort_order: 'desc',
    });
    expect(ranking.facets).toBeUndefined();
  });

  it('converte o estado em parâmetros de /v2/production/<kind> e de /v2/metrics', () => {
    const search = resultsSearch.parse(
      'q=solos&type=article&tab=articles&qualis=A2&graduation=Doutorado&city_id=c&sort_by=citations',
    );
    expect(toProductionQuery('article', search)).toEqual({
      q: 'solos',
      page: 1,
      per_page: 20,
      city_id: ['c'],
      qualis: ['A2'],
      sort_by: 'citations',
      sort_order: 'desc',
      facets: [
        'year',
        'area',
        'institution',
        'graduate_program',
        'identity_territory',
        'city',
        'qualis',
      ],
    });
    // Livros não aceitam Qualis nem `citations`.
    expect(toProductionQuery('book', search)).toMatchObject({
      sort_by: 'relevance',
      sort_order: 'desc',
    });
    expect(toProductionQuery('book', search)).not.toHaveProperty('qualis');
    expect(toProductionMetricQuery(search)).toEqual({
      q: 'solos',
      city_id: ['c'],
    });
  });

  it('resolve aba e ordenação válidas para o tipo de busca', () => {
    expect(resolveSearchTab('article', 'patents').id).toBe('researchers');
    expect(resolveSearchTab('article', 'articles').id).toBe('articles');
    expect(TABS_BY_SEARCH_TYPE.name).toEqual(['researchers']);
    expect(
      resolveSort(
        { source: 'production', kind: 'article' },
        {
          sort_by: 'matches',
        },
      ),
    ).toEqual({ sort_by: 'year', sort_order: 'desc' });
  });

  it('troca de aba zera página e ordenação e descarta filtros que a aba não aceita', () => {
    const search = resultsSearch.parse(
      'q=solos&page=3&sort_by=name&graduation=Doutorado&area=ENGENHARIAS',
    );
    const next = switchTab(search, 'articles');
    expect(activeTab(next).id).toBe('articles');
    expect(next).toMatchObject({ page: 1, area: ['ENGENHARIAS'] });
    expect(next.graduation).toBeUndefined();
    expect(next.sort_by).toBeUndefined();

    const back = switchTab(next, 'researchers');
    expect(back.tab).toBeUndefined();
  });

  it('nova busca mantém filtros, volta à aba padrão e limpa source_type fixo', () => {
    const search = resultsSearch.parse(
      'q=solos&tab=patents&source_type=article&area=ENGENHARIAS&page=2',
    );
    const next = applyQuery(search, { q: 'redes', type: 'article' });
    expect(next).toMatchObject({
      q: 'redes',
      type: 'article',
      area: ['ENGENHARIAS'],
      page: 1,
    });
    expect(next.tab).toBeUndefined();
    expect(next.source_type).toBeUndefined();

    expect(applyQuery(next, { q: '  ' }).q).toBeUndefined();
  });

  it('conta só os filtros que valem para a aba', () => {
    const search = resultsSearch.parse(
      'graduation=Doutorado&qualis=A1&qualis=A2&year_end=2020',
    );
    expect(countTabFilters(search, { source: 'researcher' })).toBe(2);
    expect(
      countTabFilters(search, { source: 'production', kind: 'article' }),
    ).toBe(3);
  });
});
