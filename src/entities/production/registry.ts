import {
  BookOpen,
  BookOpenText,
  CodeXml,
  Copyright,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  GraduationCap,
  Lightbulb,
  Presentation,
  ScrollText,
  type LucideIcon,
} from 'lucide-react';
import {
  FALLBACK_COLOR,
  PRODUCTION_COLORS,
  eventNatureColor,
  orientationColor,
  productionColor,
  qualisColor,
  statusColor,
  type DictionaryColor,
} from '@/shared/lib/design-tokens';
import {
  doiUrl,
  formatAuthorsList,
  formatJcr,
  formatLattesLabel,
  formatNatureLabel,
  formatPageRange,
  formatProjectStudents,
  formatQualisDetail,
  formatStatusLabel,
  formatYearRange,
  formatYesNo,
  safeHttpUrl,
  type ProductionDetail,
  type ProductionItem,
  type ProductionKind,
  type ProductionMagazineRef,
  type ProductionSortBy,
  type ProductionSortByKind,
  type ResearchProjectComponent,
  type ResearchProjectFoment,
  type ResearchProjectProduction,
} from './model';

export interface ProductionDetailRow {
  label: string;
  value: string | number | null | undefined;
  /** Quando presente, o valor vira link externo seguro. */
  href?: string;
}

export interface ProductionExternalLink {
  label: string;
  href: string;
}

export interface ProductionTag {
  label: string;
  /** Cor opcional de marcador (`Dot`), vinda de `design-tokens.ts`. */
  color?: DictionaryColor;
}

export interface ArticleMetricsData {
  magazine: ProductionMagazineRef | null | undefined;
  citationsCount: number;
}

export interface ArticleDetailExtras {
  abstract?: string | null;
  keywords?: readonly string[];
}

export interface ResearchProjectDetailExtras {
  description?: string | null;
  foment?: readonly ResearchProjectFoment[];
  components?: readonly ResearchProjectComponent[];
  productions?: readonly ResearchProjectProduction[];
}

export interface ProductionDefinition<
  K extends ProductionKind = ProductionKind,
> {
  kind: K;
  /**
   * Segmento público da URL do detalhe (`/producoes/<slug>/<id>`, T13): pt-BR,
   * kebab-case, sem acento e no singular. Mudar um slug quebra links salvos.
   */
  slug: string;
  /** Título da seção/listagem em pt-BR, sentence case ("Artigos"). */
  title: string;
  /** Rótulo no singular e no plural ("artigo", "artigos"). */
  noun: readonly [singular: string, plural: string];
  /** Ícone oficial (`lucide-react`, conforme `design-kit/reference/icons.md`). */
  icon: LucideIcon;
  /** Cor base do tipo em `design-tokens.ts` (ou neutra quando varia por item). */
  color: DictionaryColor;
  /** Cor do card/item (Qualis nos artigos, natureza em eventos/orientações, status em projetos). */
  itemColor: (item: ProductionItem<K>) => DictionaryColor;
  /** Opções de ordenação aceitas pela rota `/v2/production/*`. */
  sortOptions: readonly ProductionSortByKind[K][];
  /** Título exibido no card e no cabeçalho do detalhe. */
  itemTitle: (item: ProductionItem<K>) => string;
  /** Veículo/subtítulo exibido acima do título no card. */
  subtitle: (item: ProductionItem<K>) => string | null;
  /** Ano ou período formatado para os metadados do card (`Calendar`). */
  yearLabel: (item: ProductionItem<K>) => string | null;
  /** Etiquetas curtas complementares do card. */
  tags: (item: ProductionItem<K>) => ProductionTag[];
  /** Links externos do item (DOI, página do artigo, PDF em acesso aberto). */
  externalLinks: (item: ProductionItem<K>) => ProductionExternalLink[];
  /** Campos estruturados do dossiê de detalhe, na ordem de exibição. */
  details: (item: ProductionDetail<K>) => ProductionDetailRow[];
  /** Metadados bibliométricos (Qualis, JCR, citações) para artigos. */
  articleMetrics?: (item: ProductionItem<K>) => ArticleMetricsData;
  /** Resumo e palavras-chave específicos do dossiê de artigo. */
  articleExtras?: (item: ProductionDetail<K>) => ArticleDetailExtras;
  /** Seções estruturadas específicas de projetos de pesquisa. */
  projectExtras?: (item: ProductionDetail<K>) => ResearchProjectDetailExtras;
}

