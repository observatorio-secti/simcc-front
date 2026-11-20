import { useState } from 'react';
import {
  PRODUCTION_KINDS,
  normalizeProductionKind,
  type ProductionDetailByKind,
  type ProductionKind,
  type ProductionSummaryByKind,
} from '@/entities/production/model';
import { PRODUCTION_REGISTRY } from '@/entities/production/registry';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { ProductionDetail } from '@/entities/production/ui/production-detail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Demo, Showcase } from './showcase';

const AUTHORS = [
  { id: '11111111-1111-4111-8111-111111111111', name: 'Helena Duarte Ramos' },
  { id: '22222222-2222-4222-8222-222222222222', name: 'Caio Menezes Barreto' },
];

const ARTICLE_SAMPLES: ProductionSummaryByKind['article'][] = [
  {
    id: 'art-a1',
    title:
      'Arquitetura integrada x-in-the-loop para simulação de veículos de superfície autônomos',
    year: 2025,
    doi: '10.1016/j.robot.2025.104512',
    magazine: {
      name: 'Robotics and Autonomous Systems',
      issn: '0921-8890',
      qualis: 'A1',
      qualis_status: null,
      jcr: 4.3,
    },
    platform_authors: AUTHORS,
    citations_count: 14,
    has_abstract: true,
    has_open_access_pdf: true,
    matches: [
      {
        field: 'abstract',
        snippet:
          'Simulação em tempo real de veículos autônomos na costa da Bahia.',
        highlights: [[27, 45]],
      },
    ],
  },
  {
    id: 'art-a3',
    title:
      'Modelagem hidrogeoquímica de aquíferos cársticos no semiárido baiano',
    year: 2024,
    doi: '10.1007/s12665-024-11400-1',
    magazine: {
      name: 'Environmental Earth Sciences',
      issn: '1866-6280',
      qualis: 'A3',
      qualis_status: null,
      jcr: 2.8,
    },
    platform_authors: [AUTHORS[0]!],
    citations_count: 3,
    has_abstract: true,
    has_open_access_pdf: false,
  },
  {
    id: 'art-sq',
    title:
      'Linearização de controle preditivo para robôs móveis com restrições cinemáticas',
    year: 2023,
    doi: null,
    magazine: null,
    platform_authors: [AUTHORS[1]!],
    citations_count: 1,
    has_abstract: false,
    has_open_access_pdf: false,
  },
];

const OTHER_SAMPLES: Array<
  {
    [K in Exclude<ProductionKind, 'article'>]: {
      kind: K;
      item: ProductionSummaryByKind[K];
    };
  }[Exclude<ProductionKind, 'article'>]
> = [
  {
    kind: 'book',
    item: {
      id: 'book-1',
      title: 'Sistemas ciberfísicos e robótica aplicada à indústria 4.0',
      year: 2024,
      isbn: '978-65-88123-45-6',
      publishing_company: 'EDUFBA',
      platform_authors: AUTHORS,
    },
  },
  {
    kind: 'book_chapter',
    item: {
      id: 'chap-1',
      title: 'Controle preditivo não linear embarcado em sistemas autônomos',
      book_title: 'Avanços em Automação e Controle no Nordeste',
      year: 2024,
      isbn: '978-85-7455-512-0',
      publishing_company: 'Editus',
      platform_authors: [AUTHORS[0]!],
    },
  },
  {
    kind: 'software',
    item: {
      id: 'soft-1',
      title: 'SimccViz — Painel analítico de redes de colaboração científica',
      year: 2025,
      platform: 'Web / Linux',
      environment: 'TypeScript · React',
      code: 'BR512025000412-8',
      platform_authors: AUTHORS,
    },
  },
  {
    kind: 'patent',
    item: {
      id: 'pat-1',
      title:
        'Dispositivo sensor óptico de baixo custo para monitoramento de turbidez hídrica',
      year: 2023,
      category: 'Privilégio de Inovação',
      code: 'BR102023015482-1',
      platform_authors: [AUTHORS[1]!],
    },
  },
  {
    kind: 'event',
    item: {
      id: 'evt-1',
      title: 'Percepção visual em subestações elétricas sob neblina intensa',
      event_name: 'Congresso Brasileiro de Automática (CBA)',
      year: 2024,
      nature: 'Congresso',
      type_participation: 'Apresentação oral',
      platform_authors: [AUTHORS[0]!],
    },
  },
  {
    kind: 'event',
    item: {
      id: 'evt-2',
      title: null,
      event_name: 'Oficina Estadual de Dados Abertos de CT&I',
      year: 2025,
      nature: 'Oficina',
      type_participation: 'Palestrante',
      platform_authors: [AUTHORS[1]!],
    },
  },
  {
    kind: 'research_project',
    item: {
      id: 'proj-1',
      title:
        'Monitoramento inteligente de bacias hidrográficas do sul da Bahia com IoT',
      start_year: 2023,
      end_year: null,
      status: 'EM_ANDAMENTO',
      nature: 'PESQUISA',
      agency_name: 'FAPESB',
      platform_authors: AUTHORS,
    },
  },
  {
    kind: 'brand',
    item: {
      id: 'brand-1',
      title: 'OBSERVATÓRIO SIMCC BAHIA',
      year: 2024,
      nature: 'Marca nominativa',
      platform_authors: [AUTHORS[0]!],
    },
  },
  {
    kind: 'guidance',
    item: {
      id: 'guid-1',
      title: 'Segmentação semântica de imagens aéreas para mapeamento costeiro',
      year: 2025,
      nature: 'Iniciação Científica',
      type: 'Orientador principal',
      status: 'Concluída',
      oriented: 'Lucas Andrade Silva',
      platform_authors: [AUTHORS[0]!],
    },
  },
  {
    kind: 'report',
    item: {
      id: 'rep-1',
      title:
        'Diagnóstico da infraestrutura laboratorial dos campi do interior baiano',
      year: 2024,
      project_name: 'Rede Baiana de Pesquisa em Energia e Materiais',
      platform_authors: AUTHORS,
    },
  },
];

