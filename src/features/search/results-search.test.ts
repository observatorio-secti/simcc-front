import { describe, expect, it } from 'vitest';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import {
  activeTab,
  applyQuery,
  countTabFilters,
  resolveSort,
  resultsSearch,
  searchInFor,
  switchTab,
  toggleQualisFilter,
  toProductionMetricQuery,
  toProductionQuery,
  toResearcherMapQuery,
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
      per_page: 30,
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
      per_page: 30,
      year_start: getDefaultYearStart(),
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

  it('mapeia os tipos de busca nome e resumo para search_in de /v2/researcher', () => {
    expect(searchInFor('name')).toBe('name');
    expect(searchInFor('abstract')).toBe('abstract');
    expect(searchInFor('profile')).toBeUndefined();
    expect(searchInFor('article')).toBeUndefined();

    const byName = toResearcherQuery(
      resultsSearch.parse('q=silva&type=name&source_type=article'),
    );
    expect(byName).toMatchObject({ q: 'silva', search_in: 'name' });
    // Nome e resumo não filtram por tipo de produção nem pedem a faceta.
    expect(byName).not.toHaveProperty('source_type');
    expect(byName.facets).not.toContain('source_type');

    const byAbstract = toResearcherQuery(
      resultsSearch.parse('q=solos&type=abstract'),
    );
    expect(byAbstract.search_in).toBe('abstract');
    expect(
      toResearcherRankingQuery(resultsSearch.parse('q=solos&type=abstract')),
    ).toMatchObject({ search_in: 'abstract', sort_by: 'matches' });

    // Perfil inteiro: o padrão da v2 (`all`), sem enviar o parâmetro.
    expect(
      toResearcherQuery(resultsSearch.parse('q=solos')),
    ).not.toHaveProperty('search_in');
    // Sem termo, não há campo de busca a restringir.
    expect(
      toResearcherQuery(resultsSearch.parse('type=name')),
    ).not.toHaveProperty('search_in');
  });

  it('nova busca por nome limpa o filtro source_type', () => {
    const search = resultsSearch.parse('q=solos&source_type=article');
    expect(applyQuery(search, { q: 'silva', type: 'name' }).source_type).toBe(
      undefined,
    );
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

  it('pede só territory_city na aba de mapa, com o mesmo recorte e limite por nível', () => {
    const search = resultsSearch.parse(
      'q=solos&tab=map&identity_territory=5&city_code=2913606&page=3',
    );
    expect(activeTab(search).source).toBe('map');
    const map = toResearcherMapQuery(search);
    expect(map).toMatchObject({
      q: 'solos',
      identity_territory: ['5'],
      city_code: ['2913606'],
      page: 1,
      per_page: 1,
      facets: ['territory_city'],
      facet_limit: 100,
    });
    expect(map.include).toBeUndefined();
    expect(map.matches_limit).toBeUndefined();
    // A lista recebe os mesmos filtros de território e de município.
    expect(toResearcherQuery(search)).toMatchObject({
      identity_territory: ['5'],
      city_code: ['2913606'],
    });
  });

  it('a aba de mapa aparece após Pesquisadores e antes de Artigos', () => {
    expect(TABS_BY_SEARCH_TYPE.profile.slice(0, 3)).toEqual([
      'researchers',
      'map',
      'articles',
    ]);
    expect(TABS_BY_SEARCH_TYPE.name).toEqual(['researchers', 'map']);
  });

  it('converte o estado em parâmetros de /v2/production/<kind> e de /v2/metrics', () => {
    const search = resultsSearch.parse(
      'q=solos&type=article&tab=articles&qualis=A2&graduation=Doutorado&city_id=c&sort_by=citations',
    );
    expect(toProductionQuery('article', search)).toEqual({
      q: 'solos',
      page: 1,
      per_page: 30,
      year_start: getDefaultYearStart(),
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
    expect(toProductionMetricQuery('book', search)).toEqual({
      q: 'solos',
      year_start: getDefaultYearStart(),
      city_id: ['c'],
    });
    // Artigos agrupam por Qualis; o filtro de Qualis não entra na série.
    expect(toProductionMetricQuery('article', search)).toEqual({
      q: 'solos',
      year_start: getDefaultYearStart(),
      city_id: ['c'],
      group_by: 'qualis',
    });
  });

  it('liga e desliga estratos do filtro de Qualis a partir do gráfico', () => {
    const search = resultsSearch.parse('tab=articles&qualis=A2');
    expect(toggleQualisFilter(search, 'A1')).toEqual({ qualis: ['A2', 'A1'] });
    expect(toggleQualisFilter(search, 'A2')).toEqual({ qualis: undefined });
    expect(toggleQualisFilter(search, 'qualquer')).toEqual({ qualis: ['A2'] });
  });

  it('resolve aba e ordenação válidas para o tipo de busca', () => {
    expect(resolveSearchTab('article', 'patents').id).toBe('researchers');
    expect(resolveSearchTab('article', 'articles').id).toBe('articles');
    expect(TABS_BY_SEARCH_TYPE.name).toEqual(['researchers', 'map']);
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
    const empty = resultsSearch.parse('');
    expect(countTabFilters(empty, { source: 'researcher' })).toBe(0);
    expect(
      countTabFilters(empty, { source: 'production', kind: 'article' }),
    ).toBe(0);

    const search = resultsSearch.parse(
      'graduation=Doutorado&qualis=A1&qualis=A2&year_end=2020',
    );
    expect(countTabFilters(search, { source: 'researcher' })).toBe(2);
    expect(
      countTabFilters(search, { source: 'production', kind: 'article' }),
    ).toBe(3);

    const cleared = resultsSearch.clearFilters(search);
    expect(cleared.year_start).toBe(getDefaultYearStart());
    expect(cleared.year_end).toBeUndefined();
    expect(countTabFilters(cleared, { source: 'researcher' })).toBe(0);
  });
});
