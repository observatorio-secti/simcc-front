import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { INDICATOR_PANELS } from '@/features/indicators/indicators-data';
import { server } from '@/test/msw/server';
import { renderRoute } from '@/test/render-route';

describe('Rota /indicadores', () => {
  it('lista os cartões dos painéis por padrão, sem renderizar iframe nem chamar /v2/metrics', async () => {
    const requested: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requested.push(request.url);
    };
    server.events.on('request:start', onRequest);

    await renderRoute('/indicadores');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Indicadores' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Sobre os painéis de indicadores' }),
    ).toBeInTheDocument();

    for (const panel of INDICATOR_PANELS) {
      const cardLink = screen.getByRole('link', {
        name: new RegExp(panel.title, 'i'),
      });
      expect(cardLink).toHaveAttribute(
        'href',
        `/indicadores?painel=${panel.id}`,
      );
      expect(screen.getByText(panel.description)).toBeInTheDocument();
      expect(screen.queryByTitle(panel.title)).not.toBeInTheDocument();
    }

    server.events.removeListener('request:start', onRequest);
    expect(requested.some((url) => url.includes('/metrics'))).toBe(false);
  });

  it('abre o painel de verdade ao clicar no cartão, oferece abertura em tela cheia e permite voltar', async () => {
    const { router, user } = await renderRoute('/indicadores');

    const busca = INDICATOR_PANELS[1]!;
    await user.click(
      await screen.findByRole('link', { name: new RegExp(busca.title, 'i') }),
    );

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ painel: busca.id });
    });

    expect(
      screen.getByRole('heading', { level: 1, name: busca.title }),
    ).toBeInTheDocument();

    const iframe = screen.getByTitle(busca.title);
    expect(iframe).toHaveAttribute('src', busca.src);
    expect(iframe).toHaveAttribute('loading', 'lazy');

    const links = screen.getAllByRole('link', {
      name: /Abrir em tela cheia/,
    });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute('href', busca.src);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    await user.click(screen.getByRole('link', { name: /Voltar aos painéis/i }));

    await waitFor(() => {
      expect(router.state.location.search).toEqual({});
    });
    expect(
      await screen.findByRole('heading', {
        name: 'Sobre os painéis de indicadores',
      }),
    ).toBeInTheDocument();
  });

  it('abre direto no painel indicado na URL', async () => {
    const pos = INDICATOR_PANELS[2]!;
    await renderRoute('/indicadores?painel=pos-graduacao');
    expect(
      await screen.findByRole('heading', { level: 1, name: pos.title }),
    ).toBeInTheDocument();
    expect(screen.getByTitle(pos.title)).toHaveAttribute('src', pos.src);
  });

  it('mostra os cartões quando o valor de painel na URL é inválido', async () => {
    await renderRoute('/indicadores?painel=xyz');
    expect(
      await screen.findByRole('heading', {
        name: 'Sobre os painéis de indicadores',
      }),
    ).toBeInTheDocument();
    for (const panel of INDICATOR_PANELS) {
      expect(screen.queryByTitle(panel.title)).not.toBeInTheDocument();
    }
  });
});
