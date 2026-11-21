import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');
vi.stubEnv('VITE_ODA_API_URL', 'https://oda.test/oda/v1/');

const {
  researchGroupAllQueryOptions,
  researchGroupDetailQueryOptions,
  researchGroupKeys,
  researchGroupListQueryOptions,
  researchGroupResearchersQueryOptions,
} = await import('./queries');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('researchGroupKeys', () => {
  it('segue o padrão [entidade, operação, params]', () => {
    expect(researchGroupKeys.list({ page: 1, size: 50 })).toEqual([
      'research-group',
      'list',
      { page: 1, size: 50 },
    ]);
    expect(researchGroupKeys.detail('grp-1')).toEqual([
      'research-group',
      'detail',
      'grp-1',
    ]);
  });
});

describe('researchGroup queryOptions', () => {
  it('busca página da ODA repassando `signal` e adapta os itens', async () => {
    const fetchMock = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        json({
          data: [
            {
              id: 'grp-1',
              nome: 'Núcleo de Pesquisa em Saúde',
              areaPredominante: 'Ciências da Saúde',
              instituicoes: [
                {
                  id: 'inst-1',
                  sigla: 'UESC',
                  nome: 'Universidade Estadual de Santa Cruz',
                  tipoRelacao: 'SEDE',
                },
              ],
              membros: [{ id: 'm-1', nome: 'Ana Souza', eLider: true }],
              linhasPesquisa: [{ titulo: 'Epidemiologia' }],
            },
          ],
          meta: { page: 1, size: 20, totalItems: 1, totalPages: 1 },
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new QueryClient();
    const result = await client.fetchQuery(
      researchGroupListQueryOptions({ page: 1, size: 20 }),
    );

    expect(result.items[0]).toMatchObject({
      id: 'grp-1',
      name: 'Núcleo de Pesquisa em Saúde',
      institutionAcronym: 'UESC',
      memberCount: 1,
      researchLineCount: 1,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://oda.test/oda/v1/grupos-pesquisa/simcc?page=1&size=20',
    );
    expect(fetchMock.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });

  it('busca catálogo completo, detalhe e pesquisadores do grupo com `signal`', async () => {
    const fetchMock = vi.fn(
      async (input: RequestInfo | URL, _init?: RequestInit) => {
        const url = String(input);
        if (url.includes('/pesquisadores')) {
          return json({
            data: [{ id: 'r-1', nome: 'Carla Dias', imageUrl: '/img/r1.png' }],
            meta: { page: 1, size: 100, totalItems: 1, totalPages: 1 },
          });
        }
        if (url.includes('grupos-pesquisa/simcc')) {
          return json({
            data: [{ id: 'grp-1', nome: 'Grupo 1' }],
            meta: { page: 1, size: 10000, totalItems: 1, totalPages: 1 },
          });
        }
        return json({ id: 'grp-1', nome: 'Grupo 1' });
      },
    );
    vi.stubGlobal('fetch', fetchMock);

    const client = new QueryClient();
    const all = await client.fetchQuery(researchGroupAllQueryOptions());
    expect(all).toHaveLength(1);

    const detail = await client.fetchQuery(
      researchGroupDetailQueryOptions('grp-1'),
    );
    expect(detail.name).toBe('Grupo 1');

    const researchers = await client.fetchQuery(
      researchGroupResearchersQueryOptions('grp-1'),
    );
    expect(researchers.items[0]?.imageUrl).toBe(
      'https://oda.test/oda/v1/img/r1.png',
    );
    expect(
      fetchMock.mock.calls.every(
        ([, init]) => init?.signal instanceof AbortSignal,
      ),
    ).toBe(true);
  });

  it('desabilita queries de detalhe quando id está vazio', () => {
    expect(researchGroupDetailQueryOptions('  ').enabled).toBe(false);
    expect(researchGroupResearchersQueryOptions('').enabled).toBe(false);
  });
});