const DETAIL_EXAMPLES: {
  [K in ProductionKind]: ProductionDetailByKind[K];
} = {
  article: {
    ...ARTICLE_SAMPLES[0]!,
    abstract:
      'Este artigo apresenta uma arquitetura integrada x-in-the-loop para validação de controladores preditivos aplicados a veículos autônomos de superfície em condições ambientais adversas.',
    landing_page_url: 'https://www.sciencedirect.com/science/article/pii/ex',
    pdf_url: 'https://arxiv.org/pdf/2501.00001.pdf',
    keywords: ['Robótica marítima', 'Controle preditivo', 'Simulação HIL'],
    authors: [
      { name: 'Helena Duarte Ramos' },
      { name: 'Caio Menezes Barreto' },
    ],
    all_authors_raw: 'RAMOS, H. D.; BARRETO, C. M.',
    language: 'Inglês',
  },
  book: {
    id: 'book-1',
    title: 'Sistemas ciberfísicos e robótica aplicada à indústria 4.0',
    year: 2024,
    isbn: '978-65-88123-45-6',
    publishing_company: 'EDUFBA',
    publishing_company_city: 'Salvador',
    doi: '10.9771/edufba.2024.01',
    platform_authors: AUTHORS,
    authors: [
      { name: 'Helena Duarte Ramos' },
      { name: 'Caio Menezes Barreto' },
    ],
    all_authors_raw: 'RAMOS, H. D.; BARRETO, C. M.',
  },
  book_chapter: {
    id: 'chap-1',
    title: 'Controle preditivo não linear embarcado em sistemas autônomos',
    book_title: 'Avanços em Automação e Controle no Nordeste',
    year: 2024,
    isbn: '978-85-7455-512-0',
    publishing_company: 'Editus',
    organizers: 'MENEZES, C.; SOUZA, R.',
    start_page: '112',
    end_page: '140',
    doi: '10.7455/editus.2024.08',
    platform_authors: [AUTHORS[0]!],
    authors: [{ name: 'Helena Duarte Ramos' }],
  },
  software: {
    id: 'soft-1',
    title: 'SimccViz — Painel analítico de redes de colaboração científica',
    year: 2025,
    platform: 'Web / Linux',
    environment: 'TypeScript · React',
    code: 'BR512025000412-8',
    availability: 'Código aberto (MIT)',
    financing: 'SECTI-BA / FAPESB',
    platform_authors: AUTHORS,
  },
  patent: {
    id: 'pat-1',
    title:
      'Dispositivo sensor óptico de baixo custo para monitoramento de turbidez hídrica',
    year: 2023,
    category: 'Privilégio de Inovação',
    code: 'BR102023015482-1',
    deposit_date: '2023-06-14',
    grant_date: null,
    details: 'Depositada junto ao INPI com cotitularidade UESC/SECTI.',
    platform_authors: [AUTHORS[1]!],
  },
  event: {
    id: 'evt-1',
    title: 'Percepção visual em subestações elétricas sob neblina intensa',
    event_name: 'Congresso Brasileiro de Automática (CBA)',
    year: 2024,
    nature: 'Congresso',
    type_participation: 'Apresentação oral',
    form_participation: 'Participante com trabalho',
    platform_authors: [AUTHORS[0]!],
  },
  research_project: {
    id: 'proj-1',
    title:
      'Monitoramento inteligente de bacias hidrográficas do sul da Bahia com IoT',
    start_year: 2023,
    end_year: null,
    status: 'EM_ANDAMENTO',
    nature: 'PESQUISA',
    agency_name: 'FAPESB',
    agency_code: 'APP0042/2023',
    description:
      'Implantação de estações telemétricas de baixo consumo para coleta contínua de parâmetros físico-químicos e predição de eventos extremos.',
    number_undergraduates: 4,
    number_academic_masters: 2,
    number_phd: 1,
    foment: [
      { agency_name: 'FAPESB', agency_code: 'FAPESB', nature: 'Auxílio' },
      { agency_name: 'CNPq', agency_code: 'CNPQ', nature: 'Bolsa IC' },
    ],
    components: [
      { name: 'Helena Duarte Ramos', coordinator: true },
      { name: 'Caio Menezes Barreto', coordinator: false },
    ],
    productions: [
      {
        title:
          'Sensor óptico de baixo custo para monitoramento contínuo de turbidez',
        type: 'Artigo publicado',
      },
    ],
    platform_authors: AUTHORS,
  },
  brand: {
    id: 'brand-1',
    title: 'OBSERVATÓRIO SIMCC BAHIA',
    year: 2024,
    nature: 'Marca nominativa',
    goal: 'Identificação institucional da plataforma estadual de CT&I.',
    platform_authors: [AUTHORS[0]!],
  },
  guidance: {
    id: 'guid-1',
    title: 'Segmentação semântica de imagens aéreas para mapeamento costeiro',
    year: 2025,
    nature: 'Iniciação Científica',
    type: 'Orientador principal',
    status: 'Concluída',
    oriented: 'Lucas Andrade Silva',
    platform_authors: [AUTHORS[0]!],
  },
  report: {
    id: 'rep-1',
    title:
      'Diagnóstico da infraestrutura laboratorial dos campi do interior baiano',
    year: 2024,
    project_name: 'Rede Baiana de Pesquisa em Energia e Materiais',
    financing: 'SECTI-BA',
    platform_authors: AUTHORS,
  },
};

