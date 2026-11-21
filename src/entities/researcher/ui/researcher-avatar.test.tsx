import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResearcherAvatar } from './researcher-avatar';

describe('ResearcherAvatar', () => {
  it('renderiza imagem com alt quando não é decorativo e faz fallback em erro', () => {
    const { rerender } = render(
      <ResearcherAvatar
        name="Helena Duarte Ramos"
        imageUrl="https://exemplo.br/helena.jpg"
        size="lg"
      />,
    );

    const img = screen.getByRole('img', { name: 'Helena Duarte Ramos' });
    expect(img).toHaveAttribute('src', 'https://exemplo.br/helena.jpg');

    fireEvent.error(img);
    expect(
      screen.getByRole('img', { name: 'Helena Duarte Ramos' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: 'Helena Duarte Ramos' })?.tagName,
    ).toBe('SPAN');

    rerender(
      <ResearcherAvatar
        name="Helena Duarte Ramos"
        imageUrl="https://exemplo.br/nova-foto.jpg"
        size="lg"
      />,
    );
    expect(
      screen.getByRole('img', { name: 'Helena Duarte Ramos' }).tagName,
    ).toBe('IMG');
  });

  it('mostra iniciais no tamanho pequeno sem foto e oculta quando decorativo', () => {
    const { container } = render(
      <ResearcherAvatar name="Caio Menezes Barreto" size="sm" decorative />,
    );

    expect(screen.getByText('CB')).toBeInTheDocument();
    const root = container.querySelector('[data-slot="researcher-avatar"]');
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveClass('rounded-full');
  });
});
