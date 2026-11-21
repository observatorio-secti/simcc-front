import { QueryClient } from '@tanstack/react-query';
import { createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_SIMCC_API_URL', 'https://api.test/simcc/api/');
vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.test/simcc/admin/');
vi.stubEnv('VITE_IDP_URL', 'https://api.test/idp/');

const { createAdminClient } = await import('@/api/admin');
const { createIdpClient } = await import('@/api/idp');
const { createSessionStore } = await import('@/features/auth');
const { createAppRouter } = await import('./router');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

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
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  if (originalLocalStorage) {
    Object.defineProperty(window, 'localStorage', originalLocalStorage);
  }
  if (originalSessionStorage) {
    Object.defineProperty(window, 'sessionStorage', originalSessionStorage);
  }
  vi.restoreAllMocks();
});

describe('rotas de autenticação na árvore real', () => {
  it('renderiza /auth/sem-acesso com cartão do Design Kit', async () => {
    const queryClient = new QueryClient();
    const idpClient = createIdpClient({ idpUrl: 'https://api.test/idp/' });
    const adminClient = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      getAccessToken: () => idpClient.getAccessToken(),
      refreshAccessToken: () => idpClient.refreshAccessToken(),
    });
    const session = createSessionStore({
      idp: idpClient,
      admin: adminClient,
      navigateExternal: vi.fn(),
    });

    const router = createAppRouter(
      queryClient,
      { enabled: false, pageView: vi.fn() },
      session,
      createMemoryHistory({
        initialEntries: ['/auth/sem-acesso?from=/console'],
      }),
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Sem acesso')).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /Trocar de conta/i }),
    ).toBeInTheDocument();
  });

  it('processa /auth/callback com code e state pela rota real e redireciona para a home', async () => {
    const queryClient = new QueryClient();
    const idpClient = createIdpClient({
      idpUrl: 'https://api.test/idp/',
      fetch: async () =>
        json({ access_token: 'at-1', refresh_token: 'rt-1', expires_in: 900 }),
      getOrigin: () => 'https://app.test',
      getBaseUrl: () => '/',
    });
    const adminClient = createAdminClient({
      baseUrl: 'https://api.test/simcc/admin/',
      fetch: async () =>
        json({
          user: { sub: 'u-1', name: 'Admin', email: 'a@ba.gov.br' },
          is_admin: true,
        }),
      getAccessToken: () => idpClient.getAccessToken(),
      refreshAccessToken: () => idpClient.refreshAccessToken(),
    });
    const session = createSessionStore({
      idp: idpClient,
      admin: adminClient,
      navigateExternal: vi.fn(),
    });

    const { state } = await idpClient.prepareAuthorization({ returnTo: '/' });
    const router = createAppRouter(
      queryClient,
      { enabled: false, pageView: vi.fn() },
      session,
      createMemoryHistory({
        initialEntries: [
          `/auth/callback?code=code-1&state=${encodeURIComponent(state)}`,
        ],
      }),
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    expect(session.getSnapshot().isAdmin).toBe(true);
  });

  it('renderiza erro em /auth/callback acessada sem parâmetros', async () => {
    const queryClient = new QueryClient();
    const session = createSessionStore({ navigateExternal: vi.fn() });
    const router = createAppRouter(
      queryClient,
      { enabled: false, pageView: vi.fn() },
      session,
      createMemoryHistory({ initialEntries: ['/auth/callback'] }),
    );

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível entrar')).toBeInTheDocument();
    });
  });
});
