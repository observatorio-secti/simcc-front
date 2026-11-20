import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ResearchLine } from '../model';
import { ResearchLines } from './research-lines';

const SAMPLE_LINES: ResearchLine[] = [
  {
    name: 'Engenharia de Software e Sistemas Distribuídos',
    area: 'CIÊNCIA DA COMPUTAÇÃO',
    start_year: 2012,
    end_year: null,
  },
  {
    name: 'Redes de Computadores e Segurança',
    area: 'ENGENHARIA III',
    start_year: 2009,
    end_year: 2023,
  },
  {
    name: 'Linha Sem Período Definido',
    area: null,
    start_year: null,
    end_year: null,
  },
];

describe('ResearchLines', () => {
  it('renderiza contagem e cards na grade com área e período formatados', () => {
    render(<ResearchLines lines={SAMPLE_LINES} />);

    expect(screen.getByText('Linhas de pesquisa')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(
      screen.getByText('Engenharia de Software e Sistemas Distribuídos'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ciência da computação')).toBeInTheDocument();
    expect(screen.getByText('2012 – atual')).toBeInTheDocument();
    expect(screen.getByText('Engenharia III')).toBeInTheDocument();
    expect(screen.getByText('2009 – 2023')).toBeInTheDocument();
  });

  it('alterna entre grade e tabela pelo botão do cabeçalho', async () => {
    const user = userEvent.setup();
    const onLayoutChange = vi.fn();

    render(
      <ResearchLines lines={SAMPLE_LINES} onLayoutChange={onLayoutChange} />,
    );

    await user.click(screen.getByRole('radio', { name: 'Exibir em tabela' }));

    expect(onLayoutChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Linha de pesquisa' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '2012' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Atual' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '2023' })).toBeInTheDocument();
  });

  it('respeita o modo controlado', async () => {
    const user = userEvent.setup();
    const onLayoutChange = vi.fn();

    render(
      <ResearchLines
        lines={SAMPLE_LINES}
        layout="table"
        onLayoutChange={onLayoutChange}
      />,
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Exibir em grade' }));
    expect(onLayoutChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('exibe EmptyState quando não há linhas de pesquisa', () => {
    render(<ResearchLines lines={[]} />);

    expect(
      screen.getByText('Nenhuma linha de pesquisa cadastrada'),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: 'Exibir em tabela' }),
    ).not.toBeInTheDocument();
  });
});
