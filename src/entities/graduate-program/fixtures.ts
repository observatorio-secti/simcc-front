import type { GraduateProgramDetail, GraduateProgramSummary } from './model';

// Exemplos no formato da v2, para testes e para a vitrine. Ids fictícios; os
// valores seguem respostas reais de `/v2/graduate-program` (caixa alta da
// CAPES inclusive).

export const programSummaryFixture: GraduateProgramSummary = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Modelagem Computacional em Ciência e Tecnologia',
  acronym: 'PPGMC',
  institution_id: '00000000-0000-4000-8000-000000000002',
  area: 'INTERDISCIPLINAR',
  modality: 'ACADÊMICO',
  rating: '4',
  state: 'BA',
  city: 'Ilhéus',
};

export const programDetailFixture: GraduateProgramDetail = {
  ...programSummaryFixture,
  institution: {
    id: '00000000-0000-4000-8000-000000000002',
    name: 'Universidade Estadual de Santa Cruz',
    acronym: 'UESC',
  },
  code: '28007018005P0',
  name_en: 'Computational Modeling in Science and Technology',
  type: 'Mestrado/Doutorado',
  description: null,
  site: 'www.uesc.br/cursos/pos_graduacao/mestrado/modelagem',
  coordinator: 'Coordenação do PPGMC',
  email: 'ppgmc@uesc.br',
  phone: '7336805000',
  start: '2006-03-01',
  research_lines: [
    {
      name: 'Modelagem de sistemas biológicos e ambientais',
      area: 'Interdisciplinar',
      start_year: 2006,
      end_year: null,
    },
    {
      name: 'Computação científica e métodos numéricos',
      area: 'Ciência da Computação',
      start_year: 2006,
      end_year: 2018,
    },
    {
      name: 'Física computacional',
      area: null,
      start_year: null,
      end_year: null,
    },
  ],
  counts: { researchers: 27 },
};
