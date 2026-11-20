import type { AnyRouter } from '@tanstack/react-router';
import { env } from '@/config/env';
import {
  createAnalytics,
  type Analytics,
  type PageView,
} from '@/shared/lib/analytics';

// Liga o GA4 ao router: um `page_view` por mudança de caminho, inclusive a
// primeira carga. Mudança só de search params (filtro, busca, página) não
// conta: com a URL como estado, contaria cada filtro como página (ADR 0009).

let appAnalytics: Analytics | undefined;

/** Instância única da app; sem `VITE_GA_MEASUREMENT_ID`, é no-op. */
export function getAppAnalytics() {
  appAnalytics ??= createAnalytics(env.gaMeasurementId);
  return appAnalytics;
}

/**
 * Monta o `page_view` a partir do href público do router (já com o
 * basepath), descartando query string e hash.
 */
export function toPageView(
  publicHref: string,
  origin: string,
  title: string,
): PageView {
  const url = new URL(publicHref, origin);
  return { path: url.pathname, location: url.origin + url.pathname, title };
}

/** Assina as navegações do router. Devolve a função que cancela a assinatura. */
export function trackPageViews(
  router: Pick<AnyRouter, 'subscribe'>,
  analytics: Analytics,
) {
  if (!analytics.enabled) return () => {};

  return router.subscribe('onResolved', (event) => {
    if (!event.pathChanged) return;
    analytics.pageView(
      toPageView(
        event.toLocation.publicHref,
        window.location.origin,
        document.title,
      ),
    );
  });
}
