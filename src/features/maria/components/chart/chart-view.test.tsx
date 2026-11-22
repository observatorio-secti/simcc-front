import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ChartBlock } from '@/entities/conversation/model';
import { ChartView } from './chart-view';

const base: ChartBlock = {
  type: 'chart',
  chart_type: 'bar',
  title: 'Bolsas por território',
  x: { key: 'territorio', label: 'Território', type: 'category' },
  series: [
    { key: 'mestrado', label: 'Mestrado', unit: 'bolsas' },
    { key: 'doutorado', label: 'Doutorado', unit: 'bolsas' },
  ],
  data: [
    { territorio: 'Metropolitano de Salvador', mestrado: 512, doutorado: 210 },
    { territorio: 'Portal do Sertão', mestrado: 120, doutorado: 40 },
    { territorio: 'Litoral Sul', mestrado: 0, doutorado: null },
  ],
  orientation: 'vertical',
  truncated: false,
};

const kinds: ChartBlock['chart_type'][] = [
  'bar',
  'line',
  'area',
  'pie',
  'donut',
  'scatter',
];

describe('ChartView', () => {
  it.each(kinds)('desenha %s sem quebrar', (kind) => {
    render(<ChartView block={{ ...base, chart_type: kind }} />);
    const svg = screen.getByRole('img', { name: 'Bolsas por território' });
    expect(svg.querySelectorAll('path, circle').length).toBeGreaterThan(0);
  });

  it('pizza mostra porcentagem na legenda e só a primeira série', () => {
    render(<ChartView block={{ ...base, chart_type: 'pie' }} />);
    expect(screen.getByText('Metropolitano de Salvador')).toBeInTheDocument();
    expect(screen.getByText('81%')).toBeInTheDocument();
    expect(screen.queryByText('Doutorado')).toBeNull();
  });

  it('barra horizontal cresce com as categorias e quebra rótulos', () => {
    render(
      <ChartView
        block={{ ...base, orientation: 'horizontal', stacking: 'absolute' }}
      />,
    );
    const svg = screen.getByRole('img');
    expect(Number(svg.getAttribute('height'))).toBeGreaterThanOrEqual(3 * 32);
    expect(svg.querySelector('title')?.textContent).toBe(
      'Metropolitano de Salvador',
    );
  });

  it('tooltip pelo teclado: categoria, série e valor com unidade', () => {
    render(<ChartView block={base} />);
    const svg = screen.getByRole('img');
    fireEvent.keyDown(svg, { key: 'ArrowRight' });
    expect(screen.getByText('512 bolsas')).toBeInTheDocument();
    expect(
      screen.getAllByText('Metropolitano de Salvador').length,
    ).toBeGreaterThan(0);
    fireEvent.keyDown(svg, { key: 'Escape' });
    expect(screen.queryByText('512 bolsas')).toBeNull();
  });

  it('percent: tooltip com porcentagem e valor absoluto', () => {
    render(<ChartView block={{ ...base, stacking: 'percent' }} />);
    fireEvent.keyDown(screen.getByRole('img'), { key: 'ArrowRight' });
    expect(screen.getByText('70,9% · 512 bolsas')).toBeInTheDocument();
  });

  it('sem dados mostra aviso', () => {
    render(<ChartView block={{ ...base, data: [] }} />);
    expect(
      screen.getByText('Sem valores para desenhar o gráfico.'),
    ).toBeInTheDocument();
  });
});
