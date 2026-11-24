import type { GetPath, ResponseOf, Schema } from '@/api/types';
import rawExamples from './openapi-examples.json';

// Fixtures derivadas do contrato gerado (`simcc-v2.d.ts` via `src/api/types.ts`)
// combinadas com os 5 exemplos reais extraídos de `/v2/openapi.json`
// (`openapi-examples.json`).
//
// Os campos `deprecated` da v2 (`researcher_id`, `image`) saíram do contrato
// na virada (V4.1): as fixtures seguem o schema gerado sem exceções.
export type ModernResponse<P extends GetPath> = ResponseOf<P>;

export type V2JsonPath = Exclude<GetPath, '/researcher/{researcher_id}/image'>;

export type V2Fixtures = {
  [P in V2JsonPath]: ModernResponse<P>;
};

interface OpenApiExamplesFile {
  schemas: {
    ErrorResponse: Schema<'ErrorResponse'>[];
    FacetResult: Schema<'FacetResult'>[];
    MatchItem: Schema<'MatchItem'>[];
    Meta: Schema<'Meta'>[];
    Pagination: Schema<'Pagination'>[];
  };
}

const schemaExamples = (rawExamples as unknown as OpenApiExamplesFile).schemas;

function firstExample<T>(items: T[], name: string): T {
  const first = items[0];
  if (first === undefined) {
    throw new Error(
      `Exemplo "${name}" ausente em src/test/msw/openapi-examples.json.`,
    );
  }
  return first;
}

/** Exemplos reais extraídos dos schemas de `/v2/openapi.json`. */
export const openApiMeta = firstExample(schemaExamples.Meta, 'Meta');
export const openApiPagination = firstExample(
  schemaExamples.Pagination,
  'Pagination',
);
export const openApiFacetResult = firstExample(
  schemaExamples.FacetResult,
  'FacetResult',
);
export const openApiMatchItem = firstExample(
  schemaExamples.MatchItem,
  'MatchItem',
);

const [unknownParamError, notFoundError] = schemaExamples.ErrorResponse;
if (!unknownParamError || !notFoundError) {
  throw new Error(
    'Exemplos de ErrorResponse ausentes em src/test/msw/openapi-examples.json.',
  );
}

export const openApiErrors = {
  unknownParameter: unknownParamError,
  notFound: notFoundError,
} as const;

const defaultSort: Schema<'Sort'> = { by: 'relevance', order: 'desc' };

const institutionRef: Schema<'InstitutionRef'> = {
  id: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
  name: 'Universidade Estadual de Santa Cruz',
  acronym: 'UESC',
};

const cityRef: Schema<'CityRef'> = {
  id: '7d1a5e8c-1f4b-4a92-8b3e-5c6d7e8f9a01',
  name: 'Ilhéus',
};

const researcherRef: Schema<'ResearcherRef'> = {
  id: '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d',
  name: 'Ana Maria Silva',
  lattes_id: '1234567890123456',
};

const graduateProgramRef: Schema<'GraduateProgramRef'> = {
  id: '4c3b2a10-8e7d-4f6a-9b5c-1d2e3f4a5b6c',
  name: 'Programa de Pós-Graduação em Modelagem Computacional',
  acronym: 'PPGMC',
};

const magazineRef: Schema<'MagazineRef'> = {
  name: 'Revista Brasileira de Ciência do Solo',
  issn: '0100-0683',
  qualis: 'A2',
  qualis_status: null,
  jcr: 2.1,
};

const articleMatch: Schema<'ArticleMatch'> = {
  field: 'title',
  snippet: openApiMatchItem.snippet ?? 'Redes neurais aplicadas a solos',
  highlights: openApiMatchItem.highlights ?? [[0, 13]],
};

function makeListResponse<Item, Filters>(
  data: Item[],
  filters_applied: Filters,
  facets: Record<string, Schema<'FacetResult'>> | null = {
    institution: openApiFacetResult,
  },
) {
  return {
    data,
    pagination: openApiPagination,
    filters_applied,
    sort: defaultSort,
    meta: openApiMeta,
    facets,
  };
}

function makeDetailResponse<Data>(data: Data) {
  return {
    data,
    meta: openApiMeta,
  };
}

