import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ApiError, clientErrorCodes } from '@/api/errors';
import { createSimccClient, simcc, unwrap } from '@/api/simcc';
import {
  openApiErrors,
  openApiFacetResult,
  openApiMatchItem,
  openApiMeta,
  openApiPagination,
  v2Fixtures,
} from './fixtures';
import { simccV2Url } from './handlers';
import { server } from './server';

describe('MSW da API v2', () => {
  it('combina os 5 exemplos reais do OpenAPI nas fixtures tipadas', () => {
    expect(openApiMeta.took_ms).toBe(42);
    expect(openApiPagination.total_items).toBe(137);
    expect(openApiFacetResult.param).toBe('institution_id');
    expect(openApiMatchItem.source_type).toBe('article');
    expect(openApiErrors.notFound.error.code).toBe('not_found');
    expect(openApiErrors.unknownParameter.error.code).toBe('unknown_parameter');
  });

  it('monta URLs da v2 respeitando VITE_SIMCC_API_URL e parâmetros OpenAPI', () => {
    expect(simccV2Url('/researcher/{researcher_id}')).toMatch(
      /\/v2\/researcher\/:researcher_id$/,
    );
    expect(simccV2Url('institution')).toMatch(/\/v2\/institution$/);
  });

  it('responde às rotas da v2 com fixtures tipadas e sem campos @deprecated', async () => {
    const researchers = await unwrap(
      simcc.GET('/researcher', { params: { query: { q: 'solos' } } }),
    );
    expect(researchers.meta).toEqual(openApiMeta);
    expect(researchers.pagination).toEqual(openApiPagination);
    expect(researchers.data[0]?.id).toBe(v2Fixtures['/researcher'].data[0]?.id);
    expect(researchers.data[0]).not.toHaveProperty('researcher_id');
    expect(researchers.data[0]).not.toHaveProperty('image');

    const detail = await unwrap(
      simcc.GET('/researcher/{researcher_id}', {
        params: {
          path: { researcher_id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d' },
        },
      }),
    );
    expect(detail.data.name).toBe('Ana Maria Silva');
    expect(detail.data).not.toHaveProperty('researcher_id');
    expect(detail.data).not.toHaveProperty('image');

    const metrics = await unwrap(
      simcc.GET('/metrics/production/{kind}', {
        params: { path: { kind: 'software' } },
      }),
    );
    expect(metrics.kind).toBe('software');
    expect(metrics.data.length).toBeGreaterThan(0);

    const imageRes = await simcc.GET('/researcher/{researcher_id}/image', {
      params: {
        path: { researcher_id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d' },
      },
      parseAs: 'arrayBuffer',
    });
    expect(imageRes.response.status).toBe(200);
    expect(imageRes.response.headers.get('Content-Type')).toBe('image/png');
  });

  it('cobre todas as rotas JSON declaradas no contrato OpenAPI v2', async () => {
    const id = '00000000-0000-4000-8000-000000000001';
    const calls = [
      unwrap(simcc.GET('/analytics')),
      unwrap(simcc.GET('/analytics/pages')),
      unwrap(simcc.GET('/researcher')),
      unwrap(
        simcc.GET('/researcher/{researcher_id}', {
          params: { path: { researcher_id: id } },
        }),
      ),
      unwrap(simcc.GET('/institution')),
      unwrap(
        simcc.GET('/institution/{institution_id}', {
          params: { path: { institution_id: id } },
        }),
      ),
      unwrap(simcc.GET('/graduate-program')),
      unwrap(
        simcc.GET('/graduate-program/{program_id}', {
          params: { path: { program_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/article')),
      unwrap(
        simcc.GET('/production/article/{article_id}', {
          params: { path: { article_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/book')),
      unwrap(
        simcc.GET('/production/book/{book_id}', {
          params: { path: { book_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/book-chapter')),
      unwrap(
        simcc.GET('/production/book-chapter/{chapter_id}', {
          params: { path: { chapter_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/software')),
      unwrap(
        simcc.GET('/production/software/{software_id}', {
          params: { path: { software_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/patent')),
      unwrap(
        simcc.GET('/production/patent/{patent_id}', {
          params: { path: { patent_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/event')),
      unwrap(
        simcc.GET('/production/event/{event_id}', {
          params: { path: { event_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/research-project')),
      unwrap(
        simcc.GET('/production/research-project/{project_id}', {
          params: { path: { project_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/brand')),
      unwrap(
        simcc.GET('/production/brand/{item_id}', {
          params: { path: { item_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/guidance')),
      unwrap(
        simcc.GET('/production/guidance/{item_id}', {
          params: { path: { item_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/report')),
      unwrap(
        simcc.GET('/production/report/{item_id}', {
          params: { path: { item_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/magazine-text')),
      unwrap(
        simcc.GET('/production/magazine-text/{item_id}', {
          params: { path: { item_id: id } },
        }),
      ),
      unwrap(simcc.GET('/production/event-work')),
      unwrap(
        simcc.GET('/production/event-work/{item_id}', {
          params: { path: { item_id: id } },
        }),
      ),
      unwrap(simcc.GET('/suggestion', { params: { query: { q: 'redes' } } })),
      unwrap(simcc.GET('/magazine')),
      unwrap(
        simcc.GET('/magazine/{magazine_id}', {
          params: { path: { magazine_id: id } },
        }),
      ),
      unwrap(simcc.GET('/scholarship')),
      unwrap(
        simcc.GET('/researcher/{researcher_id}/terms', {
          params: { path: { researcher_id: id } },
        }),
      ),
      unwrap(
        simcc.GET('/metrics/production/{kind}', {
          params: { path: { kind: 'article' } },
        }),
      ),
    ];

    expect(calls).toHaveLength(Object.keys(v2Fixtures).length);
    const results = await Promise.all(calls);
    for (const body of results) {
      // `/analytics/pages` é a única rota sem `meta` no contrato.
      if ('total' in body && !('meta' in body)) continue;
      expect(body).toHaveProperty('meta', openApiMeta);
    }
  });

  it('rejeita requisições fora dos handlers registrados (onUnhandledRequest: error)', async () => {
    const unknownClient = createSimccClient('http://unhandled.example.test/');
    const error = await unwrap(unknownClient.GET('/researcher')).catch(
      (err: unknown) => err,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      code: clientErrorCodes.network,
    });
  });

  it('aceita sobrescrita por teste com server.use() e reseta depois', async () => {
    server.use(
      http.get(simccV2Url('/researcher/{researcher_id}'), () =>
        HttpResponse.json(openApiErrors.notFound, { status: 404 }),
      ),
    );

    const error = await unwrap(
      simcc.GET('/researcher/{researcher_id}', {
        params: { path: { researcher_id: 'inexistente' } },
      }),
    ).catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'Pesquisador não encontrado.',
    });
  });

  it('volta ao handler padrão após o reset automático do afterEach', async () => {
    const detail = await unwrap(
      simcc.GET('/researcher/{researcher_id}', {
        params: { path: { researcher_id: 'inexistente' } },
      }),
    );
    expect(detail.data.id).toBe('9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d');
  });
});
