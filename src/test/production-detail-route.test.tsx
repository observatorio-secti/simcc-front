import {
  configure,
  createEvent,
  fireEvent,
  getConfig,
  waitFor,
  within,
} from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { openApiErrors, v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';
import { renderRoute } from './render-route';

// Os overlays montam a lista, o perfil e a produção na mesma árvore; com a
// suíte inteira em paralelo, 1 s de `findBy`/`waitFor` é pouco.
const defaultAsyncTimeout = getConfig().asyncUtilTimeout;
beforeAll(() => configure({ asyncUtilTimeout: 5000 }));
afterAll(() => configure({ asyncUtilTimeout: defaultAsyncTimeout }));

const article = v2Fixtures['/production/article/{article_id}'].data;
const magazineText = v2Fixtures['/production/magazine-text/{item_id}'].data;
const eventWork = v2Fixtures['/production/event-work/{item_id}'].data;
const researcher = v2Fixtures['/researcher/{researcher_id}'].data;
const ARTICLE_PATH = `/producoes/artigo/${article.id}`;

describe('Rota /producoes/$kind/$id (T13)', () => {
  it('renderiza a página completa com o ProductionDetail no template E', async () => {
    const { container, findByRole, getByText } =
      await renderRoute(ARTICLE_PATH);

    expect(
      await findByRole('heading', { level: 1, name: article.title }),
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-slot="production-detail"][data-layout="profile"]',
      ),
    ).toBeInTheDocument();
    expect(getByText('Ficha técnica')).toBeInTheDocument();
    expect(getByText('Resumo')).toBeInTheDocument();
  }, 30000);

  // `magazine-text` e `event-work` dão 500 no backend local (pendência da
  // V4.1): a página é validada só com a API simulada.
  it.each([
    ['texto-em-revista', magazineText],
    ['trabalho-em-evento', eventWork],
  ])(
    'renderiza /producoes/%s com a API simulada',
    async (slug, item) => {
      const { findByRole } = await renderRoute(`/producoes/${slug}/${item.id}`);
      expect(
        await findByRole('heading', { level: 1, name: item.title }),
      ).toBeInTheDocument();
    },
    15000,
  );

  it('exibe 404 quando a produção não existe', async () => {
    const { findByText } = await renderRoute(
      '/producoes/artigo/00000000-0000-0000-0000-000000000404',
      {
        handlers: [
          http.get(simccV2Url('/production/article/{article_id}'), () =>
            HttpResponse.json(openApiErrors.notFound, { status: 404 }),
          ),
        ],
      },
    );
    expect(await findByText('Página não encontrada')).toBeInTheDocument();
  }, 30000);

  it('exibe 404 quando o tipo da URL não existe', async () => {
    const { findByText } = await renderRoute(
      `/producoes/article/${article.id}`,
    );
    expect(await findByText('Página não encontrada')).toBeInTheDocument();
  }, 30000);
});

