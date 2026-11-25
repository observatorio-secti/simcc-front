import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import { openApiErrors, v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import { renderRoute } from './render-route';

const RESEARCHER_ID = v2Fixtures['/researcher/{researcher_id}'].data.id;

describe('Rota /pesquisadores/$id (T3)', () => {
  it('renderiza perfil completo com cabeçalho, sidebar, nuvem de termos, bolsas e artigos', async () => {
    const articleCalls: URLSearchParams[] = [];
    const { findByRole, findByText, getByLabelText, getByText } =
      await renderRoute(`/pesquisadores/${RESEARCHER_ID}`, {
        handlers: [
          http.get(simccV2Url('/production/article'), ({ request }) => {
            articleCalls.push(new URL(request.url).searchParams);
            return HttpResponse.json(v2Fixtures['/production/article']);
          }),
        ],
      });

    const researcher = v2Fixtures['/researcher/{researcher_id}'].data;
    expect(
      await findByRole('heading', { name: researcher.name }),
    ).toBeInTheDocument();

    // Sidebar: informações gerais, bolsa (/v2/scholarship) e nuvem de termos (/v2/researcher/{id}/terms)
    expect(await findByText('Produtividade em Pesquisa')).toBeInTheDocument();
    expect(await findByText('solos')).toBeInTheDocument();
    expect(await findByText('redes')).toBeInTheDocument();

    // Filtro de ano inicial com padrão dinâmico (anoCorrente - 10) e enviado à API
    expect(getByLabelText('Ano inicial')).toHaveValue(getDefaultYearStart());
    expect(getByLabelText('Ano final')).toHaveValue(null);
    expect(articleCalls.at(-1)?.get('year_start')).toBe(
      String(getDefaultYearStart()),
    );

    // Cartão de aviso do período antes do gráfico Qualis, seguido da lista de artigos
    const notice = await findByRole('note');
    const chartHeading = getByText('Gráfico de quantidade total por Qualis');
    expect(notice).toHaveTextContent(/publicações de anos anteriores/i);
    expect(
      notice.compareDocumentPosition(chartHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    const firstArticle = v2Fixtures['/production/article'].data[0];
    if (firstArticle) {
      expect(
        await findByRole('link', { name: firstArticle.title }),
      ).toBeInTheDocument();
    }
  }, 15000);

  it('sincroniza troca de aba e filtro Qualis na URL', async () => {
    const { findByRole, findByText, router, user } = await renderRoute(
      `/pesquisadores/${RESEARCHER_ID}`,
    );

    const qualisA2Button = await findByRole('button', { name: 'Qualis A2' });
    await user.click(qualisA2Button);
    await waitFor(() => {
      expect(router.state.location.search.qualis).toEqual(['A2']);
    });

    const guidanceTab = await findByRole('tab', { name: /Orientações/i });
    await user.click(guidanceTab);
    expect(
      await findByText('Gráfico de orientações por natureza ao longo dos anos'),
    ).toBeInTheDocument();

    const trajectoryTab = await findByRole('tab', { name: /Trajetória/i });
    await user.click(trajectoryTab);
    await waitFor(() => {
      expect(router.state.location.search.tab).toBe('trajectory');
    });
    expect(
      await findByText(/Formação acadêmica|Sem dados de trajetória/i),
    ).toBeInTheDocument();
  }, 15000);

  it('aceita lattes_id na URL e usa o UUID retornado nos sub-endpoints', async () => {
    const LATTES_ID = '0273462762077753';
    const researcher = v2Fixtures['/researcher/{researcher_id}'].data;
    const requestedTermsIds: string[] = [];
    const requestedScholarshipResearcherIds: Array<string | null> = [];

    const { findByRole } = await renderRoute(`/pesquisadores/${LATTES_ID}`, {
      handlers: [
        http.get(simccV2Url('/researcher/{researcher_id}'), ({ params }) => {
          expect(params.researcher_id).toBe(LATTES_ID);
          return HttpResponse.json(v2Fixtures['/researcher/{researcher_id}']);
        }),
        http.get(
          simccV2Url('/researcher/{researcher_id}/terms'),
          ({ params }) => {
            requestedTermsIds.push(String(params.researcher_id));
            return HttpResponse.json(
              v2Fixtures['/researcher/{researcher_id}/terms'],
            );
          },
        ),
        http.get(simccV2Url('/scholarship'), ({ request }) => {
          requestedScholarshipResearcherIds.push(
            new URL(request.url).searchParams.get('researcher_id'),
          );
          return HttpResponse.json(v2Fixtures['/scholarship']);
        }),
      ],
    });

    expect(
      await findByRole('heading', { name: researcher.name }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(requestedTermsIds).toContain(researcher.id);
      expect(requestedScholarshipResearcherIds).toContain(researcher.id);
    });
  }, 15000);

  it('exibe página 404 quando o pesquisador não existe', async () => {
    const { findByText } = await renderRoute(
      '/pesquisadores/00000000-0000-0000-0000-000000000404',
      {
        handlers: [
          http.get(simccV2Url('/researcher/{researcher_id}'), () =>
            HttpResponse.json(openApiErrors.notFound, { status: 404 }),
          ),
        ],
      },
    );

    expect(await findByText('Página não encontrada')).toBeInTheDocument();
  }, 15000);
});
