import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import type { GetPath } from '@/api/types';
import { ApiError } from '@/api/errors';
import { simcc, unwrap } from '@/api/simcc';
import { examples } from './examples.gen';
import { server } from './server';
import { fixture, mockGet, mockGetError, simccUrl } from './simcc';

// `simcc` é importado estaticamente, ou seja, criado antes de qualquer hook do
// arquivo: estes testes provam que o setup liga o MSW cedo o bastante.

describe('simccUrl', () => {
  it('troca parâmetros de caminho pelo formato do MSW', () => {
    expect(simccUrl('/researcher/{researcher_id}/terms')).toBe(
      'http://api.test/v2/researcher/:researcher_id/terms',
    );
  });
});

describe('handlers padrão', () => {
  it('interceptam o cliente `simcc` criado na importação', async () => {
    await expect(unwrap(simcc.GET('/researcher'))).resolves.toEqual(
      examples['/researcher'],
    );
  });

  it('respondem rotas com parâmetro de caminho', async () => {
    const body = await unwrap(
      simcc.GET('/institution/{institution_id}', {
        params: { path: { institution_id: 'qualquer' } },
      }),
    );
    expect(body.data.id).toBe(
      examples['/institution/{institution_id}'].data.id,
    );
  });

  it('não mudam quando o teste altera um fixture', async () => {
    fixture('/researcher').data.length = 0;
    await expect(unwrap(simcc.GET('/researcher'))).resolves.toEqual(
      examples['/researcher'],
    );
  });

  it('cobrem os GET da v2 com resposta JSON', () => {
    const covered: GetPath[] = Object.keys(examples) as GetPath[];
    expect(covered).toContain('/researcher/{researcher_id}');
    expect(covered).toContain('/production/article');
    expect(covered).not.toContain('/researcher/{researcher_id}/image');
  });
});

describe('sobrescrita por teste', () => {
  it('mockGet troca o corpo, tipado pelo contrato', async () => {
    const body = fixture('/researcher');
    body.data = body.data.map((item) => ({ ...item, name: 'Maria Silva' }));
    server.use(mockGet('/researcher', body));

    const result = await unwrap(simcc.GET('/researcher'));
    expect(result.data[0]?.name).toBe('Maria Silva');
  });

  it('mockGet com função lê a requisição', async () => {
    server.use(
      mockGet('/researcher', ({ request }) => {
        const body = fixture('/researcher');
        body.filters_applied.q = new URL(request.url).searchParams.get('q');
        return body;
      }),
    );

    const result = await unwrap(
      simcc.GET('/researcher', { params: { query: { q: 'solos' } } }),
    );
    expect(result.filters_applied.q).toBe('solos');
  });

  it('mockGetError chega ao app como ApiError', async () => {
    server.use(mockGetError('/researcher/{researcher_id}', 404));

    const request = unwrap(
      simcc.GET('/researcher/{researcher_id}', {
        params: { path: { researcher_id: 'inexistente' } },
      }),
    );
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
    });
  });

  it('falha de rede vira network_error', async () => {
    server.use(http.get(simccUrl('/researcher'), () => HttpResponse.error()));

    await expect(unwrap(simcc.GET('/researcher'))).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
    });
  });
});
