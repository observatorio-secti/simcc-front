import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type {
  GraduateProgramDetail,
  GraduateProgramSummary,
} from '@/entities/graduate-program/model';
import { renderRoute } from './render-route';
import { v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import type { TerritoryGeoJson } from '@/entities/territory/geo';

const testGeoJson: TerritoryGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: '2927408',
        name: 'Salvador',
        territorio_id: '26',
        territorio_identidade: 'METROPOLITANA DE SALVADOR',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-38.5, -13.0],
            [-38.4, -13.0],
            [-38.4, -12.9],
            [-38.5, -12.9],
            [-38.5, -13.0],
          ],
        ],
      },
    },
  ],
};

const programA: GraduateProgramSummary = {
  id: 'prog-1',
  name: 'Programa de Pós-Graduação em Ciência da Computação',
  acronym: 'PGCOMP',
  area: 'CIÊNCIAS EXATAS E DA TERRA',
  modality: 'ACADÊMICO',
  rating: '5',
  city: 'Salvador',
  state: 'BA',
};

const programB: GraduateProgramSummary = {
  id: 'prog-2',
  name: 'Programa de Pós-Graduação em Saúde Coletiva',
  acronym: 'PPGSC',
  area: 'CIÊNCIAS DA SAÚDE',
  modality: 'PROFISSIONAL',
  rating: '4',
  city: 'Salvador',
  state: 'BA',
};

const programDetail: GraduateProgramDetail = {
  ...programA,
  code: '28001010035P5',
  name_en: 'Graduate Program in Computer Science',
  type: 'MESTRADO E DOUTORADO',
  description: 'Formação de pesquisadores em computação na Bahia.',
  coordinator: 'Profa. Maria Silva',
  email: 'pgcomp@ufba.br',
  phone: '(71) 3283-6000',
  site: 'https://pgcomp.ufba.br',
  start: '2005',
  institution: {
    id: 'inst-1',
    name: 'Universidade Federal da Bahia',
    acronym: 'UFBA',
  },
  counts: {
    researchers: 28,
  },
  research_lines: [
    {
      name: 'Engenharia de Software e Sistemas Distribuídos',
      area: 'CIÊNCIAS EXATAS E DA TERRA',
      start_year: 2010,
      end_year: null,
    },
  ],
};

function makeListHandler(
  items: GraduateProgramSummary[],
  calls: URLSearchParams[] = [],
) {
  return http.get(simccV2Url('/graduate-program'), ({ request }) => {
    const url = new URL(request.url);
    calls.push(url.searchParams);
    const q = url.searchParams.get('q')?.toLowerCase();
    const filtered = q
      ? items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.acronym?.toLowerCase().includes(q),
        )
      : items;

    return HttpResponse.json({
      data: filtered,
      pagination: {
        page: 1,
        per_page: 20,
        total_items: filtered.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
      filters_applied: {},
      sort: { sort_by: 'name', sort_order: 'asc' },
      facets: {
        area: {
          param: 'area',
          total: 2,
          items: [
            {
              value: 'CIÊNCIAS EXATAS E DA TERRA',
              label: 'Ciências Exatas e da Terra',
              count: 1,
            },
          ],
        },
        city: {
          param: 'city',
          total: 1,
          items: [{ value: 'Salvador', label: 'Salvador', count: 2 }],
        },
        territory_city: {
          param: ['identity_territory', 'city_code'],
          total: 1,
          covered: 2,
          items: [
            {
              value: '26',
              code: 26,
              label: 'METROPOLITANA DE SALVADOR',
              count: 2,
              selected: url.searchParams.has('identity_territory'),
              children: [
                {
                  value: '2927408',
                  code: 2927408,
                  label: 'Salvador',
                  count: 2,
                  selected: false,
                },
              ],
            },
          ],
        },
      },
      meta: {
        took_ms: 5,
        cached: false,
        timestamp: '2026-11-20T00:00:00Z',
        data_as_of: '2026-11-20T00:00:00Z',
      },
    });
  });
}

