// Contrato das rotas GET /v2/production/* (produções canônicas, sem duplicatas por coautor).
import { PaginationV2, SortOrderV2 } from './researcher-v2';

export type ProductionKindV2 =
  | 'article'
  | 'book'
  | 'book-chapter'
  | 'software'
  | 'patent'
  | 'event';

export type ProductionSortByV2 = 'relevance' | 'year' | 'citations' | 'title';

/** Pesquisador da plataforma que assina a obra. */
export interface ResearcherRefV2 {
  id: string;
  name: string;
  lattes_id: string | null;
}

export interface ProductionMatchV2 {
  /** Campo onde o termo foi encontrado (title, abstract, book_title...). */
  field: string;
  /** Trecho com o termo destacado entre `<b>...</b>`. */
  snippet: string;
}

export interface MagazineRefV2 {
  name: string | null;
  issn: string | null;
  qualis: string | null;
  jcr: string | null;
}

interface ProductionBaseV2 {
  id: string;
  title: string;
  year: number | null;
  platform_authors: ResearcherRefV2[];
  matches?: ProductionMatchV2[] | null;
}

export interface ArticleSummaryV2 extends ProductionBaseV2 {
  doi: string | null;
  magazine: MagazineRefV2 | null;
  citations_count: number;
  has_abstract: boolean;
  has_open_access_pdf: boolean;
}

export interface ArticleDetailV2 extends ArticleSummaryV2 {
  abstract: string | null;
  landing_page_url: string | null;
  pdf_url: string | null;
  keywords: string | null;
  all_authors_raw: string | null;
  language: string | null;
}

export interface BookSummaryV2 extends ProductionBaseV2 {
  isbn: string | null;
  publishing_company: string | null;
}

export interface BookDetailV2 extends BookSummaryV2 {
  doi: string | null;
  publishing_company_city: string | null;
  all_authors_raw: string | null;
}

export interface BookChapterSummaryV2 extends ProductionBaseV2 {
  book_title: string | null;
  isbn: string | null;
  publishing_company: string | null;
}

export interface BookChapterDetailV2 extends BookChapterSummaryV2 {
  doi: string | null;
  organizers: string | null;
  start_page: string | null;
  end_page: string | null;
  all_authors_raw: string | null;
}

export interface SoftwareSummaryV2 extends ProductionBaseV2 {
  platform: string | null;
  environment: string | null;
  code: string | null;
}

export interface SoftwareDetailV2 extends SoftwareSummaryV2 {
  availability: string | null;
  financing: string | null;
}

export interface PatentSummaryV2 extends ProductionBaseV2 {
  category: string | null;
  code: string | null;
}

export interface PatentDetailV2 extends PatentSummaryV2 {
  grant_date: string | null;
  deposit_date: string | null;
  details: string | null;
}

export interface EventSummaryV2 extends ProductionBaseV2 {
  event_name: string | null;
  nature: string | null;
  type_participation: string | null;
}

export interface EventDetailV2 extends EventSummaryV2 {
  form_participation: string | null;
}

export interface ProductionSummaryByKindV2 {
  article: ArticleSummaryV2;
  book: BookSummaryV2;
  'book-chapter': BookChapterSummaryV2;
  software: SoftwareSummaryV2;
  patent: PatentSummaryV2;
  event: EventSummaryV2;
}

export interface ProductionDetailByKindV2 {
  article: ArticleDetailV2;
  book: BookDetailV2;
  'book-chapter': BookChapterDetailV2;
  software: SoftwareDetailV2;
  patent: PatentDetailV2;
  event: EventDetailV2;
}

export interface ProductionSearchResponseV2<T> {
  data: T[];
  pagination: PaginationV2;
  filters_applied: Record<string, unknown>;
  sort: { by: ProductionSortByV2; order: SortOrderV2 };
  meta: {
    took_ms: number;
    cached: boolean;
    timestamp: string;
    data_as_of: string | null;
  };
}
