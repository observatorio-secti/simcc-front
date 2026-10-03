// Contrato da rota GET /v2/researcher (busca pelo perfil completo do pesquisador).

export interface InstitutionV2 {
  id: string;
  name: string;
  acronym: string | null;
  image: string | null;
  cover: string | null;
}

export interface CityRefV2 {
  id: string;
  name: string;
}

export interface AffiliationV2 {
  institution: InstitutionV2;
  workload: string | null;
  identity_territory: string | null;
  city: CityRefV2 | null;
}

export interface ResearcherCountsV2 {
  articles: number;
  book_chapters: number;
  books: number;
  patents: number;
  software: number;
  brands: number;
}

export interface MatchItemV2 {
  source_type: string;
  source_id: string;
  title: string;
  year: number | null;
  /** Trecho com o termo encontrado entre marcadores `[[termo]]`. */
  snippet: string | null;
}

export interface ResearcherMatchesV2 {
  total: number;
  by_type: Record<string, number>;
  items: MatchItemV2[];
}

export interface ResearcherV2 {
  researcher_id: string;
  name: string;
  image: string | null;
  graduation: string | null;
  classification: string | null;
  lattes_update: string | null;
  affiliations: AffiliationV2[];
  counts: ResearcherCountsV2;
  matches?: ResearcherMatchesV2 | null;
}

export interface PaginationV2 {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface FacetItemV2 {
  /** Valor a ser enviado no filtro correspondente. */
  value: string;
  label: string;
  acronym: string | null;
  count: number;
  selected: boolean;
}

export interface FacetV2 {
  /** Quantidade de valores distintos com ao menos um pesquisador. */
  total: number;
  items: FacetItemV2[];
}

export type FacetKeyV2 =
  | 'institution'
  | 'graduate_program'
  | 'year'
  | 'source_type'
  | 'identity_territory'
  | 'city'
  | 'area'
  | 'modality'
  | 'graduation'
  | 'classification';

export type FacetsV2 = Partial<Record<FacetKeyV2, FacetV2>>;

export type SortByV2 = 'name' | 'id' | 'relevance';
export type SortOrderV2 = 'asc' | 'desc';

export interface ResearcherSearchResponseV2 {
  data: ResearcherV2[];
  pagination: PaginationV2;
  filters_applied: Record<string, unknown>;
  sort: { by: SortByV2; order: SortOrderV2 };
  meta: {
    took_ms: number;
    cached: boolean;
    timestamp: string;
    data_as_of: string | null;
  };
  facets: FacetsV2 | null;
  summary: unknown | null;
}
