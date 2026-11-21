import { StrictMode } from 'react';
import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  isRedirect,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';

vi.stubEnv('VITE_SIMCC_API_URL', 'https://api.test/simcc/api/');
vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.test/simcc/admin/');
vi.stubEnv('VITE_IDP_URL', 'https://api.test/idp/');

const { createAdminClient } = await import('@/api/admin');
const { base64UrlEncode, createIdpClient, readPkceTransaction } =
  await import('@/api/idp');
const {
  AccessDeniedPage,
  AuthCallbackPage,
  createSessionStore,
  requireAdmin,
  useSession,
} = await import('./index');

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
  return `${header}.${body}.sig`;
}

function createHarness({
  idpFetch,
  adminFetch,
  currentHref = '/',
}: {
  idpFetch: typeof globalThis.fetch;
  adminFetch: typeof globalThis.fetch;
  currentHref?: string;
}) {
  const navigateExternal = vi.fn();
  const idpClient = createIdpClient({
    idpUrl: 'https://api.test/idp/',
    fetch: idpFetch,
    getOrigin: () => 'https://app.test',
    getBaseUrl: () => '/',
  });
  const adminClient = createAdminClient({
    baseUrl: 'https://api.test/simcc/admin/',
    fetch: adminFetch,
    getAccessToken: () => idpClient.getAccessToken(),
    hasRefreshToken: () => idpClient.hasRefreshToken(),
    refreshAccessToken: (failed) =>
      idpClient.refreshAccessToken({ failedAccessToken: failed }),
  });
  const session = createSessionStore({
    idp: idpClient,
    admin: adminClient,
    navigateExternal,
    getCurrentHref: () => currentHref,
    getBaseUrl: () => '/',
  });

  return { idpClient, adminClient, session, navigateExternal };
}

function renderWithAuthRouter({
  initialEntry,
  session,
  strictMode = false,
}: {
  initialEntry: string;
  session: ReturnType<typeof createHarness>['session'];
  strictMode?: boolean;
}) {
  const rootRoute = createRootRouteWithContext<{
    session: typeof session;
  }>()({
    component: () => <Outlet />,
  });

  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Página inicial pública</div>,
  });

  const consoleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/console/etl',
    beforeLoad: requireAdmin,
    component: () => <div>Console ETL protegido</div>,
  });

  const callbackRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/callback',
    validateSearch: (search: Record<string, unknown>) => ({
      code: typeof search.code === 'string' ? search.code : undefined,
      state: typeof search.state === 'string' ? search.state : undefined,
      error: typeof search.error === 'string' ? search.error : undefined,
      error_description:
        typeof search.error_description === 'string'
          ? search.error_description
          : undefined,
    }),
    component: () => {
      const search = callbackRoute.useSearch();
      return (
        <AuthCallbackPage
          code={search.code}
          state={search.state}
          error={search.error}
          errorDescription={search.error_description}
          session={session}
        />
      );
    },
  });

  const accessDeniedRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth/sem-acesso',
    validateSearch: (search: Record<string, unknown>) => ({
      from: typeof search.from === 'string' ? search.from : undefined,
      reason:
        search.reason === 'idp_unconfigured'
          ? ('idp_unconfigured' as const)
          : undefined,
    }),
    component: () => {
      const search = accessDeniedRoute.useSearch();
      return (
        <AccessDeniedPage
          from={search.from}
          reason={search.reason}
          session={session}
        />
      );
    },
  });

  const routeTree = rootRoute.addChildren([
    homeRoute,
    consoleRoute,
    callbackRoute,
    accessDeniedRoute,
  ]);

  const router = createRouter({
    routeTree,
    context: { session },
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
  });

  const ui = strictMode ? (
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  ) : (
    <RouterProvider router={router} />
  );

  return { router, ...render(ui) };
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

