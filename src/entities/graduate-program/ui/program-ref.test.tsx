import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProgramRef } from './program-ref';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('ProgramRef', () => {
  it('renderiza link com BASE_URL e nome do programa', () => {
    vi.stubEnv('BASE_URL', '/observatorio/');
    render(
      <ProgramRef
        program={{
          id: 'prog-1',
          name: 'Programa de Pós-Graduação em Ciência da Computação',
          acronym: 'PGCOMP',
        }}
      />,
    );

    const link = screen.getByRole('link', {
      name: 'Programa de Pós-Graduação em Ciência da Computação',
    });
    expect(link).toHaveAttribute('href', '/observatorio/pos-graduacao/prog-1');
    expect(screen.queryByText('(PGCOMP)')).not.toBeInTheDocument();
  });

  it('exibe sigla distinta, ícone opcional e metadado', () => {
    render(
      <ProgramRef
        program={{
          id: 'prog-2',
          name: 'Programa de Pós-Graduação em Saúde Coletiva',
          acronym: 'PPGSC',
        }}
        showIcon
        showAcronym
        meta="Permanente"
      />,
    );

    expect(screen.getByText('(PPGSC)')).toBeInTheDocument();
    expect(screen.getByText('Permanente')).toBeInTheDocument();
    expect(screen.getByRole('link').querySelector('svg')).toHaveAttribute(
      'aria-hidden',
    );
  });

  it('não duplica sigla quando ela é igual ao nome', () => {
    render(
      <ProgramRef
        program={{
          id: 'prog-3',
          name: 'PROFNIT',
          acronym: 'PROFNIT',
        }}
        showAcronym
      />,
    );

    expect(screen.queryByText('(PROFNIT)')).not.toBeInTheDocument();
  });
});
