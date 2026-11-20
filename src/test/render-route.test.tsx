import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import {
  createRootRouteWithContext,
  createRoute,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { isApiError } from '@/api/errors';
import { simcc, unwrap } from '@/api/simcc';
import type { RouterContext } from '@/routes/__root';
import { openApiErrors, v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import { renderRoute } from './render-route';

describe('renderRoute', () => {
  it('monta a rota real "/" com o TanStack Router em memória', async () => {
    const { router } = await renderRoute('/');

    expect(router.state.location.pathname).toBe('/');
    expect(
      screen.getByRole('heading', {
        name: /o simcc está sendo reconstruído/i,
      }),
    ).toBeInTheDocument();
  });

  it('renderiza a página 404 em rota inexistente e navega de volta para "/"', async () => {
    const { router, user } = await renderRoute('/rota-que-nao-existe');

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /página não encontrada/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: /voltar ao início/i }));

    expect(router.state.location.pathname).toBe('/');
    expect(
      await screen.findByRole('heading', {
        name: /o simcc está sendo reconstruído/i,
      }),
    ).toBeInTheDocument();
  });

  it('carrega a rota preguiçosa "/dev/vitrine" em ambiente de desenvolvimento', async () => {
    await renderRoute('/dev/vitrine');

    expect(
      await screen.findByRole('heading', { name: /vitrine do kit/i }),
    ).toBeInTheDocument();
  });
});

// Exemplo completo do fluxo da arquitetura: URL (zod) -> loader (ensureQueryData)
// -> API v2 (simcc + unwrap) -> MSW -> componente com useSuspenseQuery.
const searchSchema = z.object({
  q: z.string().optional(),
});

const researcherListQuery = (q?: string) =>
  queryOptions({
    queryKey: ['example', 'researcher', { q }],
    queryFn: ({ signal }) =>
      unwrap(
        simcc.GET('/researcher', {
          params: { query: q ? { q } : undefined },
          signal,
        }),
      ),
  });

function createExampleRouteTree() {
  const root = createRootRouteWithContext<RouterContext>()({
    component: () => <Outlet />,
  });

  const researchersRoute = createRoute({
    getParentRoute: () => root,
    path: '/pesquisadores',
    validateSearch: searchSchema,
    loaderDeps: ({ search }) => ({ q: search.q }),
    loader: ({ context, deps }) =>
      context.queryClient.ensureQueryData(researcherListQuery(deps.q)),
    errorComponent: ({ error }) => (
      <div role="alert">
        {isApiError(error) ? `${error.status}: ${error.message}` : 'Erro'}
      </div>
    ),
    component: ResearchersExampleScreen,
  });

  function ResearchersExampleScreen() {
    const { q } = researchersRoute.useSearch();
    const router = useRouter();
    const { data } = useSuspenseQuery(researcherListQuery(q));

    return (
      <main>
        <h1>Pesquisadores</h1>
        {q ? <p>Filtro: {q}</p> : null}
        <ul>
          {data.data.map((researcher) => (
            <li key={researcher.id}>{researcher.name}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() =>
            void router.navigate({ href: '/pesquisadores?q=solos' })
          }
        >
          Filtrar por solos
        </button>
      </main>
    );
  }

  return root.addChildren([researchersRoute]);
}

describe('renderRoute + MSW (fluxo completo de tela)', () => {
  it('carrega dados do loader via MSW padrão e atualiza a URL ao interagir', async () => {
    const routeTree = createExampleRouteTree();
    const { router, user } = await renderRoute('/pesquisadores', {
      routeTree,
    });

    expect(
      screen.getByRole('heading', { name: 'Pesquisadores' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Maria Silva')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /filtrar por solos/i }),
    );

    expect(router.state.location.search).toEqual({ q: 'solos' });
    expect(await screen.findByText('Filtro: solos')).toBeInTheDocument();
  });

  it('permite sobrescrever handlers MSW por teste via opção `handlers`', async () => {
    const routeTree = createExampleRouteTree();
    const base = v2Fixtures['/researcher'];
    const first = base.data[0];
    if (!first) throw new Error('Fixture de pesquisador ausente');

    await renderRoute('/pesquisadores?q=bahia', {
      routeTree,
      handlers: [
        http.get(simccV2Url('/researcher'), () =>
          HttpResponse.json({
            ...base,
            data: [{ ...first, id: 'custom-1', name: 'João Pereira Costa' }],
          }),
        ),
      ],
    });

    expect(screen.getByText('Filtro: bahia')).toBeInTheDocument();
    expect(screen.getByText('João Pereira Costa')).toBeInTheDocument();
  });

  it('falha imediatamente sem retry quando a API responde erro 500', async () => {
    const routeTree = createExampleRouteTree();
    const handler = vi.fn(() =>
      HttpResponse.json(
        {
          ...openApiErrors.notFound,
          error: {
            code: 'server_error',
            message: 'Falha interna simulada.',
            details: [],
          },
        },
        { status: 500 },
      ),
    );

    await renderRoute('/pesquisadores', {
      routeTree,
      handlers: [http.get(simccV2Url('/researcher'), handler)],
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('alert')).toHaveTextContent(
      '500: Falha interna simulada.',
    );
  });
});