describe('Rotas de Pós-graduação (T5)', () => {
  it('renderiza landing com mapa, KPIs e catálogo em /pos-graduacao', async () => {
    const calls: URLSearchParams[] = [];
    const { user, router } = await renderRoute('/pos-graduacao', {
      handlers: [
        makeListHandler([programA, programB], calls),
        http.get('*/territorio_relacionado.json', () =>
          HttpResponse.json(testGeoJson),
        ),
      ],
    });

    expect(
      await screen.findByText(
        'Programa de Pós-Graduação em Ciência da Computação',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Programa de Pós-Graduação em Saúde Coletiva'),
    ).toBeInTheDocument();

    // Mapa alimentado pela faceta territory_city, numa query só
    // O mapa é carregado sob demanda (Leaflet em chunk à parte).
    const territory = await screen.findByRole(
      'button',
      { name: /Metropolitana de Salvador/ },
      { timeout: 5000 },
    );
    expect(calls.every((params) => params.get('per_page') !== '100')).toBe(
      true,
    );
    expect(calls.at(-1)!.getAll('facets')).toContain('territory_city');
    expect(calls.at(-1)!.get('facet_limit')).toBe('100');
    // A faceta hierárquica não vira bloco do painel de filtros
    expect(screen.queryByText('territory_city')).not.toBeInTheDocument();

    // Clicar no território filtra por código SEI
    await user.click(territory);
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        identity_territory: ['26'],
      });
    });
    expect(calls.at(-1)!.getAll('identity_territory')).toEqual(['26']);
    await user.click(
      await screen.findByRole('button', { name: /Metropolitana de Salvador/ }),
    );
    await waitFor(() => {
      expect(router.state.location.search).not.toHaveProperty(
        'identity_territory',
      );
    });

    // Busca textual atualiza URL e filtra resultados
    const searchInput = screen.getByPlaceholderText(
      'Pesquisar programas por nome ou sigla',
    );
    await user.type(searchInput, 'Computação');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'Computação' });
    });

    expect(
      screen.getByText('Programa de Pós-Graduação em Ciência da Computação'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Programa de Pós-Graduação em Saúde Coletiva'),
    ).not.toBeInTheDocument();
  }, 20000);

  it('alterna entre grade e tabela persistindo view na URL', async () => {
    const { user, router } = await renderRoute('/pos-graduacao', {
      handlers: [
        makeListHandler([programA]),
        http.get('*/territorio_relacionado.json', () =>
          HttpResponse.json(testGeoJson),
        ),
      ],
    });

    await screen.findByText(
      'Programa de Pós-Graduação em Ciência da Computação',
    );

    await user.click(screen.getByRole('radio', { name: 'Exibir em tabela' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ view: 'table' });
    });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('renderiza detalhe do programa com linhas de pesquisa e informações gerais em /pos-graduacao/$id', async () => {
    await renderRoute('/pos-graduacao/prog-1', {
      handlers: [
        http.get(simccV2Url('/graduate-program/{program_id}'), () =>
          HttpResponse.json({
            data: programDetail,
            meta: { data_as_of: '2026-11-20T00:00:00Z' },
          }),
        ),
      ],
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Programa de Pós-Graduação em Ciência da Computação',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Profa. Maria Silva')).toBeInTheDocument();
    expect(screen.getByText('pgcomp@ufba.br')).toBeInTheDocument();
    expect(
      screen.getByText('Engenharia de Software e Sistemas Distribuídos'),
    ).toBeInTheDocument();
  });
  it('não exibe seção Painel nem Produção geral, e lista pesquisadores, produções e discentes em abas diretas', async () => {
    const capturedResearcherProgramIds: string[] = [];
    const capturedArticleProgramIds: string[] = [];

    const { router, user } = await renderRoute('/pos-graduacao/prog-1', {
      handlers: [
        http.get(simccV2Url('/graduate-program/{program_id}'), () =>
          HttpResponse.json({
            data: programDetail,
            meta: { data_as_of: '2026-11-20T00:00:00Z' },
          }),
        ),
        http.get(simccV2Url('/researcher'), ({ request }) => {
          const url = new URL(request.url);
          capturedResearcherProgramIds.push(
            ...url.searchParams.getAll('graduate_program_id'),
          );
          return HttpResponse.json(v2Fixtures['/researcher']);
        }),
        http.get(simccV2Url('/production/article'), ({ request }) => {
          const url = new URL(request.url);
          capturedArticleProgramIds.push(
            ...url.searchParams.getAll('graduate_program_id'),
          );
          return HttpResponse.json(v2Fixtures['/production/article']);
        }),
      ],
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Programa de Pós-Graduação em Ciência da Computação',
      }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole('heading', { name: 'Painel' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('tab', { name: 'Produção geral' }),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(capturedResearcherProgramIds).toContain('prog-1');
    });

    await user.click(screen.getByRole('tab', { name: 'Discentes' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ tab: 'students' });
    });
    expect(
      screen.getByText(/Discentes: painel indisponível no momento/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Artigos' }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ tab: 'articles' });
    });
    await waitFor(() => {
      expect(capturedArticleProgramIds).toContain('prog-1');
    });

    const articleLink = await screen.findByRole('link', {
      name: /Redes neurais aplicadas a solos/i,
    });
    expect(articleLink).toBeInTheDocument();

    await user.click(articleLink);
    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('production=article');
    });
  });
});
