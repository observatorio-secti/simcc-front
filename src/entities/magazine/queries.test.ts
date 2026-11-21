import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import type { MagazineDetailResponse, MagazineListResponse } from './model';

// `queries.ts` importa `simcc`, que avalia `env` no load; CI não tem `.env`.
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');
const { simcc } = await import('@/api/simcc');
const { magazineDetailQueryOptions, magazineKeys, magazineListQueryOptions } =
  await import('./queries');

afterEach(() => {
  vi.restoreAllMocks();
});

const listPayload: MagazineListResponse = {
  data: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Nature',
      issn: '0028-0836',
      qualis: 'A1',
      qualis_status: null,
      jcr: 50.5,
      jcr_link: 'https://jcr.clarivate.com/nature',
      reference_period: '2017-2020',
    },
  ],
  pagination: {
    page: 1,
    per_page: 20,
    total_items: 1,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  },
  filters_applied: {
    q: 'Nature',
    issn: [],
    qualis: ['A1'],
  },
  sort: { by: 'name', order: 'asc' },
  meta: {
    took_ms: 4,
    cached: false,
    timestamp: '2026-11-20T00:00:00Z',
    data_as_of: '2026-11-20',
  },
  facets: null,
};

const detailPayload: MagazineDetailResponse = {
  data: listPayload.data[0]!,
  meta: {
    took_ms: 2,
    cached: false,
    timestamp: '2026-11-20T00:00:00Z',
    data_as_of: '2026-11-20',
  },
};

describe('magazineKeys', () => {
  it('padroniza as chaves de lista e detalhe', () => {
    expect(magazineKeys.list({ q: 'Nature', page: 2 })).toEqual([
      'magazine',
      'list',
      { q: 'Nature', page: 2 },
    ]);
    expect(magazineKeys.detail('mag-1')).toEqual([
      'magazine',
      'detail',
      'mag-1',
    ]);
  });
});

describe('magazineListQueryOptions', () => {
  it('consulta /magazine com params e repassa signal', async () => {
    const spy = vi.spyOn(simcc, 'GET').mockResolvedValue({
      data: listPayload,
      response: new Response(JSON.stringify(listPayload), { status: 200 }),
    } as never);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const params = { q: 'Nature', qualis: ['A1'] as ('A1' | 'A2')[] };
    const options = magazineListQueryOptions(params);

    expect(options.queryKey).toEqual(['magazine', 'list', params]);

    const result = await queryClient.fetchQuery(options);

    expect(result).toEqual(listPayload);
    expect(spy).toHaveBeenCalledWith(
      '/magazine',
      expect.objectContaining({
        params: { query: params },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('rejeita com ApiError quando a API devolve erro', async () => {
    vi.spyOn(simcc, 'GET').mockResolvedValue({
      error: {
        error: { code: 'validation_error', message: 'Filtro inválido' },
      },
      response: new Response(null, { status: 422 }),
    } as never);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await expect(
      queryClient.fetchQuery(magazineListQueryOptions({ page: 0 })),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('magazineDetailQueryOptions', () => {
  it('consulta /magazine/{magazine_id} com path param e repassa signal', async () => {
    const spy = vi.spyOn(simcc, 'GET').mockResolvedValue({
      data: detailPayload,
      response: new Response(JSON.stringify(detailPayload), { status: 200 }),
    } as never);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const id = '11111111-1111-4111-8111-111111111111';
    const options = magazineDetailQueryOptions(id);

    expect(options.queryKey).toEqual(['magazine', 'detail', id]);

    const result = await queryClient.fetchQuery(options);

    expect(result).toEqual(detailPayload);
    expect(spy).toHaveBeenCalledWith(
      '/magazine/{magazine_id}',
      expect.objectContaining({
        params: { path: { magazine_id: id } },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('desabilita query automática quando magazineId é vazio', () => {
    expect(magazineDetailQueryOptions('').enabled).toBe(false);
    expect(magazineDetailQueryOptions('   ').enabled).toBe(false);
    expect(magazineDetailQueryOptions('mag-1').enabled).toBe(true);
  });
});
