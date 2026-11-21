import type { ResearchGroup } from '@/entities/research-group/model';
import { GroupRef } from '@/entities/research-group/ui/group-ref';
import { ResearchGroupCard } from '@/entities/research-group/ui/research-group-card';
import { Demo, Showcase } from './showcase';

const emptyContact = { email: null, phone: null, website: null };

const SAMPLE_GROUPS: ResearchGroup[] = [
  {
    id: 'oda-grp-saude',
    name: 'Núcleo de Epidemiologia e Saúde Coletiva da Bahia',
    area: 'Ciências da Saúde',
    knowledgeArea: 'Ciências da Saúde',
    knowledgeAreas: ['Ciências da Saúde'],
    dgpId: '004218991',
    foundedYear: 2014,
    status: 'ATIVO',
    repercussion: null,
    headquarters: {
      id: 'inst-ufba',
      name: 'Universidade Federal da Bahia',
      acronym: 'UFBA',
      relationship: 'SEDE',
      isHeadquarters: true,
      imageUrl: null,
      unitName: 'Instituto de Saúde Coletiva',
      unitState: 'BA',
      stateAcronym: 'BA',
      stateName: 'Bahia',
      region: 'Nordeste',
    },
    partnerInstitutions: [],
    institutionLabel: 'UFBA - Universidade Federal da Bahia',
    institutionAcronym: 'UFBA',
    leaders: [
      {
        id: 'm-1',
        name: 'Mariana Costa Silva',
        isLeader: true,
        lattesId: null,
      },
      {
        id: 'm-2',
        name: 'Rafael Santos Oliveira',
        isLeader: true,
        lattesId: null,
      },
    ],
    members: [],
    memberCount: 24,
    researchLines: [],
    researchLineCount: 5,
    contact: emptyContact,
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
  },
  {
    id: 'oda-grp-exatas',
    name: 'Laboratório de Sistemas Distribuídos e Computação em Nuvem',
    area: 'Ciência da Computação',
    knowledgeArea: 'Ciências Exatas e da Terra',
    knowledgeAreas: ['Ciências Exatas e da Terra', 'Ciência da Computação'],
    dgpId: '008914320',
    foundedYear: 2018,
    status: 'ATIVO',
    repercussion: null,
    headquarters: {
      id: 'inst-uesc',
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
    leaders: [
      {
        id: 'm-3',
        name: 'Lucas Andrade Ferreira',
        isLeader: true,
        lattesId: null,
      },
      { id: 'm-4', name: 'Beatriz Almeida', isLeader: true, lattesId: null },
      { id: 'm-5', name: 'Tiago Nogueira', isLeader: true, lattesId: null },
    ],
    members: [],
    memberCount: 16,
    researchLines: [],
    researchLineCount: 3,
    contact: emptyContact,
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
  },
  {
    id: 'oda-grp-engenharias',
    name: 'Grupo de Materiais Avançados e Energias Renováveis',
    area: 'Engenharias',
    knowledgeArea: 'Engenharias',
    knowledgeAreas: ['Engenharias'],
    dgpId: null,
    foundedYear: 2021,
    status: 'CERTIFICADO',
    repercussion: null,
    headquarters: {
      id: 'inst-ifba',
      name: 'Instituto Federal da Bahia',
      acronym: 'IFBA',
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
    institutionLabel: 'IFBA - Instituto Federal da Bahia',
    institutionAcronym: 'IFBA',
    leaders: [
      {
        id: 'm-6',
        name: 'Camila Mendes Pereira',
        isLeader: true,
        lattesId: null,
      },
    ],
    members: [],
    memberCount: 9,
    researchLines: [],
    researchLineCount: 2,
    contact: emptyContact,
    address: {
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: 'Vitória da Conquista',
      state: 'BA',
      postalCode: null,
      latitude: null,
      longitude: null,
    },
  },
  {
    id: 'oda-grp-fallback',
    name: 'Observatório Territorial e Desenvolvimento Regional',
    area: 'Estudos Interdisciplinares em Territórios',
    knowledgeArea: null,
    knowledgeAreas: [],
    dgpId: null,
    foundedYear: null,
    status: null,
    repercussion: null,
    headquarters: null,
    partnerInstitutions: [],
    institutionLabel: 'UNEB - Universidade do Estado da Bahia',
    institutionAcronym: 'UNEB',
    leaders: [],
    members: [],
    memberCount: 1,
    researchLines: [],
    researchLineCount: 0,
    contact: emptyContact,
    address: {
      street: null,
      number: null,
      complement: null,
      neighborhood: null,
      city: null,
      state: null,
      postalCode: null,
      latitude: null,
      longitude: null,
    },
  },
];

export function ResearchGroupShowcase() {
  return (
    <Showcase
      id="grupo-pesquisa"
      title="Grupo de pesquisa"
      description="Entidade alimentada pelo adaptador da API ODA (ADR 0007): GroupRef e ResearchGroupCard no padrão sc-entity."
    >
      <Demo
        label="GroupRef (referências inline)"
        className="flex-col items-start gap-2"
      >
        <GroupRef
          group={{
            id: SAMPLE_GROUPS[0]!.id,
            name: SAMPLE_GROUPS[0]!.name,
            institutionAcronym: SAMPLE_GROUPS[0]!.institutionAcronym,
          }}
        />
        <GroupRef
          group={{
            id: SAMPLE_GROUPS[1]!.id,
            name: SAMPLE_GROUPS[1]!.name,
          }}
        />
        <GroupRef group={{ id: 'sem-nome', name: null }} showIcon={false} />
      </Demo>

      <Demo label="ResearchGroupCard (grade sc-entity)" className="w-full">
        <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SAMPLE_GROUPS.map((group) => (
            <ResearchGroupCard key={group.id} group={group} />
          ))}
        </div>
      </Demo>
    </Showcase>
  );
}
