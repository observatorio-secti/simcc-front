import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgramCard } from './program-card';

describe('ProgramCard', () => {
  it('renderiza card plano sc-entity com instituição, cidade, conceito e contagens', () => {
    render(
      <ProgramCard
        program={{
          id: 'prog-saude',
          name: 'Programa de Pós-Graduação em Saúde Coletiva',
          acronym: 'PPGSC',
          area: 'SAÚDE COLETIVA',
          modality: 'ACADÊMICO',
          rating: '5',
          city: 'FEIRA DE SANTANA',
          state: 'BA',
          institution: {
            id: 'inst-uefs',
            name: 'Universidade Estadual de Feira de Santana',
            acronym: 'UEFS',
          },
          counts: { researchers: 24 },
          research_lines: [
            {
              name: 'Epidemiologia',
              area: 'SAÚDE COLETIVA',
              start_year: 2011,
              end_year: null,
            },
            {
              name: 'Políticas de Saúde',
              area: 'SAÚDE COLETIVA',
              start_year: 2014,
              end_year: null,
            },
          ],
        }}
      />,
    );

    const card = screen.getByRole('link', {
      name: /Programa de Pós-Graduação em Saúde Coletiva/i,
    });
    expect(card).toHaveAttribute('href', '/pos-graduacao/prog-saude');
    expect(card).not.toHaveClass('shadow-sm', 'shadow-md', 'shadow-lg');
    expect(screen.getByText('PPGSC')).toBeInTheDocument();
    expect(screen.getByText('Conceito 5')).toBeInTheDocument();
    expect(screen.getByText('Acadêmico')).toBeInTheDocument();
    expect(
      screen.getByText('Saúde coletiva').closest('[data-slot="badge"]'),
    ).toHaveClass('bg-area-saude');
    expect(screen.getByText('UEFS')).toBeInTheDocument();
    expect(screen.getByText('Feira de Santana, BA')).toBeInTheDocument();
    expect(screen.getByText('24 docentes')).toBeInTheDocument();
    expect(screen.getByText('2 linhas de pesquisa')).toBeInTheDocument();
  });

  it('usa Badge outline com Dot para área de cor clara (Exatas) conforme DESIGN.md §2.4', () => {
    render(
      <ProgramCard
        program={{
          id: 'prog-comp',
          name: 'Programa de Pós-Graduação em Ciência da Computação',
          area: 'CIÊNCIA DA COMPUTAÇÃO',
          modality: 'ACADÊMICO',
          rating: '6',
        }}
        institutionLabel="UFBA"
        researchersCount={38}
      />,
    );

    const areaText = screen.getByText('Ciência da computação');
    const badge = areaText.closest('[data-slot="badge"]');
    expect(badge).toHaveAttribute('data-variant', 'outline');
    expect(badge).not.toHaveClass('bg-area-exatas');
    expect(badge?.querySelector('[data-slot="dot"]')).toHaveClass(
      'bg-area-exatas',
    );
    expect(screen.getByText('UFBA')).toBeInTheDocument();
    expect(screen.getByText('38 docentes')).toBeInTheDocument();
  });

  it('omite campos opcionais ausentes sem exibir placeholders quebrados', () => {
    render(
      <ProgramCard
        program={{
          id: 'prog-min',
          name: 'Programa Sem Metadados Extras',
          acronym: null,
          area: null,
          modality: null,
          rating: null,
          city: null,
          state: null,
        }}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'Programa Sem Metadados Extras' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Conceito/)).not.toBeInTheDocument();
    expect(screen.queryByText(/docente/)).not.toBeInTheDocument();
  });
});
