import createClient from 'openapi-fetch';
import { describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  apiErrorFromResponse,
  apiErrorMiddleware,
  isApiError,
  normalizeErrorBody,
} from './errors';
import type { paths } from './generated/simcc-v2';

const json = (body: unknown, status: number, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

describe('normalizeErrorBody', () => {
  it('lê o envelope de erro da v2', () => {
    const error = normalizeErrorBody(422, {
      error: {
        code: 'unknown_parameter',
        message: "Parâmetro desconhecido: 'foo'",
        details: [
          {
            field: 'foo',
            message: 'Parâmetro não aceito por esta rota',
            type: 'unknown_parameter',
            input: null,
          },
        ],
      },
    });

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      name: 'ApiError',
      status: 422,
      code: 'unknown_parameter',
      message: "Parâmetro desconhecido: 'foo'",
      details: [
        {
          field: 'foo',
          message: 'Parâmetro não aceito por esta rota',
          type: 'unknown_parameter',
          input: null,
        },
      ],
    });
  });

  it('aceita erro da v2 sem `details` e descarta detalhes malformados', () => {
    expect(
      normalizeErrorBody(404, {
        error: { code: 'not_found', message: 'Pesquisador não encontrado.' },
      }).details,
    ).toEqual([]);

    expect(
      normalizeErrorBody(422, {
        error: {
          code: 'validation_error',
          message: 'Parâmetros inválidos',
          details: [{ field: 'page' }, 'texto', { message: 'ok' }],
        },
      }).details,
    ).toEqual([{ field: null, message: 'ok', type: null, input: null }]);
  });

  it('aceita o formato antigo `{ detail: string }`', () => {
    expect(
      normalizeErrorBody(404, { detail: 'Researcher not found' }),
    ).toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'Researcher not found',
      details: [],
    });
  });

  it('aceita o 422 antigo do FastAPI `{ detail: [...] }`', () => {
    const error = normalizeErrorBody(422, {
      detail: [
        {
          loc: ['query', 'page'],
          msg: 'Input should be a valid integer',
          type: 'int_parsing',
          input: 'abc',
        },
        { loc: ['body', 'filters', 0], msg: 'Field required', type: 'missing' },
      ],
    });

    expect(error).toMatchObject({
      status: 422,
      code: 'validation_error',
      message: 'Parâmetros inválidos.',
      details: [
        {
          field: 'page',
          message: 'Input should be a valid integer',
          type: 'int_parsing',
          input: 'abc',
        },
        {
          field: 'filters.0',
          message: 'Field required',
          type: 'missing',
          input: null,
        },
      ],
    });
  });

  it.each([
    [400, 'bad_request'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not_found'],
    [422, 'validation_error'],
    [429, 'rate_limited'],
    [500, 'server_error'],
    [503, 'server_error'],
    [418, 'http_error'],
  ])(
    'deriva o código do status %i quando o corpo não ajuda',
    (status, code) => {
      for (const body of [
        undefined,
        '<html>Bad Gateway</html>',
        { mensagem: 'outro formato' },
        { error: 'texto' },
        { detail: '' },
      ]) {
        const error = normalizeErrorBody(status, body);
        expect(error).toMatchObject({ status, code, details: [] });
        expect(error.message).not.toBe('');
      }
    },
  );
});

describe('apiErrorFromResponse', () => {
  it('lê corpo JSON', async () => {
    const error = await apiErrorFromResponse(
      json({ error: { code: 'not_found', message: 'Não achei.' } }, 404),
    );
    expect(error).toMatchObject({ status: 404, code: 'not_found' });
  });

  it('não confunde HTML do proxy com mensagem da API', async () => {
    const error = await apiErrorFromResponse(
      new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      }),
    );
    expect(error).toMatchObject({ status: 502, code: 'server_error' });
    expect(error.message).not.toMatch(/html/i);
  });

  it('trata corpo vazio', async () => {
    const error = await apiErrorFromResponse(
      new Response(null, { status: 404 }),
    );
    expect(error).toMatchObject({ status: 404, code: 'not_found' });
  });
});

describe('apiErrorMiddleware', () => {
  const setup = (fetch: (request: Request) => Promise<Response>) => {
    const client = createClient<paths>({
      baseUrl: 'http://api.test/v2',
      fetch,
    });
    client.use(apiErrorMiddleware);
    return client;
  };

  const getResearcher = (client: ReturnType<typeof setup>) =>
    client.GET('/researcher/{researcher_id}', {
      params: { path: { researcher_id: 'abc' } },
    });

  it('deixa passar a resposta de sucesso', async () => {
    const body = { data: { id: 'abc' }, meta: {} };
    const client = setup(async () => json(body, 200));
    const { data } = await getResearcher(client);
    expect(data).toEqual(body);
  });

  it('rejeita com ApiError quando a v2 devolve erro', async () => {
    const client = setup(async () =>
      json(
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
    const error = await getResearcher(client).catch((e: unknown) => e);
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'Pesquisador não encontrado.',
    });
  });

  it('rejeita com ApiError no formato antigo', async () => {
    const client = setup(async () => json({ detail: 'Not Found' }, 404));
    await expect(getResearcher(client)).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'Not Found',
    });
  });

  it('rejeita com `invalid_response` quando 200 não é JSON', async () => {
    const client = setup(
      async () =>
        new Response('<!doctype html><html></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
    );
    await expect(getResearcher(client)).rejects.toMatchObject({
      name: 'ApiError',
      status: 200,
      code: 'invalid_response',
    });
  });

  it('converte falha de rede em `network_error` com status 0', async () => {
    const cause = new TypeError('Failed to fetch');
    const client = setup(async () => {
      throw cause;
    });
    const error = await getResearcher(client).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: 'network_error', cause });
  });

  it('não converte cancelamento', async () => {
    const abort = new DOMException('The operation was aborted.', 'AbortError');
    const fetch = vi.fn(async () => {
      throw abort;
    });
    const client = setup(fetch);
    await expect(getResearcher(client)).rejects.toBe(abort);
    expect(fetch).toHaveBeenCalledOnce();
  });
});
