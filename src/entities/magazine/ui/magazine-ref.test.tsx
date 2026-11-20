import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Magazine, MagazineRefData } from '../model';
import { JcrMark } from './jcr-mark';
import { MagazineRef } from './magazine-ref';
import { QualisMark } from './qualis-mark';

const dotOf = (element: HTMLElement) =>
  element
    .closest('[data-slot="qualis-mark"]')
    ?.querySelector('[data-slot="dot"]');

describe('MagazineRef', () => {
  it('mostra nome, Qualis, JCR e ISSN com link para o portal', () => {
    const magazine: MagazineRefData = {
      name: 'Waste Management',
      issn: '0956053X',
      qualis: 'A1',
      qualis_status: null,
      jcr: 7.1,
    };
    render(<MagazineRef magazine={magazine} />);

    expect(screen.getByText('Waste Management')).toBeInTheDocument();
    const qualis = screen.getByText('Qualis A1');
    expect(dotOf(qualis)).toHaveClass('bg-qualis-A1');
    expect(screen.getByText('7,1')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /ISSN 0956-053X/ }),
    ).toHaveAttribute(
      'href',
      'https://portal.issn.org/resource/ISSN/0956-053X',
    );
  });

  it('revista do artigo sem Qualis: rótulo e cor SQ, sem JCR', () => {
    render(
      <MagazineRef
        magazine={{
          name: 'International Brazilian Journal Of Urology',
          issn: '20531584',
          qualis: null,
          qualis_status: 'not_rated',
          jcr: null,
        }}
      />,
    );

    expect(dotOf(screen.getByText('Sem Qualis'))).toHaveClass('bg-qualis-SQ');
    expect(screen.queryByText(/JCR/)).not.toBeInTheDocument();
    // ISSN com dígito verificador inválido aparece, mas sem link.
    expect(screen.getByText('2053-1584')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('item do catálogo: período de referência e link do JCR', () => {
    const magazine: Magazine = {
      id: '06828386-8814-435e-9d3b-dc70fa306f05',
      name: '2d Materials',
      issn: '20531583',
      qualis: 'A1',
      qualis_status: null,
      jcr: 4.5,
      jcr_link: 'https://jcr.example/2d-materials',
      reference_period: '2021-2025',
    };
    render(<MagazineRef magazine={magazine} />);

    expect(screen.getByText('Qualis A1 (2021–2025)')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /JCR 4,5/ })).toHaveAttribute(
      'href',
      'https://jcr.example/2d-materials',
    );
  });

  it('sem nome nem ISSN', () => {
    render(<MagazineRef magazine={{ name: '  ', issn: null }} />);

    expect(screen.getByText('Revista sem nome')).toBeInTheDocument();
    expect(screen.getByText('Sem Qualis')).toBeInTheDocument();
    expect(screen.queryByText(/ISSN/)).not.toBeInTheDocument();
  });
});

describe('QualisMark', () => {
  it('"não se aplica" usa a cor SQ', () => {
    render(<QualisMark qualis={null} qualis_status="not_applicable" />);
    expect(dotOf(screen.getByText('Qualis não se aplica'))).toHaveClass(
      'bg-qualis-SQ',
    );
  });

  it('B5 não tem cor no kit: cai na cor neutra', () => {
    render(<QualisMark qualis="B5" />);
    expect(dotOf(screen.getByText('Qualis B5'))).toHaveClass('bg-neutral-400');
  });
});

describe('JcrMark', () => {
  it('não renderiza nada sem JCR', () => {
    const { container } = render(<JcrMark jcr={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sem link é texto', () => {
    render(<JcrMark jcr={98.4} />);
    expect(screen.getByText('98,4')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