const researcherSummary: Schema<'ResearcherSummary'> = {
  id: researcherRef.id,
  name: researcherRef.name,
  image_url: `https://observatoriocti.secti.ba.gov.br/simcc/api/v2/researcher/${researcherRef.id}/image`,
  graduation: 'Doutorado',
  classification: 'A',
  lattes_update: '2026-10-15T12:00:00Z',
  affiliations: [
    {
      institution: institutionRef,
      workload: 40,
      identity_territory: 'Litoral Sul',
      city: cityRef,
    },
  ],
  counts: {
    articles: 24,
    book_chapters: 3,
    books: 1,
    patents: 2,
    software: 4,
    brands: 1,
    guidance: 12,
    reports: 2,
  },
  matches: {
    total: 1,
    by_type: { article: 1 },
    items: [openApiMatchItem],
  },
};

const researcherDetail: Schema<'ResearcherDetail'> = {
  id: researcherSummary.id,
  name: researcherSummary.name,
  image_url: researcherSummary.image_url,
  graduation: researcherSummary.graduation,
  classification: researcherSummary.classification,
  lattes_update: researcherSummary.lattes_update,
  affiliations: researcherSummary.affiliations,
  counts: researcherSummary.counts,
  abstract: 'Pesquisadora em ciência de dados aplicada à agricultura.',
  abstract_ai: null,
  identifiers: {
    lattes_id: '1234567890123456',
    lattes_10_id: 'K4712345Z1',
    orcid: '0000-0002-1825-0097',
    scopus: null,
    openalex: 'A5023888391',
  },
  bibliometrics: {
    h_index: 12,
    i10_index: 15,
    cited_by_count: 420,
    works_count: 34,
  },
  graduate_programs: [
    {
      program: graduateProgramRef,
      type: 'Permanente',
    },
  ],
  research_groups: [
    {
      id: '2a1b3c4d-5e6f-4789-8abc-def012345678',
      name: 'Grupo de Inteligência Computacional Aplicada',
    },
  ],
  education: [
    {
      degree: 'Doutorado',
      course: 'Ciência da Computação',
      institution: 'Universidade Federal da Bahia',
      start_year: 2014,
      end_year: 2018,
      status: 'Concluído',
      keywords: ['aprendizado de máquina', 'solos'],
    },
  ],
  experience: [
    {
      organization: institutionRef.name,
      start_year: 2019,
      end_year: null,
      employment_type: 'Servidor público',
      functional_classification: 'Professor Adjunto',
      workload_hours_weekly: 40,
      exclusive_dedication: true,
      additional_info: null,
    },
  ],
  foment: [
    {
      modality_code: 'PQ',
      modality: 'Produtividade em Pesquisa',
      category_level: '2',
      call_title: 'Chamada CNPq 09/2023',
      funding_program: 'Bolsas no País',
      institute: 'CNPq',
      aid_quantity: 1,
      scholarship_quantity: 1,
    },
  ],
};

const articleSummary: Schema<'ArticleSummary'> = {
  id: openApiMatchItem.source_id ?? '0b6f1c1e-2d4a-4c55-9f0e-2b7f3c9d1a11',
  title: openApiMatchItem.title ?? 'Redes neurais aplicadas a solos',
  year: openApiMatchItem.year ?? 2023,
  doi: '10.1590/18069657rbcs20230001',
  magazine: magazineRef,
  platform_authors: [researcherRef],
  citations_count: 18,
  has_abstract: true,
  has_open_access_pdf: true,
  matches: [articleMatch],
};

const articleDetail: Schema<'ArticleDetail'> = {
  ...articleSummary,
  authors: [{ name: 'SILVA, A. M.' }, { name: 'SOUZA, B. C.' }],
  abstract: 'Estudo de redes neurais aplicadas à classificação de solos.',
  landing_page_url: 'https://doi.org/10.1590/18069657rbcs20230001',
  pdf_url: 'https://example.org/artigo.pdf',
  keywords: ['redes neurais', 'solos', 'sensoriamento'],
  all_authors_raw: 'SILVA, A. M.; SOUZA, B. C.',
  language: 'pt',
};

const bookSummary: Schema<'BookSummary'> = {
  id: '11111111-2222-4333-8444-555555555551',
  title: 'Métodos computacionais para análise ambiental',
  year: 2022,
  isbn: '978-65-00-00001-1',
  publishing_company: 'Editus',
  platform_authors: [researcherRef],
  matches: null,
};

const bookDetail: Schema<'BookDetail'> = {
  ...bookSummary,
  authors: [{ name: 'SILVA, A. M.' }],
  doi: null,
  publishing_company_city: 'Ilhéus',
  all_authors_raw: 'SILVA, A. M.',
};