describe('sessionStore e useSession', () => {
  it('ignora role=ADMIN do JWT e lê isAdmin exclusivamente de GET <admin>/me', async () => {
    const jwtWithAdminRole = createFakeJwt({
      sub: 'user-1',
      name: 'Usuário Comum',
      email: 'comum@ufba.br',
      role: 'ADMIN',
      aud: 'simcc',
    });

    const { idpClient, session } = createHarness({
      idpFetch: async () =>
        json({ access_token: jwtWithAdminRole, refresh_token: 'rt-1' }),
      adminFetch: async () =>
        json({
          user: {
            sub: 'user-1',
            name: 'Usuário Comum',
            email: 'comum@ufba.br',
          },
          is_admin: false,
        }),
    });

    const { url, state } = await idpClient.prepareAuthorization({
      returnTo: '/console',
    });
    expect(url).toContain('authorize');

    const outcome = await session.handleCallback({ code: 'c1', state });
    expect(outcome).toEqual({ kind: 'success', returnTo: '/console' });

    let hookValue: ReturnType<typeof useSession> | undefined;
    function Probe() {
      hookValue = useSession(session);
      return <span>{hookValue.isAdmin ? 'admin' : 'comum'}</span>;
    }

    render(<Probe />);
    expect(screen.getByText('comum')).toBeInTheDocument();
    expect(hookValue?.isAuthenticated).toBe(true);
    expect(hookValue?.isAdmin).toBe(false);
    expect(hookValue?.user?.sub).toBe('user-1');

    // Nenhum token em localStorage nem sessionStorage.
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it('concede isAdmin=true quando GET <admin>/me retorna is_admin=true mesmo com role=DEFAULT no JWT', async () => {
    const jwtWithDefaultRole = createFakeJwt({
      sub: 'admin-1',
      name: 'Admin Real',
      email: 'admin@secti.ba.gov.br',
      role: 'DEFAULT',
    });

    const { idpClient, session } = createHarness({
      idpFetch: async () =>
        json({ access_token: jwtWithDefaultRole, refresh_token: 'rt-1' }),
      adminFetch: async () =>
        json({
          user: {
            sub: 'admin-1',
            name: 'Admin Real',
            email: 'admin@secti.ba.gov.br',
          },
          is_admin: true,
        }),
    });

    const { state } = await idpClient.prepareAuthorization({ returnTo: '/' });
    await session.handleCallback({ code: 'c2', state });

    expect(session.getSnapshot()).toMatchObject({
      status: 'authenticated',
      isAdmin: true,
      user: { sub: 'admin-1', name: 'Admin Real' },
    });
  });

  it('trata 403 em /me como autenticado sem acesso usando identidade do JWT sem role', async () => {
    const jwt = createFakeJwt({
      sub: 'u-403',
      name: 'Visitante Logado',
      email: 'visitante@ba.gov.br',
      role: 'ADMIN',
    });

    const { idpClient, session } = createHarness({
      idpFetch: async () => json({ access_token: jwt, refresh_token: 'rt-1' }),
      adminFetch: async () => json({ detail: 'Forbidden' }, 403),
    });

    const { state } = await idpClient.prepareAuthorization({
      returnTo: '/console',
    });
    const outcome = await session.handleCallback({ code: 'c-403', state });

    expect(outcome).toEqual({ kind: 'success', returnTo: '/console' });
    expect(session.getSnapshot()).toMatchObject({
      status: 'authenticated',
      isAdmin: false,
      user: {
        sub: 'u-403',
        name: 'Visitante Logado',
        email: 'visitante@ba.gov.br',
      },
    });
  });

  it('mantém sessão em memória quando ação da API admin retorna 502/504 e retoma em 401 sem refresh', async () => {
    const { idpClient, adminClient, session, navigateExternal } = createHarness(
      {
        idpFetch: async (_url, init) => {
          const body = JSON.parse(String(init?.body)) as Record<string, string>;
          if (body.grant_type === 'authorization_code') {
            return json({ access_token: 'at-1', refresh_token: 'rt-1' });
          }
          return json({ error: 'invalid_grant' }, 400);
        },
        adminFetch: async (url) => {
          if (String(url).endsWith('/me')) {
            return json({
              user: { sub: 'a1', name: 'Admin', email: 'a@ba.gov.br' },
              is_admin: true,
            });
          }
          if (String(url).endsWith('/etl/runs')) {
            return json({ detail: 'ETL indisponível' }, 502);
          }
          return json({ detail: 'Expired' }, 401);
        },
        currentHref: '/console/etl?page=2',
      },
    );

    const { state } = await idpClient.prepareAuthorization({
      returnTo: '/console/etl?page=2',
    });
    await session.handleCallback({ code: 'c1', state });

    await expect(
      adminClient.request('/etl/runs', { method: 'POST' }),
    ).rejects.toMatchObject({ status: 502 });
    expect(session.getSnapshot().isAuthenticated).toBe(true);
    expect(session.hasTokensInMemory()).toBe(true);
    expect(navigateExternal).not.toHaveBeenCalled();

    // Agora uma chamada retorna 401 e o refresh falha (invalid_grant) -> retoma com prompt=none
    await expect(adminClient.request('/admins')).rejects.toBeInstanceOf(
      ApiError,
    );
    expect(session.getSnapshot().status).toBe('anonymous');
    expect(session.hasTokensInMemory()).toBe(false);
    await waitFor(() => {
      expect(navigateExternal).toHaveBeenCalledTimes(1);
    });
    const resumeUrl = new URL(navigateExternal.mock.calls[0]?.[0] as string);
    expect(resumeUrl.searchParams.get('prompt')).toBe('none');
  });

  it('logout limpa memória e redireciona para end_session com client_id=simcc', async () => {
    const { idpClient, session, navigateExternal } = createHarness({
      idpFetch: async () =>
        json({ access_token: 'at-1', refresh_token: 'rt-1' }),
      adminFetch: async () =>
        json({
          user: { sub: 'a1', name: 'Admin', email: 'a@ba.gov.br' },
          is_admin: true,
        }),
    });

    const { state } = await idpClient.prepareAuthorization({ returnTo: '/' });
    await session.handleCallback({ code: 'c1', state });

    const endUrl = session.logout();
    expect(session.getSnapshot().status).toBe('anonymous');
    expect(session.hasTokensInMemory()).toBe(false);
    expect(navigateExternal).toHaveBeenCalledWith(endUrl);

    const parsed = new URL(endUrl ?? '');
    expect(parsed.pathname).toBe('/idp/end_session');
    expect(parsed.searchParams.get('client_id')).toBe('simcc');
    expect(parsed.searchParams.get('post_logout_redirect_uri')).toBe(
      'https://app.test/',
    );
  });
});

describe('requireAdmin (beforeLoad)', () => {
  it('sem sessão em memória dispara prompt=none preservando rota e search no state', async () => {
    const { session } = createHarness({
      idpFetch: async () => json({}),
      adminFetch: async () => json({}),
    });

    const thrown = await requireAdmin({
      context: { session },
      location: { href: '/console/etl?page=2' },
    }).catch((err: unknown) => err);

    expect(isRedirect(thrown)).toBe(true);
    const redirectResponse = thrown as {
      options: { href?: string; reloadDocument?: boolean };
    };
    expect(redirectResponse.options.reloadDocument).toBe(true);

    const authUrl = new URL(redirectResponse.options.href ?? '');
    expect(authUrl.origin + authUrl.pathname).toBe(
      'https://api.test/idp/authorize',
    );
    expect(authUrl.searchParams.get('prompt')).toBe('none');
    expect(authUrl.searchParams.get('code_challenge_method')).toBe('S256');

    const stored = readPkceTransaction();
    expect(stored?.returnTo).toBe('/console/etl?page=2');
    expect(stored?.prompt).toBe('none');
    expect(authUrl.searchParams.get('state')).toBe(stored?.state);
  });

  it('usuário autenticado sem is_admin é redirecionado para /auth/sem-acesso', async () => {
    const { idpClient, session } = createHarness({
      idpFetch: async () =>
        json({ access_token: 'at-1', refresh_token: 'rt-1' }),
      adminFetch: async () =>
        json({
          user: { sub: 'u1', name: 'Comum', email: 'c@ba.gov.br' },
          is_admin: false,
        }),
    });

    const { state } = await idpClient.prepareAuthorization({ returnTo: '/' });
    await session.handleCallback({ code: 'c1', state });

    const { router } = renderWithAuthRouter({
      initialEntry: '/console/etl?page=2',
      session,
    });

    await waitFor(() => {
      expect(screen.getByText('Sem acesso')).toBeInTheDocument();
    });
    expect(router.state.location.pathname).toBe('/auth/sem-acesso');
    expect(screen.getByText(/Comum/)).toBeInTheDocument();
  });

  it('usuário autenticado com is_admin=true acessa a rota protegida', async () => {
    const { idpClient, session } = createHarness({
      idpFetch: async () =>
        json({ access_token: 'at-1', refresh_token: 'rt-1' }),
      adminFetch: async () =>
        json({
          user: { sub: 'a1', name: 'Admin', email: 'a@ba.gov.br' },
          is_admin: true,
        }),
    });

    const { state } = await idpClient.prepareAuthorization({ returnTo: '/' });
    await session.handleCallback({ code: 'c1', state });

    renderWithAuthRouter({
      initialEntry: '/console/etl?page=2',
      session,
    });

    await waitFor(() => {
      expect(screen.getByText('Console ETL protegido')).toBeInTheDocument();
    });
  });

  it('propaga erro 502 de /me quando há tokens em memória sem redirecionar nem derrubar sessão', async () => {
    const { idpClient, session } = createHarness({
      idpFetch: async () =>
        json({ access_token: 'at-1', refresh_token: 'rt-1' }),
      adminFetch: async () => json({ detail: 'Bad Gateway' }, 502),
    });

    await idpClient.exchangeCodeForTokens({ code: 'c1', codeVerifier: 'v1' });

    await expect(
      requireAdmin({
        context: { session },
        location: { href: '/console/etl' },
      }),
    ).rejects.toMatchObject({ status: 502 });
    expect(session.hasTokensInMemory()).toBe(true);
  });
});

describe('/auth/callback e tela Sem acesso', () => {
  it('troca code + state em /auth/callback, limpa PKCE do storage e navega para destino do state (mesmo em StrictMode)', async () => {
    const tokenRequests: string[] = [];
    const { idpClient, session } = createHarness({
      idpFetch: async (_url, init) => {
        tokenRequests.push(String(init?.body));
        return json({
          access_token: 'at-ok',
          refresh_token: 'rt-ok',
          expires_in: 900,
        });
      },
      adminFetch: async () =>
        json({
          user: { sub: 'a1', name: 'Admin', email: 'a@ba.gov.br' },
          is_admin: true,
        }),
    });

    const { state } = await idpClient.prepareAuthorization({
      prompt: 'none',
      returnTo: '/console/etl?page=4',
    });

    renderWithAuthRouter({
      initialEntry: `/auth/callback?code=code-123&state=${encodeURIComponent(state)}`,
      session,
      strictMode: true,
    });

    await waitFor(() => {
      expect(screen.getByText('Console ETL protegido')).toBeInTheDocument();
    });

    // StrictMode montou duas vezes, mas a troca do code ocorreu uma única vez.
    expect(tokenRequests).toHaveLength(1);
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
    expect(session.getSnapshot().isAdmin).toBe(true);
  });

  it('em error=login_required após prompt=none redireciona para login normal preservando destino no state', async () => {
    const { idpClient, session, navigateExternal } = createHarness({
      idpFetch: async () => json({}),
      adminFetch: async () => json({}),
    });

    const { state } = await idpClient.prepareAuthorization({
      prompt: 'none',
      returnTo: '/console/etl?page=7',
    });

    renderWithAuthRouter({
      initialEntry: `/auth/callback?error=login_required&state=${encodeURIComponent(state)}`,
      session,
      strictMode: true,
    });

    await waitFor(() => {
      expect(navigateExternal).toHaveBeenCalledTimes(1);
    });

    const nextAuthUrl = new URL(navigateExternal.mock.calls[0]?.[0] as string);
    expect(nextAuthUrl.pathname).toBe('/idp/authorize');
    expect(nextAuthUrl.searchParams.get('prompt')).toBeNull();
    const newTx = readPkceTransaction();
    expect(newTx?.returnTo).toBe('/console/etl?page=7');
    expect(newTx?.prompt).toBe('default');
  });

  it('exibe erro claro quando /auth/callback é acessado sem parâmetros ou com state inválido', async () => {
    const { idpClient, session } = createHarness({
      idpFetch: async () => json({}),
      adminFetch: async () => json({}),
    });

    await idpClient.prepareAuthorization({ returnTo: '/console' });

    const { unmount } = renderWithAuthRouter({
      initialEntry: '/auth/callback?code=c1&state=estado-forjado',
      session,
    });

    await waitFor(() => {
      expect(screen.getByText('Não foi possível entrar')).toBeInTheDocument();
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Falha na autenticação',
    );
    expect(window.sessionStorage.length).toBe(0);
    unmount();

    renderWithAuthRouter({
      initialEntry: '/auth/callback',
      session,
    });

    await waitFor(() => {
      expect(
        screen.getByText(/Nenhum código de autorização foi informado/),
      ).toBeInTheDocument();
    });
  });

  it('em /auth/callback com 502 em /me permite tentar novamente sem perder tokens', async () => {
    const user = userEvent.setup();
    let meCalls = 0;

    const { idpClient, session } = createHarness({
      idpFetch: async () =>
        json({ access_token: 'at-1', refresh_token: 'rt-1' }),
      adminFetch: async () => {
        meCalls += 1;
        if (meCalls === 1) {
          return new Response(null, { status: 502 });
        }
        return json({
          user: { sub: 'a1', name: 'Admin', email: 'a@ba.gov.br' },
          is_admin: true,
        });
      },
    });

    const { state } = await idpClient.prepareAuthorization({
      returnTo: '/console/etl',
    });

    renderWithAuthRouter({
      initialEntry: `/auth/callback?code=c-502&state=${encodeURIComponent(state)}`,
      session,
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /Tentar novamente/i }),
      ).toBeInTheDocument();
    });
    expect(session.hasTokensInMemory()).toBe(true);

    await user.click(screen.getByRole('button', { name: /Tentar novamente/i }));

    await waitFor(() => {
      expect(screen.getByText('Console ETL protegido')).toBeInTheDocument();
    });
  });

  it('tela Sem acesso permite trocar de conta (prompt=login) e sair', async () => {
    const user = userEvent.setup();
    const { idpClient, session, navigateExternal } = createHarness({
      idpFetch: async () =>
        json({ access_token: 'at-1', refresh_token: 'rt-1' }),
      adminFetch: async () =>
        json({
          user: {
            sub: 'u1',
            name: 'Pesquisador Sem Permissão',
            email: 'p@ba.gov.br',
          },
          is_admin: false,
        }),
    });

    const { state } = await idpClient.prepareAuthorization({ returnTo: '/' });
    await session.handleCallback({ code: 'c1', state });

    renderWithAuthRouter({
      initialEntry: '/auth/sem-acesso?from=%2Fconsole%2Fetl',
      session,
    });

    await waitFor(() => {
      expect(screen.getByText('Sem acesso')).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Pesquisador Sem Permissão \(p@ba\.gov\.br\)/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Trocar de conta/i }));
    await waitFor(() => {
      expect(navigateExternal).toHaveBeenCalledTimes(1);
    });
    const reloginUrl = new URL(navigateExternal.mock.calls[0]?.[0] as string);
    expect(reloginUrl.searchParams.get('prompt')).toBe('login');
    expect(readPkceTransaction()?.returnTo).toBe('/console/etl');

    await user.click(screen.getByRole('button', { name: /Sair/i }));
    expect(navigateExternal).toHaveBeenCalledTimes(2);
    expect(navigateExternal.mock.calls[1]?.[0]).toContain('/idp/end_session');
  });
});
