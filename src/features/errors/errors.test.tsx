import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import { ErrorPage } from './error-page';
import { NotFoundPage } from './not-found-page';

function createTestRouter(initialPath = '/rota-inexistente') {
  const rootRoute = createRootRoute({
    notFoundComponent: NotFoundPage,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Início</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
  return router;
}

describe('NotFoundPage e ErrorPage', () => {
  it('renderiza 404 definitiva com ações de voltar e página inicial', async () => {
    const router = createTestRouter('/nao-existe');
    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Voltar' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Página inicial' }),
    ).toHaveAttribute('href', '/');
  });

  it('renderiza ErrorPage com mensagem da API e botão Tentar novamente', async () => {
    const user = userEvent.setup();
    const reset = vi.fn();
    const error = new ApiError({
      status: 503,
      code: 'server_error',
      message: 'Serviço temporariamente indisponível.',
    });

    const rootRoute = createRootRoute({
      component: () => <ErrorPage error={error} reset={reset} />,
    });
    const indexRoute = createRoute({
      getParentRoute: () => rootRoute,
      path: '/',
      component: () => <div>Início</div>,
    });
    const router = createRouter({
      routeTree: rootRoute.addChildren([indexRoute]),
      history: createMemoryHistory({ initialEntries: ['/'] }),
    });

    render(<RouterProvider router={router} />);

    expect(
      await screen.findByRole('heading', { name: 'Algo deu errado' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Serviço temporariamente indisponível.'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
