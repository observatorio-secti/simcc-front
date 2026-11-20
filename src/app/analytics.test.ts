import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Analytics } from '@/shared/lib/analytics';

// `env` é calculado ao importar o módulo.
vi.stubEnv('VITE_SIMCC_API_URL', 'http://localhost:8000/');
const { toPageView, trackPageViews } = await import('./analytics');

function createTestRouter(basepath: string, initialPath: string) {
  const rootRoute = createRootRoute();
  const routeTree = rootRoute.addChildren([
    createRoute({ getParentRoute: () => rootRoute, path: '/' }),
    createRoute({ getParentRoute: () => rootRoute, path: '/pesquisadores' }),
  ]);
  return createRouter({
    routeTree,
    basepath,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

function fakeAnalytics(enabled = true) {
  return { enabled, pageView: vi.fn() } satisfies Analytics;
}

describe('toPageView', () => {
  it('mantém o basepath e descarta query string e hash', () => {
    expect(
      toPageView('/simcc/pesquisadores?q=ana#topo', 'https://exemplo.br', 'T'),
    ).toEqual({
      path: '/simcc/pesquisadores',
      location: 'https://exemplo.br/simcc/pesquisadores',
      title: 'T',
    });
  });
});

describe('trackPageViews', () => {
  it('envia um page_view na primeira carga e a cada mudança de caminho', async () => {
    const router = createTestRouter('/simcc', '/simcc/');
    const analytics = fakeAnalytics();
    trackPageViews(router, analytics);

    await router.load();
    await router.navigate({ href: '/pesquisadores' });
    await router.navigate({ href: '/' });

    expect(analytics.pageView.mock.calls.map(([page]) => page.path)).toEqual([
      '/simcc/',
      '/simcc/pesquisadores',
      '/simcc/',
    ]);
  });

  it('ignora mudança só de search params e recarga da mesma rota', async () => {
    const router = createTestRouter('/', '/pesquisadores');
    const analytics = fakeAnalytics();
    trackPageViews(router, analytics);

    await router.load();
    await router.navigate({ href: '/pesquisadores?q=ana' });
    await router.invalidate();

    expect(analytics.pageView).toHaveBeenCalledTimes(1);
  });

  it('não assina o router quando o analytics está desligado', () => {
    const router = { subscribe: vi.fn() };
    trackPageViews(router, fakeAnalytics(false));

    expect(router.subscribe).not.toHaveBeenCalled();
  });
});
