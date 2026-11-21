import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

// `simcc` captura `globalThis.fetch` e `env` na importação.
vi.stubGlobal('fetch', fetchMock);
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');

const {
  RESEARCHER_DETAIL_INCLUDES,
  researcherDetailQueryOptions,
  researcherImageUrl,
  researcherKeys,
  researcherListQueryOptions,
  researcherTermsQueryOptions,
} = await import('./queries');

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function createQueryFnContext() {
  const controller = new AbortController();
  return {
    controller,
    context: {
      signal: controller.signal,
      meta: undefined,
      client: {} as never,
    },
  };
}

afterEach(() => {
  fetchMock.mockReset();
});

describe('researcherKeys', () => {
  it('padroniza chaves de lista, detalhe e termos', () => {
    expect(researcherKeys.list({ q: 'ia', page: 2 })).toEqual([
      'researcher',
      'list',
      { q: 'ia', page: 2 },
    ]);
    expect(researcherKeys.detail('r-1')).toEqual([
      'researcher',
      'detail',
      'r-1',
      { include: RESEARCHER_DETAIL_INCLUDES },
    ]);
    expect(researcherKeys.terms('r-1', { limit: 20 })).toEqual([
      'researcher',
      'terms',
      'r-1',
      { limit: 20 },
    ]);
  });
});

describe('researcherListQueryOptions', () => {
  it('consulta /v2/researcher com filtros e repassa signal', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [],
        pagination: { page: 1, per_page: 20, total_items: 0, total_pages: 0 },
        filters_applied: {},
        sort: { sort_by: 'relevance', sort_order: 'desc' },
        meta: { took_ms: 5, cached: false, timestamp: '2026-11-20T00:00:00Z' },
      }),
    );

    const options = researcherListQueryOptions({
      q: 'robótica',
      institution_id: ['inst-1', 'inst-2'],
      page: 2,
    });
    const { controller, context } = createQueryFnContext();
    await options.queryFn?.({ ...context, queryKey: options.queryKey });

    const request = fetchMock.mock.calls[0]?.[0] as Request;
    const url = new URL(request.url);
    expect(url.pathname).toBe('/simcc/api/v2/researcher');
    expect(url.searchParams.get('q')).toBe('robótica');
    expect(url.searchParams.getAll('institution_id')).toEqual([
      'inst-1',
      'inst-2',
    ]);
    expect(url.searchParams.get('page')).toBe('2');
    expect(request.signal.aborted).toBe(false);
    controller.abort();
    expect(request.signal.aborted).toBe(true);
  });
});

describe('researcherDetailQueryOptions', () => {
  it('inclui education, experience e foment por padrão e repassa signal', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          id: 'res-1',
          researcher_id: 'res-1',
          name: 'Helena Duarte Ramos',
          image_url: 'http://api.test/v2/researcher/res-1/image',
          image: '',
          affiliations: [],
          identifiers: { lattes_id: '123' },
          graduate_programs: [],
          research_groups: [],
        },
        meta: { took_ms: 8, cached: false, timestamp: '2026-11-20T00:00:00Z' },
      }),
    );

    const options = researcherDetailQueryOptions('res-1');
    const { controller, context } = createQueryFnContext();
    const result = await options.queryFn?.({
      ...context,
      queryKey: options.queryKey,
    });

    const request = fetchMock.mock.calls[0]?.[0] as Request;
    const url = new URL(request.url);
    expect(url.pathname).toBe('/simcc/api/v2/researcher/res-1');
    expect(url.searchParams.getAll('include')).toEqual([
      'education',
      'experience',
      'foment',
    ]);
    expect(request.signal.aborted).toBe(false);
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    expect(result?.data.id).toBe('res-1');
  });

  it('rejeita com ApiError quando o pesquisador não existe', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: 'not_found',
            message: 'Pesquisador não encontrado.',
            details: [],
          },
        },
        404,
      ),
    );

    const options = researcherDetailQueryOptions('inexistente');
    const { context } = createQueryFnContext();
    await expect(
      options.queryFn?.({ ...context, queryKey: options.queryKey }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('researcherTermsQueryOptions e researcherImageUrl', () => {
  it('consulta termos do pesquisador e monta URL da imagem', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [{ term: 'robotica', frequency: 12 }],
        meta: { took_ms: 4, cached: false, timestamp: '2026-11-20T00:00:00Z' },
      }),
    );

    const options = researcherTermsQueryOptions('res-1', { limit: 30 });
    const { controller, context } = createQueryFnContext();
    const result = await options.queryFn?.({
      ...context,
      queryKey: options.queryKey,
    });

    const request = fetchMock.mock.calls[0]?.[0] as Request;
    const url = new URL(request.url);
    expect(url.pathname).toBe('/simcc/api/v2/researcher/res-1/terms');
    expect(url.searchParams.get('limit')).toBe('30');
    expect(request.signal.aborted).toBe(false);
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    expect(result?.data[0]?.term).toBe('robotica');

    expect(researcherImageUrl('res-1')).toBe(
      'http://api.test/simcc/api/v2/researcher/res-1/image',
    );
  });
});
