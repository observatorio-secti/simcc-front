import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ResultToolbar } from './result-toolbar';

describe('ResultToolbar', () => {
  it('oculta o botão de filtros em desktop (lg:hidden) e abre os filtros ao clicar', async () => {
    const user = userEvent.setup();
    const onFiltersClick = vi.fn();

    render(<ResultToolbar onFiltersClick={onFiltersClick} filtersCount={3} />);

    const button = screen.getByRole('button', { name: /Filtros/i });
    expect(button).toHaveClass('lg:hidden');
    expect(button).toHaveTextContent('3');

    await user.click(button);
    expect(onFiltersClick).toHaveBeenCalledTimes(1);
  });

  it('não renderiza o botão de filtros quando onFiltersClick não é informado', () => {
    render(<ResultToolbar />);
    expect(
      screen.queryByRole('button', { name: /Filtros/i }),
    ).not.toBeInTheDocument();
  });
});
