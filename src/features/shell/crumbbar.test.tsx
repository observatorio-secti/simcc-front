import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Crumbbar } from './crumbbar';

function renderCrumbbarAt(initialPath: string) {
  const onToggleSidebar = vi.fn();

  const rootRoute = createRootRoute({
    component: () => (
      <div>
        <Crumbbar
          sidebarCollapsed={false}
          mobileOpen={false}
          isMobile={false}
          onToggleSidebar={onToggleSidebar}
        />
        <Outlet />
      </div>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    staticData: { crumb: 'Página inicial' },
    component: () => <div>Início</div>,
  });

  const institutionsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/instituicoes',
    staticData: { crumb: 'Instituições' },
    component: () => <Outlet />,
  });

  const institutionsIndexRoute = createRoute({
    getParentRoute: () => institutionsRoute,
    path: '/',
    component: () => <div>Lista</div>,
  });

  const institutionDetailRoute = createRoute({
    getParentRoute: () => institutionsRoute,
    path: '$id',
    staticData: { crumb: 'Detalhes da instituição' },
    component: () => <div>Detalhe</div>,
  });

  const routeTree = rootRoute.addChildren([
    indexRoute,
    institutionsRoute.addChildren([
      institutionsIndexRoute,
      institutionDetailRoute,
    ]),
  ]);

  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  render(<RouterProvider router={router} />);
  return { onToggleSidebar };
}

describe('Crumbbar', () => {
  it('renderiza o último segmento na raiz como texto com aria-current="page"', async () => {
    renderCrumbbarAt('/');

    const current = await screen.findByText('Página inicial');
    expect(current.tagName).toBe('SPAN');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', { name: 'Recolher menu' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('lê staticData.crumb das rotas ativas sem exibir o slug cru', async () => {
    renderCrumbbarAt('/instituicoes/ufba-slug-cru');

    await waitFor(() => {
      expect(screen.getByText('Detalhes da instituição')).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    const homeLink = screen.getByRole('link', { name: 'Página inicial' });
    expect(homeLink).toHaveAttribute('href', '/');

    const parentLink = screen.getByRole('link', { name: 'Instituições' });
    expect(parentLink).toHaveAttribute('href', '/instituicoes');

    expect(screen.queryByText(/ufba-slug-cru/i)).not.toBeInTheDocument();
  });
});
