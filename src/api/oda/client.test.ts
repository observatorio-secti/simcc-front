// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../errors';

vi.stubEnv('VITE_SIMCC_API_URL', 'http://api.test/simcc/api/');
vi.stubEnv('VITE_ODA_API_URL', '');
const { createOdaClient, oda, odaErrorCodes } = await import('./client');

const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

describe('createOdaClient', () => {
  it('não quebra na inicialização quando `odaApiUrl` está ausente e rejeita chamadas com ApiError em pt-BR', async () => {
    expect(oda.isConfigured).toBe(false);

    const error = await oda.listGroupsPage().catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 0,
      code: odaErrorCodes.notConfigured,
    });
    expect((error as ApiError).message).toMatch(/ODA/i);

    await expect(oda.getGroup('grp-1')).rejects.toMatchObject({
      status: 0,
      code: odaErrorCodes.notConfigured,
    });
  });

  it('monta URLs de lista, detalhe e pesquisadores preservando subcaminho da ODA', async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/pesquisadores')) {
        return json({
          data: [{ id: 'p-1', nome: 'Ana Souza' }],
          meta: { page: 2, size: 20, totalItems: 1, totalPages: 1 },
        });
      }
      if (url.includes('grupos-pesquisa/simcc')) {
        return json({
          data: [{ id: 'grp-1', nome: 'Grupo Alfa' }],
          meta: { page: 2, size: 50, totalItems: 1, totalPages: 1 },
        });
      }
      return json({ id: 'grp-1', nome: 'Grupo Alfa' });
    });

    const client = createOdaClient(
      'https://observatoriocti.secti.ba.gov.br/oda/v1',
      { fetch },
    );

    const page = await client.listGroupsPage({ page: 2, size: 50 });
    expect(page.items[0]?.name).toBe('Grupo Alfa');
    expect(fetch.mock.calls[0]?.[0]).toBe(
      'https://observatoriocti.secti.ba.gov.br/oda/v1/grupos-pesquisa/simcc?page=2&size=50',
    );

    const detail = await client.getGroup('grp-1');
    expect(detail.name).toBe('Grupo Alfa');
    expect(fetch.mock.calls[1]?.[0]).toBe(
      'https://observatoriocti.secti.ba.gov.br/oda/v1/grupos-pesquisa/grp-1',
    );

    const researchers = await client.listGroupResearchers('grp-1', {
      page: 2,
      size: 20,
    });
    expect(researchers.items[0]?.name).toBe('Ana Souza');
    expect(fetch.mock.calls[2]?.[0]).toBe(
      'https://observatoriocti.secti.ba.gov.br/oda/v1/grupos-pesquisa/grp-1/pesquisadores?page=2&size=20',
    );
  });

  it('converte erro HTTP, HTML inesperado, falha Zod e erro de rede em ApiError', async () => {
    const httpErrorClient = createOdaClient('https://oda.test/oda/v1/', {
      fetch: async () => json({ detail: 'Grupo não encontrado' }, 404),
    });
    await expect(httpErrorClient.getGroup('inexistente')).rejects.toMatchObject(
      {
        status: 404,
        code: 'not_found',
        message: 'Grupo não encontrado',
      },
    );

    const htmlClient = createOdaClient('https://oda.test/oda/v1/', {
      fetch: async () =>
        new Response('<html>Bad Gateway</html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
    });
    await expect(htmlClient.listGroupsPage()).rejects.toMatchObject({
      status: 200,
      code: 'invalid_response',
    });

    const badSchemaClient = createOdaClient('https://oda.test/oda/v1/', {
      fetch: async () => json({ data: [{ id: '', nome: 123 }] }),
    });
    const schemaErr = await badSchemaClient
      .listGroupsPage()
      .catch((e: unknown) => e);
    expect(schemaErr).toBeInstanceOf(ApiError);
    expect(schemaErr).toMatchObject({
      status: 200,
      code: 'invalid_response',
    });
    expect((schemaErr as ApiError).details.length).toBeGreaterThan(0);

    const cause = new TypeError('Failed to fetch');
    const networkClient = createOdaClient('https://oda.test/oda/v1/', {
      fetch: async () => {
        throw cause;
      },
    });
    await expect(networkClient.listGroupsPage()).rejects.toMatchObject({
      status: 0,
      code: 'network_error',
      cause,
    });
  });

  it('propaga AbortError sem converter em ApiError e rejeita id vazio', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    const client = createOdaClient('https://oda.test/oda/v1/', {
      fetch: async () => {
        throw abort;
      },
    });

    await expect(client.listGroupsPage()).rejects.toBe(abort);
    await expect(client.getGroup('   ')).rejects.toMatchObject({
      status: 400,
      code: 'bad_request',
    });
  });

  it('envia busca textual (q + modoBusca=textual), filtros e ordenação em listGroupsPage', async () => {
    const fetch = vi.fn(async () =>
      json({
        data: [{ id: 'grp-1', nome: 'Grupo IA' }],
        meta: { page: 1, size: 12, totalItems: 1, totalPages: 1 },
      }),
    );
    const client = createOdaClient('https://oda.test/oda/v1/', { fetch });

    await client.listGroupsPage({
      page: 1,
      size: 12,
      q: '  inteligência artificial  ',
      situacao: 'CERTIFICADO',
      areaConhecimentoId: 'area-1',
      uf: 'ba',
      instituicaoId: 'inst-1',
      cidade: 'Salvador',
      anoFormacao: 2020,
      ordenarPor: 'anoFormacao',
      ordem: 'desc',
    });

    const calledUrl = new URL(String(fetch.mock.calls[0]?.[0]));
    expect(calledUrl.searchParams.get('q')).toBe('inteligência artificial');
    expect(calledUrl.searchParams.get('modoBusca')).toBe('textual');
    expect(calledUrl.searchParams.get('situacao')).toBe('CERTIFICADO');
    expect(calledUrl.searchParams.get('areaConhecimentoId')).toBe('area-1');
    expect(calledUrl.searchParams.get('uf')).toBe('BA');
    expect(calledUrl.searchParams.get('instituicaoId')).toBe('inst-1');
    expect(calledUrl.searchParams.get('cidade')).toBe('Salvador');
    expect(calledUrl.searchParams.get('anoFormacao')).toBe('2020');
    expect(calledUrl.searchParams.get('ordenarPor')).toBe('anoFormacao');
    expect(calledUrl.searchParams.get('ordem')).toBe('desc');
  });

  it('busca endpoints auxiliares de UF, áreas de conhecimento e instituições', async () => {
    const fetch = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('/uf')) {
        return json([
          { id: 'uf-ba', sigla: 'BA', nome: 'Bahia', regiao: 'Nordeste' },
        ]);
      }
      if (url.includes('/area-conhecimento')) {
        return json({
          data: [
            {
              id: 'area-1',
              nome: 'Engenharias',
              tipo: 'GRANDE_AREA',
            },
            { id: 'area-dot', nome: '.', tipo: 'SUBAREA' },
          ],
        });
      }
      return json({
        data: [
          {
            id: 'inst-1',
            nome: 'Universidade Federal da Bahia',
            sigla: 'UFBA',
            estado: { sigla: 'BA' },
          },
        ],
      });
    });

    const client = createOdaClient('https://oda.test/oda/v1/', { fetch });

    const states = await client.listStates();
    expect(states).toEqual([
      { id: 'uf-ba', acronym: 'BA', name: 'Bahia', region: 'Nordeste' },
    ]);

    const areas = await client.listKnowledgeAreas({ tipo: 'GRANDE_AREA' });
    expect(areas).toEqual([
      { id: 'area-1', name: 'Engenharias', type: 'GRANDE_AREA' },
    ]);

    const institutions = await client.listInstitutions({ uf: 'ba' });
    expect(institutions).toEqual([
      {
        id: 'inst-1',
        name: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
        label: 'UFBA - Universidade Federal da Bahia',
        stateAcronym: 'BA',
      },
    ]);
  });
});
