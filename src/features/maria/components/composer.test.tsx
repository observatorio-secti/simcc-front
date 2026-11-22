import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Composer } from './composer';

function Harness({
  onSubmit,
  streaming = false,
}: {
  onSubmit: (value: string) => void;
  streaming?: boolean;
}) {
  const [value, setValue] = useState('');
  return (
    <Composer
      value={value}
      onValueChange={setValue}
      onSubmit={onSubmit}
      streaming={streaming}
      onStop={() => {}}
    />
  );
}

describe('Composer', () => {
  it('Enter envia, Shift+Enter quebra linha e vazio não envia', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} />);
    const field = screen.getByRole('textbox');
    await user.type(field, '   {Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
    await user.type(field, 'oi{Shift>}{Enter}{/Shift}mundo{Enter}');
    expect(onSubmit).toHaveBeenCalledWith('oi\nmundo');
    expect(screen.getByText(/caracteres/)).toBeInTheDocument();
  });

  it('ignora Enter durante composição de IME', () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const field = screen.getByRole('textbox');
    fireEvent.change(field, { target: { value: 'にほん' } });
    fireEvent.keyDown(field, { key: 'Enter', isComposing: true });
    fireEvent.keyDown(field, { key: 'Enter', keyCode: 229 });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('durante a resposta deixa digitar, mas troca Enviar por Parar', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<Harness onSubmit={onSubmit} streaming />);
    const field = screen.getByRole('textbox');
    await user.type(field, 'próxima{Enter}');
    expect(field).toHaveValue('próxima');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Parar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Enviar/ })).toBeNull();
  });

  it('bloqueia acima de 10.000 caracteres', () => {
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);
    const field = screen.getByRole('textbox');
    fireEvent.change(field, { target: { value: 'a'.repeat(10001) } });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('button', { name: /Enviar/ })).toBeDisabled();
  });
});
