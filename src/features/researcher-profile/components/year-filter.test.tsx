import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { getDefaultYearStart } from '@/shared/lib/search-params';
import { YearFilter } from './year-filter';

function ControlledYearFilter({
  initialStart,
  initialEnd,
  onSpy,
}: {
  initialStart?: number;
  initialEnd?: number;
  onSpy?: (next: { yearStart?: number; yearEnd?: number }) => void;
}) {
  const [range, setRange] = useState<{ yearStart?: number; yearEnd?: number }>({
    yearStart: initialStart,
    yearEnd: initialEnd,
  });

  return (
    <YearFilter
      yearStart={range.yearStart}
      yearEnd={range.yearEnd}
      onChange={(next) => {
        setRange(next);
        onSpy?.(next);
      }}
    />
  );
}

describe('YearFilter', () => {
  it('permite digitar ano inicial e ano final caractere a caractere', async () => {
    const user = userEvent.setup();
    const onSpy = vi.fn();

    render(<ControlledYearFilter onSpy={onSpy} />);

    const startInput = screen.getByLabelText('Ano inicial');
    const endInput = screen.getByLabelText('Ano final');

    await user.type(startInput, '2018');
    expect(startInput).toHaveValue(2018);
    expect(onSpy).toHaveBeenCalledTimes(1);
    expect(onSpy).toHaveBeenLastCalledWith({
      yearStart: 2018,
      yearEnd: undefined,
    });

    await user.type(endInput, '2024');
    expect(endInput).toHaveValue(2024);
    expect(onSpy).toHaveBeenCalledTimes(2);
    expect(onSpy).toHaveBeenLastCalledWith({
      yearStart: 2018,
      yearEnd: 2024,
    });
  });

  it('permite apagar dígitos de um ano inicial já preenchido para digitar outro mais antigo', async () => {
    const user = userEvent.setup();
    const onSpy = vi.fn();

    render(<ControlledYearFilter initialStart={2020} onSpy={onSpy} />);

    const startInput = screen.getByLabelText('Ano inicial');
    expect(startInput).toHaveValue(2020);

    await user.click(startInput);
    await user.keyboard('{Backspace}');
    expect(startInput).toHaveValue(202);
    expect(onSpy).not.toHaveBeenCalled();

    await user.keyboard('{Backspace}{Backspace}{Backspace}');
    expect(startInput).toHaveValue(null);
    expect(onSpy).not.toHaveBeenCalled();

    await user.type(startInput, '1995');
    expect(startInput).toHaveValue(1995);
    expect(onSpy).toHaveBeenLastCalledWith({
      yearStart: 1995,
      yearEnd: undefined,
    });
  });

  it('restaura o valor anterior no blur se o rascunho ficar incompleto ou vazio', async () => {
    const user = userEvent.setup();
    render(<ControlledYearFilter initialStart={2020} />);

    const startInput = screen.getByLabelText('Ano inicial');
    await user.click(startInput);
    await user.keyboard('{Backspace}');
    expect(startInput).toHaveValue(202);

    await user.tab();
    expect(startInput).toHaveValue(2020);

    await user.clear(startInput);
    expect(startInput).toHaveValue(null);
    await user.tab();
    expect(startInput).toHaveValue(2020);
  });

  it('oculta Limpar anos quando já está no padrão e restaura para o padrão ao clicar', async () => {
    const user = userEvent.setup();
    const onSpy = vi.fn();
    const defaultStart = getDefaultYearStart();

    const { rerender } = render(
      <ControlledYearFilter initialStart={defaultStart} onSpy={onSpy} />,
    );
    expect(
      screen.queryByRole('button', { name: 'Limpar anos' }),
    ).not.toBeInTheDocument();

    rerender(
      <ControlledYearFilter
        key="custom"
        initialStart={2019}
        initialEnd={2023}
        onSpy={onSpy}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Limpar anos' }));

    expect(screen.getByLabelText('Ano inicial')).toHaveValue(defaultStart);
    expect(screen.getByLabelText('Ano final')).toHaveValue(null);
    expect(onSpy).toHaveBeenLastCalledWith({
      yearStart: defaultStart,
      yearEnd: undefined,
    });
  });
});
