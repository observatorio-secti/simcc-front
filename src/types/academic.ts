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

// --- Coleções ---
export interface CollectionRef {
  id: string;
  slug: string;
  name: string;
}

export interface CollectionPublic extends CollectionRef {
  description?: string | null;
  refresh_interval_days: number;
  is_default: boolean;
  created_at: string;
  researcher_count?: number;
}

export interface CollectionCreate {
  slug: string;
  name: string;
  description?: string | null;
  refresh_interval_days?: number;
}

export interface CollectionUpdate {
  name?: string | null;
  description?: string | null;
  refresh_interval_days?: number | null;
  is_default?: boolean | null;
}

export interface CollectionMembership {
  collection: CollectionRef;
  attributes?: Record<string, unknown>;
  created_at: string;
}

export interface CollectionsQueryParams {
  q?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'slug' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export interface ResearcherItem {
  researcher_id: string;
  name: string;
  lattes_id: string;
  created_at: string;
  affiliations?: Affiliation[];
  collections?: CollectionMembership[];
  etl_status?: string | null;
  last_synced_at?: string | null;
}

export interface ResearcherDetail {
  researcher_id: string;
  name: string;
  lattes_id: string;
  created_at: string;
  affiliations?: Affiliation[];
  collections?: CollectionMembership[];
}

export interface ResearcherCreate {
  name: string;
  lattes_id: string;
  institution_ids?: string[];
  collection_ids?: string[];
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
  collection_id?: string;
  page?: number;
  per_page?: number;
  sort_by?: 'name' | 'lattes_id' | 'created_at';
  sort_order?: 'asc' | 'desc';
}
