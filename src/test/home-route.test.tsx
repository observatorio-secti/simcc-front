import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';
import { simccV2Url } from '@/test/msw/handlers';
import { renderRoute } from '@/test/render-route';

beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => undefined;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => undefined;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined;
  }
});

describe('HomePage e SearchBar (rota "/")', () => {
  it('renderiza o hero de busca e palavras sugeridas sem os atalhos de páginas', async () => {
    await renderRoute('/');

    expect(
      screen.getByRole('heading', { level: 1, name: /pesquisar um tema/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /saiba como utilizar a plataforma/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('combobox', { name: /buscar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /robótica/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /explore por página/i }),
    ).not.toBeInTheDocument();
  });

  it('busca sugestões em /v2/suggestion ao digitar e navega para /busca ao selecionar', async () => {
    let capturedQuery: string | null = null;
    let capturedSourceTypes: string[] = [];

    const { router, user } = await renderRoute('/', {
      handlers: [
        http.get(simccV2Url('/suggestion'), ({ request }) => {
          const url = new URL(request.url);
          capturedQuery = url.searchParams.get('q');
          capturedSourceTypes = url.searchParams.getAll('source_type');
          return HttpResponse.json({
            data: [
              {
                term: 'redes neurais',
                frequency: 42,
                source_types: ['article', 'abstract'],
              },
              {
                term: 'redes complexas',
                frequency: 15,
                source_types: ['article'],
              },
            ],
            meta: { total: 2 },
          });
        }),
      ],
    });

    const input = screen.getByRole('combobox', { name: /buscar/i });
    await user.type(input, 'redes');

    const option = await screen.findByRole('option', {
      name: /redes neurais/i,
    });
    expect(capturedQuery).toBe('redes');
    expect(capturedSourceTypes).toEqual([]);

    await user.click(option);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/busca');
    });
    expect(router.state.location.searchStr).toContain('q=redes+neurais');
  });

  it('envia source_type ao escolher Artigos e submete com type=article', async () => {
    let capturedSourceTypes: string[] = [];

    const { router, user } = await renderRoute('/', {
      handlers: [
        http.get(simccV2Url('/suggestion'), ({ request }) => {
          const url = new URL(request.url);
          capturedSourceTypes = url.searchParams.getAll('source_type');
          return HttpResponse.json({
            data: [
              {
                term: 'bioinformática',
                frequency: 19,
                source_types: ['article'],
              },
            ],
            meta: { total: 1 },
          });
        }),
      ],
    });

    await user.click(screen.getByRole('combobox', { name: /tipo de busca/i }));
    await user.click(screen.getByRole('option', { name: /^artigos$/i }));

    const input = screen.getByRole('combobox', { name: /buscar/i });
    await user.type(input, 'bio');

    await screen.findByRole('option', { name: /bioinformática/i });
    expect(capturedSourceTypes).toEqual(['article']);

    await user.click(screen.getByRole('button', { name: /^pesquisar$/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/busca');
    });
    expect(router.state.location.searchStr).toContain('q=bio');
    expect(router.state.location.searchStr).toContain('type=article');
  });

  it('navega para /busca ao clicar em uma palavra sugerida', async () => {
    const { router, user } = await renderRoute('/');

    await user.click(screen.getByRole('button', { name: /saúde coletiva/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/busca');
    });
    expect(router.state.location.searchStr).toContain('q=sa%C3%BAde+coletiva');
  });

  it('não navega ao submeter busca vazia e limpa o campo com o botão limpar', async () => {
    const { router, user } = await renderRoute('/');

    await user.click(screen.getByRole('button', { name: /^pesquisar$/i }));
    expect(router.state.location.pathname).toBe('/');

    const input = screen.getByRole('combobox', { name: /buscar/i });
    await user.type(input, 'energia');
    expect(input).toHaveValue('energia');

    await user.click(screen.getByRole('button', { name: /limpar busca/i }));
    expect(input).toHaveValue('');
  });
});
