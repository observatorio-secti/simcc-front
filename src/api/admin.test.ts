import { describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';

vi.stubEnv('VITE_SIMCC_API_URL', 'https://api.test/simcc/api/');
vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.test/simcc/admin/');
vi.stubEnv('VITE_IDP_URL', 'https://api.test/idp/');

const { createAdminClient, isAdminApiConfigured, resolveAdminUrl } =
  await import('./admin');
const { createIdpClient } = await import('./idp');
const { createSimccClient } = await import('./simcc');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('resolveAdminUrl e isolamento de token', () => {
  it('preserva subcaminho da adminApiUrl e aceita barra inicial relativa', () => {
    expect(resolveAdminUrl('https://observatorio.br/simcc/admin/', '/me')).toBe(
      'https://observatorio.br/simcc/admin/me',
    );
    expect(
      resolveAdminUrl('https://observatorio.br/simcc/admin', 'etl/runs'),
    ).toBe('https://observatorio.br/simcc/admin/etl/runs');
  });

  it('recusa enviar token para outro domínio, outro prefixo ou path traversal', async () => {
    const fetchMock = vi.fn(async () => json({ ok: true }));
    const client = createAdminClient({
      baseUrl: 'https://observatorio.br/simcc/admin/',
      fetch: fetchMock,
      getAccessToken: () => 'secret-token',
      refreshAccessToken: vi.fn(),
    });

    for (const badPath of [
      'https://evil.com/me',
      '//evil.com/me',
      'https://observatorio.br/simcc/api/v2/researcher',
      'https://observatorio.br/simcc/admin-evil/me',
      '../api/v2/researcher',
    ]) {
      await expect(client.request(badPath)).rejects.toBeInstanceOf(ApiError);
    }

    expect(fetchMock).not.toHaveBeenCalled();
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
    const client = createAdminClient({
      baseUrl: '',
      getAccessToken: () => 'token',
      refreshAccessToken: vi.fn(),
    });
    expect(client.isConfigured()).toBe(false);
    await expect(client.fetchMe()).rejects.toMatchObject({
      code: 'admin_api_not_configured',
    });
  });
});

describe('createAdminClient — /me, 401, 403 e 502/504', () => {
  it('envia Bearer token para GET <admin>/me e valida resposta', async () => {
    const fetchMock = vi.fn(async () =>
      json({
        user: {
          sub: 'sub-1',
          name: 'Ana Admin',
          email: 'ana@secti.ba.gov.br',
        },
        is_admin: true,
      }),
    );

    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: fetchMock,
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
    });

    const me = await client.fetchMe();
    expect(me).toEqual({
      user: {
        sub: 'sub-1',
        name: 'Ana Admin',
        email: 'ana@secti.ba.gov.br',
      },
      is_admin: true,
    });

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://api.test/simcc/admin/me');
    expect(new Headers(init.headers).get('Authorization')).toBe(
      'Bearer at-valid',
    );
  });

  it('em 401 concorrente renova uma única vez via fila e repete cada requisição 1x', async () => {
    let accessToken = 'at-expired';
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
          accessToken = 'at-fresh';
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

    const adminFetch = vi.fn(
      async (url: RequestInfo | URL, init?: RequestInit) => {
        const auth = new Headers(init?.headers).get('Authorization');
        if (String(url).endsWith('/etl/runs')) {
          etlCalls += 1;
          if (auth === 'Bearer at-expired') {
            return json({ detail: 'Token expired' }, 401);
          }
          if (auth === 'Bearer at-fresh') {
            return json({ runs: [] });
          }
        }
        if (String(url).endsWith('/admins')) {
          adminsCalls += 1;
          if (auth === 'Bearer at-expired') {
            return json({ detail: 'Token expired' }, 401);
          }
          if (auth === 'Bearer at-fresh') {
            return json({ items: [] });
          }
        }
        return json({ detail: 'Unexpected' }, 500);
      },
    );

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
      adminClient.request<{ runs: unknown[] }>('/etl/runs'),
      adminClient.request<{ items: unknown[] }>('/admins'),
    ]);

    expect(runs).toEqual({ runs: [] });
    expect(admins).toEqual({ items: [] });
    expect(accessToken).toBe('at-fresh');
    // 1 exchange + 1 refresh apenas para as duas falhas 401 simultâneas
    expect(idpFetch).toHaveBeenCalledTimes(2);
    expect(etlCalls).toBe(2);
    expect(adminsCalls).toBe(2);
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('repete no máximo 1x em 401 persistente e aciona onAuthFailure', async () => {
    const onAuthFailure = vi.fn();
    const refreshMock = vi.fn(async () => 'at-2');
    const adminFetch = vi.fn(async () =>
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

  it('aciona onAuthFailure quando a renovação falha em 401', async () => {
    const onAuthFailure = vi.fn();
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: async () => json({ detail: 'Unauthorized' }, 401),
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

  it('em 403 propaga ApiError de acesso negado sem encerrar sessão', async () => {
    const onAuthFailure = vi.fn();
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: async () =>
        json({ detail: 'Usuário sem permissão de admin.' }, 403),
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
      onAuthFailure,
    });

    await expect(client.fetchMe()).rejects.toMatchObject({
      status: 403,
      code: 'forbidden',
      message: 'Usuário sem permissão de admin.',
    });
    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('em 502 e 504 lança ApiError com mensagem clara sem encerrar sessão', async () => {
    const onAuthFailure = vi.fn();
    let nextResponse = new Response('<html>502 Bad Gateway</html>', {
      status: 502,
      headers: { 'Content-Type': 'text/html' },
    });

    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: async () => nextResponse,
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
      onAuthFailure,
    });

    await expect(
      client.request('/etl/runs', { method: 'POST' }),
    ).rejects.toMatchObject({
      status: 502,
      code: 'server_error',
      message: expect.stringContaining('ETL'),
    });

    nextResponse = new Response(null, { status: 504 });
    await expect(
      client.request('/etl/runs', { method: 'POST' }),
    ).rejects.toMatchObject({
      status: 504,
      code: 'server_error',
      message: expect.stringContaining('tempo esgotado'),
    });

    nextResponse = json({ detail: 'Timeout ao aguardar serviço ETL.' }, 504);
    await expect(
      client.request('/etl/runs', { method: 'POST' }),
    ).rejects.toMatchObject({
      status: 504,
      message: 'Timeout ao aguardar serviço ETL.',
    });

    expect(onAuthFailure).not.toHaveBeenCalled();
  });

  it('normaliza 422 com detail em lista do FastAPI e preserva AbortError', async () => {
    const client = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: async () =>
        json(
          {
            detail: [
              {
                loc: ['body', 'sub'],
                msg: 'Field required',
                type: 'missing',
              },
            ],
          },
          422,
        ),
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
    });

    await expect(
      client.request('/admins', { method: 'POST' }),
    ).rejects.toMatchObject({
      status: 422,
      code: 'validation_error',
      details: [{ field: 'sub', message: 'Field required', type: 'missing' }],
    });

    const abort = new DOMException('Aborted', 'AbortError');
    const abortClient = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: async () => {
        throw abort;
      },
      getAccessToken: () => 'at-valid',
      refreshAccessToken: vi.fn(),
    });
    await expect(abortClient.fetchMe()).rejects.toBe(abort);
  });
});
