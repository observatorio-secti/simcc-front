import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

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
  onListRequest?: (params: {
    page: number;
    size: number;
    q: string | null;
    modoBusca: string | null;
    uf: string | null;
    areaConhecimentoId: string | null;
    situacao: string | null;
    instituicaoId: string | null;
    cidade: string | null;
    anoFormacao: string | null;
    ordenarPor: string | null;
    ordem: string | null;
  }) => void;
}) {
  const sourceItems = options?.items ?? odaGroupsFixture;

  return [
    http.get(`${ODA_TEST_BASE}/uf`, () =>
      HttpResponse.json([
        { id: 'uf-ba', sigla: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
        { id: 'uf-pe', sigla: 'PE', nome: 'Pernambuco', regiao: 'Nordeste' },
      ]),
    ),
    http.get(`${ODA_TEST_BASE}/area-conhecimento`, () =>
      HttpResponse.json({
        data: [
          {
            id: 'area-exatas',
            nome: 'Ciências Exatas e da Terra',
            tipo: 'GRANDE_AREA',
          },
          {
            id: 'area-saude',
            nome: 'Ciências da Saúde',
            tipo: 'GRANDE_AREA',
          },
        ],
        meta: { page: 1, size: 100, totalItems: 2, totalPages: 1 },
      }),
    ),
    http.get(`${ODA_TEST_BASE}/instituicao`, () =>
      HttpResponse.json({
        data: [
          {
            id: 'inst-1',
            nome: 'Universidade Estadual de Santa Cruz',
            sigla: 'UESC',
            estado: { sigla: 'BA' },
          },
          {
            id: 'inst-2',
            nome: 'Universidade Federal da Bahia',
            sigla: 'UFBA',
            estado: { sigla: 'BA' },
          },
        ],
        meta: { page: 1, size: 100, totalItems: 2, totalPages: 1 },
      }),
    ),
    http.get(`${ODA_TEST_BASE}/grupos-pesquisa/simcc`, ({ request }) => {
      const url = new URL(request.url);
      const page = Number(url.searchParams.get('page') ?? '1');
      const size = Number(url.searchParams.get('size') ?? '12');
      options?.onListRequest?.({
        page,
        size,
        q: url.searchParams.get('q'),
        modoBusca: url.searchParams.get('modoBusca'),
        uf: url.searchParams.get('uf'),
        areaConhecimentoId: url.searchParams.get('areaConhecimentoId'),
        situacao: url.searchParams.get('situacao'),
        instituicaoId: url.searchParams.get('instituicaoId'),
        cidade: url.searchParams.get('cidade'),
        anoFormacao: url.searchParams.get('anoFormacao'),
        ordenarPor: url.searchParams.get('ordenarPor'),
        ordem: url.searchParams.get('ordem'),
      });

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
                lattesId: '1234567890123456',
                imageUrl: 'https://oda.test/fotos/ana.jpg',
                eLider: true,
              },
              {
                id: 'r-2',
                nome: 'Bruno Costa',
                formacaoAcademica: null,
                lattesId: '9876543210987654',
                imageUrl: null,
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
        onListRequest: (params) =>
          requestedParams.push({ page: params.page, size: params.size }),
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
    expect(
      screen.getByRole('searchbox', {
        name: /Pesquisar grupos por nome, área ou palavra-chave/i,
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Exibir em lista' }));
    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('view=list');
    });
  }, 15000);

  it('envia busca textual com modoBusca=textual e aplica filtros laterais na URL', async () => {
    const calls: Array<Record<string, string | number | null>> = [];
    const { user, router } = await renderRoute('/grupos-pesquisa', {
      handlers: createOdaHandlers({
        onListRequest: (params) => calls.push(params),
      }),
    });

    const searchInput = await screen.findByRole('searchbox', {
      name: /Pesquisar grupos por nome, área ou palavra-chave/i,
    });
    await user.type(searchInput, 'computação');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('q=computa');
      expect(calls.at(-1)).toMatchObject({
        q: 'computação',
        modoBusca: 'textual',
      });
    });

    const ufCheckbox = await screen.findByRole('checkbox', {
      name: /BA — Bahia/i,
    });
    await user.click(ufCheckbox);

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('uf=BA');
      expect(calls.at(-1)).toMatchObject({
        q: 'computação',
        modoBusca: 'textual',
        uf: 'BA',
      });
    });

    const areaCheckbox = await screen.findByRole('checkbox', {
      name: 'Ciências Exatas e da Terra',
    });
    await user.click(areaCheckbox);

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('area=area-exatas');
      expect(calls.at(-1)).toMatchObject({
        areaConhecimentoId: 'area-exatas',
        uf: 'BA',
      });
    });

    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));

    await waitFor(() => {
      expect(router.state.location.searchStr).not.toContain('uf=');
      expect(router.state.location.searchStr).not.toContain('area=');
      expect(router.state.location.searchStr).toContain('q=computa');
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

    expect(await screen.findByText(/Lideranças? do grupo/)).toBeInTheDocument();
    const leaderLink = await screen.findByRole('link', { name: 'Ana Souza' });
    expect(leaderLink).toHaveAttribute(
      'href',
      '/pesquisadores/1234567890123456',
    );
    expect(
      await screen.findByText('Doutorado em Ciência da Computação'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('img[src="https://oda.test/fotos/ana.jpg"]'),
    ).toBeInTheDocument();
    expect(
      document.querySelector(
        'img[src="http://localhost:8088/v2/researcher/9876543210987654/image"]',
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Pesquisadores/i }));

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('tab=pesquisadores');
    });
    const researchersPanel = screen.getByRole('tabpanel', {
      name: /Pesquisadores/i,
    });
    expect(within(researchersPanel).getByText('Ana Souza')).toBeInTheDocument();
    expect(
      within(researchersPanel).getByRole('link', { name: 'Ana Souza' }),
    ).toHaveAttribute('href', '/pesquisadores/1234567890123456');
    expect(
      within(researchersPanel).getByText('Doutorado em Ciência da Computação'),
    ).toBeInTheDocument();
  }, 15000);

  it('exibe liderança pelo fallback de membros quando /pesquisadores retorna vazio e abre busca sem lattesId', async () => {
    await renderRoute('/grupos-pesquisa/grp-2', {
      handlers: createOdaHandlers(),
    });

    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Laboratório de Saúde Coletiva',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Liderança do grupo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Carlos Lima' })).toHaveAttribute(
      'href',
      '/busca?q=Carlos+Lima&type=name',
    );
  }, 15000);

  it('navega direto para /pesquisadores/$lattesId ao clicar no nome sem buscar por nome', async () => {
    const baseResearcher = v2Fixtures['/researcher/{researcher_id}'].data;
    const anaResearcher = {
      ...baseResearcher,
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Ana Souza',
    };
    const requestedIds: string[] = [];

    const { user, router } = await renderRoute(
      '/grupos-pesquisa/grp-1?tab=pesquisadores',
      {
        handlers: [
          ...createOdaHandlers(),
          http.get(simccV2Url('/researcher/:researcher_id'), ({ params }) => {
            requestedIds.push(String(params.researcher_id));
            return HttpResponse.json({
              ...v2Fixtures['/researcher/{researcher_id}'],
              data: anaResearcher,
            });
          }),
        ],
      },
    );

    const links = await screen.findAllByRole('link', { name: 'Ana Souza' });
    await user.click(links[0]!);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/pesquisadores/1234567890123456',
      );
      expect(requestedIds).toContain('1234567890123456');
    });
  }, 15000);
});
