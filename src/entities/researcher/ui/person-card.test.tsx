import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ResearcherSummary } from '../model';
import { PersonCard } from './person-card';

const baseResearcher: ResearcherSummary = {
  id: 'res-1',
  researcher_id: 'legacy-ignored',
  name: 'Helena Duarte Ramos',
  image_url: 'https://exemplo.br/fotos/helena.jpg',
  image: 'legacy-image-ignored',
  classification: 'A',
  graduation: 'Doutorado',
  affiliations: [
    {
      institution: {
        id: 'inst-1',
        name: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
      },
    },
    {
      institution: {
        id: 'inst-2',
        name: 'Universidade Estadual de Santa Cruz',
        acronym: 'UESC',
      },
    },
  ],
  matches: {
    total: 37,
    by_type: { article: 37 },
    items: [],
  },
};

describe('PersonCard', () => {
  it('renderiza link com id, classificação, evidências na cor do tipo e siglas', () => {
    render(<PersonCard researcher={baseResearcher} searchType="article" />);

    const link = screen.getByRole('link', { name: /Helena Duarte Ramos/ });
    expect(link).toHaveAttribute(
      'href',
      expect.stringMatching(/\/pesquisadores\/res-1$/),
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    const evidenceBadge = screen.getByText('37 evidências');
    expect(evidenceBadge).toHaveClass('bg-search-article');
    expect(screen.getByText('UFBA / UESC')).toBeInTheDocument();
  });

  it('usa singular para 1 evidência e faz fallback quando imagem falha', () => {
    const { container } = render(
      <PersonCard
        researcher={{
          ...baseResearcher,
          classification: null,
          matches: { total: 1, by_type: {}, items: [] },
        }}
      />,
    );

    expect(screen.getByText('1 evidência')).toHaveClass('bg-search-profile');
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    if (img) fireEvent.error(img);
    expect(container.querySelector('img')).toBeNull();
  });

  it('suporta layout em lista sem evidências ou foto', () => {
    render(
      <PersonCard
        layout="list"
        researcher={{
          ...baseResearcher,
          image_url: '',
          matches: null,
        }}
      />,
    );

    const link = screen.getByRole('link', { name: /Helena Duarte Ramos/ });
    expect(link).toHaveAttribute('data-layout', 'list');
    expect(screen.queryByText(/evidência/)).not.toBeInTheDocument();
  });
});