export function ProductionShowcase() {
  const [selectedKind, setSelectedKind] = useState<ProductionKind>('article');

  return (
    <Showcase
      id="producao"
      title="Produção (E2)"
      description="Registro dos 10 tipos da v2, ProductionCard (sc-prod sem sombra, borda esquerda de 6px por Qualis/tipo/natureza/status e cores claras apenas como marcador) e ProductionDetail."
      bare
    >
      <div className="flex flex-col gap-6">
        <Demo label="Artigos — borda por Qualis (A1, A3 clara, Sem Qualis) e destaque UTF-16">
          <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ARTICLE_SAMPLES.map((article) => (
              <ProductionCard
                key={article.id}
                kind="article"
                item={article}
                onOpen={() => setSelectedKind('article')}
              />
            ))}
          </div>
        </Demo>

        <Demo label="Demais 9 tipos — livro, capítulo (clara), software, patente, evento (Congresso e Oficina clara), projeto, marca, orientação (IC clara) e relatório">
          <div className="grid w-full gap-4 md:grid-cols-2 lg:grid-cols-3">
            {OTHER_SAMPLES.map(({ kind, item }) => (
              <ProductionCard
                key={item.id}
                kind={kind}
                item={item}
                onOpen={() => setSelectedKind(kind)}
              />
            ))}
          </div>
        </Demo>

        <Demo
          label="Dossiê de detalhe (ProductionDetail)"
          className="flex-col items-stretch"
        >
          <Tabs
            value={selectedKind}
            onValueChange={(value) => {
              const next = normalizeProductionKind(value);
              if (next) setSelectedKind(next);
            }}
            className="w-full"
          >
            <TabsList className="overflow-y-hidden">
              {PRODUCTION_KINDS.map((kind) => {
                const def = PRODUCTION_REGISTRY[kind];
                const Icon = def.icon;
                return (
                  <TabsTrigger key={kind} value={kind}>
                    <Icon aria-hidden />
                    {def.title}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {PRODUCTION_KINDS.map((kind) => (
              <TabsContent key={kind} value={kind}>
                <ProductionDetail kind={kind} item={DETAIL_EXAMPLES[kind]} />
              </TabsContent>
            ))}
          </Tabs>
        </Demo>
      </div>
    </Showcase>
  );
}
