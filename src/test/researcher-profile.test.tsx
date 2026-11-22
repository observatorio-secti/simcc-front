import { waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { openApiErrors, v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import { renderRoute } from './render-route';

const RESEARCHER_ID = v2Fixtures['/researcher/{researcher_id}'].data.id;

describe('Rota /pesquisadores/$id (T3)', () => {
  it('renderiza perfil completo com cabeçalho, sidebar, nuvem de termos, bolsas e artigos', async () => {
    const { findByRole, findByText, getByText } = await renderRoute(
      `/pesquisadores/${RESEARCHER_ID}`,
    );

    const researcher = v2Fixtures['/researcher/{researcher_id}'].data;
    expect(
      await findByRole('heading', { name: researcher.name }),
    ).toBeInTheDocument();

    // Sidebar: informações gerais, bolsa (/v2/scholarship) e nuvem de termos (/v2/researcher/{id}/terms)
    expect(await findByText('Produtividade em Pesquisa')).toBeInTheDocument();
    expect(await findByText('solos')).toBeInTheDocument();
    expect(await findByText('redes')).toBeInTheDocument();

    // Gráfico Qualis e lista de artigos
    expect(
      getByText('Gráfico de quantidade total por Qualis'),
    ).toBeInTheDocument();
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
