import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
  type AnyRoute,
} from '@tanstack/react-router';
import {
  render,
  type RenderOptions,
  type RenderResult,
} from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import type { RequestHandler } from 'msw';
import { routeTree as appRouteTree } from '@/routeTree.gen';
import { server } from './msw/server';

/** Cria um `QueryClient` de teste sem tentativas de retry em falhas. */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export interface RenderRouteOptions<
  TRouteTree extends AnyRoute = typeof appRouteTree,
> extends Omit<RenderOptions, 'wrapper'> {
  /** Sobrescritas de handlers MSW para este teste (resetadas no `afterEach`). */
  handlers?: RequestHandler[];
  /** Instância customizada do QueryClient; por padrão usa `createTestQueryClient()`. */
  queryClient?: QueryClient;
  /** Árvore de rotas alternativa; por padrão usa `routeTree` real da aplicação. */
  routeTree?: TRouteTree;
  /** Caminho base do router; por padrão segue `import.meta.env.BASE_URL`. */
  basepath?: string;
  /** Aguarda `router.load()` antes de montar a árvore (padrão `true`). */
  awaitLoad?: boolean;
}

export interface RenderRouteResult<
  TRouteTree extends AnyRoute = typeof appRouteTree,
> extends RenderResult {
  router: ReturnType<typeof createMemoryRouter<TRouteTree>>;
  queryClient: QueryClient;
  user: UserEvent;
}

function createMemoryRouter<TRouteTree extends AnyRoute>(
  initialUrl: string,
  queryClient: QueryClient,
  routeTree: TRouteTree,
  basepath: string,
) {
  return createRouter({
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [initialUrl] }),
    basepath,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
  });
}

/**
 * Monta a árvore do TanStack Router em memória (`createMemoryHistory`) com
 * `QueryClientProvider` sem retry e suporte a sobrescritas de MSW por teste.
 */
export async function renderRoute<
  TRouteTree extends AnyRoute = typeof appRouteTree,
>(
  initialUrl = '/',
  options: RenderRouteOptions<TRouteTree> = {},
): Promise<RenderRouteResult<TRouteTree>> {
  const {
    handlers,
    queryClient = createTestQueryClient(),
    routeTree = appRouteTree as TRouteTree,
    basepath = import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
    awaitLoad = true,
    ...renderOptions
  } = options;

  if (handlers?.length) {
    server.use(...handlers);
  }

  const router = createMemoryRouter(
    initialUrl,
    queryClient,
    routeTree,
    basepath,
  );

  if (awaitLoad) {
    await router.load();
  }

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
    renderOptions,
  );

  return {
    ...result,
    router,
    queryClient,
    user: userEvent.setup(),
  };
}
