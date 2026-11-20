import { createRouter } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { routeTree } from '@/routeTree.gen';

export function createAppRouter(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: { queryClient },
    // VITE_BASE_PATH (ex.: /simcc/) chega aqui como BASE_URL.
    basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
    defaultPreload: 'intent',
    // O TanStack Query já guarda o cache; o loader do router não precisa de outro.
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
