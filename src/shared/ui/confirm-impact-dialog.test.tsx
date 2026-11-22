import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmImpactDialog } from './confirm-impact-dialog';

describe('ConfirmImpactDialog', () => {
  it('mostra o impacto, confirma e cancela', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ConfirmImpactDialog
        open
        onOpenChange={onOpenChange}
        title="Excluir instituição?"
        description="UFBA"
        impact={<p>Os vínculos dos pesquisadores serão desfeitos.</p>}
        confirmLabel="Excluir"
        onConfirm={onConfirm}
      />,
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveTextContent('Os vínculos dos pesquisadores');
    await user.click(screen.getByRole('button', { name: 'Excluir' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('em andamento trava os botões e não fecha; erro aparece no diálogo', () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmImpactDialog
        open
        onOpenChange={onOpenChange}
        title="Remover?"
        confirmLabel="Remover"
        onConfirm={vi.fn()}
        pending
        error="Não é possível remover o último administrador."
      />,
    );

    expect(screen.getByRole('button', { name: 'Remover' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Fechar' })).toBeNull();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Não é possível remover o último administrador.',
    );
  });
});
