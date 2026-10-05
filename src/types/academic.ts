export interface Pagination {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SortMeta {
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface GenericEnvelope<T> {
  data: T[];
  pagination: Pagination;
  filters_applied?: Record<string, unknown>;
  sort?: SortMeta;
  meta?: Record<string, unknown>;
  facets?: Record<string, unknown> | null;
  summary?: Record<string, unknown> | null;
}

export interface InstitutionRef {
  id: string;
  name: string;
  acronym: string;
}

export interface InstitutionPublic {
  id: string;
  name: string;
  acronym: string;
  created_at: string;
  researchers_count?: number;
}

export interface InstitutionCreate {
  name: string;
  acronym: string;
}

export interface InstitutionUpdate {
  name: string;
  acronym: string;
}

export interface Affiliation {
  institution: InstitutionRef;
  created_at: string;
}

export interface ResearcherItem {
  researcher_id: string;
  name: string;
  lattes_id: string;
  created_at: string;
  affiliations?: Affiliation[];
  etl_status?: string | null;
  last_synced_at?: string | null;
}

export interface ResearcherDetail {
  researcher_id: string;
  name: string;
  lattes_id: string;
  created_at: string;
  affiliations?: Affiliation[];
}

export interface ResearcherCreate {
  name: string;
  lattes_id: string;
  institution_ids?: string[];
}

export interface ResearcherUpdate {
  name: string;
  lattes_id: string;
}

export interface ResearcherSearchResponse {
  data: ResearcherItem[];
  pagination: Pagination;
  filters_applied?: Record<string, unknown>;
  sort?: SortMeta;
  meta?: Record<string, unknown>;
  facets?: Record<string, unknown> | null;
  summary?: Record<string, unknown> | null;
}

export interface InstitutionsQueryParams {
  q?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'acronym' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ResearchersQueryParams {
  q?: string;
  institution_id?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'lattes_id' | 'created_at';
  sort_order?: 'asc' | 'desc';
}
