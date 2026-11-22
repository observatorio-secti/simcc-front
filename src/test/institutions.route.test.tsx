import { fireEvent, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { v2Fixtures } from '@/test/msw/fixtures';
import { simccV2Url } from '@/test/msw/handlers';
import { renderRoute } from '@/test/render-route';

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

describe('Rotas de instituições (T4)', () => {
  it('renderiza a listagem de instituições com total e busca navegável na URL', async () => {
    const capturedQueries: string[] = [];

    const { router, user } = await renderRoute('/instituicoes', {
      handlers: [
        http.get(simccV2Url('/institution'), ({ request }) => {
          const url = new URL(request.url);
          capturedQueries.push(url.searchParams.get('q') ?? '');

          if (url.searchParams.get('q') === 'inexistente') {
            return HttpResponse.json({
              ...v2Fixtures['/institution'],
              data: [],
              pagination: {
                ...v2Fixtures['/institution'].pagination,
                total_items: 0,
                total_pages: 0,
                has_next: false,
                has_prev: false,
              },
            });
          }

          return HttpResponse.json(v2Fixtures['/institution']);
        }),
      ],
    });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Instituições' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Universidade Estadual de Santa Cruz'),
    ).toBeInTheDocument();
    expect(screen.getByText('Total de instituições')).toBeInTheDocument();

    const searchInput = screen.getByRole('searchbox', {
      name: /pesquisar instituições/i,
    });
    await user.type(searchInput, 'inexistente{Enter}');

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('q=inexistente');
    });

    expect(
      await screen.findByText('Nenhuma instituição encontrada'),
    ).toBeInTheDocument();
    expect(capturedQueries).toContain('inexistente');

    const clearButtons = screen.getAllByRole('button', {
      name: 'Limpar busca',
    });
    await user.click(clearButtons[0]!);
    await waitFor(() => {
      expect(router.state.location.searchStr).not.toContain('q=');
    });
  });

  it('alterna visualização entre grade e lista na URL e navega para o detalhe', async () => {
    const { router, user } = await renderRoute('/instituicoes');

    const listToggle = screen.getByRole('radio', {
      name: 'Visualização em lista',
    });
    await user.click(listToggle);

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('view=list');
    });

    const link = screen.getByRole('link', {
      name: /Universidade Estadual de Santa Cruz/i,
    });
    await user.click(link);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/instituicoes/3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
      );
    });

    expect(
      await screen.findByRole(
        'heading',
        {
          level: 1,
          name: 'Universidade Estadual de Santa Cruz',
        },
        { timeout: 4000 },
      ),
    ).toBeInTheDocument();
  });

  it('renderiza detalhe da instituição com pesquisadores e alterna para aba de programas na URL', async () => {
    const { router, user } = await renderRoute(
      '/instituicoes/3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
    );

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Universidade Estadual de Santa Cruz',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Universidade pública estadual localizada em Ilhéus, Bahia.',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('412').length).toBeGreaterThan(0);
    expect(screen.getAllByText('18').length).toBeGreaterThan(0);
    expect(screen.getAllByText('64').length).toBeGreaterThan(0);
    expect(screen.getAllByText('53').length).toBeGreaterThan(0);
    expect(screen.getAllByText('21').length).toBeGreaterThan(0);

    // Tooltip de detalhamento de bolsistas ao passar o mouse
    const scholarshipCardTrigger = screen.getByLabelText(
      /Bolsistas de produtividade: 64/i,
    );
    await user.hover(scholarshipCardTrigger);
    expect(
      await screen.findByText('Detalhamento por tipo'),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('Produtividade em Pesquisa — Nível 2').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('48').length).toBeGreaterThan(0);
    expect(
      screen.getAllByText('Produtividade em Pesquisa — Nível 1A').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText('16').length).toBeGreaterThan(0);
    await user.unhover(scholarshipCardTrigger);

    expect(await screen.findByText('Ana Maria Silva')).toBeInTheDocument();

    const programsTab = screen.getByRole('tab', {
      name: /Programas de pós-graduação/i,
    });
    await user.click(programsTab);

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('tab=programs');
    });

    expect(
      await screen.findByText(
        /Programa de Pós-Graduação em Modelagem Computacional/i,
      ),
    ).toBeInTheDocument();
  });
  it('não exibe aba de painel nem sigla em Informações gerais, e lista produções da instituição nas abas diretas', async () => {
    const capturedInstitutionIds: string[] = [];

    const { router, user } = await renderRoute(
      '/instituicoes/3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
      {
        handlers: [
          http.get(simccV2Url('/production/article'), ({ request }) => {
            const url = new URL(request.url);
            capturedInstitutionIds.push(
              ...url.searchParams.getAll('institution_id'),
            );
            return HttpResponse.json(v2Fixtures['/production/article']);
          }),
        ],
      },
    );

    expect(
      screen.queryByRole('tab', { name: 'Painel' }),
    ).not.toBeInTheDocument();

    // Sigla aparece no cabeçalho (acima do nome), mas não no card lateral "Informações gerais"
    const aside = screen.getByRole('complementary', {
      name: 'Informações gerais',
    });
    expect(aside).not.toHaveTextContent('Sigla');
    expect(screen.getByText('UESC')).toBeInTheDocument();

    const articlesTab = await screen.findByRole('tab', {
      name: 'Artigos',
    });
    await user.click(articlesTab);

    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('tab=articles');
    });

    await waitFor(() => {
      expect(capturedInstitutionIds).toContain(
        '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
      );
    });

    const articleLink = await screen.findByRole('link', {
      name: /Redes neurais aplicadas a solos/i,
    });
    expect(articleLink).toBeInTheDocument();

    await user.click(articleLink);
    await waitFor(() => {
      expect(router.state.location.searchStr).toContain('production=article');
    });
  });

  it('renderiza o cover quando válido e oculta a imagem se falhar ao carregar', async () => {
    const coverUrl = 'https://cdn.example.org/covers/uesc.jpg';
    const baseDetail = v2Fixtures['/institution/{institution_id}'];

    const { container } = await renderRoute(
      '/instituicoes/3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
      {
        handlers: [
          http.get(simccV2Url('/institution/{institution_id}'), () =>
            HttpResponse.json({
              ...baseDetail,
              data: {
                ...baseDetail.data,
                cover: coverUrl,
              },
            }),
          ),
        ],
      },
    );

    const coverImg = container.querySelector(`img[src="${coverUrl}"]`);
    expect(coverImg).toBeInTheDocument();

    fireEvent.error(coverImg!);

    await waitFor(() => {
      expect(
        container.querySelector(`img[src="${coverUrl}"]`),
      ).not.toBeInTheDocument();
    });
  });
});
