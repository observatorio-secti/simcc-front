// Google Analytics 4 via gtag.js, carregado só quando há ID de medição.
// Sem ID, `createAnalytics` devolve um objeto no-op: nenhum script do Google
// entra no DOM e nenhum global (`dataLayer`, `gtag`) é criado.
//
// O `page_view` automático do gtag fica desligado (`send_page_view: false`):
// quem envia é o router, a cada navegação (ver src/app/analytics.ts).

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const GTAG_SCRIPT_ID = 'google-analytics-gtag';

export interface PageView {
  /** Caminho público (com o basepath), sem query string nem hash. */
  path: string;
  /** URL absoluta da página, sem query string nem hash. */
  location: string;
  title: string;
}

export interface Analytics {
  readonly enabled: boolean;
  pageView(page: PageView): void;
}

const disabledAnalytics: Analytics = {
  enabled: false,
  pageView: () => {},
};

export function createAnalytics(measurementId: string | undefined): Analytics {
  if (!measurementId || typeof window === 'undefined') return disabledAnalytics;

  const gtag = loadGtag(measurementId);

  return {
    enabled: true,
    pageView({ path, location, title }) {
      const page = {
        page_path: path,
        page_location: location,
        page_title: title,
      };
      // `set` faz os eventos automáticos seguintes (engajamento, rolagem…)
      // usarem a mesma página, e não a URL crua com query string.
      gtag('set', page);
      gtag('event', 'page_view', { ...page, send_to: measurementId });
    },
  };
}

/** Cria a fila do gtag e injeta o script uma única vez. */
function loadGtag(measurementId: string) {
  window.dataLayer ??= [];
  window.gtag ??= function gtag() {
    // O gtag.js só reconhece comandos empilhados como o objeto `arguments`.
    // eslint-disable-next-line prefer-rest-params
    (window.dataLayer ??= []).push(arguments);
  };
  const gtag = window.gtag;

  if (!document.getElementById(GTAG_SCRIPT_ID)) {
    gtag('js', new Date());
    gtag('config', measurementId, { send_page_view: false });

    const script = document.createElement('script');
    script.id = GTAG_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);
  }

  return gtag;
}
