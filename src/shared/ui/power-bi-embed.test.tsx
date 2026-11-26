import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PowerBiEmbed } from './power-bi-embed';

const SRC = 'https://app.powerbi.com/view?r=abc';

describe('PowerBiEmbed', () => {
  it('embute o painel em iframe acessível e oferece o link em nova aba', () => {
    render(
      <PowerBiEmbed
        src={SRC}
        title="Painel de teste"
        description="Descrição do painel"
        previewSrc="/preview.png"
      />,
    );

    const iframe = screen.getByTitle('Painel de teste');
    expect(iframe.tagName).toBe('IFRAME');
    expect(iframe).toHaveAttribute('src', SRC);
    expect(iframe).toHaveAttribute('loading', 'lazy');
    expect(iframe).toHaveAttribute('allowfullscreen');

    // Link no topo (telas largas) e no card (telas estreitas)
    const links = screen.getAllByRole('link', {
      name: /Abrir em tela cheia/,
    });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', SRC);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
    expect(
      screen.getByAltText('Pré-visualização do painel Painel de teste'),
    ).toBeInTheDocument();
    expect(screen.getByText('Descrição do painel')).toBeInTheDocument();
  });

  it('mostra aviso sem iframe quando o painel está indisponível', () => {
    render(<PowerBiEmbed src={SRC} title="Painel X" unavailable />);

    expect(screen.queryByTitle('Painel X')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Painel X: painel indisponível no momento/),
    ).toBeInTheDocument();
  });
});
