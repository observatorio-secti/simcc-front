import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';

const fetchMock =
  vi.fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>();

// `simcc` captura `globalThis.fetch` e `env` na importação.
vi.stubGlobal('fetch', fetchMock);
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');

const {
  graduateProgramDetailQueryOptions,
  graduateProgramKeys,
  graduateProgramListQueryOptions,
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

describe('graduateProgramKeys', () => {
  it('padroniza chaves de listagem e detalhe', () => {
    expect(graduateProgramKeys.all).toEqual(['graduate-program']);
    expect(graduateProgramKeys.lists()).toEqual(['graduate-program', 'list']);
    expect(graduateProgramKeys.list({ q: 'computação', page: 2 })).toEqual([
      'graduate-program',
      'list',
      { q: 'computação', page: 2 },
    ]);
    expect(graduateProgramKeys.details()).toEqual([
      'graduate-program',
      'detail',
    ]);
    expect(graduateProgramKeys.detail('prog-1')).toEqual([
      'graduate-program',
      'detail',
      'prog-1',
    ]);
  });
});

describe('graduateProgramListQueryOptions', () => {
  it('consulta /v2/graduate-program com filtros repetidos e repassa signal', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: [
          {
            id: 'prog-1',
            name: 'Programa de Pós-Graduação em Ciência da Computação',
            acronym: 'PGCOMP',
          },
        ],
        pagination: { page: 1, per_page: 20, total_items: 1, total_pages: 1 },
        filters_applied: {},
        sort: { sort_by: 'name', sort_order: 'asc' },
        meta: { took_ms: 6, cached: false, timestamp: '2026-11-20T00:00:00Z' },
      }),
    );

    const options = graduateProgramListQueryOptions({
      q: 'computação',
      institution_id: ['ufba', 'uesc'],
      rating: ['5', '6'],
      page: 2,
    });
    const { controller, context } = createQueryFnContext();
    const result = await options.queryFn?.({
      ...context,
      queryKey: options.queryKey,
    });

    const request = fetchMock.mock.calls[0]?.[0] as Request;
    const url = new URL(request.url);
    expect(url.pathname).toBe('/simcc/api/v2/graduate-program');
    expect(url.searchParams.get('q')).toBe('computação');
    expect(url.searchParams.getAll('institution_id')).toEqual(['ufba', 'uesc']);
    expect(url.searchParams.getAll('rating')).toEqual(['5', '6']);
    expect(url.searchParams.get('page')).toBe('2');
    expect(request.signal.aborted).toBe(false);
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    expect(result?.data[0]?.id).toBe('prog-1');
  });
});

describe('graduateProgramDetailQueryOptions', () => {
  it('consulta /v2/graduate-program/{program_id} e repassa signal', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          id: 'prog-1',
          name: 'Programa de Pós-Graduação em Ciência da Computação',
          research_lines: [
            {
              name: 'Engenharia de Software',
              area: 'CIÊNCIA DA COMPUTAÇÃO',
              start_year: 2012,
              end_year: null,
            },
          ],
          counts: { researchers: 38 },
        },
        meta: { took_ms: 4, cached: false, timestamp: '2026-11-20T00:00:00Z' },
      }),
    );

    const options = graduateProgramDetailQueryOptions('prog-1');
    const { controller, context } = createQueryFnContext();
    const result = await options.queryFn?.({
      ...context,
      queryKey: options.queryKey,
    });

    const request = fetchMock.mock.calls[0]?.[0] as Request;
    const url = new URL(request.url);
    expect(url.pathname).toBe('/simcc/api/v2/graduate-program/prog-1');
    expect(request.signal.aborted).toBe(false);
    controller.abort();
    expect(request.signal.aborted).toBe(true);
    expect(result?.data.research_lines).toHaveLength(1);
    expect(result?.data.counts?.researchers).toBe(38);
  });

  it('rejeita com ApiError quando o programa não é encontrado', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: 'not_found',
            message: 'Programa não encontrado.',
            details: [],
          },
        },
        404,
      ),
    );

    const options = graduateProgramDetailQueryOptions('inexistente');
    const { context } = createQueryFnContext();
    await expect(
      options.queryFn?.({ ...context, queryKey: options.queryKey }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});
