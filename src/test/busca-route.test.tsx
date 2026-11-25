import { waitFor, within } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import { v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import { renderRoute } from './render-route';

const researcher = v2Fixtures['/researcher'].data[0]!;
const article = v2Fixtures['/production/article'].data[0]!;
const facetItem = v2Fixtures['/researcher'].facets!.institution!.items[0]!;

/** Registra as chamadas a uma listagem da v2 e responde com a fixture. */
function captureList(path: '/researcher' | '/production/article') {
  const calls: URLSearchParams[] = [];
  const handler = http.get(simccV2Url(path), ({ request }) => {
    calls.push(new URL(request.url).searchParams);
    return HttpResponse.json(v2Fixtures[path]);
  });
  return { calls, handler };
}

const territoryGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: '2913606',
        name: 'Ilhéus',
        territorio_id: '5',
        territorio_identidade: 'LITORAL SUL',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-39.1, -14.8],
            [-39.0, -14.8],
            [-39.0, -14.7],
            [-39.1, -14.7],
            [-39.1, -14.8],
          ],
        ],
      },
    },
  ],
};

/** `/researcher` com a faceta `territory_city` quando a query pede o mapa. */
function captureResearchersWithMap() {
  const calls: URLSearchParams[] = [];
  const page2Researcher = {
    ...researcher,
    id: 'res-page-2',
    name: 'Marina Costa Oliveira',
  };
  const handler = http.get(simccV2Url('/researcher'), ({ request }) => {
    const params = new URL(request.url).searchParams;
    calls.push(params);
    const fixture = v2Fixtures['/researcher'];
    if (
      params.getAll('identity_territory').includes('5') &&
      params.get('per_page') === '6'
    ) {
      const page = Number(params.get('page') ?? '1');
      return HttpResponse.json({
        ...fixture,
        data: page === 2 ? [page2Researcher] : [researcher],
        pagination: {
          page,
          per_page: 6,
          total_items: 7,
          total_pages: 2,
          has_next: page < 2,
          has_prev: page > 1,
        },
      });
    }
    if (!params.getAll('facets').includes('territory_city')) {
      return HttpResponse.json(fixture);
    }
    return HttpResponse.json({
      ...fixture,
      facets: {
        territory_city: {
          param: ['identity_territory', 'city_code'],
          total: 2,
          covered: 5,
          items: [
            {
              value: '5',
              code: 5,
              label: 'LITORAL SUL',
              count: 4,
              selected: params.getAll('identity_territory').includes('5'),
              children: [
                {
                  value: '2913606',
                  code: 2913606,
                  label: 'Ilhéus',
                  count: 4,
                  selected: false,
                },
              ],
            },
            {
              value: null,
              code: null,
              label: 'Sem território',
              count: 1,
              selected: false,
            },
          ],
        },
      },
    });
  });
  return { calls, handler };
}

