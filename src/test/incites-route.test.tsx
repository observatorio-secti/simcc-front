import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { INCITES_PANELS } from '@/features/incites/incites-data';
import { renderRoute } from './render-route';

describe('Rota /incites', () => {
  it('carrega a rota pública /incites com breadcrumb e painéis', async () => {
    await renderRoute('/incites');

    const breadcrumb = screen.getByRole('navigation', {
      name: /breadcrumb/i,
    });
    expect(breadcrumb).toHaveTextContent('Página inicial');
    expect(breadcrumb).toHaveTextContent('Institutos de CT&I');

    expect(
      screen.getByRole('heading', {
        name: 'Institutos de Ciência, Inovação e Tecnologia (INCITES)',
      }),
    ).toBeInTheDocument();

    for (const panel of INCITES_PANELS) {
      expect(
        screen.getByRole('link', { name: new RegExp(panel.title, 'i') }),
      ).toHaveAttribute('href', panel.href);
    }
  });
});
