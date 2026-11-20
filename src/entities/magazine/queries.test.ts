import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import type { MagazineDetailResponse, MagazineListResponse } from './model';

// O cliente da v2 lê `env` e guarda `globalThis.fetch` ao ser criado: os dois
// precisam estar prontos antes do import.
const fetchMock = vi.fn<(request: Request) => Promise<Response>>();
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/');
vi.stubGlobal('fetch', fetchMock);
const { magazineQueries } = await import('./queries');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const meta = {
  took_ms: 4,
  cached: false,
  timestamp: '2026-11-20T16:46:57Z',
  data_as_of: null,
};

const magazine = {
  id: '06828386-8814-435e-9d3b-dc70fa306f05',
  name: '2d Materials',
  issn: '20531583',
  qualis: 'A1',
  qualis_status: null,
  jcr: 4.5,
  jcr_link: null,
  reference_period: '2021-2025',
} satisfies MagazineDetailResponse['data'];

const listBody = {
  data: [magazine],
  pagination: {
    page: 1,
    per_page: 1,
    total_items: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
  filters_applied: { q: null, issn: [], qualis: ['A1', 'not_rated'] },
  sort: { by: 'jcr', order: 'desc' },
  meta,
  facets: null,
} satisfies MagazineListResponse;

const lastUrl = () => new URL(fetchMock.mock.calls.at(-1)?.[0].url ?? '');

const client = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });

afterEach(() => {
  fetchMock.mockReset();
});

describe('magazineQueries.list', () => {
  it('usa a key [magazine, list, params]', () => {
    const params = { q: 'lancet', page: 2 };
    expect(magazineQueries.list(params).queryKey).toEqual([
      'magazine',
      'list',
      params,
    ]);
    expect(magazineQueries.list().queryKey).toEqual(['magazine', 'list', {}]);
  });

  it('chama /v2/magazine com os filtros na query', async () => {
    fetchMock.mockResolvedValue(json(listBody));
    const result = await client().fetchQuery(
      magazineQueries.list({
        q: 'materials',
        qualis: ['A1', 'not_rated'],
        sort_by: 'jcr',
        per_page: 1,
      }),
    );

    const url = lastUrl();
    expect(url.origin + url.pathname).toBe('http://api.test/v2/magazine');
    expect(url.searchParams.get('q')).toBe('materials');
    expect(url.searchParams.getAll('qualis')).toEqual(['A1', 'not_rated']);
    expect(url.searchParams.get('sort_by')).toBe('jcr');
    expect(url.searchParams.get('per_page')).toBe('1');
    expect(result.data[0]?.name).toBe('2d Materials');
    expect(result.pagination.total_items).toBe(1);
  });

  it('rejeita com ApiError quando a v2 recusa o parâmetro', async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          error: {
            code: 'unknown_parameter',
            message: "Parâmetro desconhecido: 'limit'",
            details: [],
          },
        },
        422,
      ),
    );
    await expect(
      client().fetchQuery(magazineQueries.list()),
    ).rejects.toMatchObject({
      status: 422,
      code: 'unknown_parameter',
    });
  });
});

describe('magazineQueries.detail', () => {
  it('usa a key [magazine, detail, id]', () => {
    expect(magazineQueries.detail('abc').queryKey).toEqual([
      'magazine',
      'detail',
      'abc',
    ]);
  });

  it('chama /v2/magazine/{id} e devolve o envelope { data, meta }', async () => {
    fetchMock.mockResolvedValue(json({ data: magazine, meta }));
    const result = await client().fetchQuery(
      magazineQueries.detail(magazine.id),
    );

    expect(lastUrl().pathname).toBe(`/v2/magazine/${magazine.id}`);
    expect(result.data).toEqual(magazine);
  });

  it('rejeita com ApiError not_found', async () => {
    fetchMock.mockResolvedValue(
      json(
        {
          error: {
            code: 'not_found',
            message: 'Revista não encontrada.',
            details: [],
          },
        },
        404,
      ),
    );
    const error = await client()
      .fetchQuery(magazineQueries.detail('x'))
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'Revista não encontrada.',
    });
  });
});
