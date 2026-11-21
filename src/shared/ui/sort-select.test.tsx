import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SortSelect, type SortOption } from './sort-select';

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

const OPTIONS: readonly SortOption<
  'relevance' | 'year' | 'citations' | 'title'
>[] = [
  { value: 'relevance', label: 'Mais relevantes', defaultOrder: 'desc' },
  { value: 'year', label: 'Ano', defaultOrder: 'desc' },
  { value: 'citations', label: 'Mais citados', defaultOrder: 'desc' },
  { value: 'title', label: 'Título (A–Z)', defaultOrder: 'asc' },
];

describe('SortSelect', () => {
  it('exibe valor atual e dispara atualização com defaultOrder da opção escolhida', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SortSelect
        options={OPTIONS}
        value="relevance"
        order="desc"
        onChange={onChange}
      />,
    );

    const trigger = screen.getByRole('combobox', { name: 'Ordenar por' });
    expect(trigger).toHaveTextContent('Mais relevantes');

    await user.click(trigger);
    await user.click(screen.getByRole('option', { name: 'Título (A–Z)' }));

    expect(onChange).toHaveBeenCalledWith({
      sort_by: 'title',
      sort_order: 'asc',
    });
  });

  it('alterna direção asc/desc quando showOrderToggle está ativo', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <SortSelect
        options={OPTIONS}
        value="year"
        order="desc"
        showOrderToggle
        onChange={onChange}
      />,
    );

    const toggleBtn = screen.getByRole('button', {
      name: /Ordem decrescente/i,
    });
    await user.click(toggleBtn);

    expect(onChange).toHaveBeenCalledWith({
      sort_by: 'year',
      sort_order: 'asc',
    });

    rerender(
      <SortSelect
        options={OPTIONS}
        value="year"
        order="asc"
        showOrderToggle
        onChange={onChange}
      />,
    );

    const ascBtn = screen.getByRole('button', { name: /Ordem crescente/i });
    await user.click(ascBtn);
    expect(onChange).toHaveBeenLastCalledWith({
      sort_by: 'year',
      sort_order: 'desc',
    });
  });

  it('respeita estado desabilitado', () => {
    render(
      <SortSelect
        options={OPTIONS}
        value="relevance"
        order="desc"
        showOrderToggle
        disabled
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('combobox', { name: 'Ordenar por' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /Ordem decrescente/i }),
    ).toBeDisabled();
  });
});
