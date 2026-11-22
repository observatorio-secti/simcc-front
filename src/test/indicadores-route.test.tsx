import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { INDICATOR_PANELS } from '@/features/indicators/indicators-data';
import { server } from '@/test/msw/server';
import { renderRoute } from '@/test/render-route';

describe('Rota /indicadores', () => {
  it('mostra o painel de produção por padrão, com link para o Power BI e sem chamar /v2/metrics', async () => {
    const requested: string[] = [];
    const onRequest = ({ request }: { request: Request }) => {
      requested.push(request.url);
    };
    server.events.on('request:start', onRequest);

    await renderRoute('/indicadores');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Indicadores' }),
    ).toBeInTheDocument();
    for (const panel of INDICATOR_PANELS) {
      expect(
        screen.getByRole('tab', { name: panel.title }),
      ).toBeInTheDocument();
    }

    const producao = INDICATOR_PANELS[0]!;
    const iframe = screen.getByTitle(producao.title);
    expect(iframe).toHaveAttribute('src', producao.src);
    expect(iframe).toHaveAttribute('loading', 'lazy');

    const links = screen.getAllByRole('link', { name: /Abrir no Power BI/ });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link).toHaveAttribute('href', producao.src);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    server.events.removeListener('request:start', onRequest);
    expect(requested.some((url) => url.includes('/metrics'))).toBe(false);
  });

  it('troca de painel pela aba e guarda a escolha na URL', async () => {
    const { router, user } = await renderRoute('/indicadores');

    await user.click(
      await screen.findByRole('tab', { name: 'Busca de informações' }),
    );

    await waitFor(() => {
      expect(router.state.location.search).toEqual({ painel: 'busca' });
    });
    expect(screen.getByTitle('Busca de informações')).toHaveAttribute(
      'src',
      INDICATOR_PANELS[1]!.src,
    );
  });

  it('abre direto no painel indicado na URL e ignora valor inválido', async () => {
    await renderRoute('/indicadores?painel=pos-graduacao');
    expect(
      await screen.findByRole('tab', {
        name: 'Programas de pós-graduação',
        selected: true,
      }),
    ).toBeInTheDocument();

    await renderRoute('/indicadores?painel=xyz');
    expect(
      (
        await screen.findAllByRole('tab', {
          name: 'Indicadores de produção',
          selected: true,
        })
      ).length,
    ).toBeGreaterThan(0);
  });
});
