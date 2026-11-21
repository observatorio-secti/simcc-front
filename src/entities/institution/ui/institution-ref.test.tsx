import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstitutionRef } from './institution-ref';

describe('InstitutionRef', () => {
  const ufba = {
    id: 'f1ac00a8-15d9-4306-a893-c611636601d6',
    name: 'Universidade Federal Da Bahia',
    acronym: 'UFBA',
  };

  it('renderiza sigla e nome formatado com link no modo padrão', () => {
    render(<InstitutionRef institution={ufba} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute(
      'href',
      '/instituicoes/f1ac00a8-15d9-4306-a893-c611636601d6',
    );
    expect(link).toHaveTextContent('UFBA');
    expect(link).toHaveTextContent('Universidade Federal da Bahia');
  });

  it('não duplica sigla quando o nome já traz o prefixo', () => {
    render(
      <InstitutionRef
        institution={{
          id: 'inst-2',
          name: 'UESC - Universidade Estadual De Santa Cruz',
          acronym: 'UESC',
        }}
      />,
    );
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('UESC·Universidade Estadual de Santa Cruz');
  });

  it('suporta exibição apenas da sigla com title completo e fallback sem sigla', () => {
    const { rerender } = render(
      <InstitutionRef institution={ufba} display="acronym" showIcon />,
    );
    const acronymLink = screen.getByRole('link');
    expect(acronymLink).toHaveTextContent('UFBA');
    expect(acronymLink).toHaveAttribute(
      'title',
      'Universidade Federal da Bahia',
    );
    expect(acronymLink.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );

    rerender(
      <InstitutionRef
        institution={{
          id: 'inst-3',
          name: 'Instituto Baiano de Pesquisa',
          acronym: null,
        }}
        display="acronym"
      />,
    );
    expect(screen.getByRole('link')).toHaveTextContent(
      'Instituto Baiano de Pesquisa',
    );
  });

  it('suporta exibição apenas do nome formatado', () => {
    render(<InstitutionRef institution={ufba} display="name" />);
    expect(screen.getByRole('link')).toHaveTextContent(
      /^Universidade Federal da Bahia$/,
    );
  });
});
