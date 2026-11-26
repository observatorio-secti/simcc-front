import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  StackedYearChart,
  type StackedYearPoint,
  type StackedYearSeries,
} from './stacked-year-chart';
import { getYearLabelStep } from './year-label-step';

beforeAll(() => {
  if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

const SERIES: StackedYearSeries[] = [
  { key: 'A1', label: 'Qualis A1', bgClassName: 'bg-qualis-A1' },
  { key: 'B1', label: 'Qualis B1', bgClassName: 'bg-qualis-B1' },
];

function makePoints(startYear: number, count: number): StackedYearPoint[] {
  return Array.from({ length: count }, (_, idx) => {
    const year = startYear + idx;
    return {
      period: year,
      value: (idx + 1) * 2,
      groups: { A1: idx + 1, B1: idx + 1 },
    };
  });
}

describe('getYearLabelStep', () => {
  it('ajusta o intervalo de rótulos conforme a quantidade de anos', () => {
    expect(getYearLabelStep(10)).toBe(1);
    expect(getYearLabelStep(14)).toBe(1);
    expect(getYearLabelStep(20)).toBe(2);
    expect(getYearLabelStep(30)).toBe(3);
    expect(getYearLabelStep(60)).toBe(5);
  });
});

describe('StackedYearChart', () => {
  it('renderiza todos os anos sem agrupamento e intercala os rótulos quando há muitos anos', () => {
    const points = makePoints(1995, 30);
    render(
      <StackedYearChart
        title="Produções por ano"
        points={points}
        series={SERIES}
      />,
    );

    const chart = screen.getByRole('img', { name: 'Produções por ano' });
    expect(chart).toHaveClass('overflow-hidden');
    // Todas as 30 colunas individuais devem estar presentes (sem faixas como 1995–97)
    expect(chart.children).toHaveLength(30);
    expect(screen.queryByText(/–/)).not.toBeInTheDocument();

    // Com 30 anos, step = 3: 1995, 1998, 2001... aparecem; 1996 e 1997 ficam ocultos
    expect(screen.getByText('1995')).toBeInTheDocument();
    expect(screen.queryByText('1996')).not.toBeInTheDocument();
    expect(screen.queryByText('1997')).not.toBeInTheDocument();
    expect(screen.getByText('1998')).toBeInTheDocument();
  });

  it('mostra o valor total e o detalhamento por série ao passar o mouse na barra', async () => {
    const user = userEvent.setup();
    const points: StackedYearPoint[] = [
      { period: 2023, value: 5, groups: { A1: 3, B1: 2 } },
      { period: 2024, value: 8, groups: { A1: 5, B1: 3 } },
    ];

    render(
      <StackedYearChart
        title="Artigos por ano"
        points={points}
        series={SERIES}
      />,
    );

    // Valor não fica fixo acima da barra antes do hover
    expect(screen.queryByText('2023 — Total: 5')).not.toBeInTheDocument();

    const chart = screen.getByRole('img', { name: 'Artigos por ano' });
    const firstBarColumn = chart.children[0] as HTMLElement;
    await user.hover(firstBarColumn);

    const tooltips = await screen.findAllByText('2023 — Total: 5');
    expect(tooltips.length).toBeGreaterThan(0);
    expect(screen.getAllByText('3').length).toBeGreaterThan(0);
    expect(screen.getAllByText('2').length).toBeGreaterThan(0);
  });

  it('mantém o callback onToggleKey ao clicar em um segmento', async () => {
    const user = userEvent.setup();
    const onToggleKey = vi.fn();
    render(
      <StackedYearChart
        title="Artigos por ano"
        points={[{ period: 2024, value: 5, groups: { A1: 3, B1: 2 } }]}
        series={SERIES}
        onToggleKey={onToggleKey}
      />,
    );

    await user.click(screen.getByRole('button', { name: '2024 Qualis A1: 3' }));
    expect(onToggleKey).toHaveBeenCalledWith('A1');
  });
});
