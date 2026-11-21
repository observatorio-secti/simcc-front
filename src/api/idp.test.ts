import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './errors';

vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');
vi.stubEnv('VITE_IDP_URL', 'https://idp.test/idp/');

const {
  PKCE_STORAGE_KEY,
  base64UrlEncode,
  clearPkceTransaction,
  consumePkceTransaction,
  createIdpClient,
  decodeOAuthState,
  encodeOAuthState,
  generatePkcePair,
  readJwtIdentity,
  readPkceTransaction,
  sanitizeReturnTo,
} = await import('./idp');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })),
  );
  const body = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  return `${header}.${body}.signature`;
}

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

const originalLocalStorage = Object.getOwnPropertyDescriptor(
  window,
  'localStorage',
);
const originalSessionStorage = Object.getOwnPropertyDescriptor(
  window,
  'sessionStorage',
);

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: createMemoryStorage(),
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  if (originalLocalStorage) {
    Object.defineProperty(window, 'localStorage', originalLocalStorage);
  }
  if (originalSessionStorage) {
    Object.defineProperty(window, 'sessionStorage', originalSessionStorage);
  }
});

describe('PKCE e state', () => {
  it('gera code_verifier e code_challenge S256 válidos', async () => {
    const { codeVerifier, codeChallenge } = await generatePkcePair();

    expect(codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(codeVerifier).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);

    const expectedDigest = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(codeVerifier),
    );
    expect(codeChallenge).toBe(base64UrlEncode(expectedDigest));
  });

  it('codifica e decodifica rota de destino no state com suporte a UTF-8', () => {
    const state = encodeOAuthState('/console/pesquisadores?q=educação');
    expect(decodeOAuthState(state)).toMatchObject({
      returnTo: '/console/pesquisadores?q=educa%C3%A7%C3%A3o',
    });
  });

  it('bloqueia open redirect e remove basepath ou rotas de callback', () => {
    expect(sanitizeReturnTo('https://evil.com/steal')).toBe('/');
    expect(sanitizeReturnTo('//evil.com/steal')).toBe('/');
    expect(sanitizeReturnTo('javascript:alert(1)')).toBe('/');
    expect(sanitizeReturnTo('/auth/callback?code=123')).toBe('/');
    expect(sanitizeReturnTo('/auth/sem-acesso?from=/console')).toBe('/');
    expect(sanitizeReturnTo('/simcc/console/etl?page=2', '/simcc/')).toBe(
      '/console/etl?page=2',
    );
  });

  it('ignora campo role do JWT ao ler identidade de fallback', () => {
    const jwt = createFakeJwt({
      sub: 'user-1',
      name: 'Maria Silva',
      email: 'maria@secti.ba.gov.br',
      role: 'ADMIN',
      aud: 'simcc',
    });

    const identity = readJwtIdentity(jwt);
    expect(identity).toEqual({
      sub: 'user-1',
      name: 'Maria Silva',
      email: 'maria@secti.ba.gov.br',
    });
    expect(identity).not.toHaveProperty('role');
  });
});

