import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { readStorage } from '@/shared/lib/storage';
import { PublicLayout } from './public-layout';
import { SIDEBAR_STORAGE_KEY } from './sidebar-storage';

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

function renderShellAt(initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <PublicLayout>
        <Outlet />
      </PublicLayout>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    staticData: { crumb: 'Página inicial' },
    component: () => <div>Conteúdo inicial</div>,
  });

  const searchRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/busca',
    staticData: { crumb: 'Pesquisar' },
    component: () => <div>Conteúdo de busca</div>,
  });

  const institutionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/instituicoes',
    staticData: { crumb: 'Instituições' },
    component: () => <div>Conteúdo de instituições</div>,
  });

  const institutionDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/instituicoes/$id',
    staticData: { crumb: 'Instituição' },
    component: () => <div>Conteúdo da instituição</div>,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      indexRoute,
      searchRoute,
      institutionsRoute,
      institutionDetailRoute,
    ]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  return render(<RouterProvider router={router} />);
}

function mockMatchMedia(matches: boolean) {
  const mediaQueryList = {
    matches,
    media: '(max-width: 767px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  } as unknown as MediaQueryList;

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQueryList),
  );
}

describe('PublicLayout e AppSidebar', () => {
  const originalLocalStorage = Object.getOwnPropertyDescriptor(
    window,
    'localStorage',
  );

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
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
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('alterna o colapso da sidebar no desktop e persiste via storage.ts', async () => {
    const user = userEvent.setup();
    const firstRender = renderShellAt('/');

    const sidebar = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-slot="sidebar"]');
      expect(el).not.toBeNull();
      return el!;
    });

    expect(sidebar).toHaveAttribute('data-state', 'expanded');
    expect(sidebar.className).toContain('w-[16rem]');

    await user.click(screen.getByRole('button', { name: 'Recolher menu' }));

    expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    expect(sidebar.className).toContain('w-[3rem]');
    expect(readStorage<boolean>(SIDEBAR_STORAGE_KEY, false)).toBe(true);

    // Simula nova montagem (recarregamento): restaura preferência salva.
    firstRender.unmount();
    renderShellAt('/');

    const restoredSidebar = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-slot="sidebar"]');
      expect(el).not.toBeNull();
      return el!;
    });
    expect(restoredSidebar).toHaveAttribute('data-state', 'collapsed');
    expect(restoredSidebar.className).toContain('w-[3rem]');

    await user.click(screen.getByRole('button', { name: 'Expandir menu' }));
    expect(restoredSidebar).toHaveAttribute('data-state', 'expanded');
    expect(readStorage<boolean>(SIDEBAR_STORAGE_KEY, true)).toBe(false);
  });

  it('destaca o item ativo incluindo subrotas usando isActive', async () => {
    renderShellAt('/instituicoes/ufba');

    const sidebar = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-slot="sidebar"]');
      expect(el).not.toBeNull();
      return el!;
    });

    const institutionsLink = within(sidebar).getByRole('link', {
      name: 'Instituições',
    });
    expect(institutionsLink).toHaveAttribute('aria-current', 'page');
    expect(institutionsLink.className).toContain('bg-eng-blue');

    const homeLink = within(sidebar).getByRole('link', {
      name: 'Página inicial',
    });
    expect(homeLink).not.toHaveAttribute('aria-current', 'page');
    expect(homeLink.className).not.toContain('bg-eng-blue');
  });

  it('recolhe e expande seções da plataforma', async () => {
    const user = userEvent.setup();
    renderShellAt('/');

    const sectionTrigger = await screen.findByRole('button', {
      name: 'Ferramentas',
    });
    expect(sectionTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: 'Listagens' })).toBeInTheDocument();

    await user.click(sectionTrigger);
    expect(sectionTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('link', { name: 'Listagens' }),
    ).not.toBeInTheDocument();
  });

  it('abre a sidebar em Sheet no mobile (< md)', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    renderShellAt('/');

    const trigger = await screen.findByRole('button', { name: 'Abrir menu' });
    await user.click(trigger);

    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getByRole('link', { name: 'Instituições' }),
    ).toBeInTheDocument();
  });

  it('contrai a sidebar ao clicar em um item do menu e expande ao voltar para a página inicial', async () => {
    const user = userEvent.setup();
    renderShellAt('/');

    const sidebar = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-slot="sidebar"]');
      expect(el).not.toBeNull();
      return el!;
    });

    expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // Clicar em "Página inicial" já estando em "/" mantém expandida.
    await user.click(
      within(sidebar).getByRole('link', { name: 'Página inicial' }),
    );
    expect(sidebar).toHaveAttribute('data-state', 'expanded');

    // Clicar em outro item do menu contrai a sidebar.
    await user.click(
      within(sidebar).getByRole('link', { name: 'Instituições' }),
    );
    await waitFor(() => {
      expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    });
    expect(readStorage<boolean>(SIDEBAR_STORAGE_KEY, false)).toBe(true);

    // Voltar para a página inicial pelo item do menu expande a sidebar.
    await user.click(
      within(sidebar).getByRole('link', { name: 'Página inicial' }),
    );
    await waitFor(() => {
      expect(sidebar).toHaveAttribute('data-state', 'expanded');
    });
    expect(readStorage<boolean>(SIDEBAR_STORAGE_KEY, true)).toBe(false);
  });

  it('expande a sidebar ao voltar para a página inicial por outro link (ex.: topbar)', async () => {
    const user = userEvent.setup();
    renderShellAt('/');

    const sidebar = await waitFor(() => {
      const el = document.querySelector<HTMLElement>('[data-slot="sidebar"]');
      expect(el).not.toBeNull();
      return el!;
    });

    await user.click(within(sidebar).getByRole('link', { name: 'Pesquisar' }));
    await waitFor(() => {
      expect(sidebar).toHaveAttribute('data-state', 'collapsed');
    });

    await user.click(
      screen.getByRole('link', { name: 'Página inicial do Simcc' }),
    );
    await waitFor(() => {
      expect(sidebar).toHaveAttribute('data-state', 'expanded');
    });
    expect(readStorage<boolean>(SIDEBAR_STORAGE_KEY, true)).toBe(false);
  });
});
