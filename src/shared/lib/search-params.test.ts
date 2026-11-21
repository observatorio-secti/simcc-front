import { createElement } from 'react';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import createClient from 'openapi-fetch';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  baseListSearch,
  cleanSearchParams,
  createListSearch,
  createListSearchSchema,
  parseListSearchString,
  searchBooleanParam,
  searchEnumArrayParam,
  searchStringArrayParam,
  searchStringParam,
  stringifyListSearchObject,
  toURLSearchParams,
} from './search-params';

const QUALIS_VALUES = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'C',
  'not_rated',
  'not_applicable',
] as const;

const articleSearch = createListSearch({
  sortBy: ['relevance', 'year', 'citations', 'title'] as const,
  defaultSortBy: 'relevance',
  defaultSortOrder: 'desc',
  filters: {
    institution_id: searchStringArrayParam(),
    area: searchStringArrayParam(),
    qualis: searchEnumArrayParam(QUALIS_VALUES),
    has_open_access: searchBooleanParam(),
  },
  extra: {
    view: searchStringParam(),
  },
});

describe('search-params', () => {
  describe('validação e coerção do schema', () => {
    it('aplica padrões sem manter chaves undefined no objeto resultante', () => {
      const parsed = articleSearch.parse({});

      expect(parsed).toEqual({
        page: 1,
        per_page: 20,
        sort_by: 'relevance',
        sort_order: 'desc',
      });
      expect('q' in parsed).toBe(false);
      expect('institution_id' in parsed).toBe(false);
      expect('year_start' in parsed).toBe(false);
    });

    it('normaliza q (trim, vazio vira ausente, número da URL vira string)', () => {
      expect(articleSearch.parse({ q: '  inteligência artificial  ' }).q).toBe(
        'inteligência artificial',
      );
      expect('q' in articleSearch.parse({ q: '   ' })).toBe(false);
      expect(articleSearch.parse({ q: 2024 }).q).toBe('2024');
    });

    it('valida page e per_page com fallback e limite máximo da v2', () => {
      expect(articleSearch.parse({ page: '3', per_page: '50' })).toMatchObject({
        page: 3,
        per_page: 50,
      });

      expect(articleSearch.parse({ page: '0', per_page: '-10' })).toMatchObject(
        {
          page: 1,
          per_page: 20,
        },
      );

      expect(
        articleSearch.parse({ page: 'abc', per_page: '250' }),
      ).toMatchObject({
        page: 1,
        per_page: 100,
      });
    });

    it('valida sort_by/sort_order e faz fallback para os padrões quando inválidos', () => {
      expect(
        articleSearch.parse({ sort_by: 'citations', sort_order: 'ASC' }),
      ).toMatchObject({
        sort_by: 'citations',
        sort_order: 'asc',
      });

      expect(
        articleSearch.parse({ sort_by: 'invalid_field', sort_order: 'up' }),
      ).toMatchObject({
        sort_by: 'relevance',
        sort_order: 'desc',
      });
    });

    it('suporta arrays repetidos, valor único, deduplicação e filtro de enum', () => {
      const parsed = articleSearch.parse({
        institution_id: ['ufba', 'uesc', 'ufba', ''],
        area: 'Engenharias',
        qualis: ['A1', 'INVALID', 'B2'],
      });

      expect(parsed.institution_id).toEqual(['ufba', 'uesc']);
      expect(parsed.area).toEqual(['Engenharias']);
      expect(parsed.qualis).toEqual(['A1', 'B2']);

      const allInvalid = articleSearch.parse({ qualis: ['INVALID'] });
      expect('qualis' in allInvalid).toBe(false);
    });

    it('suporta year_start/year_end e normaliza intervalo invertido', () => {
      expect(
        articleSearch.parse({ year_start: '2020', year_end: '2025' }),
      ).toMatchObject({
        year_start: 2020,
        year_end: 2025,
      });

      expect(
        articleSearch.parse({ year_start: 2025, year_end: 2018 }),
      ).toMatchObject({
        year_start: 2018,
        year_end: 2025,
      });

      const invalidYears = articleSearch.parse({
        year_start: 'abc',
        year_end: 99,
      });
      expect('year_start' in invalidYears).toBe(false);
      expect('year_end' in invalidYears).toBe(false);
    });

    it('permite desativar intervalo de ano em catálogos sem ano', () => {
      const institutionSchema = createListSearchSchema({
        sortBy: ['name', 'acronym'] as const,
        defaultSortBy: 'name',
        defaultSortOrder: 'asc',
        yearRange: false,
      });

      const parsed = institutionSchema.parse({
        q: 'UFBA',
        year_start: 2020,
      });

      expect(parsed).toEqual({
        q: 'UFBA',
        page: 1,
        per_page: 20,
        sort_by: 'name',
        sort_order: 'asc',
      });
      expect('year_start' in parsed).toBe(false);
    });

    it('interpreta parâmetros booleanos corretamente', () => {
      expect(
        articleSearch.parse({ has_open_access: 'true' }).has_open_access,
      ).toBe(true);
      expect(
        articleSearch.parse({ has_open_access: 'false' }).has_open_access,
      ).toBe(false);
      expect(
        'has_open_access' in articleSearch.parse({ has_open_access: 'x' }),
      ).toBe(false);
    });

    it('infere chaves opcionais e obrigatórias corretamente em TypeScript', () => {
      expect(baseListSearch.parse({ q: 'simcc' })).toEqual({
        q: 'simcc',
        page: 1,
        per_page: 20,
      });

      type ArticleSearch = ReturnType<typeof articleSearch.parse>;
      expectTypeOf<ArticleSearch>().toEqualTypeOf<{
        q?: string;
        page: number;
        per_page: number;
        sort_by: 'relevance' | 'year' | 'citations' | 'title';
        sort_order: 'asc' | 'desc';
        year_start?: number;
        year_end?: number;
        institution_id?: string[];
        area?: string[];
        qualis?: (typeof QUALIS_VALUES)[number][];
        has_open_access?: boolean;
        view?: string;
      }>();

      expectTypeOf<ReturnType<typeof baseListSearch.parse>>().toEqualTypeOf<{
        q?: string;
        page: number;
        per_page: number;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        year_start?: number;
        year_end?: number;
      }>();
    });
  });

  describe('round-trip URLSearchParams ↔ schema zod ↔ query da API', () => {
    it('limpa valores padrão e vazios ao serializar para URLSearchParams', () => {
      const state = articleSearch.parse({
        q: 'robótica',
        page: 1,
        per_page: 20,
        sort_by: 'relevance',
        sort_order: 'desc',
        institution_id: ['ufba', 'uesc'],
        year_start: 2020,
      });

      const usp = articleSearch.toURLSearchParams(state);
      expect(usp.toString()).toBe(
        'q=rob%C3%B3tica&year_start=2020&institution_id=ufba&institution_id=uesc',
      );
      expect(usp.getAll('institution_id')).toEqual(['ufba', 'uesc']);
      expect(usp.has('page')).toBe(false);
      expect(usp.has('per_page')).toBe(false);
      expect(usp.has('sort_by')).toBe(false);
      expect(usp.has('sort_order')).toBe(false);
    });

    it('reconstrói exatamente o estado e gera a query esperada no openapi-fetch', async () => {
      const rawUrl =
        '?q=rob%C3%B3tica&page=2&per_page=50&sort_by=year&sort_order=asc&year_start=2019&year_end=2024&institution_id=ufba&institution_id=uesc&qualis=A1&qualis=A2&has_open_access=true&view=list';

      const parsed = articleSearch.fromURLSearchParams(rawUrl);

      expect(parsed).toEqual({
        q: 'robótica',
        page: 2,
        per_page: 50,
        sort_by: 'year',
        sort_order: 'asc',
        year_start: 2019,
        year_end: 2024,
        institution_id: ['ufba', 'uesc'],
        qualis: ['A1', 'A2'],
        has_open_access: true,
        view: 'list',
      });

      // Remove apenas campos de UI (`view`) ao montar query da API v2.
      const apiQuery = articleSearch.toApiParams(parsed);
      expect('view' in apiQuery).toBe(false);

      const capturedUrls: string[] = [];
      const mockFetch = vi.fn(async (input: RequestInfo | URL) => {
        const url = input instanceof Request ? input.url : String(input);
        capturedUrls.push(url);
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      });

      const client = createClient<{
        '/production/article': {
          get: {
            parameters: { query?: typeof apiQuery };
            responses: {
              200: { content: { 'application/json': { data: [] } } };
            };
          };
        };
      }>({
        baseUrl: 'https://api.simcc.test/v2',
        fetch: mockFetch,
      });

      await client.GET('/production/article', {
        params: { query: apiQuery },
      });

      expect(capturedUrls).toHaveLength(1);
      const sent = new URL(capturedUrls[0]!);
      expect(sent.pathname).toBe('/v2/production/article');
      expect(sent.searchParams.get('q')).toBe('robótica');
      expect(sent.searchParams.get('page')).toBe('2');
      expect(sent.searchParams.get('per_page')).toBe('50');
      expect(sent.searchParams.get('sort_by')).toBe('year');
      expect(sent.searchParams.get('sort_order')).toBe('asc');
      expect(sent.searchParams.get('year_start')).toBe('2019');
      expect(sent.searchParams.get('year_end')).toBe('2024');
      expect(sent.searchParams.getAll('institution_id')).toEqual([
        'ufba',
        'uesc',
      ]);
      expect(sent.searchParams.getAll('qualis')).toEqual(['A1', 'A2']);
      expect(sent.searchParams.get('has_open_access')).toBe('true');
      expect(sent.searchParams.has('view')).toBe(false);

      // Round-trip de volta pela URL (ignorando `view` ausente na API).
      const roundTripped = articleSearch.fromURLSearchParams(
        articleSearch.toURLSearchParams(parsed),
      );
      expect(roundTripped).toEqual(parsed);
    });

    it('parseListSearchString, toURLSearchParams e stringifyListSearchObject mantêm chaves repetidas', () => {
      const usp = toURLSearchParams(
        { q: '2024', area: ['Saúde', 'Engenharias'], page: 1, empty: '' },
        { page: 1 },
      );
      expect(usp.toString()).toBe('q=2024&area=Sa%C3%BAde&area=Engenharias');

      const str = stringifyListSearchObject({
        q: '2024',
        area: ['Saúde', 'Engenharias'],
        empty: '',
        none: [],
      });
      expect(str).toBe('?q=2024&area=Sa%C3%BAde&area=Engenharias');
      expect(parseListSearchString(str)).toEqual({
        q: '2024',
        area: ['Saúde', 'Engenharias'],
      });
      expect(cleanSearchParams({ a: '', b: [], c: 1 }, { c: 1 })).toEqual({});
    });
  });

  describe('atualização de estado, reset de página e contagem de filtros', () => {
    it('reseta page para 1 ao mudar q, filtro, ordenação, período ou per_page', () => {
      const pageThree = articleSearch.parse({
        q: 'energia',
        page: 3,
        institution_id: ['ufba'],
      });

      expect(articleSearch.update(pageThree, { q: 'solar' }).page).toBe(1);
      expect(
        articleSearch.update(pageThree, { sort_by: 'citations' }).page,
      ).toBe(1);
      expect(articleSearch.update(pageThree, { per_page: 50 }).page).toBe(1);
      expect(
        articleSearch.setYearRange(pageThree, { year_start: 2021 }).page,
      ).toBe(1);
      expect(
        articleSearch.toggleFilter(pageThree, 'institution_id', 'uesc'),
      ).toMatchObject({
        page: 1,
        institution_id: ['ufba', 'uesc'],
      });
    });

    it('preserva page ao navegar entre páginas ou quando nada muda de fato', () => {
      const pageTwo = articleSearch.parse({ q: 'energia', page: 2 });

      expect(articleSearch.update(pageTwo, { page: 5 }).page).toBe(5);
      expect(articleSearch.update(pageTwo, { q: 'energia' }).page).toBe(2);
    });

    it('toggleFilter remove chave quando última opção é desmarcada', () => {
      const withOne = articleSearch.parse({
        page: 4,
        institution_id: ['ufba'],
      });
      const cleared = articleSearch.toggleFilter(
        withOne,
        'institution_id',
        'ufba',
      );
      expect(cleared.page).toBe(1);
      expect('institution_id' in cleared).toBe(false);
    });

    it('clearFilters limpa filtros e período mantendo busca, ordenação e per_page', () => {
      const dirty = articleSearch.parse({
        q: 'bahia',
        page: 4,
        per_page: 50,
        sort_by: 'year',
        sort_order: 'asc',
        year_start: 2019,
        year_end: 2023,
        institution_id: ['ufba', 'uefs'],
        qualis: ['A1'],
        has_open_access: true,
      });

      expect(articleSearch.countActiveFilters(dirty)).toBe(5);

      const cleaned = articleSearch.clearFilters(dirty);
      expect(cleaned).toEqual({
        q: 'bahia',
        page: 1,
        per_page: 50,
        sort_by: 'year',
        sort_order: 'asc',
      });
      expect(articleSearch.countActiveFilters(cleaned)).toBe(0);
    });
  });

  describe('integração com TanStack Router', () => {
    it('valida URL inicial e limpa valores padrão ao navegar', async () => {
      const scrollToSpy = vi
        .spyOn(window, 'scrollTo')
        .mockImplementation(() => undefined);
      let capturedSearch: ReturnType<typeof articleSearch.parse> | undefined;

      const rootRoute = createRootRoute();
      const listRoute = createRoute({
        getParentRoute: () => rootRoute,
        path: '/test-artigos',
        validateSearch: articleSearch.schema,
        search: { middlewares: articleSearch.middlewares },
        component: function TestPage() {
          const search = listRoute.useSearch();
          capturedSearch = search;
          return createElement(
            'div',
            null,
            createElement(
              'span',
              { 'data-testid': 'state' },
              JSON.stringify(search),
            ),
          );
        },
      });

      const router = createRouter({
        routeTree: rootRoute.addChildren([listRoute]),
        parseSearch: parseListSearchString,
        stringifySearch: stringifyListSearchObject,
        history: createMemoryHistory({
          initialEntries: [
            '/test-artigos?q=ia&institution_id=ufba&institution_id=uesc&page=2',
          ],
        }),
      });

      render(createElement(RouterProvider, { router }));

      await waitFor(() => {
        expect(screen.getByTestId('state')).toBeInTheDocument();
      });

      expect(capturedSearch).toEqual({
        q: 'ia',
        page: 2,
        per_page: 20,
        sort_by: 'relevance',
        sort_order: 'desc',
        institution_id: ['ufba', 'uesc'],
      });

      const nextSearch = articleSearch.update(capturedSearch!, { q: 'dados' });
      const nextHref = `/test-artigos${stringifyListSearchObject(
        articleSearch.clean(nextSearch),
      )}`;
      await router.navigate({ href: nextHref });

      await waitFor(() => {
        expect(capturedSearch?.q).toBe('dados');
      });
      expect(capturedSearch?.page).toBe(1);
      expect(router.state.location.href).toBe(
        '/test-artigos?q=dados&institution_id=ufba&institution_id=uesc',
      );

      // Middleware `stripSearchParams` também limpa padrões quando usado em `<Link>` / `navigate`.
      const stripped = articleSearch.middlewares[0]!({
        search: nextSearch,
        next: (value) => value,
      });
      expect(stripped).toEqual({
        q: 'dados',
        institution_id: ['ufba', 'uesc'],
      });

      scrollToSpy.mockRestore();
    });
  });
});
