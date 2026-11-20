import { afterEach, describe, expect, it } from 'vitest';
import { createAnalytics, GTAG_SCRIPT_ID } from './analytics';

const page = {
  path: '/simcc/pesquisadores',
  location: 'https://exemplo.br/simcc/pesquisadores',
  title: 'Pesquisadores',
};

/** Comandos empilhados no dataLayer, como arrays. */
function commands() {
  return (window.dataLayer ?? []).map((entry) =>
    Array.from(entry as ArrayLike<unknown>),
  );
}

function gtagScripts() {
  return document.querySelectorAll('script[src*="googletagmanager"]');
}

afterEach(() => {
  document.getElementById(GTAG_SCRIPT_ID)?.remove();
  delete window.dataLayer;
  delete window.gtag;
});

describe('createAnalytics com ID de medição', () => {
  it('injeta o script do gtag uma única vez', () => {
    createAnalytics('G-TESTE000');
    createAnalytics('G-TESTE000');

    const scripts = gtagScripts();
    expect(scripts).toHaveLength(1);
    expect(scripts[0]).toHaveAttribute(
      'src',
      'https://www.googletagmanager.com/gtag/js?id=G-TESTE000',
    );
    expect(commands().filter(([command]) => command === 'config')).toHaveLength(
      1,
    );
  });

  it('desliga o page_view automático do gtag', () => {
    createAnalytics('G-TESTE000');

    expect(commands()).toContainEqual([
      'config',
      'G-TESTE000',
      { send_page_view: false },
    ]);
  });

  it('envia um page_view por chamada, com caminho, URL e título', () => {
    const analytics = createAnalytics('G-TESTE000');
    analytics.pageView(page);
    analytics.pageView({
      ...page,
      path: '/simcc/',
      location: 'https://exemplo.br/simcc/',
    });

    const pageViews = commands().filter(
      ([command, name]) => command === 'event' && name === 'page_view',
    );
    expect(pageViews).toEqual([
      [
        'event',
        'page_view',
        {
          page_path: '/simcc/pesquisadores',
          page_location: 'https://exemplo.br/simcc/pesquisadores',
          page_title: 'Pesquisadores',
          send_to: 'G-TESTE000',
        },
      ],
      ['event', 'page_view', expect.objectContaining({ page_path: '/simcc/' })],
    ]);
  });
});

describe('createAnalytics sem ID de medição', () => {
  it.each([undefined, ''])('não carrega nada (%o)', (measurementId) => {
    const analytics = createAnalytics(measurementId);
    analytics.pageView(page);

    expect(analytics.enabled).toBe(false);
    expect(gtagScripts()).toHaveLength(0);
    expect(window.dataLayer).toBeUndefined();
    expect(window.gtag).toBeUndefined();
  });
});
