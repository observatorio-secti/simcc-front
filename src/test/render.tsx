import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, type RenderOptions } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { routeTree } from '@/routeTree.gen';
import type { RouterContext } from '@/routes/__root';

/**
 * `QueryClient` de teste: sem nova tentativa (um erro aparece na hora) e sem
 * coleta de cache durante o teste. Um por teste, para não vazar cache.
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

export interface RenderRouteOptions {
  queryClient?: QueryClient;
  /** Sobrescreve partes do contexto do router (ex.: sessão, quando existir). */
  context?: Partial<RouterContext>;
}

/**
 * Renderiza uma rota real (o `routeTree` da app) num router em memória, com a
 * API simulada pelo MSW. Espera o carregamento da rota (loaders e chunks) antes
 * de renderizar; conteúdo que depende de query no componente aparece depois,
 * então use `findBy*`.
 *
 *     server.use(mockGet('/researcher/{researcher_id}', body));
 *     const { user, router } = await renderRoute('/pesquisadores/<id>');
 *     expect(await screen.findByRole('heading', { name: 'Maria Silva' }))
 *       .toBeInTheDocument();
 */
export async function renderRoute(
  path: string,
  { queryClient = createTestQueryClient(), context }: RenderRouteOptions = {},
) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient, ...context },
  });
  // Carregada antes, a rota não é carregada de novo quando o RouterProvider monta.
  await router.load();

  const user = userEvent.setup();
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...view, router, queryClient, user };
}

/**
 * Renderiza um componente solto com `QueryClientProvider`, para testar
 * componentes de entidade e hooks de query fora de uma rota.
 */
export function renderWithQueryClient(
  ui: ReactNode,
  {
    queryClient = createTestQueryClient(),
    ...options
  }: RenderOptions & { queryClient?: QueryClient } = {},
) {
  const user = userEvent.setup();
  const view = render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options,
  );
  return { ...view, queryClient, user };
}
