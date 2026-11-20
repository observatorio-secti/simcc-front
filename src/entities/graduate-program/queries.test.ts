import { QueryClient } from '@tanstack/react-query';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { programDetailFixture, programSummaryFixture } from './fixtures';

// Sem MSW (F1.6): o `openapi-fetch` guarda `globalThis.fetch` ao criar o
// cliente em `src/api/simcc.ts`, então o `fetch` simulado e o `env` entram
// antes do import das queries.
const fetchMock = vi.fn<(request: Request) => Promise<Response>>();
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/');
vi.stubGlobal('fetch', fetchMock);
const { graduateProgramQueries } = await import('./queries');

afterAll(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const meta = {
  took_ms: 1,
  cached: false,
  timestamp: '2026-11-20T00:00:00Z',
  data_as_of: null,
};

function lastRequestUrl() {
  const request = fetchMock.mock.lastCall?.[0];
  return new URL(request?.url ?? '');
}

function newClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

beforeEach(() => {
  fetchMock.mockReset();
});

describe('graduateProgramQueries.list', () => {
  it('usa a key padronizada', () => {
    const search = { q: 'computação', page: 2 };
    expect(graduateProgramQueries.list(search).queryKey).toEqual([
      'graduate-program',
      'list',
      search,
    ]);
    expect(graduateProgramQueries.list().queryKey).toEqual([
      'graduate-program',
      'list',
      {},
    ]);
  });

  it('chama /v2/graduate-program com filtros repetidos e devolve o envelope', async () => {
    const body = {
      data: [programSummaryFixture],
      pagination: {
        page: 1,
        per_page: 20,
        total_items: 1,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
      filters_applied: { q: 'modelagem', state: ['BA'] },
      sort: { by: 'name', order: 'asc' },
      meta,
    };
    fetchMock.mockResolvedValueOnce(json(body));

    const result = await newClient().fetchQuery(
      graduateProgramQueries.list({
        q: 'modelagem',
        state: ['BA', 'SE'],
        per_page: 20,
      }),
    );

    const url = lastRequestUrl();
    expect(url.origin + url.pathname).toBe(
      'http://api.test/v2/graduate-program',
    );
    expect(url.searchParams.get('q')).toBe('modelagem');
    expect(url.searchParams.getAll('state')).toEqual(['BA', 'SE']);
    expect(url.searchParams.get('per_page')).toBe('20');
    expect(result.data[0]?.name).toBe(programSummaryFixture.name);
    expect(result.pagination.total_items).toBe(1);
  });
});

describe('graduateProgramQueries.detail', () => {
  it('usa a key padronizada', () => {
    expect(graduateProgramQueries.detail('abc').queryKey).toEqual([
      'graduate-program',
      'detail',
      'abc',
    ]);
  });

  it('chama /v2/graduate-program/{id} e traz linhas e instituição', async () => {
    fetchMock.mockResolvedValueOnce(json({ data: programDetailFixture, meta }));

    const result = await newClient().fetchQuery(
      graduateProgramQueries.detail(programDetailFixture.id),
    );

    expect(lastRequestUrl().pathname).toBe(
      `/v2/graduate-program/${programDetailFixture.id}`,
    );
    expect(result.data.institution?.name).toBe(
      'Universidade Estadual de Santa Cruz',
    );
    expect(result.data.research_lines).toHaveLength(3);
  });

  it('rejeita com ApiError 404 para programa inexistente', async () => {
    fetchMock.mockResolvedValueOnce(
      json(
        { error: { code: 'not_found', message: 'Programa não encontrado.' } },
        404,
      ),
    );

    const error = await newClient()
      .fetchQuery(graduateProgramQueries.detail('inexistente'))
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: 'not_found' });
  });
});
