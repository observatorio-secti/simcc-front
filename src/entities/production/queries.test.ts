import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { PRODUCTION_ENDPOINTS, PRODUCTION_KINDS } from './model';

const fetchMock = vi.fn<typeof fetch>();

// `openapi-fetch` captura `globalThis.fetch` ao criar o cliente (`simcc`),
// e `env` valida `VITE_SIMCC_API_URL` no import (a CI não tem .env).
vi.stubGlobal('fetch', fetchMock);
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');
const {
  productionDetailQueryOptions,
  productionKeys,
  productionListQueryOptions,
} = await import('./queries');

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

beforeEach(() => {
  fetchMock.mockReset();
});

describe('productionKeys e queryOptions', () => {
  it.each(PRODUCTION_KINDS)(
    'gera keys e executa list e detail com signal para %s',
    async (kind) => {
      fetchMock.mockImplementation(async (input) => {
        const url = input instanceof Request ? input.url : String(input);
        if (url.includes('/item-id-1')) {
          return jsonResponse({
            data: { id: 'item-id-1', title: 'Detalhe' },
            meta: {
              took_ms: 1,
              cached: false,
              timestamp: '2026-11-20T00:00:00Z',
            },
          });
        }
        return jsonResponse({
          data: [],
          pagination: {
            page: 1,
            per_page: 20,
            total_items: 0,
            total_pages: 0,
            has_next: false,
            has_prev: false,
          },
          filters_applied: {},
          sort: { by: 'year', order: 'desc' },
          meta: {
            took_ms: 1,
            cached: false,
            timestamp: '2026-11-20T00:00:00Z',
          },
        });
      });

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const listParams = { q: 'bahia', page: 2 };
      const listOptions = productionListQueryOptions(kind, listParams);
      expect(listOptions.queryKey).toEqual([
        'production',
        kind,
        'list',
        listParams,
      ]);
      expect(productionKeys.list(kind)).toEqual([
        'production',
        kind,
        'list',
        {},
      ]);

      await queryClient.fetchQuery(listOptions);
      const listRequest = fetchMock.mock.calls[0]?.[0];
      expect(listRequest).toBeInstanceOf(Request);
      if (!(listRequest instanceof Request)) return;
      const listUrl = new URL(listRequest.url);
      expect(listUrl.pathname).toBe(
        `/simcc/api/v2${PRODUCTION_ENDPOINTS[kind].listPath}`,
      );
      expect(listUrl.searchParams.get('q')).toBe('bahia');
      expect(listUrl.searchParams.get('page')).toBe('2');
      expect(listRequest.signal).toBeInstanceOf(AbortSignal);

      const detailOptions = productionDetailQueryOptions(kind, 'item-id-1');
      expect(detailOptions.queryKey).toEqual([
        'production',
        kind,
        'detail',
        'item-id-1',
      ]);

      await queryClient.fetchQuery(detailOptions);
      const detailRequest = fetchMock.mock.calls[1]?.[0];
      expect(detailRequest).toBeInstanceOf(Request);
      if (!(detailRequest instanceof Request)) return;
      const detailUrl = new URL(detailRequest.url);
      expect(detailUrl.pathname).toBe(
        `/simcc/api/v2${PRODUCTION_ENDPOINTS[kind].listPath}/item-id-1`,
      );
      expect(detailRequest.signal).toBeInstanceOf(AbortSignal);
    },
  );

  it('propaga ApiError 404 quando a v2 responde erro', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        { error: { code: 'not_found', message: 'Produção não encontrada.' } },
        404,
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await expect(
      queryClient.fetchQuery(
        productionDetailQueryOptions('article', 'missing'),
      ),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ApiError &&
        error.status === 404 &&
        error.code === 'not_found',
    );
  });
});
