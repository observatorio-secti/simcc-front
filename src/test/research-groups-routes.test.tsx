import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

const ODA_TEST_BASE = 'https://oda.test/oda/v1';

vi.stubEnv('VITE_SIMCC_API_URL', 'http://localhost:8088/');
vi.stubEnv('VITE_ODA_API_URL', `${ODA_TEST_BASE}/`);

const { renderRoute } = await import('@/test/render-route');
const { v2Fixtures } = await import('@/test/msw/fixtures');
const { simccV2Url } = await import('@/test/msw/handlers');

const odaGroupsFixture = [
  {
    id: 'grp-1',
    nome: 'Núcleo de Inteligência Artificial',
    areaPredominante: 'Ciências Exatas e da Terra',
    dgpId: '1001',
    anoFormacao: 2018,
    situacao: 'ATIVO',
    repercussao: 'Desenvolvimento de modelos aplicados ao setor público.',
    cidade: 'Ilhéus',
    uf: 'BA',
    instituicoes: [
      {
        id: 'inst-1',
        sigla: 'UESC',
        nome: 'Universidade Estadual de Santa Cruz',
        tipoRelacao: 'SEDE',
      },
    ],
    membros: [{ id: 'm-1', nome: 'Ana Souza', eLider: true }],
    linhasPesquisa: [
      {
        titulo: 'Aprendizado de Máquina',
        objetivo: 'Modelagem preditiva em dados científicos.',
      },
    ],
  },
  {
    id: 'grp-2',
    nome: 'Laboratório de Saúde Coletiva',
    areaPredominante: 'Ciências da Saúde',
    dgpId: '1002',
    anoFormacao: 2014,
    situacao: 'CERTIFICADO',
    cidade: 'Salvador',
    uf: 'BA',
    instituicoes: [
      {
        id: 'inst-2',
        sigla: 'UFBA',
        nome: 'Universidade Federal da Bahia',
        tipoRelacao: 'SEDE',
      },
    ],
    membros: [{ id: 'm-2', nome: 'Carlos Lima', eLider: true }],
    linhasPesquisa: [{ titulo: 'Epidemiologia Regional', objetivo: null }],
  },
];

function createOdaHandlers(options?: {
  items?: typeof odaGroupsFixture;
  onListRequest?: (params: { page: number; size: number }) => void;
}) {
  const sourceItems = options?.items ?? odaGroupsFixture;

  return [
    http.get(`${ODA_TEST_BASE}/grupos-pesquisa/simcc`, ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const size = Number(url.searchParams.get('size') ?? '12');
      options?.onListRequest?.({ page, size });

      const start = (page - 1) * size;
      const paged = sourceItems.slice(start, start + size);
      const totalItems = sourceItems.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / size));

      return HttpResponse.json({
        data: paged,
        meta: {
          page,
          size,
          totalItems,
          totalPages,
        },
      });
    }),
    http.get(`${ODA_TEST_BASE}/grupos-pesquisa/:id`, ({ params }) => {
      const found = odaGroupsFixture.find((item) => item.id === params.id);
      if (!found) {
        return HttpResponse.json(
          { message: 'Grupo não encontrado' },
          { status: 404 },
        );
      }
      return HttpResponse.json(found);
    }),
    http.get(
      `${ODA_TEST_BASE}/grupos-pesquisa/:id/pesquisadores`,
      ({ params }) => {
        if (params.id === 'grp-1') {
          return HttpResponse.json({
            data: [
              {
                id: 'r-1',
                nome: 'Ana Souza',
                formacaoAcademica: 'Doutorado em Ciência da Computação',
                eLider: true,
              },
            ],
            meta: { page: 1, size: 100, totalItems: 1, totalPages: 1 },
          });
        }
        return HttpResponse.json({
          data: [],
          meta: { page: 1, size: 100, totalItems: 0, totalPages: 0 },
        });
      },
    ),
  ];
}

describe('Rotas de grupos de pesquisa (T6)', () => {
  it('renderiza a listagem paginada /grupos-pesquisa sem size=10000 e alterna visão', async () => {
    const requestedParams: Array<{ page: number; size: number }> = [];
    const { user, router } = await renderRoute('/grupos-pesquisa', {
      handlers: createOdaHandlers({
        onListRequest: (params) => requestedParams.push(params),
      }),
    });

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Grupos de pesquisa',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Núcleo de Inteligência Artificial'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Laboratório de Saúde Coletiva'),
    ).toBeInTheDocument();
    expect(requestedParams).toEqual([{ page: 1, size: 12 }]);
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Exibir em lista' }));
    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('view=list');
    });
  }, 15000);

  it('exibe estado vazio quando a API ODA não retorna grupos', async () => {
    await renderRoute('/grupos-pesquisa', {
      handlers: createOdaHandlers({ items: [] }),
    });

    expect(
      await screen.findByText('Nenhum grupo de pesquisa encontrado'),
    ).toBeInTheDocument();
  }, 15000);

  it('renderiza o detalhe /grupos-pesquisa/$id com linhas de pesquisa e aba de pesquisadores', async () => {
    const { user, router } = await renderRoute('/grupos-pesquisa/grp-1', {
      handlers: createOdaHandlers(),
    });

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Núcleo de Inteligência Artificial',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Aprendizado de Máquina')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Espelho DGP CNPq/i }),
    ).toHaveAttribute('href', 'https://dgp.cnpq.br/dgp/espelhogrupo/1001');

    await user.click(screen.getByRole('tab', { name: /Pesquisadores/i }));

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('tab=pesquisadores');
    });
    expect(await screen.findByText('Ana Souza')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ana Souza' })).toHaveAttribute(
      'href',
      '/researcher?name=Ana+Souza',
    );
    expect(
      screen.getByText('Doutorado em Ciência da Computação'),
    ).toBeInTheDocument();
  }, 15000);

  it('navega para o perfil do pesquisador no SimCC ao clicar no nome na aba Pesquisadores', async () => {
    const baseResearcher = v2Fixtures['/researcher'].data[0]!;
    const anaResearcher = {
      ...baseResearcher,
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Ana Souza',
    };

    const { user, router } = await renderRoute(
      '/grupos-pesquisa/grp-1?tab=pesquisadores',
      {
        handlers: [
          ...createOdaHandlers(),
          http.get(simccV2Url('/researcher'), () =>
            HttpResponse.json({
              ...v2Fixtures['/researcher'],
              data: [anaResearcher],
            }),
          ),
          http.get(simccV2Url('/researcher/:researcher_id'), () =>
            HttpResponse.json(anaResearcher),
          ),
        ],
      },
    );

    const link = await screen.findByRole('link', { name: 'Ana Souza' });
    await user.click(link);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        `/pesquisadores/${anaResearcher.id}`,
      );
    });
  }, 15000);
});
