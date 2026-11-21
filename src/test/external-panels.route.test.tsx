import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EXTERNAL_PANEL_GROUPS } from '@/features/external-panels/external-panels-data';
import { renderRoute } from '@/test/render-route';

describe('Rota /paineis-dados-externos', () => {
  it('renderiza a página na moldura pública com o breadcrumb e as seções', async () => {
    const { router } = await renderRoute('/paineis-dados-externos');

    expect(router.state.location.pathname).toBe('/paineis-dados-externos');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /painéis de dados externos/i,
      }),
    ).toBeInTheDocument();

    for (const group of EXTERNAL_PANEL_GROUPS) {
      expect(
        screen.getByRole('heading', { level: 2, name: group.title }),
      ).toBeInTheDocument();

      for (const item of group.items) {
        const link = screen.getByRole('link', {
          name: `Acessar ${item.title} (abre em nova aba)`,
        });
        expect(link).toHaveAttribute('href', item.url);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('usa apenas URLs HTTPS válidas sem proxies institucionais legados', () => {
    const allItems = EXTERNAL_PANEL_GROUPS.flatMap((group) => group.items);
    for (const item of allItems) {
      expect(item.url).toMatch(/^https:\/\//);
      expect(item.url).not.toContain('ez27.periodicos.capes.gov.br');
      expect(item.url).not.toContain('shibShireURL');
      expect(item.url).not.toContain('LoginController');
    }
  });

  it('copia o link do painel para a área de transferência ao clicar em copiar', async () => {
    const { user } = await renderRoute('/paineis-dados-externos');
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    const firstPanel = EXTERNAL_PANEL_GROUPS[0]?.items[0];
    expect(firstPanel).toBeDefined();
    if (!firstPanel) return;

    await user.click(
      screen.getByRole('button', {
        name: `Copiar link de ${firstPanel.title}`,
      }),
    );

    expect(writeText).toHaveBeenCalledWith(firstPanel.url);
  });

  it('volta para a página inicial ao clicar em Voltar sem histórico anterior', async () => {
    const { router, user } = await renderRoute('/paineis-dados-externos');

    await user.click(screen.getByRole('button', { name: /voltar/i }));

    expect(router.state.location.pathname).toBe('/');
  });
});
