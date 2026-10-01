// Utilitário de rastreamento Google Analytics 4 (GA4) nativo via gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_MEASUREMENTID || '';

export function initGA() {
  if (typeof window === 'undefined' || !MEASUREMENT_ID) return;

  // Se já foi injetado o script, não injeta novamente
  if (document.getElementById('google-analytics-script')) return;

  const script = document.createElement('script');
  script.id = 'google-analytics-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID);
}

export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_location: url,
      page_title: title || document.title,
    });
  }
}