const bookChapterSummary: Schema<'BookChapterSummary'> = {
  id: '11111111-2222-4333-8444-555555555552',
  title: 'Modelagem preditiva na bacia do Rio Cachoeira',
  book_title: bookSummary.title,
  year: 2022,
  isbn: bookSummary.isbn,
  publishing_company: 'Editus',
  platform_authors: [researcherRef],
  matches: null,
};

const bookChapterDetail: Schema<'BookChapterDetail'> = {
  ...bookChapterSummary,
  authors: [{ name: 'SILVA, A. M.' }],
  doi: null,
  organizers: 'SOUZA, B. C.',
  start_page: '45',
  end_page: '72',
  all_authors_raw: 'SILVA, A. M.',
};

const softwareSummary: Schema<'SoftwareSummary'> = {
  id: '11111111-2222-4333-8444-555555555553',
  title: 'SoloVisão',
  year: 2024,
  platform: 'Web',
  environment: 'Linux',
  code: 'BR512024000123-4',
  platform_authors: [researcherRef],
  matches: null,
};

const softwareDetail: Schema<'SoftwareDetail'> = {
  ...softwareSummary,
  availability: 'Livre',
  financing: 'FAPESB',
};

const patentSummary: Schema<'PatentSummary'> = {
  id: '11111111-2222-4333-8444-555555555554',
  title: 'Sensor óptico portátil para umidade de solo',
  year: 2023,
  category: 'Produto',
  code: 'BR102023000456-7',
  platform_authors: [researcherRef],
  matches: null,
};

const patentDetail: Schema<'PatentDetail'> = {
  ...patentSummary,
  grant_date: null,
  deposit_date: '2023-05-10',
  details: 'Dispositivo embarcado com calibração espectral.',
};

const eventSummary: Schema<'EventSummary'> = {
  id: '11111111-2222-4333-8444-555555555555',
  title: 'Classificação de solos baianos por aprendizado profundo',
  event_name: 'Congresso Brasileiro de Ciência do Solo',
  year: 2024,
  nature: 'Congresso',
  type_participation: 'Apresentação Oral',
  platform_authors: [researcherRef],
  matches: null,
};

const eventDetail: Schema<'EventDetail'> = {
  ...eventSummary,
  form_participation: 'Apresentador',
};

const researchProjectSummary: Schema<'ResearchProjectSummary'> = {
  id: '11111111-2222-4333-8444-555555555556',
  title: 'Monitoramento inteligente de solos no Sul da Bahia',
  start_year: 2023,
  end_year: null,
  status: 'EM_ANDAMENTO',
  nature: 'PESQUISA',
  agency_name: 'FAPESB',
  platform_authors: [researcherRef],
  matches: null,
};

const researchProjectDetail: Schema<'ResearchProjectDetail'> = {
  ...researchProjectSummary,
  agency_code: 'FAPESB-001/2023',
  description: 'Projeto de pesquisa aplicada com sensores e redes neurais.',
  number_undergraduates: 3,
  number_specialists: 0,
  number_academic_masters: 2,
  number_phd: 1,
  foment: [
    {
      agency_name: 'FAPESB',
      agency_code: 'FAPESB-001/2023',
      nature: 'Auxílio',
    },
  ],
  components: [
    {
      name: researcherRef.name,
      lattes_id: researcherRef.lattes_id,
      citations: 'SILVA, A. M.',
      coordinator: true,
    },
  ],
  productions: [
    {
      title: articleSummary.title,
      type: 'article',
    },
  ],
};

const brandSummary: Schema<'BrandSummary'> = {
  id: '11111111-2222-4333-8444-555555555557',
  title: 'SOLOVISAO',
  year: 2024,
  nature: 'Marca de produto',
  platform_authors: [researcherRef],
  matches: null,
};

const brandDetail: Schema<'BrandDetail'> = {
  ...brandSummary,
  goal: 'Identificação de plataforma de análise de solos.',
};

const guidanceSummary: Schema<'GuidanceSummary'> = {
  id: '11111111-2222-4333-8444-555555555558',
  title: 'Visão computacional aplicada à fertilidade do solo',
  year: 2024,
  nature: 'Dissertação de mestrado',
  type: 'Orientador principal',
  status: 'Concluída',
  oriented: 'Carlos Eduardo Lima',
  platform_authors: [researcherRef],
  matches: null,
};

const guidanceDetail: Schema<'GuidanceDetail'> = {
  ...guidanceSummary,
};

