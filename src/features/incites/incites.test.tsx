import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { INCITES_PANELS } from './incites-data';
import { IncitesPage } from './incites-page';

describe('IncitesPage', () => {
  it('renderiza título, card de introdução e os 3 cards de painéis com links externos', () => {
    render(<IncitesPage />);

    expect(
      screen.getByRole('heading', {
        name: 'Institutos de Ciência, Inovação e Tecnologia (INCITES)',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Sobre os painéis INCITES' }),
    ).toBeInTheDocument();

    for (const panel of INCITES_PANELS) {
      const link = screen.getByRole('link', {
        name: new RegExp(panel.title, 'i'),
      });
      expect(link).toHaveAttribute('href', panel.href);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(screen.getByText(panel.description)).toBeInTheDocument();
    }
  });
});
