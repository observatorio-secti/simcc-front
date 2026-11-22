import { describe, expect, it } from 'vitest';
import { listingTabToSearchTab } from './listing-tabs';
import {
  activeTab,
  applyQuery,
  countTabFilters,
  resultsSearch,
  sortOptionsForTab,
  switchTab,
  toMagazineQuery,
  toProductionQuery,
  toScholarshipQuery,
} from './results-search';
import {
  CATALOG_TABS,
  resolveSearchTab,
  tabsForSearchType,
} from './search-tabs';

describe('abas sem termo (D1.4)', () => {
  it('mostra um catálogo da v2 por aba, qualquer que seja o tipo', () => {
    const ids = tabsForSearchType('article', false).map((tab) => tab.id);
    expect(ids).toEqual([...CATALOG_TABS]);
    expect(ids).toEqual(
      expect.arrayContaining([
        'researchers',
        'scholarships',
        'articles',
        'research_projects',
        'brands',
        'guidances',
        'reports',
        'magazine_texts',
        'event_works',
        'magazines',
      ]),
    );
    // Com termo, as abas continuam as do tipo de busca (T2).
    expect(tabsForSearchType('article').map((tab) => tab.id)).toEqual([
      'researchers',
      'articles',
    ]);
  });

  it('bolsistas e revistas só existem sem termo', () => {
    expect(resolveSearchTab('profile', 'scholarships', false).source).toBe(
      'scholarship',
    );
    expect(resolveSearchTab('profile', 'magazines', false).source).toBe(
      'magazine',
    );
    expect(resolveSearchTab('profile', 'magazines', true).id).toBe(
      'researchers',
    );
    expect(activeTab(resultsSearch.parse('q=solos&tab=scholarships')).id).toBe(
      'researchers',
    );
    expect(activeTab(resultsSearch.parse('tab=reports'))).toMatchObject({
      source: 'production',
      kind: 'report',
    });
  });

  it('nova busca a partir de bolsistas volta à aba padrão; limpar o termo mantém a aba', () => {
    const catalog = resultsSearch.parse('tab=magazines&qualis=A1&page=3');
    const searched = applyQuery(catalog, { q: 'solos' });
    expect(searched.tab).toBeUndefined();
    expect(searched.page).toBe(1);

    const articles = resultsSearch.parse('q=solos&tab=articles');
    expect(applyQuery(articles, { q: undefined }).tab).toBe('articles');
  });
});

describe('texto em revista e trabalho em evento (V4.1)', () => {
  it('são abas de produção do catálogo, ligadas às rotas novas da v2', () => {
    expect(resolveSearchTab('profile', 'magazine_texts', false)).toMatchObject({
      source: 'production',
      kind: 'magazine_text',
      label: 'Textos em revista',
    });
    expect(resolveSearchTab('profile', 'event_works', false)).toMatchObject({
      source: 'production',
      kind: 'event_work',
      label: 'Trabalhos em eventos',
    });
    // Com termo, saem das abas (a busca por perfil não cobre esses tipos).
    expect(resolveSearchTab('profile', 'event_works', true).id).toBe(
      'researchers',
    );
  });

  it('montam a query de /v2/production/<kind> com os filtros comuns', () => {
    const search = resultsSearch.parse(
      'tab=event_works&institution_id=inst-1&qualis=A1&year_start=2020&sort_by=title',
    );
    expect(activeTab(search)).toMatchObject({ kind: 'event_work' });
    expect(toProductionQuery('event_work', search)).toEqual({
      page: 1,
      per_page: 20,
      year_start: 2020,
      institution_id: ['inst-1'],
      sort_by: 'title',
      sort_order: 'asc',
      facets: [
        'year',
        'area',
        'institution',
        'graduate_program',
        'identity_territory',
        'city',
      ],
    });
    expect(
      sortOptionsForTab(
        { source: 'production', kind: 'magazine_text' },
        false,
      ).map((option) => option.value),
    ).toEqual(['year', 'title']);
  });
});

