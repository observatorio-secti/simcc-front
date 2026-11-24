import type {
  InstitutionCounts,
  InstitutionSummary,
} from '@/entities/institution/model';
import { InstitutionCard } from '@/entities/institution/ui/institution-card';
import { InstitutionRef } from '@/entities/institution/ui/institution-ref';
import { Demo, Showcase } from './showcase';

interface InstitutionDemoItem {
  institution: InstitutionSummary;
  counts?: InstitutionCounts;
  researchGroupsCount?: number;
}

const SAMPLE_INSTITUTIONS: InstitutionDemoItem[] = [
  {
    institution: {
      id: 'f1ac00a8-15d9-4306-a893-c611636601d6',
      name: 'Universidade Federal Da Bahia',
      acronym: 'UFBA',
    },
    counts: {
      researchers: 2450,
      graduate_programs: 84,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
    researchGroupsCount: 412,
  },
  {
    institution: {
      id: 'f670bac4-e1ab-452c-af25-300e994759c3',
      name: 'Universidade Estadual De Santa Cruz',
      acronym: 'UESC',
    },
    counts: {
      researchers: 618,
      graduate_programs: 26,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
    researchGroupsCount: 115,
  },
  {
    institution: {
      id: 'd752090d-8ecf-458f-a9fb-3e7b3659a9f0',
      name: 'Universidade Estadual De Feira De Santana',
      acronym: 'UEFS',
    },
    counts: {
      researchers: 780,
      graduate_programs: 24,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: '36422e54-342b-4a4d-9879-edac6235343d',
      name: 'Universidade Estadual Do Sudoeste Da Bahia',
      acronym: 'UESB',
    },
    counts: {
      researchers: 710,
      graduate_programs: 22,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: '815f5ab1-3340-45b0-97d1-c16f93909caa',
      name: 'Universidade Do Estado Da Bahia',
      acronym: 'UNEB',
    },
    counts: {
      researchers: 1120,
      graduate_programs: 28,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: '73cdfd5f-e313-42c9-a90d-38ed38260d48',
      name: 'Universidade Federal Do Recôncavo Da Bahia',
      acronym: 'UFRB',
    },
    counts: {
      researchers: 495,
      graduate_programs: 18,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: 'ecafd569-d31f-429b-ba33-26780f46b990',
      name: 'Universidade Federal Do Oeste Da Bahia',
      acronym: 'UFOB',
    },
    counts: {
      researchers: 312,
      graduate_programs: 9,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: '3c0594c8-ffbe-43e2-901a-b109e2e99985',
      name: 'Universidade Federal Do Sul Da Bahia',
      acronym: 'UFSB',
    },
    counts: {
      researchers: 284,
      graduate_programs: 11,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: 'f1e4790b-5053-4aa2-89f4-37c2978d4086',
      name: 'Instituto Federal De Educação, Ciência E Tecnologia Da Bahia',
      acronym: 'IFBA',
    },
    counts: {
      researchers: 540,
      graduate_programs: 12,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: 'dc6b3b63-2ada-49cb-bbca-f888ff31d56b',
      name: 'Escola Bahiana De Medicina E Saúde Pública',
      acronym: 'EBMSP',
    },
    counts: {
      researchers: 196,
      graduate_programs: 5,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: 'd18e767a-72d4-43a9-beef-8999feb57266',
      name: 'Fundação Oswaldo Cruz',
      acronym: 'FIOCRUZ',
    },
    counts: {
      researchers: 145,
      graduate_programs: 4,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
  },
  {
    institution: {
      id: '99999999-0000-4000-8000-000000000001',
      name: 'Centro Universitário SENAI CIMATEC',
      acronym: 'CIMATEC',
    },
    counts: {
      researchers: 164,
      graduate_programs: 6,
      scholarship_holders: 0,
      research_groups: 0,
      labs: 0,
    },
    researchGroupsCount: 28,
  },
  {
    institution: {
      id: '99999999-0000-4000-8000-000000000002',
      name: 'Instituto Baiano de Pesquisa Aplicada',
      acronym: null,
    },
  },
];

export function InstitutionShowcase() {
  return (
    <Showcase
      id="instituicao"
      title="Instituição (E3)"
      description="InstitutionRef e InstitutionCard (sc-entity), logos claros/escuros do legado, fallback Building2 e contagens formatadas em pt-BR."
    >
      <Demo label="InstitutionRef">
        <div className="flex flex-col gap-2">
          <InstitutionRef institution={SAMPLE_INSTITUTIONS[0]!.institution} />
          <InstitutionRef
            institution={SAMPLE_INSTITUTIONS[1]!.institution}
            showIcon
          />
          <div className="flex flex-wrap items-center gap-4">
            <InstitutionRef
              institution={SAMPLE_INSTITUTIONS[2]!.institution}
              display="acronym"
              showIcon
            />
            <InstitutionRef
              institution={SAMPLE_INSTITUTIONS[10]!.institution}
              display="name"
            />
            <InstitutionRef
              institution={SAMPLE_INSTITUTIONS[12]!.institution}
            />
          </div>
        </div>
      </Demo>

      <Demo label="InstitutionCard — logos claros/escuros, fallback Building2 e contagens">
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {SAMPLE_INSTITUTIONS.map((item) => (
            <InstitutionCard
              key={item.institution.id}
              institution={item.institution}
              counts={item.counts}
              researchGroupsCount={item.researchGroupsCount}
            />
          ))}
        </div>
      </Demo>
    </Showcase>
  );
}
