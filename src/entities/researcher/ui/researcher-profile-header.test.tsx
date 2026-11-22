import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ResearcherDetail } from '../model';
import { ResearcherProfileHeader } from './researcher-profile-header';

const longBio =
  'Graduação em Engenharia Elétrica e doutorado em Engenharia de Computação. ' +
  'Atua em robótica móvel, controle preditivo e visão computacional aplicada a veículos autônomos e inspeção de subestações elétricas. ' +
  'Coordena projetos de pesquisa e desenvolvimento em parceria com a indústria e orienta estudantes de iniciação científica, mestrado e doutorado em sistemas inteligentes.';

const sampleDetail: ResearcherDetail = {
  id: 'res-1',
  name: 'Helena Duarte Ramos',
  image_url: 'https://exemplo.br/helena.jpg',
  graduation: 'Pós-Doutorado',
  classification: 'A',
  lattes_update: '2026-10-22T03:00:00Z',
  abstract: longBio,
  affiliations: [
    {
      institution: {
        id: 'inst-1',
        name: 'Universidade Federal da Bahia',
        acronym: 'UFBA',
      },
      city: { id: 'city-1', name: 'Salvador' },
    },
  ],
  identifiers: {
    lattes_id: '1234567890123456',
    orcid: '0000-0001-2345-6789',
    scopus: '57200012345',
    openalex: 'A12345',
  },
  graduate_programs: [],
  research_groups: [],
};

describe('ResearcherProfileHeader', () => {
  it('exibe dados do pesquisador, badges de áreas, links externos e ações', () => {
    render(
      <ResearcherProfileHeader
        researcher={sampleDetail}
        areas={['Ciências Exatas e da Terra', 'Engenharias']}
        active
        actions={<button type="button">Compartilhar</button>}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Helena Duarte Ramos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Universidade Federal da Bahia'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Atualização do Lattes: 22/10/2026'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Compartilhar' }),
    ).toBeInTheDocument();

    // Área clara (Exatas) usa badge outline com dot; Engenharias usa fundo sólido.
    const exatas = screen.getByText('Ciências Exatas e da Terra');
    expect(exatas).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByText('Engenharias')).toHaveClass('bg-area-engenharias');

    expect(screen.getByText('Pós-Doutorado')).toBeInTheDocument();
    expect(screen.getByText('Salvador')).toBeInTheDocument();

    const orcidLink = screen.getByRole('link', {
      name: /Orcid: 0000-0001-2345-6789/,
    });
    expect(orcidLink).toHaveAttribute(
      'href',
      'https://orcid.org/0000-0001-2345-6789',
    );
    expect(orcidLink).toHaveAttribute('target', '_blank');

    expect(screen.getByRole('link', { name: 'Scopus' })).toHaveAttribute(
      'href',
      'https://www.scopus.com/authid/detail.uri?authorId=57200012345',
    );
    expect(
      screen.getByRole('link', { name: 'Currículo Lattes' }),
    ).toHaveAttribute('href', 'https://lattes.cnpq.br/1234567890123456');
    expect(
      screen.getByRole('link', { name: 'Pesquisar no LinkedIn' }),
    ).toHaveAttribute(
      'href',
      'https://www.linkedin.com/search/results/people/?keywords=Helena%20Duarte%20Ramos',
    );
  });

  it('destaca termo no resumo e alterna expansão em textos longos', () => {
    render(
      <ResearcherProfileHeader
        researcher={sampleDetail}
        highlightQuery="robotica"
        searchType="article"
      />,
    );

    const highlighted = screen.getByText('robótica');
    expect(highlighted.tagName).toBe('STRONG');
    expect(highlighted).toHaveClass('text-search-article');

    const toggle = screen.getByRole('button', { name: 'Expandir resumo' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(toggle);
    expect(
      screen.getByRole('button', { name: 'Recolher resumo' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('omite identificadores inválidos e botão expandir em resumos curtos', () => {
    render(
      <ResearcherProfileHeader
        researcher={{
          ...sampleDetail,
          abstract: 'Resumo curto.',
          identifiers: {
            lattes_id: '',
            orcid: '0',
            scopus: null,
          },
        }}
      />,
    );

    expect(
      screen.queryByRole('link', { name: /Orcid/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Scopus' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Currículo Lattes' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /resumo/i }),
    ).not.toBeInTheDocument();
  });
});
