import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ResearchGroup } from '../model';
import { ResearchGroupCard } from './research-group-card';

const baseGroup: ResearchGroup = {
  id: 'grp-1',
  name: 'Núcleo de Estudos em Inteligência Computacional',
  area: 'Ciências da Saúde',
  knowledgeArea: 'Ciências da Saúde',
  knowledgeAreas: ['Ciências da Saúde'],
  dgpId: '123456',
  foundedYear: 2018,
  status: 'ATIVO',
  repercussion: null,
  headquarters: {
    id: 'inst-1',
    name: 'Universidade Estadual de Santa Cruz',
    acronym: 'UESC',
    relationship: 'SEDE',
    isHeadquarters: true,
    imageUrl: null,
    unitName: null,
    unitState: 'BA',
    stateAcronym: 'BA',
    stateName: 'Bahia',
    region: 'Nordeste',
  },
  partnerInstitutions: [],
  institutionLabel: 'UESC - Universidade Estadual de Santa Cruz',
  institutionAcronym: 'UESC',
  leaders: [
    { id: 'm-1', name: 'Ana Souza', isLeader: true, lattesId: null },
    { id: 'm-2', name: 'Bruno Lima', isLeader: true, lattesId: null },
  ],
  members: [],
  memberCount: 14,
  researchLines: [],
  researchLineCount: 4,
  contact: { email: null, phone: null, website: null },
  address: {
    street: null,
    number: null,
    complement: null,
    neighborhood: null,
    city: 'Ilhéus',
    state: 'BA',
    postalCode: null,
    latitude: null,
    longitude: null,
  },
};

describe('ResearchGroupCard', () => {
  it('renderiza card sem sombra no padrão sc-entity com ícone 56px, instituição, líderes e contagens', () => {
    const { container } = render(<ResearchGroupCard group={baseGroup} />);

    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeInTheDocument();
    expect(card?.className).not.toMatch(/shadow-/);

    const iconBox = container.querySelector('[data-slot="entity-icon"]');
    expect(iconBox?.className).toContain('size-14');

    const link = screen.getByRole('link', {
      name: 'Núcleo de Estudos em Inteligência Computacional',
    });
    expect(link).toHaveAttribute('href', '/grupos-pesquisa/grp-1');

    expect(
      screen.getByText('UESC - Universidade Estadual de Santa Cruz'),
    ).toBeInTheDocument();
    expect(screen.getByText('Ana Souza, Bruno Lima')).toBeInTheDocument();
    expect(screen.getByText('14 membros')).toBeInTheDocument();
    expect(screen.getByText('4 linhas de pesquisa')).toBeInTheDocument();
    expect(screen.getByText('Ilhéus - BA')).toBeInTheDocument();

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge).toHaveAttribute('data-variant', 'solid');
    expect(badge?.className).toContain('bg-area-saude');
  });

  it('usa outline + Dot para grande área clara (Exatas) conforme DESIGN.md §2.4', () => {
    const { container } = render(
      <ResearchGroupCard
        group={{
          ...baseGroup,
          area: 'Ciência da Computação',
          knowledgeArea: 'Ciências Exatas e da Terra',
          knowledgeAreas: ['Ciências Exatas e da Terra'],
        }}
      />,
    );

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge).toHaveAttribute('data-variant', 'outline');
    expect(badge?.className).not.toContain('bg-area-exatas');

    const dot = container.querySelector('[data-slot="dot"]');
    expect(dot?.className).toContain('bg-area-exatas');
    expect(screen.getByText('Ciência da Computação')).toBeInTheDocument();
  });

  it('usa outline + Dot neutro para área não mapeada e lida com campos opcionais ausentes', () => {
    const { container } = render(
      <ResearchGroupCard
        group={{
          ...baseGroup,
          area: 'Área Especial Não Catalogada',
          knowledgeArea: null,
          knowledgeAreas: [],
          institutionLabel: '',
          institutionAcronym: null,
          leaders: [],
          memberCount: 1,
          researchLineCount: 0,
          address: {
            ...baseGroup.address,
            city: null,
            state: null,
          },
        }}
      />,
    );

    const badge = container.querySelector('[data-slot="badge"]');
    expect(badge).toHaveAttribute('data-variant', 'outline');
    const dot = container.querySelector('[data-slot="dot"]');
    expect(dot?.className).toContain('bg-neutral-400');

    expect(screen.getByText('1 membro')).toBeInTheDocument();
    expect(screen.getByText('0 linhas de pesquisa')).toBeInTheDocument();
  });
});