const define = <K extends ProductionKind>(
  definition: ProductionDefinition<K>,
): ProductionDefinition<K> => definition;

function presentTags(
  values: ReadonlyArray<string | false | null | undefined>,
): ProductionTag[] {
  return values
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((label) => ({ label }));
}

function addExternalLink(
  links: ProductionExternalLink[],
  label: string,
  rawHref: string | null | undefined,
) {
  const href = safeHttpUrl(rawHref);
  if (href) links.push({ label, href });
}

function doiLinkRow(doi: string | null | undefined): ProductionDetailRow {
  const href = doi ? doiUrl(doi) : null;
  return {
    label: 'DOI',
    value: doi,
    href: href ?? undefined,
  };
}

function yearOrNull(year: number | null | undefined): string | null {
  return year != null ? String(year) : null;
}

/**
 * Registro único dos 12 tipos de produção da API v2.
 * Sem exportação CSV (ADR 0006).
 */
export const PRODUCTION_REGISTRY: {
  [K in ProductionKind]: ProductionDefinition<K>;
} = {
  article: define<'article'>({
    kind: 'article',
    slug: 'artigo',
    title: 'Artigos',
    noun: ['artigo', 'artigos'],
    icon: FileText,
    color: productionColor('article'),
    itemColor: (item) =>
      qualisColor(item.magazine?.qualis ?? item.magazine?.qualis_status),
    sortOptions: ['relevance', 'year', 'citations', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.magazine?.name ?? null,
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) => presentTags([item.has_open_access_pdf && 'Acesso aberto']),
    externalLinks: (item) => {
      const links: ProductionExternalLink[] = [];
      if (item.doi) addExternalLink(links, 'DOI', doiUrl(item.doi));
      if ('landing_page_url' in item) {
        addExternalLink(links, 'Página do artigo', item.landing_page_url);
      }
      if ('pdf_url' in item) {
        addExternalLink(links, 'PDF em acesso aberto', item.pdf_url);
      }
      return links;
    },
    details: (item) => [
      { label: 'Revista', value: item.magazine?.name },
      { label: 'ISSN', value: item.magazine?.issn },
      { label: 'Qualis', value: formatQualisDetail(item.magazine) },
      { label: 'JCR', value: formatJcr(item.magazine?.jcr) },
      { label: 'Citações', value: item.citations_count },
      { label: 'Idioma', value: item.language },
      {
        label: 'Palavras-chave',
        value: item.keywords?.length ? item.keywords.join(', ') : null,
      },
      {
        label: 'Autores',
        value: formatAuthorsList(item.authors, item.all_authors_raw),
      },
      doiLinkRow(item.doi),
      {
        label: 'Página do artigo',
        value: item.landing_page_url,
        href: safeHttpUrl(item.landing_page_url) ?? undefined,
      },
      {
        label: 'PDF em acesso aberto',
        value: item.pdf_url,
        href: safeHttpUrl(item.pdf_url) ?? undefined,
      },
    ],
    articleMetrics: (item) => ({
      magazine: item.magazine,
      citationsCount: item.citations_count,
    }),
    articleExtras: (item) => ({
      abstract: item.abstract,
      keywords: item.keywords,
    }),
  }),

  book: define<'book'>({
    kind: 'book',
    slug: 'livro',
    title: 'Livros',
    noun: ['livro', 'livros'],
    icon: BookOpen,
    color: productionColor('book'),
    itemColor: () => productionColor('book'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.publishing_company ?? null,
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) => presentTags([item.isbn && `ISBN ${item.isbn}`]),
    externalLinks: (item) => {
      const links: ProductionExternalLink[] = [];
      if ('doi' in item && item.doi) {
        addExternalLink(links, 'DOI', doiUrl(item.doi));
      }
      return links;
    },
    details: (item) => [
      { label: 'Editora', value: item.publishing_company },
      { label: 'Cidade da editora', value: item.publishing_company_city },
      { label: 'ISBN', value: item.isbn },
      {
        label: 'Autores',
        value: formatAuthorsList(item.authors, item.all_authors_raw),
      },
      doiLinkRow(item.doi),
    ],
  }),

  book_chapter: define<'book_chapter'>({
    kind: 'book_chapter',
    slug: 'capitulo-de-livro',
    title: 'Capítulos de livros',
    noun: ['capítulo de livro', 'capítulos de livros'],
    icon: BookOpen,
    color: productionColor('book_chapter'),
    itemColor: () => productionColor('book_chapter'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) =>
      item.book_title
        ? `Em: ${item.book_title}`
        : (item.publishing_company ?? null),
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) =>
      presentTags([
        item.book_title ? item.publishing_company : null,
        item.isbn && `ISBN ${item.isbn}`,
      ]),
    externalLinks: (item) => {
      const links: ProductionExternalLink[] = [];
      if ('doi' in item && item.doi) {
        addExternalLink(links, 'DOI', doiUrl(item.doi));
      }
      return links;
    },
    details: (item) => [
      { label: 'Livro', value: item.book_title },
      { label: 'Organizadores', value: item.organizers },
      {
        label: 'Páginas',
        value: formatPageRange(item.start_page, item.end_page),
      },
      { label: 'Editora', value: item.publishing_company },
      { label: 'ISBN', value: item.isbn },
      {
        label: 'Autores',
        value: formatAuthorsList(item.authors, item.all_authors_raw),
      },
      doiLinkRow(item.doi),
    ],
  }),

  software: define<'software'>({
    kind: 'software',
    slug: 'software',
    title: 'Softwares',
    noun: ['software', 'softwares'],
    icon: CodeXml,
    color: productionColor('software'),
    itemColor: () => productionColor('software'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.platform ?? null,
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) =>
      presentTags([item.environment, item.code && `Registro ${item.code}`]),
    externalLinks: () => [],
    details: (item) => [
      { label: 'Plataforma', value: item.platform },
      { label: 'Ambiente', value: item.environment },
      { label: 'Código de registro', value: item.code },
      { label: 'Disponibilidade', value: item.availability },
      { label: 'Financiamento', value: item.financing },
    ],
  }),

  patent: define<'patent'>({
    kind: 'patent',
    slug: 'patente',
    title: 'Patentes',
    noun: ['patente', 'patentes'],
    icon: Lightbulb,
    color: productionColor('patent'),
    itemColor: () => productionColor('patent'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.category ?? null,
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) => presentTags([item.code && `Registro ${item.code}`]),
    externalLinks: () => [],
    details: (item) => [
      { label: 'Categoria', value: item.category },
      { label: 'Código', value: item.code },
      { label: 'Data de depósito', value: item.deposit_date },
      { label: 'Data de concessão', value: item.grant_date },
      { label: 'Detalhes', value: item.details },
    ],
  }),

  event: define<'event'>({
    kind: 'event',
    slug: 'evento',
    title: 'Participação em eventos',
    noun: ['participação em evento', 'participações em eventos'],
    icon: Presentation,
    color: PRODUCTION_COLORS.congresso,
    itemColor: (item) => eventNatureColor(item.nature),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) =>
      item.title?.trim() || item.event_name?.trim() || 'Participação em evento',
    subtitle: (item) => (item.title?.trim() ? (item.event_name ?? null) : null),
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) => {
      const list: ProductionTag[] = [];
      if (item.nature?.trim()) {
        list.push({
          label: item.nature.trim(),
          color: eventNatureColor(item.nature),
        });
      }
      if (item.type_participation?.trim()) {
        list.push({ label: item.type_participation.trim() });
      }
      return list;
    },
    externalLinks: () => [],
    details: (item) => [
      { label: 'Evento', value: item.event_name },
      { label: 'Natureza', value: item.nature },
      { label: 'Tipo de participação', value: item.type_participation },
      { label: 'Forma de participação', value: item.form_participation },
    ],
  }),

  research_project: define<'research_project'>({
    kind: 'research_project',
    slug: 'projeto-de-pesquisa',
    title: 'Projetos de pesquisa',
    noun: ['projeto de pesquisa', 'projetos de pesquisa'],
    icon: FolderKanban,
    color: FALLBACK_COLOR,
    itemColor: (item) => statusColor(item.status),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.agency_name ?? null,
    yearLabel: (item) => formatYearRange(item.start_year, item.end_year),
    tags: (item) => {
      const list: ProductionTag[] = [];
      const statusLabel = formatStatusLabel(item.status);
      if (statusLabel) {
        list.push({ label: statusLabel, color: statusColor(item.status) });
      }
      const natureLabel = formatNatureLabel(item.nature);
      if (natureLabel) {
        list.push({ label: natureLabel });
      }
      return list;
    },
    externalLinks: () => [],
    details: (item) => [
      { label: 'Situação', value: formatStatusLabel(item.status) },
      { label: 'Natureza', value: formatNatureLabel(item.nature) },
      {
        label: 'Período',
        value: formatYearRange(item.start_year, item.end_year),
      },
      {
        label: 'Agência financiadora',
        value: item.agency_name
          ? item.agency_code
            ? `${item.agency_name} (${item.agency_code})`
            : item.agency_name
          : item.agency_code,
      },
      { label: 'Equipe discente', value: formatProjectStudents(item) },
    ],
    projectExtras: (item) => ({
      description: item.description,
      foment: item.foment,
      components: item.components,
      productions: item.productions,
    }),
  }),

  brand: define<'brand'>({
    kind: 'brand',
    slug: 'marca',
    title: 'Marcas',
    noun: ['marca', 'marcas'],
    icon: Copyright,
    color: productionColor('brand'),
    itemColor: () => productionColor('brand'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.nature ?? null,
    yearLabel: (item) => yearOrNull(item.year),
    tags: () => [],
    externalLinks: () => [],
    details: (item) => [
      { label: 'Natureza', value: item.nature },
      { label: 'Finalidade', value: item.goal },
    ],
  }),

  guidance: define<'guidance'>({
    kind: 'guidance',
    slug: 'orientacao',
    title: 'Orientações',
    noun: ['orientação', 'orientações'],
    icon: GraduationCap,
    color: FALLBACK_COLOR,
    itemColor: (item) => orientationColor(item.nature),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => (item.oriented ? `Orientando: ${item.oriented}` : null),
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) => {
      const list: ProductionTag[] = [];
      if (item.nature?.trim()) {
        list.push({
          label: item.nature.trim(),
          color: orientationColor(item.nature),
        });
      }
      const statusLabel = formatStatusLabel(item.status);
      if (statusLabel) {
        list.push({ label: statusLabel, color: statusColor(item.status) });
      }
      if (item.type?.trim()) {
        list.push({ label: item.type.trim() });
      }
      return list;
    },
    externalLinks: () => [],
    details: (item) => [
      { label: 'Orientando', value: item.oriented },
      { label: 'Natureza', value: item.nature },
      { label: 'Tipo', value: item.type },
      { label: 'Situação', value: formatStatusLabel(item.status) },
    ],
  }),

  report: define<'report'>({
    kind: 'report',
    slug: 'relatorio-tecnico',
    title: 'Relatórios técnicos',
    noun: ['relatório técnico', 'relatórios técnicos'],
    icon: FileSpreadsheet,
    color: productionColor('report'),
    itemColor: () => productionColor('report'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.project_name ?? null,
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) =>
      presentTags(['financing' in item ? item.financing : undefined]),
    externalLinks: () => [],
    details: (item) => [
      { label: 'Projeto relacionado', value: item.project_name },
      { label: 'Financiamento', value: item.financing },
    ],
  }),

  magazine_text: define<'magazine_text'>({
    kind: 'magazine_text',
    slug: 'texto-em-revista',
    title: 'Textos em revista',
    noun: ['texto em jornal ou revista', 'textos em jornal ou revista'],
    icon: BookOpenText,
    color: productionColor('magazine_text'),
    itemColor: () => productionColor('magazine_text'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => formatLattesLabel(item.nature),
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) =>
      presentTags([
        formatLattesLabel(item.means_divulgation),
        formatLattesLabel(item.language),
      ]),
    externalLinks: (item) => {
      const links: ProductionExternalLink[] = [];
      if ('homepage' in item) {
        addExternalLink(links, 'Página do texto', item.homepage);
      }
      return links;
    },
    details: (item) => [
      { label: 'Natureza', value: formatLattesLabel(item.nature) },
      { label: 'Título em inglês', value: item.title_en },
      { label: 'Idioma', value: formatLattesLabel(item.language) },
      {
        label: 'Meio de divulgação',
        value: formatLattesLabel(item.means_divulgation),
      },
      {
        label: 'Divulgação científica',
        value: formatYesNo(item.scientific_divulgation),
      },
      { label: 'Produção relevante', value: formatYesNo(item.relevance) },
      {
        label: 'Autores',
        value: formatAuthorsList(null, item.all_authors_raw),
      },
      {
        label: 'Página do texto',
        value: item.homepage,
        href: safeHttpUrl(item.homepage) ?? undefined,
      },
    ],
  }),

  event_work: define<'event_work'>({
    kind: 'event_work',
    slug: 'trabalho-em-evento',
    title: 'Trabalhos em eventos',
    noun: ['trabalho em evento', 'trabalhos em eventos'],
    icon: ScrollText,
    color: productionColor('event_work'),
    itemColor: () => productionColor('event_work'),
    sortOptions: ['relevance', 'year', 'title'],
    itemTitle: (item) => item.title,
    subtitle: (item) => item.event_name ?? null,
    yearLabel: (item) => yearOrNull(item.year),
    tags: (item) =>
      presentTags([
        formatLattesLabel(item.nature),
        formatLattesLabel(item.event_classification),
      ]),
    externalLinks: (item) => {
      const links: ProductionExternalLink[] = [];
      if ('homepage' in item) {
        addExternalLink(links, 'Página do trabalho', item.homepage);
      }
      return links;
    },
    details: (item) => [
      { label: 'Evento', value: item.event_name },
      {
        label: 'Classificação do evento',
        value: formatLattesLabel(item.event_classification),
      },
      { label: 'Cidade do evento', value: item.event_city },
      { label: 'Ano do evento', value: item.event_year },
      { label: 'Natureza', value: formatLattesLabel(item.nature) },
      { label: 'Anais', value: item.proceedings_title },
      { label: 'Volume', value: item.volume },
      { label: 'Fascículo', value: item.issue },
      { label: 'Série', value: item.series },
      {
        label: 'Páginas',
        value: formatPageRange(item.start_page, item.end_page),
      },
      { label: 'Editora', value: item.publisher_name },
      { label: 'Cidade da editora', value: item.publisher_city },
      { label: 'ISBN', value: item.isbn },
      { label: 'Título em inglês', value: item.title_en },
      { label: 'Idioma', value: formatLattesLabel(item.language) },
      {
        label: 'Meio de divulgação',
        value: formatLattesLabel(item.means_divulgation),
      },
      {
        label: 'Divulgação científica',
        value: formatYesNo(item.scientific_divulgation),
      },
      { label: 'Produção relevante', value: formatYesNo(item.relevance) },
      {
        label: 'Autores',
        value: formatAuthorsList(null, item.all_authors_raw),
      },
      {
        label: 'Página do trabalho',
        value: item.homepage,
        href: safeHttpUrl(item.homepage) ?? undefined,
      },
    ],
  }),
};

