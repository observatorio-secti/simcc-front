import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Scholarship } from '../model';
import { ScholarshipCard, ScholarshipModalityBadge } from './scholarship-card';

const scholarship: Scholarship = {
  id: '6e5d4c3b-2a1f-4098-b765-43210fedcba9',
  researcher: {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Maria da Silva',
  },
  modality: 'Produtividade em Pesquisa - 1A',
  category_level: '1A',
  call_title: 'Chamada CNPq 09/2023',
  funding_program: 'Bolsas no País',
  institute: 'Universidade Federal da Bahia - BA - Brasil',
  aid_quantity: null,
  scholarship_quantity: 1,
};

describe('ScholarshipCard', () => {
  it('mostra pesquisador com link, modalidade, nível, instituição e chamada', () => {
    const { container } = render(<ScholarshipCard scholarship={scholarship} />);

    const card = container.querySelector('[data-slot="scholarship-card"]');
    expect(card).toHaveClass('border-l-bolsa-PQ');
    expect(
      screen.getByRole('link', { name: 'Maria da Silva' }),
    ).toHaveAttribute('href', `/pesquisadores/${scholarship.researcher.id}`);
    expect(screen.getByText('Produtividade em Pesquisa')).toBeInTheDocument();
    expect(screen.getByText('Nível 1A')).toBeInTheDocument();
    expect(
      screen.getByText('Universidade Federal da Bahia - BA - Brasil'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Bolsas no País · Chamada CNPq 09/2023'),
    ).toBeInTheDocument();
    expect(screen.getByText('1 bolsa')).toBeInTheDocument();
  });

  it('usa a cor neutra e omite blocos vazios fora do dicionário', () => {
    const { container } = render(
      <ScholarshipCard
        scholarship={{
          ...scholarship,
          modality: 'Iniciação científica',
          category_level: null,
          institute: null,
          call_title: null,
          funding_program: null,
          scholarship_quantity: null,
        }}
      />,
    );

    const card = container.querySelector('[data-slot="scholarship-card"]');
    expect(card).toHaveClass('border-l-neutral-300');
    expect(screen.queryByText(/^Nível/)).not.toBeInTheDocument();
    expect(screen.getByText('Não informado')).toBeInTheDocument();
  });
});

describe('ScholarshipModalityBadge', () => {
  it('usa Dot com a cor da bolsa e o rótulo do dicionário', () => {
    const { container } = render(
      <ScholarshipModalityBadge modality="Produtividade Desen. Tec. e Extensão Inovadora - 2" />,
    );
    expect(
      screen.getByText('Desenvolvimento tecnológico (DT)'),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-slot="dot"]')).toHaveClass(
      'bg-bolsa-DT',
    );
  });
});
