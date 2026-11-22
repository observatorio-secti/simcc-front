import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { ResearcherDetail } from '@/entities/researcher/model';
import type { Scholarship } from '@/entities/scholarship/model';
import { ProfileSidebar } from './profile-sidebar';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const baseResearcher: ResearcherDetail = {
  id: 'res-1',
  name: 'Helena Duarte Ramos',
  image_url: '',
  classification: 'A+',
  affiliations: [],
  identifiers: { lattes_id: '1234567890123456' },
  bibliometrics: {
    h_index: 5,
    cited_by_count: 121,
    i10_index: 3,
  },
  graduate_programs: [],
  research_groups: [],
};

const dtScholarship: Scholarship = {
  id: 'sch-1',
  researcher: { id: 'res-1', name: 'Helena Duarte Ramos' },
  modality: 'Produtividade Desen. Tec. e Extensão Inovadora - 2',
  category_level: '2',
  funding_program: 'CNPq',
  call_title: 'Chamada CNPq 01/2025',
  institute: 'UFBA',
};

describe('ProfileSidebar', () => {
  it('exibe métricas bibliométricas, bolsa destacada sem duplicar nível e índice do pesquisador com cor do nível', () => {
    render(
      <ProfileSidebar
        researcher={baseResearcher}
        scholarships={[dtScholarship]}
        terms={[]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Informações gerais' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Índice H no OpenAlex:/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText(/Citações:/)).toBeInTheDocument();
    expect(screen.getByText('121')).toBeInTheDocument();
    expect(screen.getByText(/Índice i10:/)).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Bolsa formatada sem duplicação "- 2 – 2" e com borda da modalidade DT
    expect(
      screen.getByText('Produtividade Desen. Tec. e Extensão Inovadora'),
    ).toBeInTheDocument();
    expect(screen.getByText('Nível 2')).toBeInTheDocument();
    expect(
      screen.queryByText(/Extensão Inovadora - 2/),
    ).not.toBeInTheDocument();
    const scholarshipCard = screen
      .getByText('Produtividade Desen. Tec. e Extensão Inovadora')
      .closest('div');
    expect(scholarshipCard).toHaveClass('border-l-bolsa-DT');

    // Índice do pesquisador com link para /indice-pesquisador e cor da main/tokens
    const indexLink = screen.getByRole('link', {
      name: /Índice do pesquisador/i,
    });
    expect(indexLink).toHaveAttribute('href', '/indice-pesquisador');
    expect(screen.getByText('Índice do pesquisador').parentElement).toHaveClass(
      'bg-eng-blue',
      'text-white',
    );
    const levelBadge = screen.getByText('A+');
    expect(levelBadge).toHaveClass('bg-index-a-plus', 'text-white');
  });

  it('usa texto escuro quando o nível do índice tem fundo claro', () => {
    render(
      <ProfileSidebar
        researcher={{ ...baseResearcher, classification: 'B' }}
        scholarships={[]}
        terms={[]}
      />,
    );

    const levelBadge = screen.getByText('B');
    expect(levelBadge).toHaveClass('bg-index-b', 'text-neutral-900');
  });
});