describe('Overlay da produção sobre /busca (T13)', () => {
  it('abre a produção do card como overlay mascarado e fecha ao voltar', async () => {
    const { findByRole, getByText, queryByRole, router, user } =
      await renderRoute('/busca?tab=articles');

    const link = await findByRole('link', { name: article.title });
    expect(link).toHaveAttribute('href', ARTICLE_PATH);
    await user.click(link);

    const dialog = await findByRole('dialog');
    expect(
      await within(dialog).findByRole('heading', { name: article.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).toMatchObject({
      tab: 'articles',
      production: `article:${article.id}`,
    });
    expect(router.state.location.maskedLocation?.pathname).toBe(ARTICLE_PATH);
    // A lista continua montada por baixo do overlay.
    expect(getByText('Total de artigos')).toBeInTheDocument();

    router.history.back();
    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(router.state.location.search).not.toHaveProperty('production');
    expect(router.state.location.maskedLocation).toBeUndefined();
  }, 30000);

  it('Ctrl+clique segue o link da página completa', async () => {
    const { findByRole, queryByRole, router } = await renderRoute(
      '/busca?tab=articles',
    );
    const link = await findByRole('link', { name: article.title });

    let prevented: boolean | undefined;
    const spy = (event: Event) => {
      prevented = event.defaultPrevented;
      event.preventDefault(); // jsdom não navega
    };
    window.addEventListener('click', spy);
    const event = createEvent.click(link, { ctrlKey: true, button: 0 });
    fireEvent(link, event);
    window.removeEventListener('click', spy);

    expect(prevented).toBe(false);
    expect(queryByRole('dialog')).not.toBeInTheDocument();
    expect(router.state.location.search).not.toHaveProperty('production');
  }, 30000);

  it('aberta direto pela URL, fechar remove o parâmetro', async () => {
    const { findByRole, queryByRole, router, user } = await renderRoute(
      `/busca?tab=articles&production=article:${article.id}`,
    );
    const dialog = await findByRole('dialog');
    expect(
      await within(dialog).findByRole('heading', { name: article.title }),
    ).toBeInTheDocument();

    await user.click(
      within(dialog).getByRole('button', { name: 'Fechar produção' }),
    );
    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(router.state.location.pathname).toBe('/busca');
    expect(router.state.location.search).not.toHaveProperty('production');
  }, 30000);

  it('abre a produção sobre o perfil em overlay e voltar retorna ao perfil', async () => {
    const { findAllByRole, findByRole, router, user } =
      await renderRoute('/busca?q=solos');

    const [researcherLink] = await findAllByRole('link', {
      name: new RegExp(researcher.name),
    });
    await user.click(researcherLink!);
    const profile = await findByRole('dialog');
    await user.click(
      await within(profile).findByRole(
        'link',
        { name: article.title },
        { timeout: 5000 },
      ),
    );

    await waitFor(() => {
      expect(router.state.location.maskedLocation?.pathname).toBe(ARTICLE_PATH);
    });
    expect(router.state.location.search).toMatchObject({
      q: 'solos',
      researcher: researcher.id,
      production: `article:${article.id}`,
    });
    expect(
      await findByRole(
        'heading',
        { name: article.title, level: 2 },
        { timeout: 5000 },
      ),
    ).toBeInTheDocument();

    router.history.back();
    await waitFor(() => {
      expect(router.state.location.search).not.toHaveProperty('production');
    });
    // O perfil continua aberto e a barra volta a mostrar o perfil.
    expect(router.state.location.search).toMatchObject({
      researcher: researcher.id,
    });
    expect(router.state.location.maskedLocation?.pathname).toBe(
      `/pesquisadores/${researcher.id}`,
    );
    expect(
      await findByRole('heading', { name: researcher.name }, { timeout: 5000 }),
    ).toBeInTheDocument();
  }, 30000);
});

describe('Overlay da produção sobre /pesquisadores/$id (T13)', () => {
  it('abre a produção como overlay mascarado e fecha ao voltar', async () => {
    const { findByRole, queryByRole, router, user } = await renderRoute(
      `/pesquisadores/${researcher.id}?tab=articles`,
    );

    const link = await findByRole('link', { name: article.title });
    expect(link).toHaveAttribute('href', ARTICLE_PATH);
    await user.click(link);

    const dialog = await findByRole('dialog');
    expect(
      await within(dialog).findByRole('heading', { name: article.title }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe(
      `/pesquisadores/${researcher.id}`,
    );
    expect(router.state.location.search).toMatchObject({
      production: `article:${article.id}`,
    });
    expect(router.state.location.maskedLocation?.pathname).toBe(ARTICLE_PATH);

    router.history.back();
    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(router.state.location.search).not.toHaveProperty('production');
    expect(router.state.location.maskedLocation).toBeUndefined();
  }, 30000);

  it('o botão fechar volta para o perfil', async () => {
    const { findByRole, queryByRole, router, user } = await renderRoute(
      `/pesquisadores/${researcher.id}`,
    );
    await user.click(await findByRole('link', { name: article.title }));
    const dialog = await findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: 'Fechar produção' }),
    );
    await waitFor(() => {
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(router.state.location.pathname).toBe(
      `/pesquisadores/${researcher.id}`,
    );
    expect(router.state.location.search).not.toHaveProperty('production');
  }, 30000);
});
