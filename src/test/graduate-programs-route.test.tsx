import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type {
  GraduateProgramDetail,
  GraduateProgramSummary,
} from '@/entities/graduate-program/model';
import { renderRoute } from './render-route';
import { simccV2Url } from './msw/handlers';
import type { TerritoryGeoJson } from '@/features/graduate-programs/territory-geo';

const testGeoJson: TerritoryGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Salvador',
        territorio_id: '26',
        territorio_identidade: 'METROPOLITANO DE SALVADOR',
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

function makeListHandler(items: GraduateProgramSummary[]) {
  return http.get(simccV2Url('/graduate-program'), ({ request }) => {
    const url = new URL(request.url);
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
    const { user, router } = await renderRoute('/pos-graduacao', {
      handlers: [
        makeListHandler([programA, programB]),
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

    // Mapa e legenda de territórios
    expect(
      await screen.findByText('METROPOLITANO DE SALVADOR'),
    ).toBeInTheDocument();

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
  });

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
  it('mostra a seção de painel do programa com abas na URL', async () => {
    const { router, user } = await renderRoute('/pos-graduacao/prog-1', {
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
      await screen.findByRole('heading', { name: 'Painel' }),
    ).toBeInTheDocument();
    // Painéis despublicados no Power BI: aviso no lugar do iframe
    expect(
      screen.getByText(/Produção geral: painel indisponível no momento/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: 'Discentes' }));
    await waitFor(() => {
      expect(router.state.location.search).toEqual({ painel: 'discentes' });
    });
    expect(
      screen.getByText(/Discentes: painel indisponível no momento/),
    ).toBeInTheDocument();
  });
});
