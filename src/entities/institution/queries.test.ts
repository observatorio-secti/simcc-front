import { QueryClient } from '@tanstack/react-query';
import {
  afterAll,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest';
import { ApiError } from '@/api/errors';
import type { DetailResponse, ListResponse } from '@/api/types';

const mockFetch = vi.fn<(request: Request) => Promise<Response>>();
vi.stubGlobal('fetch', mockFetch);
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');

const {
  institutionDetailQueryOptions,
  institutionKeys,
  institutionListQueryOptions,
} = await import('./queries');

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('institutionKeys', () => {
  it('padroniza keys de lista e detalhe', () => {
    expect(institutionKeys.list({ q: 'ufba', page: 2 })).toEqual([
      'institution',
      'list',
      { q: 'ufba', page: 2 },
    ]);
    expect(institutionKeys.detail('inst-1')).toEqual([
      'institution',
      'detail',
      'inst-1',
    ]);
  });
});

describe('institution queries', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('busca listagem de instituições passando query params e signal', async () => {
    const payload: ListResponse<'/institution'> = {
      data: [
        {
          id: 'inst-1',
          name: 'Universidade Federal da Bahia',
          acronym: 'UFBA',
        },
      ],
      pagination: {
        page: 2,
        per_page: 20,
        total_items: 1,
        total_pages: 1,
        has_next: false,
        has_prev: true,
      },
      filters_applied: { q: 'ufba' },
      sort: { by: 'name', order: 'asc' },
      meta: {
        took_ms: 5,
        cached: false,
        timestamp: '2026-11-20T00:00:00Z',
        data_as_of: null,
      },
    };

    mockFetch.mockResolvedValueOnce(jsonResponse(payload));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const options = institutionListQueryOptions({
      q: 'ufba',
      page: 2,
      sort_by: 'name',
      sort_order: 'asc',
    });

    expect(options.queryKey).toEqual([
      'institution',
      'list',
      { q: 'ufba', page: 2, sort_by: 'name', sort_order: 'asc' },
    ]);

    const data = await queryClient.fetchQuery(options);
    expectTypeOf(data).toEqualTypeOf<ListResponse<'/institution'>>();
    expect(data).toEqual(payload);

    const request = mockFetch.mock.calls[0]?.[0];
    expect(request).toBeInstanceOf(Request);
    const url = new URL(request!.url);
    expect(url.pathname).toBe('/simcc/api/v2/institution');
    expect(url.searchParams.get('q')).toBe('ufba');
    expect(url.searchParams.get('page')).toBe('2');
    expect(url.searchParams.get('sort_by')).toBe('name');
    expect(url.searchParams.get('sort_order')).toBe('asc');
    expect(request?.signal).toBeInstanceOf(AbortSignal);
  });

  it('busca detalhe da instituição por id passando signal', async () => {
    const payload: DetailResponse<'/institution/{institution_id}'> = {
      data: {
        id: 'inst-1',
        name: 'Universidade Estadual de Santa Cruz',
        acronym: 'UESC',
        counts: {
          researchers: 618,
          graduate_programs: 26,
          scholarship_holders: 0,
          research_groups: 0,
          labs: 0,
        },
      },
      meta: {
        took_ms: 3,
        cached: true,
        timestamp: '2026-11-20T00:00:00Z',
        data_as_of: null,
      },
    };

    mockFetch.mockResolvedValueOnce(jsonResponse(payload));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const options = institutionDetailQueryOptions('inst-1');
    const data = await queryClient.fetchQuery(options);

    expectTypeOf(data).toEqualTypeOf<
      DetailResponse<'/institution/{institution_id}'>
    >();
    expect(data).toEqual(payload);

    const request = mockFetch.mock.calls[0]?.[0];
    expect(new URL(request!.url).pathname).toBe(
      '/simcc/api/v2/institution/inst-1',
    );
    expect(request?.signal).toBeInstanceOf(AbortSignal);
  });

  it('desabilita query de detalhe com id vazio e propaga ApiError no 404', async () => {
    expect(institutionDetailQueryOptions('').enabled).toBe(false);

    mockFetch.mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: 'not_found',
            message: 'Instituição não encontrada.',
          },
        },
        404,
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const error = await queryClient
      .fetchQuery(institutionDetailQueryOptions('missing'))
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'Instituição não encontrada.',
    });
  });
});
