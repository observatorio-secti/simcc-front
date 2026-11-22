import { createRouter, type RouterHistory } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { type SessionStore, sessionStore } from '@/entities/session';
import { routeTree } from '@/routeTree.gen';
import type { Analytics } from '@/shared/lib/analytics';
import { getAppAnalytics, trackPageViews } from './analytics';

export function createAppRouter(
  queryClient: QueryClient,
  analytics: Analytics = getAppAnalytics(),
  session: SessionStore = sessionStore,
  history?: RouterHistory,
) {
  const router = createRouter({
    routeTree,
    context: { queryClient, session },
    history,
    // VITE_BASE_PATH (ex.: /simcc/) chega aqui como BASE_URL.
    basepath: import.meta.env.BASE_URL.replace(/\/$/, '') || '/',
    defaultPreload: 'intent',
    // O TanStack Query já guarda o cache; o loader do router não precisa de outro.
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
  });
  // A assinatura vive enquanto o router vive (o da app nunca é descartado).
  trackPageViews(router, analytics);
  return router;
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
}
