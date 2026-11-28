import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ResearcherDetail } from '@/entities/researcher/model';
import { TrajectoryTab } from './trajectory-tab';

const researcher = {
  education: [
    {
      degree: 'DOCTORATE',
      course: 'Etnomusicologia',
      institution: 'Universidade Federal da Bahia',
      start_year: 2011,
      end_year: 2015,
      status: 'CONCLUIDO',
      keywords: [],
    },
    {
      degree: 'MASTERS-DEGREE',
      course: 'Etnomusicologia',
      institution: 'Universidade Federal da Bahia',
      start_year: 2009,
      end_year: 2011,
      status: 'EM_ANDAMENTO',
      keywords: [],
    },
  ],
  experience: [],
  foment: [],
} as unknown as ResearcherDetail;

describe('TrajectoryTab', () => {
  it('traduz os títulos e a situação da formação acadêmica', () => {
    render(<TrajectoryTab researcher={researcher} />);

    expect(
      screen.getByText('Doutorado em Etnomusicologia'),
    ).toBeInTheDocument();
    expect(screen.getByText('Mestrado em Etnomusicologia')).toBeInTheDocument();
    expect(screen.getByText('Concluído')).toBeInTheDocument();
    expect(screen.getByText('Em andamento')).toBeInTheDocument();
    expect(
      screen.queryByText(/DOCTORATE|MASTERS-DEGREE/),
    ).not.toBeInTheDocument();
  });
});
