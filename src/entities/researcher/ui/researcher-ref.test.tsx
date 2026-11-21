import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResearcherRef } from './researcher-ref';

describe('ResearcherRef', () => {
  it('renderiza link para o perfil do pesquisador com nome e meta', () => {
    render(
      <ResearcherRef
        researcher={{ id: 'res-42', name: 'Júlia Andrade Souto' }}
        meta="UNEB"
      />,
    );

    const link = screen.getByRole('link', { name: /Júlia Andrade Souto/ });
    expect(link).toHaveAttribute(
      'href',
      expect.stringMatching(/\/pesquisadores\/res-42$/),
    );
    expect(screen.getByText('UNEB')).toBeInTheDocument();
  });

  it('renderiza avatar pequeno opcional sem duplicar o nome acessível', () => {
    render(
      <ResearcherRef
        researcher={{ id: 'res-7', name: 'Tomás Ribeiro Lima' }}
        showAvatar
      />,
    );

    expect(
      screen.getByRole('link', { name: 'Tomás Ribeiro Lima' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('TL').closest('[aria-hidden="true"]'),
    ).not.toBeNull();
  });
});
