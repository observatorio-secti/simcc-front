import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { SessionStore } from '@/features/auth';
import { NotFoundPage } from '@/features/errors/not-found-page';

/** Contexto disponível em `beforeLoad` e `loader` de toda rota. */
export interface RouterContext {
  queryClient: QueryClient;
  session: SessionStore;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
