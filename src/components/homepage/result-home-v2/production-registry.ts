// Registro dos tipos de produção da v2 (/v2/production/*).
//
// Cada entrada descreve como um tipo aparece na listagem, no detalhe e no CSV.
// Para expor um novo tipo basta adicioná-lo aqui e na aba do tipo de busca
// (`RESULT_TYPE_CONFIG`): lista, detalhe e exportação são derivados deste registro.
import {
  ProductionDetailByKindV2,
  ProductionKindV2,
  ProductionSortByV2,
  ProductionSummaryByKindV2,
} from '../../../types/production-v2';

export interface DetailRow {
  label: string;
  value: string | number | null | undefined;
  /** Quando presente, o valor vira link. */
  href?: string;
}

export interface ProductionDefinition<S = any, D = any> {
  kind: ProductionKindV2;
  /** Título da listagem ("Artigos"). */
  title: string;
  /** Nome no singular e no plural, para a contagem ("1 artigo", "2 artigos"). */
  noun: [string, string];
  /** Cor do tipo (a mesma da barra de busca). */
  color: string;
  sortOptions: ProductionSortByV2[];
  /** Linha logo abaixo do título (revista, livro, evento...). */
  subtitle: (item: S) => string | null;
  /** Informações curtas exibidas como etiquetas no card. */
  tags: (item: S) => string[];
  /** Campos do detalhe, na ordem de exibição. */
  details: (item: D) => DetailRow[];
  /** Colunas próprias do tipo no CSV (id, título, ano e autores são comuns). */
  csv: (item: S) => Record<string, string | number>;
  csvFileName: string;
}

const define = <K extends ProductionKindV2>(
  definition: ProductionDefinition<
    ProductionSummaryByKindV2[K],
    ProductionDetailByKindV2[K]
  > & { kind: K },
) => definition;

export const doiUrl = (doi: string) =>
  `https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')}`;

const present = (values: (string | null | undefined | false)[]) =>
  values.filter(Boolean) as string[];

const pages = (start: string | null, end: string | null) =>
  start && end ? `${start}–${end}` : start || end;

export const PRODUCTION_DEFINITIONS: Record<
  ProductionKindV2,
  ProductionDefinition