const reportSummary: Schema<'ReportSummary'> = {
  id: '11111111-2222-4333-8444-555555555559',
  title: 'Relatório técnico de mapeamento pedológico regional',
  year: 2024,
  project_name: researchProjectSummary.title,
  platform_authors: [researcherRef],
  matches: null,
};

const reportDetail: Schema<'ReportDetail'> = {
  ...reportSummary,
  financing: 'SECTI-BA',
};

const magazineTextSummary: Schema<'MagazineTextSummary'> = {
  id: '11111111-2222-4333-8444-555555555560',
  title: 'Sensores de baixo custo chegam às lavouras do sul da Bahia',
  year: 2024,
  nature: 'JORNAL_DE_NOTICIAS',
  language: 'Português',
  means_divulgation: 'IMPRESSO',
  platform_authors: [researcherRef],
  matches: null,
};

const magazineTextDetail: Schema<'MagazineTextDetail'> = {
  ...magazineTextSummary,
  title_en: 'Low-cost sensors reach farms in southern Bahia',
  homepage: 'https://www.example.org/noticias/sensores',
  relevance: false,
  scientific_divulgation: true,
  all_authors_raw: 'SILVA, A. M.',
};

const eventWorkSummary: Schema<'EventWorkSummary'> = {
  id: '11111111-2222-4333-8444-555555555561',
  title: 'Classificação de solos tropicais com aprendizado profundo',
  year: 2023,
  nature: 'COMPLETO',
  event_name: 'Congresso Brasileiro de Ciência do Solo',
  event_classification: 'NACIONAL',
  platform_authors: [researcherRef],
  matches: null,
};

const eventWorkDetail: Schema<'EventWorkDetail'> = {
  ...eventWorkSummary,
  event_city: 'Florianópolis',
  event_year: 2023,
  proceedings_title: 'Anais do Congresso Brasileiro de Ciência do Solo',
  start_page: '45',
  end_page: '48',
  all_authors_raw: 'SILVA, A. M.',
};

const institutionDetail: Schema<'InstitutionDetail'> = {
  id: institutionRef.id,
  name: institutionRef.name,
  acronym: institutionRef.acronym,
  description: 'Universidade pública estadual localizada em Ilhéus, Bahia.',
  lattes_id: '000100000991',
  latitude: -14.7966,
  longitude: -39.1731,
  counts: {
    researchers: 412,
    graduate_programs: 18,
    scholarship_holders: 64,
    research_groups: 53,
    labs: 21,
  },
  scholarships: [
    {
      modality: 'Produtividade em Pesquisa',
      category_level: '2',
      researchers: 48,
    },
    {
      modality: 'Produtividade em Pesquisa',
      category_level: '1A',
      researchers: 16,
    },
  ],
};

const graduateProgramSummary: Schema<'GraduateProgramSummary'> = {
  id: graduateProgramRef.id,
  name: graduateProgramRef.name,
  acronym: graduateProgramRef.acronym,
  institution_id: institutionRef.id,
  area: 'INTERDISCIPLINAR',
  modality: 'Acadêmico',
  rating: '5',
  state: 'BA',
  city: 'Ilhéus',
};

const graduateProgramDetail: Schema<'GraduateProgramDetail'> = {
  ...graduateProgramSummary,
  institution: institutionRef,
  code: '28007010012P0',
  name_en: 'Graduate Program in Computational Modeling',
  type: 'Mestrado e Doutorado',
  description: 'Formação interdisciplinar em modelagem computacional.',
  site: 'https://www.uesc.br/cursos/pos_graduacao/ppgmc',
  coordinator: researcherRef.name,
  email: 'ppgmc@uesc.br',
  phone: null,
  start: '2008',
  research_lines: [
    {
      name: 'Inteligência Computacional e Ciência de Dados',
      area: 'CIENCIAS_EXATAS_E_DA_TERRA',
      start_year: 2018,
      end_year: null,
    },
  ],
  counts: {
    researchers: 22,
  },
};

const magazineItem: Schema<'Magazine'> = {
  id: '5d4c3b2a-1f0e-4987-a654-3210fedcba98',
  name: magazineRef.name,
  issn: magazineRef.issn,
  qualis: magazineRef.qualis,
  qualis_status: null,
  jcr: magazineRef.jcr,
  jcr_link: 'https://jcr.clarivate.com/',
  reference_period: '2017-2020',
};

