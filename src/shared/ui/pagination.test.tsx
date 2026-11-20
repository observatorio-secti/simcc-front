import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination';

beforeAll(() => {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => undefined;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => undefined;
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => undefined;
  }
});

describe('Pagination', () => {
  it('renderiza a partir do objeto Pagination da API v2 com acessibilidade', () => {
    render(
      <Pagination
        pagination={{
          page: 2,
          per_page: 20,
          total_items: 137,
          total_pages: 7,
          has_prev: true,
          has_next: true,
        }}
        onPageChange={vi.fn()}
      />,
    );

    const nav = screen.getByRole('navigation', { name: 'Paginação' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByText('Mostrando 21–40 de 137')).toBeInTheDocument();

    const activePage = screen.getByRole('button', { name: 'Página 2' });
    expect(activePage).toHaveAttribute('aria-current', 'page');
    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeEnabled();
  });

  it('dispara onPageChange ao clicar em página, anterior e próxima', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={3}
        totalPages={5}
        totalItems={100}
        perPage={20}
        onPageChange={onPageChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Página anterior' }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);

    await user.click(screen.getByRole('button', { name: 'Próxima página' }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);

    await user.click(screen.getByRole('button', { name: 'Página 5' }));
    expect(onPageChange).toHaveBeenLastCalledWith(5);

    // Clicar na página atual não dispara navegação redundante.
    onPageChange.mockClear();
    await user.click(screen.getByRole('button', { name: 'Página 3' }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('desabilita Anterior na primeira página e Próxima na última', () => {
    const { rerender } = render(
      <Pagination
        pagination={{
          page: 1,
          per_page: 20,
          total_items: 50,
          total_pages: 3,
          has_prev: false,
          has_next: true,
        }}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeEnabled();

    rerender(
      <Pagination
        pagination={{
          page: 3,
          per_page: 20,
          total_items: 50,
          total_pages: 3,
          has_prev: true,
          has_next: false,
        }}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Página anterior' }),
    ).toBeEnabled();
    expect(
      screen.getByRole('button', { name: 'Próxima página' }),
    ).toBeDisabled();
  });

  it('compacta intervalos longos com reticências mantendo início e fim', () => {
    render(<Pagination page={10} totalPages={20} onPageChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Página 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Página 9' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Página 10' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('button', { name: 'Página 11' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Página 20' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Página 5' }),
    ).not.toBeInTheDocument();
  });

  it('oculta paginação quando há no máximo 1 página e permite trocar per_page', async () => {
    const user = userEvent.setup();
    const onPerPageChange = vi.fn();

    const { container, rerender } = render(
      <Pagination page={1} totalPages={1} onPageChange={vi.fn()} />,
    );
    expect(container.firstChild).toBeNull();

    rerender(
      <Pagination
        page={1}
        totalPages={3}
        perPage={20}
        totalItems={50}
        onPageChange={vi.fn()}
        onPerPageChange={onPerPageChange}
      />,
    );

    await user.click(
      screen.getByRole('combobox', { name: 'Itens por página' }),
    );
    await user.click(screen.getByRole('option', { name: '50 por página' }));
    expect(onPerPageChange).toHaveBeenCalledWith(50);
  });
});
