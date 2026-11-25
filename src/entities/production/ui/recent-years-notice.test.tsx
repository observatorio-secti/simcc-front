import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import { RecentYearsNotice } from './recent-years-notice';

describe('RecentYearsNotice', () => {
  it('exibe o aviso amigável quando o filtro está no ano inicial padrão', () => {
    const defaultStart = getDefaultYearStart();
    render(<RecentYearsNotice yearStart={defaultStart} />);

    const note = screen.getByRole('note');
    expect(note).toHaveTextContent(
      `Você está vendo os artigos mais recentes (a partir de ${defaultStart})`,
    );
    expect(note).toHaveTextContent(/publicações de anos anteriores/i);
  });

  it('oculta o aviso quando o usuário altera o ano inicial ou define ano final', () => {
    const defaultStart = getDefaultYearStart();
    const { rerender } = render(<RecentYearsNotice yearStart={1998} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();

    rerender(<RecentYearsNotice yearStart={defaultStart} yearEnd={2024} />);
    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });
});