/** Acessa a definição de um tipo com inferência preservada. */
export function getProductionDefinition<K extends ProductionKind>(
  kind: K,
): ProductionDefinition<K> {
  return PRODUCTION_REGISTRY[kind];
}

/** Rótulos de ordenação em pt-BR para todas as opções da API v2. */
export const PRODUCTION_SORT_LABELS: Record<ProductionSortBy, string> = {
  relevance: 'Mais relevantes',
  year: 'Mais recentes',
  citations: 'Mais citados',
  title: 'Título (A–Z)',
};

/** Opções de ordenação disponíveis conforme a presença de busca textual (`q`). */
export function getProductionSortOptions<K extends ProductionKind>(
  kind: K,
  hasQuery: boolean,
): ProductionSortByKind[K][] {
  return PRODUCTION_REGISTRY[kind].sortOptions.filter(
    (option) => option !== 'relevance' || hasQuery,
  );
}

/** Rótulos em pt-BR para o campo de origem dos trechos em `matches[]`. */
export const MATCH_FIELD_LABELS: Record<string, string> = {
  title: 'Título',
  abstract: 'Resumo',
  keywords: 'Palavras-chave',
  magazine: 'Revista',
  book_title: 'Livro',
  publishing_company: 'Editora',
  organizers: 'Organizadores',
  event_name: 'Evento',
  details: 'Detalhes',
  platform: 'Plataforma',
  environment: 'Ambiente',
  category: 'Categoria',
  code: 'Código',
  isbn: 'ISBN',
  description: 'Descrição',
  agency_name: 'Agência financiadora',
  goal: 'Finalidade',
  nature: 'Natureza',
  oriented: 'Orientando',
  project_name: 'Projeto',
  financing: 'Financiamento',
  means_divulgation: 'Meio de divulgação',
  proceedings_title: 'Anais',
};