describe('bolsistas: URL ↔ /v2/scholarship', () => {
  it('faz o round-trip e converte para os parâmetros da v2', () => {
    const url =
      'tab=scholarships&institution_id=inst-1&graduate_program_id=prog-1&modality=Produtividade+em+Pesquisa+-+2&category_level=2&category_level=1A&sort_by=category_level&sort_order=desc&page=2';
    const search = resultsSearch.parse(url);
    expect(search).toMatchObject({
      tab: 'scholarships',
      modality: ['Produtividade em Pesquisa - 2'],
      category_level: ['2', '1A'],
      sort_by: 'category_level',
      sort_order: 'desc',
      page: 2,
    });
    const roundTrip = resultsSearch.toURLSearchParams(search);
    expect(roundTrip.getAll('category_level')).toEqual(['2', '1A']);
    expect(resultsSearch.parse(roundTrip)).toEqual(search);

    const query = toScholarshipQuery(search);
    expect(query).toEqual({
      page: 2,
      per_page: 20,
      institution_id: ['inst-1'],
      graduate_program_id: ['prog-1'],
      modality: ['Produtividade em Pesquisa - 2'],
      category_level: ['2', '1A'],
      sort_by: 'category_level',
      sort_order: 'desc',
      facets: ['institution', 'graduate_program', 'modality', 'category_level'],
      facet_limit: 50,
    });
    // A v2 recusa `facet_limit` acima de 100 (422).
    expect(query.facet_limit).toBeLessThanOrEqual(100);
    expect(countTabFilters(search, { source: 'scholarship' })).toBe(5);
  });

  it('ordena por nome do bolsista por padrão e ignora o que a rota não aceita', () => {
    const search = resultsSearch.parse(
      'tab=scholarships&sort_by=year&area=SAUDE&year_start=2020&city_id=x',
    );
    const query = toScholarshipQuery(search);
    expect(query).toMatchObject({
      sort_by: 'researcher_name',
      sort_order: 'asc',
    });
    expect(query).not.toHaveProperty('area');
    expect(query).not.toHaveProperty('year_start');
    expect(query).not.toHaveProperty('city_id');
    expect(countTabFilters(search, { source: 'scholarship' })).toBe(0);
    expect(
      sortOptionsForTab({ source: 'scholarship' }, false).map((o) => o.value),
    ).toEqual(['researcher_name', 'modality', 'category_level']);
  });

  it('a troca para bolsistas mantém instituição, programa e modalidade e descarta os demais filtros', () => {
    const researchers = resultsSearch.parse(
      'modality=Produtividade+em+Pesquisa+-+2&institution_id=inst-1&graduate_program_id=prog-1&area=SAUDE&graduation=Doutorado&page=4',
    );
    const next = switchTab(researchers, 'scholarships');
    expect(next).toMatchObject({
      tab: 'scholarships',
      modality: ['Produtividade em Pesquisa - 2'],
      institution_id: ['inst-1'],
      graduate_program_id: ['prog-1'],
      page: 1,
    });
    expect(next.area).toBeUndefined();
    expect(next.graduation).toBeUndefined();
  });
});

describe('revistas: URL ↔ /v2/magazine', () => {
  it('faz o round-trip e converte para os parâmetros da v2', () => {
    const url = 'tab=magazines&qualis=A1&qualis=A2&sort_by=jcr';
    const search = resultsSearch.parse(url);
    expect(search).toMatchObject({
      tab: 'magazines',
      qualis: ['A1', 'A2'],
      sort_by: 'jcr',
    });
    expect(
      resultsSearch.parse(resultsSearch.toURLSearchParams(search)),
    ).toEqual(search);

    expect(toMagazineQuery(search)).toEqual({
      page: 1,
      per_page: 20,
      qualis: ['A1', 'A2'],
      sort_by: 'jcr',
      sort_order: 'desc',
      facets: ['qualis'],
    });
    expect(countTabFilters(search, { source: 'magazine' })).toBe(2);
  });

  it('ordena por nome por padrão e mantém o Qualis ao trocar para artigos', () => {
    const search = resultsSearch.parse('tab=magazines&qualis=B1&year_end=2020');
    expect(toMagazineQuery(search)).toMatchObject({
      sort_by: 'name',
      sort_order: 'asc',
    });
    expect(toMagazineQuery(search)).not.toHaveProperty('year_end');
    expect(countTabFilters(search, { source: 'magazine' })).toBe(1);

    const articles = switchTab(search, 'articles');
    expect(toProductionQuery('article', articles)).toMatchObject({
      qualis: ['B1'],
      year_end: 2020,
    });
  });
});

describe('listingTabToSearchTab', () => {
  it('traduz o ?tab= do legado e aceita os ids novos', () => {
    expect(listingTabToSearchTab('bolsistas')).toBe('scholarships');
    expect(listingTabToSearchTab('magazine')).toBe('magazines');
    expect(listingTabToSearchTab('relatorio-tecnico')).toBe('reports');
    expect(listingTabToSearchTab('speaker')).toBe('events');
    expect(listingTabToSearchTab('brands')).toBe('brands');
    expect(listingTabToSearchTab('texto-revista')).toBe('magazine_texts');
    expect(listingTabToSearchTab('work-event')).toBe('event_works');
    expect(listingTabToSearchTab('event_works')).toBe('event_works');
  });

  it('descarta a aba padrão, as descontinuadas e as que não existem', () => {
    expect(listingTabToSearchTab('pesquisadores')).toBeUndefined();
    expect(listingTabToSearchTab('tecnicos')).toBeUndefined();
    expect(listingTabToSearchTab('nao-existe')).toBeUndefined();
    expect(listingTabToSearchTab(undefined)).toBeUndefined();
  });
});
