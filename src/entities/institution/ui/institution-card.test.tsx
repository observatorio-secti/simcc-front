import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstitutionCard } from './institution-card';

describe('InstitutionCard', () => {
  it('renderiza card centralizado sem sombra, logos claro/escuro e contagens em pt-BR', () => {
    const { container } = render(
      <InstitutionCard
        institution={{
          id: 'f1ac00a8-15d9-4306-a893-c611636601d6',
          name: 'UFBA - Universidade Federal Da Bahia',
          acronym: 'UFBA',
          counts: { researchers: 2450, graduate_programs: 84 },
        }}
        researchGroupsCount={412}
      />,
    );

    const card = screen.getByRole('link');
    expect(card).toHaveAttribute(
      'href',
      '/instituicoes/f1ac00a8-15d9-4306-a893-c611636601d6',
    );
    expect(card.className).not.toMatch(/\bshadow/);

    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(2);
    expect(imgs[0]).toHaveClass('dark:hidden');
    expect(imgs[1]).toHaveClass('dark:block');

    expect(screen.getByText('UFBA')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Universidade Federal da Bahia' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2.450')).toBeInTheDocument();
    expect(screen.getByText('84')).toBeInTheDocument();
    expect(screen.getByText('412')).toBeInTheDocument();
  });

  it('usa fundo claro no tema escuro para IFBA e fallback Building2 quando não há logo', () => {
    const { container, rerender } = render(
      <InstitutionCard
        institution={{
          id: 'ifba-id',
          name: 'Instituto Federal Da Bahia',
          acronym: 'IFBA',
        }}
      />,
    );

    const logoBox = container.querySelector('a > div');
    expect(logoBox).toHaveClass('dark:bg-white');
    expect(container.querySelectorAll('img')).toHaveLength(1);
    expect(screen.queryByTitle('Pesquisadores')).not.toBeInTheDocument();

    rerender(
      <InstitutionCard
        institution={{
          id: 'cimatec-id',
          name: 'Centro Universitário SENAI CIMATEC',
          acronym: 'CIMATEC',
        }}
        counts={{ researchers: 164, graduate_programs: 6 }}
      />,
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a > div > svg')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByText('164')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('usa image remota quando não há asset local e recua para Building2 em erro de carregamento', () => {
    const { container } = render(
      <InstitutionCard
        institution={{
          id: 'custom-id',
          name: 'Instituto Exemplo',
          acronym: 'IEX',
          image: 'https://cdn.example.org/iex.png',
        }}
      />,
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', 'https://cdn.example.org/iex.png');

    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('a > div > svg')).toBeInTheDocument();
  });

  it('não duplica eyebrow quando o nome é igual à sigla', () => {
    render(
      <InstitutionCard
        institution={{
          id: 'short-id',
          name: 'UESC',
          acronym: 'UESC',
        }}
      />,
    );
    expect(screen.getAllByText('UESC')).toHaveLength(1);
  });
});
