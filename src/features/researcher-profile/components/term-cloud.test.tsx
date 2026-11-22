import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TermCloud } from './term-cloud';
import {
  computeTermCloudLayout,
  TERM_CLOUD_HEIGHT,
  TERM_CLOUD_WIDTH,
} from './term-cloud-layout';

const SAMPLE_TERMS = [
  { term: 'solos', frequency: 24 },
  { term: 'irrigação', frequency: 18 },
  { term: 'sensoriamento remoto', frequency: 14 },
  { term: 'redes', frequency: 9 },
  { term: 'clima', frequency: 6 },
  { term: 'água', frequency: 3 },
];

describe('computeTermCloudLayout', () => {
  it('posiciona termos de forma determinística respeitando limites do viewBox e maxTerms', () => {
    const layoutA = computeTermCloudLayout(SAMPLE_TERMS, { maxTerms: 4 });
    const layoutB = computeTermCloudLayout(SAMPLE_TERMS, { maxTerms: 4 });

    expect(layoutA).toHaveLength(4);
    expect(layoutA).toEqual(layoutB);

    for (const item of layoutA) {
      expect(item.x).toBeGreaterThan(0);
      expect(item.x).toBeLessThan(TERM_CLOUD_WIDTH);
      expect(item.y).toBeGreaterThan(0);
      expect(item.y).toBeLessThan(TERM_CLOUD_HEIGHT);
    }

    expect(layoutA[0]?.term).toBe('solos');
    expect(layoutA[0]!.fontSize).toBeGreaterThan(layoutA[3]!.fontSize);
  });

  it('ignora termos vazios e retorna vazio quando maxTerms <= 0', () => {
    expect(computeTermCloudLayout([{ term: '   ', frequency: 5 }])).toEqual([]);
    expect(computeTermCloudLayout(SAMPLE_TERMS, { maxTerms: 0 })).toEqual([]);
  });
});

describe('TermCloud', () => {
  it('renderiza nuvem SVG com termos e tooltip de frequência', () => {
    render(<TermCloud terms={SAMPLE_TERMS} />);

    expect(
      screen.getByRole('img', {
        name: /Nuvem de termos mais frequentes/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('solos')).toBeInTheDocument();
    expect(screen.getByText('redes')).toBeInTheDocument();
    expect(screen.getByText('solos (24 ocorrências)')).toBeInTheDocument();
  });

  it('limita a quantidade de termos exibidos via maxTerms', () => {
    render(<TermCloud terms={SAMPLE_TERMS} maxTerms={2} />);

    expect(screen.getByText('solos')).toBeInTheDocument();
    expect(screen.getByText('irrigação')).toBeInTheDocument();
    expect(screen.queryByText('água')).not.toBeInTheDocument();
  });

  it('não renderiza nada em erro ou lista vazia e exibe skeleton no carregamento', () => {
    const { container, rerender } = render(<TermCloud terms={[]} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<TermCloud terms={SAMPLE_TERMS} isError />);
    expect(container).toBeEmptyDOMElement();

    rerender(<TermCloud terms={[]} isLoading />);
    expect(screen.getByText('Nuvem de termos')).toBeInTheDocument();
  });
});
