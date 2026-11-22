import type { AdminSchemas } from '@/api/admin';

// Cadastro acadêmico administrado pelo console (`/academic/*` na API de
// admin). Não confundir com as entidades públicas da v2 (`institution`,
// `researcher`): são contratos diferentes.

export type AcademicInstitution = AdminSchemas['InstitutionPublic'];
export type AcademicCollection = AdminSchemas['CollectionPublic'];
export type AcademicResearcher = AdminSchemas['ResearcherItem'];
export type AcademicResearcherDetail = AdminSchemas['ResearcherDetail'];

export type AcademicSortOrder = 'asc' | 'desc';

/** Parâmetros de `GET /academic/institutions` e `/academic/collections`. */
export interface AcademicListParams {
  q?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_order?: AcademicSortOrder;
}

/** Parâmetros de `GET /academic/researchers`. */
export interface AcademicResearcherListParams extends AcademicListParams {
  institution_id?: string;
  collection_id?: string;
}

/** Só o total: lista de 1 item, lê `pagination.total_items`. */
export const COUNT_PARAMS = { page: 1, per_page: 1 } as const;
