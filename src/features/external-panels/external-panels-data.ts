export type ExternalPanelAccess = 'public' | 'institutional' | 'registration';

export interface ExternalPanelItem {
  id: string;
  title: string;
  source: string;
  description: string;
  url: string;
  access: ExternalPanelAccess;
}

export interface ExternalPanelGroup {
  id: 'platform' | 'other';
  title: string;
  items: readonly ExternalPanelItem[];
}

export const ACCESS_LABELS: Record<ExternalPanelAccess, string> = {
  public: 'Acesso público',
  institutional: 'Acesso institucional',
  registration: 'Cadastro gratuito',
};

/**
 * Fontes de dados externas exibidas na tela `/paineis-dados-externos`.
 * Links revisados a partir do legado para remover proxies institucionais
 * específicos (EZproxy/Shibboleth) e usar HTTPS sempre que disponível.
 */
export const EXTERNAL_PANEL_GROUPS: readonly ExternalPanelGroup[] = [
  {
    id: 'platform',
    title: 'Base de dados da plataforma',
    items: [
      {
        id: 'painel-lattes',
        title: 'Painel Lattes',
        source: 'CNPq',
        description:
          'Indicadores de formação e atuação acadêmica a partir da base Lattes.',
        url: 'https://bi.cnpq.br/painel/formacao-atuacao-lattes/',
        access: 'public',
      },
      {
        id: 'plataforma-sucupira',
        title: 'Plataforma Sucupira',
        source: 'CAPES',
        description:
          'Dados de programas de pós-graduação stricto sensu e avaliações da CAPES.',
        url: 'https://sucupira.capes.gov.br/#busca_observatorio',
        access: 'public',
      },
      {
        id: 'bolsistas-cnpq',
        title: 'Bolsistas CNPq',
        source: 'CNPq',
        description:
          'Painel de fomento em CT&I e distribuição de bolsas do CNPq.',
        url: 'https://bi.cnpq.br/painel/fomento-cti/index.html',
        access: 'public',
      },
      {
        id: 'openalex',
        title: 'OpenAlex',
        source: 'OpenAlex',
        description:
          'Catálogo aberto e gratuito de publicações científicas, autores e instituições.',
        url: 'https://openalex.org/',
        access: 'public',
      },
      {
        id: 'curriculo-lattes',
        title: 'Currículo Lattes',
        source: 'CNPq',
        description:
          'Busca textual pública de currículos de pesquisadores cadastrados no CNPq.',
        url: 'https://buscatextual.cnpq.br/buscatextual/busca.do?metodo=apresentar',
        access: 'public',
      },
      {
        id: 'periodicos-capes',
        title: 'Portal de Periódicos da CAPES',
        source: 'CAPES',
        description:
          'Acervo de periódicos científicos com acesso completo via rede institucional (CAFe).',
        url: 'https://www.periodicos.capes.gov.br/',
        access: 'institutional',
      },
      {
        id: 'web-of-science',
        title: 'Web of Science',
        source: 'Clarivate',
        description:
          'Base multidisciplinar de citações e periódicos indexados (requer assinatura).',
        url: 'https://www.webofscience.com/',
        access: 'institutional',
      },
      {
        id: 'dgp-cnpq',
        title: 'Diretório dos Grupos de Pesquisa',
        source: 'CNPq',
        description:
          'Inventário oficial dos grupos de pesquisa científica e tecnológica no Brasil.',
        url: 'https://lattes.cnpq.br/web/dgp',
        access: 'public',
      },
    ],
  },
  {
    id: 'other',
    title: 'Outras plataformas',
    items: [
      {
        id: 'inpi-pepi',
        title: 'Propriedade Intelectual (pePI)',
        source: 'INPI',
        description:
          'Consulta pública a patentes, marcas, programas de computador e desenhos industriais.',
        url: 'https://busca.inpi.gov.br/pePI/',
        access: 'public',
      },
      {
        id: 'scopus',
        title: 'Scopus',
        source: 'Elsevier',
        description:
          'Base de resumos e citações de literatura científica revisada por pares (requer assinatura).',
        url: 'https://www.scopus.com/',
        access: 'institutional',
      },
      {
        id: 'researchgate',
        title: 'ResearchGate',
        source: 'ResearchGate',
        description:
          'Rede acadêmica para descoberta de publicações, pesquisadores e colaborações.',
        url: 'https://www.researchgate.net/',
        access: 'registration',
      },
    ],
  },
];
