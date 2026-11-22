import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import type { SessionStore } from '@/entities/session';
import { ErrorPage } from '@/features/errors/error-page';
import { NotFoundPage } from '@/features/errors/not-found-page';
import { Toaster } from '@/shared/ui/sonner';

/** Contexto disponível em `beforeLoad` e `loader` de toda rota. */
export interface RouterContext {
  queryClient: QueryClient;
  session: SessionStore;
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    crumb?: string;
  }
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  errorComponent: ErrorPage,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
