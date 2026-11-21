import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

const ODA_TEST_BASE = 'https://oda.test/oda/v1';

vi.stubEnv('VITE_SIMCC_API_URL', 'http://localhost:8088/');
vi.stubEnv('VITE_ODA_API_URL', `${ODA_TEST_BASE}/`);

const { renderRoute } = await import('@/test/render-route');

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

function createOdaHandlers() {
  return [
    http.get(`${ODA_TEST_BASE}/grupos-pesquisa/simcc`, () =>
      HttpResponse.json({
        data: odaGroupsFixture,
        meta: {
          page: 1,
          size: 10000,
          totalItems: odaGroupsFixture.length,
          totalPages: 1,
        },
      }),
    ),
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
  it('renderiza a listagem /grupos-pesquisa com KPIs, busca por URL e alternância de visão', async () => {
    const { user, router } = await renderRoute('/grupos-pesquisa', {
      handlers: createOdaHandlers(),
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

    const searchInput = screen.getByRole('searchbox', {
      name: 'Pesquisar grupos de pesquisa',
    });
    await user.type(searchInput, 'Saúde');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('q=Sa');
      expect(
        screen.queryByText('Núcleo de Inteligência Artificial'),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByText('Laboratório de Saúde Coletiva'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Exibir em lista' }));
    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('view=list');
    });
  }, 15000);

  it('exibe estado vazio quando a busca não retorna resultados e permite limpar filtros', async () => {
    const { user } = await renderRoute('/grupos-pesquisa?q=inexistente', {
      handlers: createOdaHandlers(),
    });

    expect(
      await screen.findByText('Nenhum grupo de pesquisa encontrado'),
    ).toBeInTheDocument();

    const clearButtons = screen.getAllByRole('button', {
      name: 'Limpar filtros',
    });
    await user.click(clearButtons[0]!);

    expect(
      await screen.findByText('Núcleo de Inteligência Artificial'),
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
    expect(
      screen.getByText('Doutorado em Ciência da Computação'),
    ).toBeInTheDocument();
  }, 15000);
});
