import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Magazine, MagazineRefData } from '../model';
import { MagazineCard } from './magazine-card';
import { MagazineRef, QualisBadge } from './magazine-ref';

const baseRef: MagazineRefData = {
  name: 'Cadernos de Saúde Pública',
  issn: '0102311X',
  qualis: 'A1',
  qualis_status: null,
  jcr: 3.15,
};

const fullMagazine: Magazine = {
  id: '22222222-2222-4222-8222-222222222222',
  name: 'Revista Brasileira de Inovação',
  issn: '1677-2504',
  qualis: 'A3',
  qualis_status: null,
  jcr: 1.45,
  jcr_link: 'https://jcr.clarivate.com/rbi',
  reference_period: '2017-2020',
};

describe('QualisBadge', () => {
  it('usa badge sólido com cor do token em estratos escuros', () => {
    render(<QualisBadge magazine={{ qualis: 'A1', qualis_status: null }} />);

    const badge = screen.getByText('Qualis A1').closest('[data-slot="badge"]');
    expect(badge).toHaveAttribute('data-variant', 'solid');
    expect(badge).toHaveClass('bg-qualis-A1');
  });

  it('usa badge outline com Dot colorido para cores claras (A3, A4) e B5', () => {
    const { rerender } = render(
      <QualisBadge magazine={{ qualis: 'A3', qualis_status: null }} />,
    );

    const badgeA3 = screen
      .getByText('Qualis A3')
      .closest('[data-slot="badge"]');
    expect(badgeA3).toHaveAttribute('data-variant', 'outline');
    expect(badgeA3).not.toHaveClass('bg-qualis-A3');
    expect(badgeA3?.querySelector('[data-slot="dot"]')).toHaveClass(
      'bg-qualis-A3',
    );

    rerender(<QualisBadge magazine={{ qualis: 'A4', qualis_status: null }} />);
    const badgeA4 = screen
      .getByText('Qualis A4')
      .closest('[data-slot="badge"]');
    expect(badgeA4).toHaveAttribute('data-variant', 'outline');
    expect(badgeA4?.querySelector('[data-slot="dot"]')).toHaveClass(
      'bg-qualis-A4',
    );

    rerender(<QualisBadge magazine={{ qualis: 'B5', qualis_status: null }} />);
    const badgeB5 = screen
      .getByText('Qualis B5')
      .closest('[data-slot="badge"]');
    expect(badgeB5).toHaveAttribute('data-variant', 'outline');
    expect(badgeB5?.querySelector('[data-slot="dot"]')).toHaveClass(
      'bg-neutral-400',
    );
  });

  it('distingue not_rated (Sem Qualis) de not_applicable (Não se aplica)', () => {
    const { rerender } = render(
      <QualisBadge magazine={{ qualis: null, qualis_status: 'not_rated' }} />,
    );

    const notRated = screen
      .getByText('Sem Qualis')
      .closest('[data-slot="badge"]');
    expect(notRated).toHaveAttribute('data-variant', 'solid');
    expect(notRated).toHaveClass('bg-qualis-SQ');

    rerender(
      <QualisBadge
        magazine={{ qualis: null, qualis_status: 'not_applicable' }}
      />,
    );

    const notApplicable = screen
      .getByText('Não se aplica')
      .closest('[data-slot="badge"]');
    expect(notApplicable).toHaveAttribute('data-variant', 'outline');
    expect(notApplicable?.querySelector('[data-slot="dot"]')).toHaveClass(
      'bg-qualis-SQ',
    );
  });
});

describe('MagazineRef', () => {
  it('exibe nome, ISSN formatado, Qualis e JCR em pt-BR', () => {
    render(<MagazineRef magazine={baseRef} />);

    expect(screen.getByText('Cadernos de Saúde Pública')).toBeInTheDocument();
    expect(screen.getByText('ISSN 0102-311X')).toBeInTheDocument();
    expect(screen.getByText('Qualis A1')).toBeInTheDocument();
    expect(screen.getByText('JCR 3,15')).toBeInTheDocument();
  });

  it('omite ISSN quando showIssn=false e aplica tamanho compacto', () => {
    const { container } = render(
      <MagazineRef magazine={baseRef} variant="compact" showIssn={false} />,
    );

    expect(screen.queryByText(/ISSN/)).not.toBeInTheDocument();
    expect(
      container.querySelector('[data-slot="magazine-ref"]'),
    ).toHaveAttribute('data-variant', 'compact');
  });

  it('abre link externo de JCR apenas para URLs http/https válidas', () => {
    const { rerender } = render(<MagazineRef magazine={fullMagazine} />);

    const link = screen.getByRole('link', { name: /JCR 1,45/i });
    expect(link).toHaveAttribute('href', 'https://jcr.clarivate.com/rbi');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    rerender(
      <MagazineRef
        magazine={{ ...fullMagazine, jcr_link: 'javascript:alert(1)' }}
      />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('JCR 1,45')).toBeInTheDocument();
  });

  it('aplica fallbacks quando nome, ISSN e JCR estão ausentes', () => {
    render(
      <MagazineRef
        magazine={{
          name: null,
          issn: null,
          qualis: null,
          qualis_status: 'not_rated',
          jcr: null,
        }}
      />,
    );

    expect(screen.getByText('Revista não informada')).toBeInTheDocument();
    expect(screen.queryByText(/ISSN/)).not.toBeInTheDocument();
    expect(screen.queryByText(/JCR/)).not.toBeInTheDocument();
    expect(screen.getByText('Sem Qualis')).toBeInTheDocument();
  });
});

describe('MagazineCard', () => {
  it('renderiza card sem sombra com borda lateral pela cor do Qualis e período', () => {
    const { container } = render(<MagazineCard magazine={fullMagazine} />);

    const card = container.querySelector('[data-slot="magazine-card"]');
    expect(card).toHaveClass('border-l-[6px]', 'border-l-qualis-A3');
    expect(card?.className).not.toMatch(/\bshadow-/);
    expect(screen.getByText('ISSN 1677-2504')).toBeInTheDocument();
    expect(screen.getByText('2017-2020')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Revista Brasileira de Inovação' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Qualis A3').closest('[data-slot="badge"]'),
    ).toHaveAttribute('data-variant', 'outline');
    expect(screen.getByRole('link', { name: /JCR 1,45/i })).toBeInTheDocument();
  });

  it('exibe fallback de ISSN quando ausente', () => {
    render(
      <MagazineCard
        magazine={{
          name: 'Anais de Simpósio',
          issn: null,
          qualis: null,
          qualis_status: 'not_applicable',
          jcr: null,
        }}
      />,
    );

    expect(screen.getByText('ISSN não informado')).toBeInTheDocument();
    expect(screen.getByText('Não se aplica')).toBeInTheDocument();
  });
});
