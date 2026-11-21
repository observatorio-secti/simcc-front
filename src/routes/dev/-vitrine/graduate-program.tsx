import type {
  GraduateProgramDetail,
  GraduateProgramSummary,
  ResearchLine,
} from '@/entities/graduate-program/model';
import { ProgramCard } from '@/entities/graduate-program/ui/program-card';
import { ProgramRef } from '@/entities/graduate-program/ui/program-ref';
import { ResearchLines } from '@/entities/graduate-program/ui/research-lines';
import { Demo, Showcase } from './showcase';

const PGCOMP_PROGRAM: GraduateProgramDetail = {
  id: '00000000-0000-4000-8000-000000000101',
  name: 'Programa de Pós-Graduação em Ciência da Computação',
  acronym: 'PGCOMP',
  institution_id: 'inst-ufba',
  area: 'CIÊNCIA DA COMPUTAÇÃO',
  modality: 'ACADÊMICO',
  rating: '6',
  state: 'BA',
  city: 'SALVADOR',
  type: 'Mestrado e Doutorado',
  institution: {
    id: 'inst-ufba',
    name: 'Universidade Federal da Bahia',
    acronym: 'UFBA',
  },
  counts: { researchers: 38 },
  research_lines: [
    {
      name: 'Engenharia de Software e Sistemas Distribuídos',
      area: 'CIÊNCIA DA COMPUTAÇÃO',
      start_year: 2012,
      end_year: null,
    },
    {
      name: 'Inteligência Computacional e Ciência de Dados',
      area: 'CIÊNCIA DA COMPUTAÇÃO',
      start_year: 2015,
      end_year: null,
    },
    {
      name: 'Redes de Computadores e Segurança',
      area: 'CIÊNCIA DA COMPUTAÇÃO',
      start_year: 2009,
      end_year: 2023,
    },
  ],
};

const SAUDE_COLETIVA_PROGRAM: GraduateProgramDetail = {
  id: '00000000-0000-4000-8000-000000000102',
  name: 'Programa de Pós-Graduação em Saúde Coletiva',
  acronym: 'PPGSC',
  institution_id: 'inst-uefs',
  area: 'SAÚDE COLETIVA',
  modality: 'ACADÊMICO',
  rating: '5',
  state: 'BA',
  city: 'FEIRA DE SANTANA',
  institution: {
    id: 'inst-uefs',
    name: 'Universidade Estadual de Feira de Santana',
    acronym: 'UEFS',
  },
  counts: { researchers: 24 },
  research_lines: [
    {
      name: 'Epidemiologia das Doenças Transmissíveis e Crônicas',
      area: 'SAÚDE COLETIVA',
      start_year: 2011,
      end_year: null,
    },
    {
      name: 'Políticas, Planejamento e Gestão em Saúde',
      area: 'SAÚDE COLETIVA',
      start_year: 2014,
      end_year: null,
    },
  ],
};

const BIOTEC_PROGRAM: GraduateProgramSummary = {
  id: '00000000-0000-4000-8000-000000000103',
  name: 'Mestrado Profissional em Propriedade Intelectual e Transferência de Tecnologia para a Inovação',
  acronym: 'PROFNIT',
  institution_id: 'inst-uesc',
  area: 'INTERDISCIPLINAR',
  modality: 'PROFISSIONAL',
  rating: '4',
  state: 'BA',
  city: 'ILHÉUS',
};

const HUMANAS_PROGRAM: GraduateProgramDetail = {
  id: '00000000-0000-4000-8000-000000000104',
  name: 'Programa de Pós-Graduação em Educação e Contemporaneidade',
  acronym: 'PPGEduC',
  institution_id: 'inst-uneb',
  area: 'EDUCAÇÃO',
  modality: 'ACADÊMICO',
  rating: '5',
  state: 'BA',
  city: 'SALVADOR',
  institution: {
    id: 'inst-uneb',
    name: 'Universidade do Estado da Bahia',
    acronym: 'UNEB',
  },
  counts: { researchers: 42 },
  research_lines: [],
};

const SAMPLE_LINES: readonly ResearchLine[] = [
  ...(PGCOMP_PROGRAM.research_lines ?? []),
  {
    name: 'Tecnologias Educacionais e Inovação Aberta',
    area: 'INTERDISCIPLINAR',
    start_year: 2019,
    end_year: null,
  },
  {
    name: 'Modelagem Matemática Aplicada à Saúde',
    area: 'SAÚDE COLETIVA',
    start_year: 2016,
    end_year: 2022,
  },
  {
    name: 'Políticas Públicas de CT&I na Bahia',
    area: 'EDUCAÇÃO',
    start_year: 2020,
    end_year: null,
  },
];

export function GraduateProgramShowcase() {
  return (
    <Showcase
      id="programa"
      title="Programa de pós-graduação (entidade)"
      description="Componentes de src/entities/graduate-program/ui/: ProgramRef, ProgramCard (sc-entity) e ResearchLines."
      bare
    >
      <div className="flex flex-col gap-6">
        <div className="rounded-lg border bg-card p-4 md:p-6">
          <Demo label="ProgramRef">
            <ProgramRef program={PGCOMP_PROGRAM} />
            <ProgramRef program={SAUDE_COLETIVA_PROGRAM} showIcon showAcronym />
            <ProgramRef
              program={BIOTEC_PROGRAM}
              showIcon
              showAcronym
              meta="Permanente"
            />
          </Demo>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            ProgramCard (sc-entity)
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ProgramCard program={PGCOMP_PROGRAM} />
            <ProgramCard program={SAUDE_COLETIVA_PROGRAM} />
            <ProgramCard
              program={BIOTEC_PROGRAM}
              institutionLabel="UESC"
              researchersCount={19}
              researchLinesCount={3}
            />
            <ProgramCard program={HUMANAS_PROGRAM} />
          </div>
        </div>

        <ResearchLines lines={SAMPLE_LINES} />

        <ResearchLines lines={[]} showLayoutToggle={false} />
      </div>
    </Showcase>
  );
}
