import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GroupRef } from './group-ref';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GroupRef', () => {
  it('renderiza link com nome, sigla opcional e BASE_URL', () => {
    vi.stubEnv('BASE_URL', '/simcc/');
    render(
      <GroupRef
        group={{
          id: 'grp-42',
          name: 'Grupo de Computação Aplicada',
          institutionAcronym: 'UFBA',
        }}
      />,
    );

    const link = screen.getByRole('link', {
      name: /Grupo de Computação Aplicada/i,
    });
    expect(link).toHaveAttribute('href', '/simcc/grupos-pesquisa/grp-42');
    expect(screen.getByText('(UFBA)')).toBeInTheDocument();
  });

  it('usa fallback quando o nome vem nulo ou vazio', () => {
    render(<GroupRef group={{ id: 'grp-9', name: null }} showIcon={false} />);

    const link = screen.getByRole('link', { name: 'Grupo de pesquisa' });
    expect(link).toHaveAttribute('href', '/grupos-pesquisa/grp-9');
  });
});