> = {
  article: define<'article'>({
    kind: 'article',
    title: 'Artigos',
    noun: ['artigo', 'artigos'],
    color: 'bg-blue-500',
    sortOptions: ['relevance', 'year', 'citations', 'title'],
    subtitle: (item) => item.magazine?.name ?? null,
    tags: (item) =>
      present([
        item.magazine?.qualis && `Qualis ${item.magazine.qualis}`,
        item.magazine?.jcr && `JCR ${item.magazine.jcr}`,
        item.citations_count > 0 &&
          `${item.citations_count.toLocaleString('pt-BR')} ${item.citations_count === 1 ? 'citação' : 'citações'}`,
        item.has_open_access_pdf && 'Acesso aberto',
      ]),
    details: (item) => [
      { label: 'Resumo', value: item.abstract },
      { label: 'Palavras-chave', value: item.keywords },
      { label: 'Revista', value: item.magazine?.name },
      { label: 'ISSN', value: item.magazine?.issn },
      { label: 'Qualis', value: item.magazine?.qualis },
      { label: 'JCR', value: item.magazine?.jcr },
      { label: 'Citações', value: item.citations_count },
      { label: 'Idioma', value: item.language },
      { label: 'Autores', value: item.all_authors_raw },
      {
        label: 'DOI',
        value: item.doi,
        href: item.doi ? doiUrl(item.doi) : undefined,
      },
      {
        label: 'Página do artigo',
        value: item.landing_page_url,
        href: item.landing_page_url ?? undefined,
      },
      {
        label: 'PDF em acesso aberto',
        value: item.pdf_url,
        href: item.pdf_url ?? undefined,
      },
    ],
    csv: (item) => ({
      doi: item.doi ?? '',
      magazine: item.magazine?.name ?? '',
      issn: item.magazine?.issn ?? '',
      qualis: item.magazine?.qualis ?? '',
      jcr: item.magazine?.jcr ?? '',
      citations: item.citations_count,
      open_access: item.has_open_access_pdf ? 'sim' : 'não',
    }),
    csvFileName: 'artigos.csv',
  }),

  book: define<'book'>({
    kind: 'book',
    title: 'Livros',
    noun: ['livro', 'livros'],
    color: 'bg-pink-500',
    sortOptions: ['relevance', 'year', 'title'],
    subtitle: (item) => item.publishing_company,
    tags: (item) => present([item.isbn && `ISBN ${item.isbn}`]),
    details: (item) => [
      { label: 'Editora', value: item.publishing_company },
      { label: 'Cidade da editora', value: item.publishing_company_city },
      { label: 'ISBN', value: item.isbn },
      { label: 'Autores', value: item.all_authors_raw },
      {
        label: 'DOI',
        value: item.doi,
        href: item.doi ? doiUrl(item.doi) : undefined,
      },
    ],
    csv: (item) => ({
      isbn: item.isbn ?? '',
      publishing_company: item.publishing_company ?? '',
    }),
    csvFileName: 'livros.csv',
  }),

  'book-chapter': define<'book-chapter'>({
    kind: 'book-chapter',
    title: 'Capítulos de livros',
    noun: ['capítulo', 'capítulos'],
    color: 'bg-pink-300',
    sortOptions: ['relevance', 'year', 'title'],
    subtitle: (item) => (item.book_title ? `Em: ${item.book_title}` : null),
    tags: (item) =>
      present([item.publishing_company, item.isbn && `ISBN ${item.isbn}`]),
    details: (item) => [
      { label: 'Livro', value: item.book_title },
      { label: 'Organizadores', value: item.organizers },
      { label: 'Páginas', value: pages(item.start_page, item.end_page) },
      { label: 'Editora', value: item.publishing_company },
      { label: 'ISBN', value: item.isbn },
      { label: 'Autores', value: item.all_authors_raw },
      {
        label: 'DOI',
        value: item.doi,
        href: item.doi ? doiUrl(item.doi) : undefined,
      },
    ],
    csv: (item) => ({
      book_title: item.book_title ?? '',
      isbn: item.isbn ?? '',
      publishing_company: item.publishing_company ?? '',
    }),
    csvFileName: 'capitulos-de-livros.csv',
  }),

  software: define<'software'>({
    kind: 'software',
    title: 'Softwares',
    noun: ['software', 'softwares'],
    color: 'bg-teal-600',
    sortOptions: ['relevance', 'year', 'title'],
    subtitle: (item) => item.platform,
    tags: (item) => present([item.code]),
    details: (item) => [
      { label: 'Plataforma', value: item.platform },
      { label: 'Ambiente', value: item.environment },
      { label: 'Código de registro', value: item.code },
      { label: 'Disponibilidade', value: item.availability },
      { label: 'Financiamento', value: item.financing },
    ],
    csv: (item) => ({
      platform: item.platform ?? '',
      environment: item.environment ?? '',
      code: item.code ?? '',
    }),
    csvFileName: 'softwares.csv',
  }),

  patent: define<'patent'>({
    kind: 'patent',
    title: 'Patentes',
    noun: ['patente', 'patentes'],
    color: 'bg-cyan-500',
    sortOptions: ['relevance', 'year', 'title'],
    subtitle: (item) => item.category,
    tags: (item) => present([item.code]),
    details: (item) => [
      { label: 'Categoria', value: item.category },
      { label: 'Código', value: item.code },
      { label: 'Data de depósito', value: item.deposit_date },
      { label: 'Data de concessão', value: item.grant_date },
      { label: 'Detalhes', value: item.details },
    ],
    csv: (item) => ({
      category: item.category ?? '',
      code: item.code ?? '',
    }),
    csvFileName: 'patentes.csv',
  }),

  event: define<'event'>({
    kind: 'event',
    title: 'Participação em eventos',
    noun: ['participação', 'participações'],
    color: 'bg-orange-500',
    sortOptions: ['relevance', 'year', 'title'],
    subtitle: (item) => item.event_name,
    tags: (item) => present([item.nature, item.type_participation]),
    details: (item) => [
      { label: 'Evento', value: item.event_name },
      { label: 'Natureza', value: item.nature },
      { label: 'Tipo de participação', value: item.type_participation },
      { label: 'Forma de participação', value: item.form_participation },
    ],
    csv: (item) => ({
      event_name: item.event_name ?? '',
      nature: item.nature ?? '',
      type_participation: item.type_participation ?? '',
    }),
    csvFileName: 'participacoes-em-eventos.csv',
  }),
};

export const SORT_LABELS: Record<ProductionSortByV2, string> = {
  relevance: 'Mais relevantes',
  year: 'Mais recentes',
  citations: 'Mais citados',
  title: 'Título (A–Z)',
};

/** Rótulo do campo onde o termo foi encontrado (`matches[].field`). */
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
};

export const QUALIS_OPTIONS = [
  'A1',
  'A2',
  'A3',
  'A4',
  'B1',
  'B2',
  'B3',
  'B4',
  'C',
];

// Mesmas cores de Qualis do card de artigo da listagem antiga.
export const QUALIS_COLORS: Record<string, string> = {
  A1: 'bg-[#006837]',
  A2: 'bg-[#8FC53E]',
  A3: 'bg-[#ACC483]',
  A4: 'bg-[#BDC4B1]',
  B1: 'bg-[#F15A24]',
  B2: 'bg-[#F5831F]',
  B3: 'bg-[#F4AD78]',
  B4: 'bg-[#F4A992]',
  B5: 'bg-[#F2D3BB]',
  C: 'bg-[#EC1C22]',
  SQ: 'bg-[#560B11]',
};