describe('Rota /busca (T2)', () => {
  it('busca pesquisadores com termo, KPIs, ranking e parâmetros da v2', async () => {
    const researchers = captureList('/researcher');
    const { findByText, findAllByRole, getByText } = await renderRoute(
      '/busca?q=solos',
      { handlers: [researchers.handler] },
    );

    expect(await findByText('Total de pesquisadores')).toBeInTheDocument();
    expect(getByText('em todo o perfil de')).toBeInTheDocument();
    expect(
      await findByText('Pesquisadores com mais ocorrências'),
    ).toBeInTheDocument();
    const cards = await findAllByRole('link', {
      name: new RegExp(researcher.name),
    });
    expect(cards.length).toBeGreaterThan(0);

    const params = researchers.calls.at(-1)!;
    expect(params.get('q')).toBe('solos');
    expect(params.get('year_start')).toBe(String(getDefaultYearStart()));
    expect(params.has('year_end')).toBe(false);
    expect(params.get('sort_by')).toBe('matches');
    expect(params.getAll('include')).toEqual(['matches']);
    expect(params.getAll('facets')).toContain('source_type');
    expect(params.has('source_type')).toBe(false);
  }, 15000);

  it('troca de aba para as produções do tipo de busca', async () => {
    const articles = captureList('/production/article');
    const { container, findByRole, findByText, router, user } =
      await renderRoute('/busca?q=solos&type=article', {
        handlers: [articles.handler],
      });

    const tablist = await findByRole('tablist', { name: 'Visão do resultado' });
    const tabs = within(tablist).getAllByRole('tab');
    expect(tabs.map((tab) => tab.textContent)).toEqual([
      'Pesquisadores',
      'Artigos',
    ]);

    await user.click(within(tablist).getByRole('tab', { name: 'Artigos' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        q: 'solos',
        type: 'article',
        tab: 'articles',
      });
    });
    expect(await findByText('Total de artigos')).toBeInTheDocument();
    expect(await findByText('Ano com mais produções')).toBeInTheDocument();
    const card = await waitFor(() => {
      const element = container.querySelector('[data-slot="production-card"]');
      expect(element).not.toBeNull();
      return element as HTMLElement;
    });
    expect(card).toHaveAttribute('data-kind', 'article');
    expect(card.textContent?.toLowerCase()).toContain(
      article.title.toLowerCase(),
    );
    expect(articles.calls.at(-1)!.get('q')).toBe('solos');
    expect(articles.calls.at(-1)!.get('year_start')).toBe(
      String(getDefaultYearStart()),
    );
  }, 15000);

  it('mostra o gráfico por ano da aba de produção e filtra pelo Qualis clicado', async () => {
    const metricCalls: URLSearchParams[] = [];
    const metricSpy = http.get(
      simccV2Url('/metrics/production/{kind}'),
      ({ request }) => {
        metricCalls.push(new URL(request.url).searchParams);
        return undefined;
      },
    );
    const { findByRole, router, user } = await renderRoute(
      '/busca?q=solos&type=article&tab=articles',
      { handlers: [metricSpy] },
    );

    expect(
      await findByRole('heading', { name: 'Artigos por ano e Qualis' }),
    ).toBeInTheDocument();
    expect(metricCalls.at(-1)!.get('group_by')).toBe('qualis');
    expect(metricCalls.at(-1)!.get('q')).toBe('solos');
    expect(metricCalls.at(-1)!.get('year_start')).toBe(
      String(getDefaultYearStart()),
    );

    await user.click(await findByRole('button', { name: 'Qualis A1' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ qualis: ['A1'] });
    });
  }, 15000);

  it('divide o gráfico de patentes em concedidas e depositadas', async () => {
    const metricCalls: URLSearchParams[] = [];
    const metricSpy = http.get(
      simccV2Url('/metrics/production/{kind}'),
      ({ request }) => {
        metricCalls.push(new URL(request.url).searchParams);
        return undefined;
      },
    );
    const { findByRole } = await renderRoute(
      '/busca?q=solos&type=patent&tab=patents',
      { handlers: [metricSpy] },
    );

    expect(
      await findByRole('heading', {
        name: 'Patentes por ano: concedidas e depositadas',
      }),
    ).toBeInTheDocument();
    expect(
      await findByRole('img', {
        name: 'Patentes por ano: concedidas e depositadas',
      }),
    ).toBeInTheDocument();
    const granted = metricCalls
      .filter((params) => params.get('q') === 'solos')
      .map((params) => params.get('granted'));
    expect(granted).toEqual(expect.arrayContaining(['true', 'false']));
  }, 15000);

  it('filtra por faceta usando o param da v2 e volta à página 1', async () => {
    const researchers = captureList('/researcher');
    const { findAllByRole, router, user } = await renderRoute(
      '/busca?q=solos&page=3',
      { handlers: [researchers.handler] },
    );

    const [checkbox] = await findAllByRole('checkbox', {
      name: new RegExp(facetItem.label),
    });
    await user.click(checkbox!);

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        institution_id: [facetItem.value],
      });
    });
    expect(router.state.location.search).not.toHaveProperty('page');
    await waitFor(() => {
      expect(researchers.calls.at(-1)!.getAll('institution_id')).toEqual([
        facetItem.value,
      ]);
    });
  }, 15000);

  it.each([
    ['name', 'name', 'com o nome contendo'],
    ['abstract', 'abstract', 'com o resumo contendo'],
  ] as const)(
    'busca do tipo %s envia search_in=%s a /v2/researcher',
    async (type, searchIn, caption) => {
      const researchers = captureList('/researcher');
      const { findByText } = await renderRoute(`/busca?q=silva&type=${type}`, {
        handlers: [researchers.handler],
      });

      expect(await findByText('Total de pesquisadores')).toBeInTheDocument();
      expect(await findByText(caption)).toBeInTheDocument();
      await waitFor(() => {
        expect(researchers.calls.length).toBeGreaterThan(0);
      });
      for (const params of researchers.calls) {
        expect(params.get('q')).toBe('silva');
        expect(params.get('search_in')).toBe(searchIn);
        expect(params.has('source_type')).toBe(false);
      }
      expect(researchers.calls.at(-1)!.getAll('facets')).not.toContain(
        'source_type',
      );
    },
    15000,
  );

  it('sem termo lista o catálogo da aba, ordenado por nome', async () => {
    const researchers = captureList('/researcher');
    const { findByText, queryByText } = await renderRoute('/busca', {
      handlers: [researchers.handler],
    });

    expect(await findByText('cadastrados na plataforma')).toBeInTheDocument();
    expect(
      queryByText('Pesquisadores com mais ocorrências'),
    ).not.toBeInTheDocument();
    const params = researchers.calls.at(-1)!;
    expect(params.has('q')).toBe(false);
    expect(params.get('sort_by')).toBe('name');
    expect(params.has('include')).toBe(false);
  }, 15000);

  it('abre o pesquisador como overlay mascarado e fecha ao voltar', async () => {
    const { container, findByRole, getByText, queryByRole, router, user } =
      await renderRoute('/busca?q=solos');

    const card = await waitFor(() => {
      const element = container.querySelector<HTMLAnchorElement>(
        '[data-slot="person-card"]',
      );
      expect(element).not.toBeNull();
      return element!;
    });
    await user.click(card);

    const dialog = await findByRole('dialog');
    expect(
      await within(dialog).findByRole('heading', { name: researcher.name }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).toMatchObject({
      q: 'solos',
      researcher: researcher.id,
    });
    expect(router.state.location.maskedLocation?.pathname).toBe(
      `/pesquisadores/${researcher.id}`,
    );
    // A lista continua montada por baixo do overlay.
    expect(getByText('Total de pesquisadores')).toBeInTheDocument();

    // Estado do perfil fica na URL (lista e máscara) e não cria entrada nova.
    await user.click(
      await within(dialog).findByRole('tab', { name: /Trajetória/i }),
    );
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        profile: 'tab=trajectory',
      });
    });
    expect(router.state.location.maskedLocation?.search).toMatchObject({
      tab: 'trajectory',
      q: 'solos',
    });

    router.history.back();
    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(router.state.location.search).not.toHaveProperty('researcher');
    expect(router.state.location.maskedLocation).toBeUndefined();
  }, 20000);

  it('o botão fechar do overlay volta para a lista', async () => {
    const { findByRole, queryByRole, router, user } =
      await renderRoute('/busca');
    await user.click(
      (await findByRole('link', {
        name: new RegExp(researcher.name),
      })) as HTMLElement,
    );
    const dialog = await findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Fechar perfil' }),
    );
    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).not.toHaveProperty('researcher');
  }, 20000);

  it('mostra o mapa por território, aproxima e pagina pesquisadores do território sem alterar filtros globais (T2.3)', async () => {
    const researchers = captureResearchersWithMap();
    const { findByRole, findByText, queryByText, router, user } =
      await renderRoute('/busca?q=solos', {
        handlers: [
          researchers.handler,
          http.get('*/territorio_relacionado.json', () =>
            HttpResponse.json(territoryGeoJson),
          ),
        ],
      });

    expect(
      await findByText('Pesquisadores com mais ocorrências'),
    ).toBeInTheDocument();
    await user.click(await findByRole('radio', { name: 'Ver no mapa' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ view: 'map' });
    });
    // O mapa é carregado sob demanda (Leaflet em chunk à parte).
    const territory = await findByRole(
      'button',
      { name: /Litoral Sul/ },
      { timeout: 5000 },
    );
    expect(
      await findByText('1 pesquisador fora dos territórios da Bahia'),
    ).toBeInTheDocument();
    expect(queryByText('Pesquisadores com mais ocorrências')).toBeNull();

    const mapCall = researchers.calls.find((params) =>
      params.getAll('facets').includes('territory_city'),
    )!;
    expect(mapCall.get('q')).toBe('solos');
    expect(mapCall.get('per_page')).toBe('1');
    expect(mapCall.get('facet_limit')).toBe('100');
    expect(mapCall.getAll('facets')).toEqual(['territory_city']);

    // Clicar no território abre a prévia paginada sem mutar identity_territory na URL.
    await user.click(territory);
    expect(router.state.location.search).not.toHaveProperty(
      'identity_territory',
    );
    await waitFor(() => {
      const previewCall = researchers.calls.find(
        (params) =>
          params.getAll('identity_territory').includes('5') &&
          params.get('per_page') === '6',
      );
      expect(previewCall).toBeDefined();
      expect(previewCall!.getAll('facets')).toEqual([]);
    });

    expect(await findByText('Página 1 de 2')).toBeInTheDocument();
    await user.click(await findByRole('button', { name: 'Próxima página' }));
    expect(await findByText('Marina Costa Oliveira')).toBeInTheDocument();
    expect(await findByText('Página 2 de 2')).toBeInTheDocument();

    await user.click(await findByRole('button', { name: 'Territórios' }));
    expect(
      await findByRole('button', { name: /Litoral Sul/ }),
    ).toBeInTheDocument();
  }, 20000);
});
