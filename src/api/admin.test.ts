import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';

vi.stubEnv('VITE_SIMCC_API_URL', 'https://api.test/simcc/api/');
vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.test/simcc/admin/');
vi.stubEnv('VITE_IDP_URL', 'https://api.test/idp/');

const { createAdminClient, isAdminApiConfigured, resolveAdminUrl } =
  await import('./admin');
const { createIdpClient } = await import('./idp');
const { createSimccClient, unwrap } = await import('./simcc');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

type FetchMock = (request: Request) => Promise<Response>;

/** O cliente tipado chama o `fetch` com um `Request` já montado. */
function adminFetchMock(handler: FetchMock) {
  return vi.fn(async (input: RequestInfo | URL) => handler(input as Request));
}

const meBody = {
  user: { sub: 'sub-1', name: 'Ana Admin', email: 'ana@secti.ba.gov.br' },
  is_admin: true,
};

const pagination = {
  page: 1,
  per_page: 20,
  total_items: 0,
  total_pages: 0,
  has_next: false,
  has_prev: false,
};

describe('resolveAdminUrl e isolamento de token', () => {
  it('preserva subcaminho da adminApiUrl e aceita barra inicial relativa', () => {
    expect(resolveAdminUrl('https://observatorio.br/simcc/admin/', '/me')).toBe(
      'https://observatorio.br/simcc/admin/me',
    );
    expect(
      resolveAdminUrl('https://observatorio.br/simcc/admin', 'etl/runs'),
    ).toBe('https://observatorio.br/simcc/admin/etl/runs');
  });

  it('recusa destino em outro domínio, outro prefixo ou com path traversal', () => {
    for (const badPath of [
      'https://evil.com/me',
      '//evil.com/me',
      'https://observatorio.br/simcc/api/v2/researcher',
      'https://observatorio.br/simcc/admin-evil/me',
      '../api/v2/researcher',
    ]) {
      expect(() =>
        resolveAdminUrl('https://observatorio.br/simcc/admin/', badPath),
      ).toThrow(ApiError);
    }
  });

  it('codifica parâmetros de caminho e mantém a chamada dentro da API de admin', async () => {
    const fetchMock = adminFetchMock(
      async () => new Response(null, { status: 204 }),
    );
    const client = createAdminClient({
      baseUrl: 'https://observatorio.br/simcc/admin/',
      fetch: fetchMock,
      getAccessToken: () => 'secret-token',
      refreshAccessToken: vi.fn(),
    });

    await client.api().DELETE('/admins/{admin_id}', {
      params: { path: { admin_id: '../../api/v2' } },
    });

    const sent = fetchMock.mock.calls[0]?.[0] as Request;
    expect(
      sent.url.startsWith('https://observatorio.br/simcc/admin/admins/'),
    ).toBe(true);
    expect(sent.method).toBe('DELETE');
    expect(sent.headers.get('Authorization')).toBe('Bearer secret-token');
  });

  it('cliente da v2 (simcc) não envia Authorization mesmo com token ativo no IdP', async () => {
    const fetchMock = vi.fn(async (_request: Request) =>
      json({ data: [], meta: {} }),
    );
    const simccClient = createSimccClient('https://observatorio.br/simcc/api/');

    await simccClient.GET('/researcher', { fetch: fetchMock });

    const sentRequest = fetchMock.mock.calls[0]?.[0] as Request;
    expect(sentRequest.headers.get('Authorization')).toBeNull();
  });

  it('trata ausência de VITE_ADMIN_API_URL de forma segura', async () => {
    expect(isAdminApiConfigured('')).toBe(false);
    const fetchMock = vi.fn();
    const client = createAdminClient({
      baseUrl: '',
      fetch: fetchMock,
      getAccessToken: () => 'token',
      refreshAccessToken: vi.fn(),
    });
    expect(client.isConfigured()).toBe(false);
    await expect(client.fetchMe()).rejects.toMatchObject({
      code: 'admin_api_not_configured',
    });
    expect(() => client.api()).toThrow(ApiError);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('createAdminClient tipado (openapi-fetch)', () => {
  it('envia Bearer token para GET <admin>/me e devolve o corpo tipado', async () => {
    const fetchMock = adminFetchMock(async () => json(meBody));
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: fetchMock,
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
    });

    await expect(client.fetchMe()).resolves.toEqual(meBody);

    const sent = fetchMock.mock.calls[0]?.[0] as Request;
    expect(sent.url).toBe('https://api.test/simcc/admin/me');
    expect(sent.headers.get('Authorization')).toBe('Bearer at-valid');
    expect(sent.headers.get('Accept')).toBe('application/json');
  });

  it('serializa query e corpo pelos tipos do contrato', async () => {
    const fetchMock = adminFetchMock(async (request) => {
      if (request.method === 'POST') {
        return json(
          {
            id: '00000000-0000-0000-0000-000000000001',
            sub: 'novo',
            created_at: '2026-11-22T10:00:00Z',
          },
          201,
        );
      }
      return json({ data: [], pagination });
    });
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: fetchMock,
      getAccessToken: () => 'at',
      refreshAccessToken: vi.fn(),
    });

    await unwrap(
      client.api().GET('/admins', {
        params: { query: { q: 'ana', page: 2, per_page: 10 } },
      }),
    );
    const created = await unwrap(
      client.api().POST('/admins', { body: { sub: 'novo' } }),
    );

    const list = fetchMock.mock.calls[0]?.[0] as Request;
    expect(new URL(list.url).search).toBe('?q=ana&page=2&per_page=10');
    const post = fetchMock.mock.calls[1]?.[0] as Request;
    await expect(post.json()).resolves.toEqual({ sub: 'novo' });
    expect(created.sub).toBe('novo');
  });

  it('em 401 concorrente renova uma única vez via fila e repete cada requisição 1x', async () => {
    let etlCalls = 0;
    let adminsCalls = 0;

    const idpFetch = vi.fn(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as Record<string, string>;
        if (body.grant_type === 'authorization_code') {
          return json({ access_token: 'at-expired', refresh_token: 'rt-1' });
        }
        if (body.grant_type === 'refresh_token') {
          expect(body.refresh_token).toBe('rt-1');
          return json({ access_token: 'at-fresh', refresh_token: 'rt-2' });
        }
        return json({ error: 'unsupported' }, 400);
      },
    );

    const idpClient = createIdpClient({
      idpUrl: 'https://api.test/idp/',
      fetch: idpFetch,
      getOrigin: () => 'https://app.test',
      getBaseUrl: () => '/',
    });
    await idpClient.exchangeCodeForTokens({ code: 'c', codeVerifier: 'v' });

    const adminFetch = adminFetchMock(async (request) => {
      const auth = request.headers.get('Authorization');
      const path = new URL(request.url).pathname;
      if (path.endsWith('/etl/runs')) etlCalls += 1;
      if (path.endsWith('/admins')) adminsCalls += 1;
      if (auth === 'Bearer at-expired') {
        return json({ detail: 'Token expired' }, 401);
      }
      return json({ data: [], pagination });
    });

    const onAuthFailure = vi.fn();
    const adminClient = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetch,
      getAccessToken: () => idpClient.getAccessToken(),
      hasRefreshToken: () => idpClient.hasRefreshToken(),
      refreshAccessToken: (failed) =>
        idpClient.refreshAccessToken({ failedAccessToken: failed }),
      onAuthFailure,
    });

    const [runs, admins] = await Promise.all([
      unwrap(adminClient.api().GET('/etl/runs')),
      unwrap(adminClient.api().GET('/admins')),
    ]);

    expect(runs.data).toEqual([]);
    expect(admins.data).toEqual([]);
    expect(idpClient.getAccessToken()).toBe('at-fresh');
    // 1 exchange + 1 refresh apenas para as duas falhas 401 simultâneas.
    expect(idpFetch).toHaveBeenCalledTimes(2);
    expect(etlCalls).toBe(2);
    expect(adminsCalls).toBe(2);
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('repete o corpo do POST na segunda tentativa após o 401', async () => {
    const bodies: unknown[] = [];
    let token = 'at-1';
    const adminFetch = adminFetchMock(async (request) => {
      bodies.push(await request.json());
      if (request.headers.get('Authorization') === 'Bearer at-1') {
        return json({ detail: 'expired' }, 401);
      }
      return json(
        { id: '1', sub: 'x', created_at: '2026-11-22T10:00:00Z' },
        201,
      );
    });
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetch,
      getAccessToken: () => token,
      refreshAccessToken: async () => {
        token = 'at-2';
        return token;
      },
    });

    await unwrap(client.api().POST('/admins', { body: { sub: 'x' } }));
    expect(bodies).toEqual([{ sub: 'x' }, { sub: 'x' }]);
  });

  it('repete no máximo 1x em 401 persistente e aciona onAuthFailure', async () => {
    const onAuthFailure = vi.fn();
    const refreshMock = vi.fn(async () => 'at-2');
    const adminFetch = adminFetchMock(async () =>
      json({ detail: 'Invalid token' }, 401),
    );

    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetch,
      getAccessToken: () => 'at-1',
      refreshAccessToken: refreshMock,
      onAuthFailure,
    });

    await expect(client.fetchMe()).rejects.toMatchObject({
      status: 401,
      code: 'unauthorized',
      message: 'Invalid token',
    });

    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(adminFetch).toHaveBeenCalledTimes(2);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('sem token nem refresh token, não chama a API e aciona onAuthFailure', async () => {
    const onAuthFailure = vi.fn();
    const adminFetch = adminFetchMock(async () => json(meBody));
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetch,
      getAccessToken: () => null,
      hasRefreshToken: () => false,
      refreshAccessToken: vi.fn(),
      onAuthFailure,
    });

    await expect(client.fetchMe()).rejects.toMatchObject({ status: 401 });
    expect(adminFetch).not.toHaveBeenCalled();
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('aciona onAuthFailure quando a renovação falha em 401', async () => {
    const onAuthFailure = vi.fn();
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(async () => json({ detail: 'Unauthorized' }, 401)),
      getAccessToken: () => 'at-1',
      refreshAccessToken: async () => {
        throw new ApiError({
          status: 400,
          code: 'invalid_grant',
          message: 'Sessão expirada.',
        });
      },
      onAuthFailure,
    });

    await expect(client.fetchMe()).rejects.toMatchObject({
      status: 400,
      code: 'invalid_grant',
    });
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
  });

  it('em 403 propaga ApiError e aciona onForbidden sem encerrar a sessão', async () => {
    const onAuthFailure = vi.fn();
    const onForbidden = vi.fn();
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(async () =>
        json({ detail: 'Not enough permissions' }, 403),
      ),
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
      onAuthFailure,
      onForbidden,
    });

    await expect(unwrap(client.api().GET('/admins'))).rejects.toMatchObject({
      status: 403,
      code: 'forbidden',
      message: 'Not enough permissions',
    });
    expect(onForbidden).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('em 409 devolve o detail do FastAPI como mensagem', async () => {
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(async () =>
        json({ detail: 'Admin with this sub already exists' }, 409),
      ),
      getAccessToken: () => 'at',
      refreshAccessToken: vi.fn(),
    });

    await expect(
      unwrap(client.api().POST('/admins', { body: { sub: 'dup' } })),
    ).rejects.toMatchObject({
      status: 409,
      code: 'http_error',
      message: 'Admin with this sub already exists',
    });
  });

  it('em 502 e 504 lança ApiError com mensagem clara sem encerrar sessão', async () => {
    const onAuthFailure = vi.fn();
    let nextResponse = new Response('<html>502 Bad Gateway</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });

    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(async () => nextResponse),
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
      onAuthFailure,
    });
    const trigger = () =>
      unwrap(client.api().POST('/etl/runs', { body: { force: false } }));

    await expect(trigger()).rejects.toMatchObject({
      status: 502,
      code: 'server_error',
      message: expect.stringContaining('ETL'),
    });

    nextResponse = new Response(null, { status: 504 });
    await expect(trigger()).rejects.toMatchObject({
      status: 504,
      code: 'server_error',
      message: expect.stringContaining('tempo esgotado'),
    });

    nextResponse = json({ detail: 'ETL service timed out' }, 504);
    await expect(trigger()).rejects.toMatchObject({
      status: 504,
      message: 'ETL service timed out',
    });

    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('normaliza 422 com detail em lista, falha de rede e preserva AbortError', async () => {
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(async () =>
        json(
          {
            detail: [
              { loc: ['body', 'sub'], msg: 'Field required', type: 'missing' },
            ],
          },
          422,
        ),
      ),
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
    });

    await expect(
      unwrap(client.api().POST('/admins', { body: { sub: '' } })),
    ).rejects.toMatchObject({
      status: 422,
      code: 'validation_error',
      details: [{ field: 'sub', message: 'Field required', type: 'missing' }],
    });

    const offline = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(async () => {
        throw new TypeError('Failed to fetch');
      }),
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
    });
    await expect(offline.fetchMe()).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
    });

    const abort = new DOMException('Aborted', 'AbortError');
    const abortClient = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(async () => {
        throw abort;
      }),
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
    });
    await expect(abortClient.fetchMe()).rejects.toBe(abort);
  });

  it('rejeita resposta 2xx que não é JSON (ex.: index.html no lugar da API)', async () => {
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: adminFetchMock(
        async () =>
          new Response('<html></html>', {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }),
      ),
      getAccessToken: () => 'at',
      refreshAccessToken: vi.fn(),
    });

    await expect(client.fetchMe()).rejects.toMatchObject({
      code: 'invalid_response',
    });
  });
});