const scholarshipItem: Schema<'Scholarship'> = {
  id: '6e5d4c3b-2a1f-4098-b765-43210fedcba9',
  researcher: {
    id: researcherRef.id,
    name: researcherRef.name,
  },
  modality: 'Produtividade em Pesquisa',
  category_level: '2',
  call_title: 'Chamada CNPq 09/2023',
  funding_program: 'Bolsas no País',
  institute: 'CNPq',
  aid_quantity: 1,
  scholarship_quantity: 1,
};

/** Fixtures padrão tipadas para todas as rotas JSON da API v2. */
export const v2Fixtures: V2Fixtures = {
  '/analytics': {
    data: [
      {
        date: '2026-11-19',
        event_name: 'page_view',
        country: 'Brazil',
        host_name: 'observatoriocti.secti.ba.gov.br',
        event_count: 1840,
        active_users: 412,
      },
    ],
    summary: {
      total_events: 1840,
      total_active_users: 412,
      start_date: '2026-11-01',
      end_date: '2026-11-19',
    },
    meta: openApiMeta,
  },
  '/analytics/pages': {
    data: [
      { page_path: '/busca', page_views: 920 },
      { page_path: '/pesquisadores', page_views: 610 },
    ],
    total: 2,
  },
  '/researcher': makeListResponse([researcherSummary], { search_in: 'all' }),
  '/researcher/{researcher_id}': makeDetailResponse(researcherDetail),
  '/institution': makeListResponse([institutionRef], {}, null),
  '/institution/{institution_id}': makeDetailResponse(institutionDetail),
  '/graduate-program': makeListResponse([graduateProgramSummary], {}),
  '/graduate-program/{program_id}': makeDetailResponse(graduateProgramDetail),
  '/production/article': makeListResponse([articleSummary], {}),
  '/production/article/{article_id}': makeDetailResponse(articleDetail),
  '/production/book': makeListResponse([bookSummary], {}),
  '/production/book/{book_id}': makeDetailResponse(bookDetail),
  '/production/book-chapter': makeListResponse([bookChapterSummary], {}),
  '/production/book-chapter/{chapter_id}':
    makeDetailResponse(bookChapterDetail),
  '/production/software': makeListResponse([softwareSummary], {}),
  '/production/software/{software_id}': makeDetailResponse(softwareDetail),
  '/production/patent': makeListResponse([patentSummary], {}),
  '/production/patent/{patent_id}': makeDetailResponse(patentDetail),
  '/production/event': makeListResponse([eventSummary], {}),
  '/production/event/{event_id}': makeDetailResponse(eventDetail),
  '/production/research-project': makeListResponse(
    [researchProjectSummary],
    {},
  ),
  '/production/research-project/{project_id}': makeDetailResponse(
    researchProjectDetail,
  ),
  '/production/brand': makeListResponse([brandSummary], {}),
  '/production/brand/{item_id}': makeDetailResponse(brandDetail),
  '/production/guidance': makeListResponse([guidanceSummary], {}),
  '/production/guidance/{item_id}': makeDetailResponse(guidanceDetail),
  '/production/report': makeListResponse([reportSummary], {}),
  '/production/report/{item_id}': makeDetailResponse(reportDetail),
  '/production/magazine-text': makeListResponse([magazineTextSummary], {}),
  '/production/magazine-text/{item_id}': makeDetailResponse(magazineTextDetail),
  '/production/event-work': makeListResponse([eventWorkSummary], {}),
  '/production/event-work/{item_id}': makeDetailResponse(eventWorkDetail),
  '/suggestion': {
    data: [
      {
        term: 'redes neurais',
        frequency: 42,
        source_types: ['article', 'abstract'],
      },
    ],
    meta: openApiMeta,
  },
  '/magazine': makeListResponse([magazineItem], {}, null),
  '/magazine/{magazine_id}': makeDetailResponse(magazineItem),
  '/scholarship': makeListResponse([scholarshipItem], {}, null),
  '/researcher/{researcher_id}/terms': {
    data: [
      { term: 'solos', frequency: 14 },
      { term: 'redes', frequency: 9 },
    ],
    meta: openApiMeta,
  },
  '/metrics/production/{kind}': {
    kind: 'article',
    data: [
      { period: 2022, value: 310 },
      { period: 2023, value: 345 },
      { period: 2024, value: 380 },
    ],
    filters_applied: {},
    meta: openApiMeta,
  },
  '/metrics/general': {
    data: {
      articles: 412000,
      books: 9800,
      book_chapters: 31000,
      work_in_event: 158000,
      patents: 1200,
      software: 2100,
      brands: 640,
      researchers: 16900,
    },
    meta: openApiMeta,
  },
};
