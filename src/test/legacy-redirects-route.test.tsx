import { waitFor } from '@testing-library/react';
import { createMemoryHistory } from '@tanstack/react-router';
import { HttpResponse, http } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { createAppRouter } from '@/app/router';
import { v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import { createTestQueryClient, renderRoute } from './render-route';

// Redirects das URLs do legado (V2, `src/routes/-redirects/`). Cada teste abre a URL antiga e confere
// o caminho final e os search params preservados.

const researcher = v2Fixtures['/researcher'].data[0]!;
const institution = v2Fixtures['/institution'].data[0]!;
const program = v2Fixtures['/graduate-program'].data[0]!;

/** Registra as chamadas a uma listagem da v2 e responde com `data`. */
function captureList(path: '/researcher' | '/institution', data: unknown[]) {
  const calls: URLSearchParams[] = [];
  const handler = http.get(simccV2Url(path), ({ request }) => {
    calls.push(new URL(request.url).searchParams);
    return HttpResponse.json({ ...v2Fixtures[path], data });
  });
  return { calls, handler };
}

async function finalLocation(url: string, options = {}) {
  const result = await renderRoute(url, options);
  await waitFor(() => {
    expect(result.router.state.status).toBe('idle');
  });
  return result;
}

describe('Redirect /resultados e /resultados-perfil (V2)', () => {
  it('traduz termo, tipo, aba, filtros, anos e ordenação para /busca', async () => {
    const { router } = await finalLocation(
      '/resultados?type_search=article&terms=solos;agua|clima&tab=articles-home' +
        '&institution_id=inst-1&institution_id=inst-2&qualis=A1&qualis=XX' +
        '&year_start=2020&year_end=2024&production_sort=citations' +
        '&open_access=true&researcher=false&facet_limit=100',
    );
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).toEqual({
      q: 'solos agua or clima',
      type: 'article',
      tab: 'articles',
      institution_id: ['inst-1', 'inst-2'],
      qualis: ['A1'],
      year_start: 2020,
      year_end: 2024,
      sort_by: 'citations',
    });
  }, 15000);

  it('converte source_type antigo e descarta abas sem equivalente', async () => {
    const { router } = await finalLocation(
      '/resultados-perfil?type_search=profile&terms=redes&tab=mapa' +
        '&source_type=ARTICLE&source_type=PARTICIPATION_EVENT&classification=A' +
        '&sort_by=relevance',
    );
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).toEqual({
      q: 'redes',
      source_type: ['article', 'event'],
      classification: ['A'],
      sort_by: 'relevance',
    });
  }, 15000);

  it('sem parâmetros, vai para /busca sem termo', async () => {
    const { router } = await finalLocation('/resultados');
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).toEqual({});
  }, 15000);
});

describe('Redirect /researcher (V2)', () => {
  it('resolve researcher_name pela v2 e preserva termo e tipo', async () => {
    const list = captureList('/researcher', [researcher]);
    const { router } = await finalLocation(
      `/researcher?researcher_name=${encodeURIComponent(researcher.name.toUpperCase())}` +
        '&search_type=article&terms=solos',
      { handlers: [list.handler] },
    );
    expect(router.state.location.pathname).toBe(
      `/pesquisadores/${researcher.id}`,
    );
    expect(router.state.location.search).toEqual({
      q: 'solos',
      search_type: 'article',
    });
    const call = list.calls[0]!;
    expect(call.get('q')).toBe(researcher.name.toUpperCase());
    expect(call.get('search_in')).toBe('name');
  }, 15000);

  it('sem correspondência exata, cai na busca por nome', async () => {
    const list = captureList('/researcher', [researcher]);
    const { router } = await finalLocation(
      '/researcher?researcher_name=Fulano%20de%20Tal&terms=',
      { handlers: [list.handler] },
    );
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).toEqual({
      q: 'Fulano de Tal',
      type: 'name',
    });
  }, 15000);

  it('lattes_id sem nome (a v2 não procura por Lattes) vai para /busca', async () => {
    const { router } = await finalLocation(
      '/researcher?lattes_id=0273462762077753',
    );
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).toEqual({});
  }, 15000);
});

describe('Redirect /instituicao (V2)', () => {
  it('resolve a sigla do path pela v2 e traduz a aba', async () => {
    const list = captureList('/institution', [institution]);
    const { router } = await finalLocation(
      `/instituicao/${institution.acronym!.toLowerCase()}?pagina=programas_pos`,
      { handlers: [list.handler] },
    );
    expect(router.state.location.pathname).toBe(
      `/instituicoes/${institution.id}`,
    );
    expect(router.state.location.search).toEqual({ tab: 'programs' });
    expect(list.calls[0]!.get('q')).toBe(institution.acronym!.toLowerCase());
  }, 15000);

  it('aceita ?institution_id= com o UUID da v2', async () => {
    const { router } = await finalLocation(
      `/instituicao?institution_id=${institution.id}&pagina=docentes`,
    );
    expect(router.state.location.pathname).toBe(
      `/instituicoes/${institution.id}`,
    );
    expect(router.state.location.search).toEqual({});
  }, 15000);

  it('sigla desconhecida vai para a lista filtrada', async () => {
    const list = captureList('/institution', [institution]);
    const { router } = await finalLocation('/instituicao/XYZ', {
      handlers: [list.handler],
    });
    expect(router.state.location.pathname).toBe('/instituicoes');
    expect(router.state.location.search).toMatchObject({ q: 'XYZ' });
  }, 15000);

  it('sem identificador, vai para a lista', async () => {
    const { router } = await finalLocation('/instituicao');
    expect(router.state.location.pathname).toBe('/instituicoes');
  }, 15000);
});

describe('Outros redirects do legado (V2)', () => {
  it('/pos-graduacao?graduate_program_id= abre o programa', async () => {
    const { router } = await finalLocation(
      `/pos-graduacao?graduate_program_id=${program.id}`,
    );
    expect(router.state.location.pathname).toBe(`/pos-graduacao/${program.id}`);
    expect(router.state.location.search).toEqual({});
  }, 15000);

  it('/grupos-pesquisa?group_id= abre o grupo', async () => {
    const { router } = await finalLocation(
      '/grupos-pesquisa?group_id=grupo-1&area=X',
    );
    expect(router.state.location.pathname).toBe('/grupos-pesquisa/grupo-1');
    expect(router.state.location.search).toEqual({});
  }, 15000);

  it('/paines-dados-externos vai para a grafia nova', async () => {
    const { router } = await finalLocation('/paines-dados-externos');
    expect(router.state.location.pathname).toBe('/paineis-dados-externos');
  }, 15000);

  it('/resultados-ia vai para /maria (T10)', async () => {
    const { router } = await finalLocation('/resultados-ia?q=solos');
    expect(router.state.location.pathname).toBe('/maria');
    expect(router.state.location.search).toEqual({});
  }, 15000);
});

describe('Analytics nos redirects (ADR 0009)', () => {
  it('envia um único page_view, com o caminho de destino', async () => {
    const analytics = { enabled: true, pageView: vi.fn() };
    const router = createAppRouter(
      createTestQueryClient(),
      analytics,
      undefined,
      createMemoryHistory({ initialEntries: ['/resultados?terms=solos'] }),
    );
    await router.load();
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/busca');
    });
    expect(analytics.pageView).toHaveBeenCalledTimes(1);
    expect(analytics.pageView.mock.calls[0]![0]).toMatchObject({
      path: '/busca',
    });
  }, 15000);
});