describe('createIdpClient', () => {
  it('trata ausência de VITE_IDP_URL sem quebrar o boot', async () => {
    const client = createIdpClient({ idpUrl: '' });
    expect(client.isConfigured()).toBe(false);
    await expect(client.prepareAuthorization()).rejects.toMatchObject({
      code: 'idp_not_configured',
    });
    expect(() => client.buildEndSessionUrl()).toThrow(ApiError);
  });

  it('monta URL de autorização com prompt=none, prompt=login, S256 e salva apenas PKCE efêmero em sessionStorage', async () => {
    const client = createIdpClient({
      idpUrl: 'https://observatorio.br/idp/',
      getOrigin: () => 'https://observatorio.br',
      getBaseUrl: () => '/simcc/',
    });

    const silent = await client.prepareAuthorization({
      prompt: 'none',
      returnTo: '/console/etl?page=3',
    });
    const silentUrl = new URL(silent.url);

    expect(silentUrl.origin + silentUrl.pathname).toBe(
      'https://observatorio.br/idp/authorize',
    );
    expect(silentUrl.searchParams.get('client_id')).toBe('simcc');
    expect(silentUrl.searchParams.get('redirect_uri')).toBe(
      'https://observatorio.br/simcc/auth/callback',
    );
    expect(silentUrl.searchParams.get('response_type')).toBe('code');
    expect(silentUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(silentUrl.searchParams.get('prompt')).toBe('none');
    expect(silentUrl.searchParams.get('state')).toBe(silent.state);

    const tx = readPkceTransaction();
    expect(tx).toMatchObject({
      state: silent.state,
      returnTo: '/console/etl?page=3',
      prompt: 'none',
    });
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.getItem(PKCE_STORAGE_KEY)).not.toBeNull();

    const relogin = await client.prepareAuthorization({
      prompt: 'login',
      returnTo: '/console',
    });
    expect(new URL(relogin.url).searchParams.get('prompt')).toBe('login');

    const consumed = consumePkceTransaction();
    expect(consumed?.state).toBe(relogin.state);
    expect(sessionStorage.getItem(PKCE_STORAGE_KEY)).toBeNull();
    clearPkceTransaction();
  });

  it('troca authorization code por tokens mantendo access e refresh token somente em memória', async () => {
    const fetchMock = vi.fn(async () =>
      json({
        access_token: 'access-1',
        refresh_token: 'refresh-1',
        expires_in: 900,
      }),
    );

    const client = createIdpClient({
      idpUrl: 'https://idp.test/idp/',
      fetch: fetchMock,
      getOrigin: () => 'https://app.test',
      getBaseUrl: () => '/',
    });

    await client.exchangeCodeForTokens({
      code: 'auth-code-123',
      codeVerifier: 'verifier-xyz',
    });

    expect(client.getAccessToken()).toBe('access-1');
    expect(client.hasRefreshToken()).toBe(true);

    // Tokens nunca podem estar em localStorage nem sessionStorage.
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toBe('https://idp.test/idp/token');
    expect(JSON.parse(String(init.body))).toEqual({
      grant_type: 'authorization_code',
      client_id: 'simcc',
      code: 'auth-code-123',
      redirect_uri: 'https://app.test/auth/callback',
      code_verifier: 'verifier-xyz',
    });
  });

  it('executa fila única concorrente de refresh e nunca reutiliza refresh token rotacionado', async () => {
    let refreshCalls = 0;
    const seenRefreshTokens: string[] = [];

    const fetchMock = vi.fn(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as Record<string, string>;
        if (body.grant_type === 'authorization_code') {
          return json({
            access_token: 'at-1',
            refresh_token: 'rt-1',
            expires_in: 900,
          });
        }

        refreshCalls += 1;
        seenRefreshTokens.push(body.refresh_token ?? '');

        if (body.refresh_token === 'rt-1') {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return json({
            access_token: 'at-2',
            refresh_token: 'rt-2',
            expires_in: 900,
          });
        }

        if (body.refresh_token === 'rt-2') {
          return json({
            access_token: 'at-3',
            refresh_token: 'rt-3',
            expires_in: 900,
          });
        }

        return json({ error: 'invalid_grant' }, 400);
      },
    );

    const client = createIdpClient({
      idpUrl: 'https://idp.test/idp/',
      fetch: fetchMock,
      getOrigin: () => 'https://app.test',
      getBaseUrl: () => '/',
    });

    await client.exchangeCodeForTokens({
      code: 'code-1',
      codeVerifier: 'ver-1',
    });

    // 5 chamadas concorrentes ao refresh devem resultar em apenas 1 POST /token.
    const results = await Promise.all([
      client.refreshAccessToken({ failedAccessToken: 'at-1' }),
      client.refreshAccessToken({ failedAccessToken: 'at-1' }),
      client.refreshAccessToken({ failedAccessToken: 'at-1' }),
      client.refreshAccessToken(),
      client.refreshAccessToken({ failedAccessToken: 'at-1' }),
    ]);

    expect(results).toEqual(['at-2', 'at-2', 'at-2', 'at-2', 'at-2']);
    expect(refreshCalls).toBe(1);
    expect(seenRefreshTokens).toEqual(['rt-1']);

    // Chamada tardia que ainda tinha `at-1` não refaz refresh nem consome `rt-2`.
    const lateResult = await client.refreshAccessToken({
      failedAccessToken: 'at-1',
    });
    expect(lateResult).toBe('at-2');
    expect(refreshCalls).toBe(1);

    // Próximo refresh com `at-2` usa o token rotacionado `rt-2` (nunca `rt-1`).
    const nextResult = await client.refreshAccessToken({
      failedAccessToken: 'at-2',
    });
    expect(nextResult).toBe('at-3');
    expect(refreshCalls).toBe(2);
    expect(seenRefreshTokens).toEqual(['rt-1', 'rt-2']);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it('limpa tokens em memória quando o refresh recebe 400 invalid_grant', async () => {
    const fetchMock = vi.fn(
      async (_url: RequestInfo | URL, init?: RequestInit) => {
        const body = JSON.parse(String(init?.body)) as Record<string, string>;
        if (body.grant_type === 'authorization_code') {
          return json({ access_token: 'at-1', refresh_token: 'rt-1' });
        }
        return json(
          {
            error: 'invalid_grant',
            error_description: 'Refresh token revogado.',
          },
          400,
        );
      },
    );

    const client = createIdpClient({
      idpUrl: 'https://idp.test/idp/',
      fetch: fetchMock,
      getOrigin: () => 'https://app.test',
      getBaseUrl: () => '/',
    });

    await client.exchangeCodeForTokens({ code: 'c', codeVerifier: 'v' });
    await expect(client.refreshAccessToken()).rejects.toMatchObject({
      status: 400,
      code: 'invalid_grant',
      message: 'Refresh token revogado.',
    });
    expect(client.getAccessToken()).toBeNull();
    expect(client.hasRefreshToken()).toBe(false);
  });

  it('monta URL de end_session com client_id=simcc e post_logout_redirect_uri', () => {
    const client = createIdpClient({
      idpUrl: 'https://observatorio.br/idp/',
      getOrigin: () => 'https://observatorio.br',
      getBaseUrl: () => '/simcc/',
    });

    const url = new URL(client.buildEndSessionUrl());
    expect(url.origin + url.pathname).toBe(
      'https://observatorio.br/idp/end_session',
    );
    expect(url.searchParams.get('client_id')).toBe('simcc');
    expect(url.searchParams.get('post_logout_redirect_uri')).toBe(
      'https://observatorio.br/simcc/',
    );
  });
});
