import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import type { ScholarshipListResponse } from './model';

// `queries.ts` importa `simcc`, que avalia `env` no load; CI não tem `.env`.
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');
const { simcc } = await import('@/api/simcc');
const {
  researcherScholarshipsQueryOptions,
  scholarshipKeys,
  scholarshipListQueryOptions,
} = await import('./queries');

afterEach(() => {
  vi.restoreAllMocks();
});

const listPayload: ScholarshipListResponse = {
  data: [
    {
      id: '6e5d4c3b-2a1f-4098-b765-43210fedcba9',
      researcher: {
        id: '11111111-1111-4111-8111-111111111111',
        name: 'Maria da Silva',
      },
      modality: 'Produtividade em Pesquisa - 2',
      category_level: '2',
      call_title: null,
      funding_program: null,
      institute: 'Universidade Federal da Bahia - BA - Brasil',
      aid_quantity: null,
      scholarship_quantity: null,
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
    researcher_id: [],
    institution_id: [],
    graduate_program_id: [],
    modality: [],
    category_level: ['2'],
  },
  sort: { by: 'researcher_name', order: 'asc' },
  meta: {
    took_ms: 4,
    cached: false,
    timestamp: '2026-11-21T00:00:00Z',
    data_as_of: null,
  },
  facets: null,
};

function mockList() {
  return vi.spyOn(simcc, 'GET').mockResolvedValue({
    data: listPayload,
    response: new Response(JSON.stringify(listPayload), { status: 200 }),
  } as never);
}

function testClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

describe('scholarshipKeys', () => {
  it('padroniza as chaves de lista e por pesquisador', () => {
    expect(scholarshipKeys.list({ category_level: ['2'], page: 2 })).toEqual([
      'scholarship',
      'list',
      { category_level: ['2'], page: 2 },
    ]);
    expect(scholarshipKeys.byResearcher('r-1')).toEqual([
      'scholarship',
      'by-researcher',
      'r-1',
    ]);
  });
});

describe('scholarshipListQueryOptions', () => {
  it('consulta /scholarship com params e repassa signal', async () => {
    const spy = mockList();
    const params = {
      category_level: ['2'],
      sort_by: 'researcher_name' as const,
      facets: ['modality', 'category_level'],
    };
    const options = scholarshipListQueryOptions(params);
    expect(options.queryKey).toEqual(['scholarship', 'list', params]);

    await expect(testClient().fetchQuery(options)).resolves.toEqual(
      listPayload,
    );
    expect(spy).toHaveBeenCalledWith(
      '/scholarship',
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

    await expect(
      testClient().fetchQuery(scholarshipListQueryOptions({ page: 0 })),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('researcherScholarshipsQueryOptions', () => {
  it('filtra pelo pesquisador com a chave by-researcher', async () => {
    const spy = mockList();
    const options = researcherScholarshipsQueryOptions('r-1');
    expect(options.queryKey).toEqual(['scholarship', 'by-researcher', 'r-1']);

    await testClient().fetchQuery(options);
    expect(spy).toHaveBeenCalledWith(
      '/scholarship',
      expect.objectContaining({
        params: { query: { researcher_id: ['r-1'], per_page: 50 } },
      }),
    );
  });
});
