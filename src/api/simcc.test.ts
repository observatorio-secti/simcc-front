import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { ApiError } from './errors';
import type { DetailResponse } from './types';

// `simcc` lê `env` ao ser importado; a CI não tem .env.
vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');
const { simcc, simccV2BaseUrl, unwrap } = await import('./simcc');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('simccV2BaseUrl', () => {
  it('aponta para <url>v2, com ou sem barra final', () => {
    expect(simccV2BaseUrl('http://localhost:8088/')).toBe(
      'http://localhost:8088/v2',
    );
    expect(simccV2BaseUrl('https://exemplo.br/simcc/api')).toBe(
      'https://exemplo.br/simcc/api/v2',
    );
  });
});

describe('simcc', () => {
  it('monta a URL da v2 com caminho e query', async () => {
    const fetch = vi.fn(async (_request: Request) =>
      json({ data: [], meta: {} }),
    );
    await simcc.GET('/researcher', {
      params: { query: { q: 'saúde', page: 2 } },
      fetch,
    });
    const request = fetch.mock.calls[0]?.[0];
    const url = new URL(request?.url ?? '');
    expect(url.origin + url.pathname).toBe(
      'http://api.test/simcc/api/v2/researcher',
    );
    expect(url.searchParams.get('q')).toBe('saúde');
    expect(url.searchParams.get('page')).toBe('2');
  });

  it('rejeita com ApiError quando a v2 devolve erro', async () => {
    const fetch = async () =>
      json({ error: { code: 'not_found', message: 'Não encontrado.' } }, 404);
    await expect(
      simcc.GET('/institution/{institution_id}', {
        params: { path: { institution_id: 'x' } },
        fetch,
      }),
    ).rejects.toBeInstanceOf(ApiError);
  });
});

describe('unwrap', () => {
  it('tipa o corpo pelo contrato', () => {
    const getResearcher = (id: string) =>
      unwrap(
        simcc.GET('/researcher/{researcher_id}', {
          params: { path: { researcher_id: id } },
        }),
      );
    expectTypeOf(getResearcher).returns.resolves.toEqualTypeOf<
      DetailResponse<'/researcher/{researcher_id}'>
    >();
  });

  it('devolve o corpo da resposta', async () => {
    const body = { data: { id: 'x' }, meta: {} };
    await expect(
      unwrap(Promise.resolve({ data: body, response: json(body) })),
    ).resolves.toBe(body);
  });

  it('normaliza `error` de um cliente sem middleware', async () => {
    const error = { detail: 'Not Found' };
    await expect(
      unwrap(Promise.resolve({ error, response: json(error, 404) })),
    ).rejects.toMatchObject({ status: 404, code: 'not_found' });
  });

  it('rejeita resposta de sucesso sem corpo', async () => {
    await expect(
      unwrap(
        Promise.resolve({
          data: undefined,
          response: new Response(null, { status: 204 }),
        }),
      ),
    ).rejects.toMatchObject({ status: 204, code: 'invalid_response' });
  });
});
