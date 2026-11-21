import { describe, expect, it } from 'vitest';
import type { ResearchGroup } from '@/entities/research-group/model';
import {
  buildGroupFacets,
  computeGroupStats,
  filterAndSortGroups,
  getGroupFacetDotClass,
} from './filter-groups';
import { researchGroupsSearch } from './search';

function makeGroup(overrides: Partial<ResearchGroup> = {}): ResearchGroup {
  return {
    id: 'grp-1',
    name: 'Grupo de Inteligência Artificial',
    area: 'Ciências Exatas e da Terra',
    knowledgeArea: 'Ciências Exatas e da Terra',
    knowledgeAreas: ['Ciências Exatas e da Terra'],
    dgpId: '123456',
    foundedYear: 2018,
    status: 'ATIVO',
    repercussion: 'Impacto regional em IA.',
    headquarters: {
      id: 'inst-1',
      name: 'Universidade Estadual de Santa Cruz',
      acronym: 'UESC',
      relationship: 'SEDE',
      isHeadquarters: true,
      imageUrl: null,
      unitName: 'DCET',
      unitState: 'BA',
      stateAcronym: 'BA',
      stateName: 'Bahia',
      region: 'Nordeste',
    },
    partnerInstitutions: [],
    institutionLabel: 'UESC - Universidade Estadual de Santa Cruz',
    institutionAcronym: 'UESC',
    leaders: [{ id: 'm-1', name: 'Ana Souza', isLeader: true, lattesId: null }],
    members: [{ id: 'm-1', name: 'Ana Souza', isLeader: true, lattesId: null }],
    memberCount: 8,
    researchLines: [{ title: 'Aprendizado de Máquina', objective: null }],
    researchLineCount: 2,
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
    ...overrides,
  };
}

const sampleGroups: ResearchGroup[] = [
  makeGroup({
    id: 'grp-1',
    name: 'Núcleo de Inteligência Artificial',
    area: 'Ciências Exatas e da Terra',
    institutionAcronym: 'UESC',
    institutionLabel: 'UESC',
    status: 'ATIVO',
    foundedYear: 2018,
    memberCount: 12,
    researchLineCount: 4,
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
  }),
  makeGroup({
    id: 'grp-2',
    name: 'Laboratório de Saúde Coletiva',
    area: 'Ciências da Saúde',
    knowledgeArea: 'Ciências da Saúde',
    knowledgeAreas: ['Ciências da Saúde'],
    institutionAcronym: 'UFBA',
    institutionLabel: 'UFBA',
    status: 'CERTIFICADO',
    foundedYear: 2012,
    memberCount: 20,
    researchLineCount: 3,
    leaders: [
      { id: 'm-2', name: 'Carlos Lima', isLeader: true, lattesId: null },
    ],
    address: {
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: 'Salvador',
      state: 'BA',
      postalCode: null,
      latitude: null,
      longitude: null,
    },
  }),
  makeGroup({
    id: 'grp-3',
    name: 'Estudos em Educação Inclusiva',
    area: 'Ciências Humanas',
    knowledgeArea: 'Ciências Humanas',
    knowledgeAreas: ['Ciências Humanas'],
    institutionAcronym: 'UEFS',
    institutionLabel: 'UEFS',
    status: 'EM_PREENCHIMENTO',
    foundedYear: 2021,
    memberCount: 5,
    researchLineCount: 1,
    address: {
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: 'Feira de Santana',
      state: 'BA',
      postalCode: null,
      latitude: null,
      longitude: null,
    },
  }),
];

describe('filterAndSortGroups', () => {
  it('filtra por termo de busca sem diferenciar acentos ou maiúsculas', () => {
    const search = researchGroupsSearch.parse({ q: 'inteligencia' });
    const result = filterAndSortGroups(sampleGroups, search);
    expect(result.map((g) => g.id)).toEqual(['grp-1']);
  });

  it('filtra por facetas de área, instituição e situação', () => {
    const search = researchGroupsSearch.parse({
      area: ['Ciências da Saúde'],
      institution: ['UFBA'],
      status: ['Certificado'],
    });
    const result = filterAndSortGroups(sampleGroups, search);
    expect(result.map((g) => g.id)).toEqual(['grp-2']);
  });

  it('ordena por membros desc e por ano asc', () => {
    const byMembers = filterAndSortGroups(
      sampleGroups,
      researchGroupsSearch.parse({ sort_by: 'members', sort_order: 'desc' }),
    );
    expect(byMembers.map((g) => g.id)).toEqual(['grp-2', 'grp-1', 'grp-3']);

    const byYear = filterAndSortGroups(
      sampleGroups,
      researchGroupsSearch.parse({ sort_by: 'year', sort_order: 'asc' }),
    );
    expect(byYear.map((g) => g.id)).toEqual(['grp-2', 'grp-1', 'grp-3']);
  });
});

describe('buildGroupFacets e computeGroupStats', () => {
  it('gera facetas ordenadas por contagem e resolve cor de área', () => {
    const search = researchGroupsSearch.parse({ institution: ['UFBA'] });
    const facets = buildGroupFacets(sampleGroups, search);

    expect(facets.area?.items).toHaveLength(3);
    expect(
      facets.institution?.items.find((item) => item.value === 'UFBA')?.selected,
    ).toBe(true);
    expect(getGroupFacetDotClass('area', 'Ciências da Saúde')).toBe(
      'bg-area-saude',
    );
    expect(getGroupFacetDotClass('institution', 'UFBA')).toBeUndefined();
  });

  it('calcula os KPIs e distribuições agregadas', () => {
    const stats = computeGroupStats(sampleGroups);
    expect(stats.totalGroups).toBe(3);
    expect(stats.totalInstitutions).toBe(3);
    expect(stats.totalMembers).toBe(37);
    expect(stats.totalLines).toBe(8);
    expect(stats.byArea).toHaveLength(3);
    expect(stats.byInstitution).toHaveLength(3);
  });
});
