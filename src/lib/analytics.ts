declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}

const measurementId = import.meta.env.VITE_MEASUREMENTID;
let previousLocation = '';
let pausedForAuth = false;

export function trackPageView(pathname: string) {
  if (typeof window === 'undefined' || !measurementId) return;

  const analytics = window;
  const disableKey = `ga-disable-${measurementId}` as const;

  if (/^\/auth\/callback\/?$/i.test(pathname)) {
    if (!analytics[disableKey]) {
      analytics[disableKey] = true;
      pausedForAuth = true;
    }
    previousLocation = '';
    return;
  }
  if (pausedForAuth) {
    delete analytics[disableKey];
    pausedForAuth = false;
  }
  if (analytics[disableKey]) return;

  const pageLocation = window.location.origin + window.location.pathname;
  if (pageLocation === previousLocation) return;

  const page = {
    page_location: pageLocation,
    page_referrer:
      previousLocation ||
      (document.referrer ? new URL(document.referrer).origin : ''),
    page_title: document.title,
  };
  analytics.dataLayer ??= [];
  const gtag = (analytics.gtag ??= function () {
    // eslint-disable-next-line prefer-rest-params -- Formato da fila do gtag.
    analytics.dataLayer?.push(arguments);
  });
  gtag('set', page);

  if (!document.getElementById('google-analytics-script')) {
    gtag('js', new Date());
    gtag('config', measurementId, { send_page_view: false });

    const script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.referrerPolicy = 'origin';
    script.src =
      'https://www.googletagmanager.com/gtag/js?id=' +
      encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  gtag('event', 'page_view', { ...page, send_to: measurementId });
  previousLocation = pageLocation;
}
