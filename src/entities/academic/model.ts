import type { AdminSchemas } from '@/api/admin';
import {
  createListSearch,
  searchStringParam,
} from '@/shared/lib/search-params';

// Cadastro acadêmico administrado pelo console (`/academic/*` na API de
// admin). Não confundir com as entidades públicas da v2 (`institution`,
// `researcher`): são contratos diferentes.

export type AcademicInstitution = AdminSchemas['InstitutionPublic'];
export type AcademicInstitutionRef = AdminSchemas['InstitutionRef'];
export type AcademicInstitutionCreateInput = AdminSchemas['InstitutionCreate'];
export type AcademicInstitutionUpdateInput = AdminSchemas['InstitutionUpdate'];

export type AcademicCollection = AdminSchemas['CollectionPublic'];
export type AcademicCollectionRef = AdminSchemas['CollectionRef'];
export type AcademicCollectionMembership = AdminSchemas['CollectionMembership'];
export type AcademicCollectionCreateInput = AdminSchemas['CollectionCreate'];
export type AcademicCollectionUpdateInput = AdminSchemas['CollectionUpdate'];

export type AcademicResearcher = AdminSchemas['ResearcherItem'];
export type AcademicResearcherDetail = AdminSchemas['ResearcherDetail'];
export type AcademicResearcherCreateInput = AdminSchemas['ResearcherCreate'];
export type AcademicResearcherUpdateInput = AdminSchemas['ResearcherUpdate'];
export type AcademicAffiliation = AdminSchemas['Affiliation'];

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

export const LATTES_ID_REGEX = /^\d{16}$/;

/** Schema de busca da lista de instituições (`/console/instituicoes`). */
export const institutionListSearch = createListSearch({
  sortBy: ['acronym', 'name', 'created_at'],
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  defaultPerPage: 20,
  yearRange: false,
});

export type AcademicInstitutionListSearch = ReturnType<
  typeof institutionListSearch.parse
>;

/** Schema de busca dos pesquisadores vinculados no detalhe da instituição. */
export const institutionDetailResearcherSearch = createListSearch({
  sortBy: ['name', 'lattes_id', 'created_at'],
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  defaultPerPage: 20,
  yearRange: false,
});

export type InstitutionDetailResearcherSearch = ReturnType<
  typeof institutionDetailResearcherSearch.parse
>;

/** Schema de busca da lista de pesquisadores (`/console/pesquisadores`). */
export const researcherListSearch = createListSearch({
  sortBy: ['name', 'lattes_id', 'created_at'],
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  defaultPerPage: 20,
  yearRange: false,
  filters: {
    institution_id: searchStringParam(),
    collection_id: searchStringParam(),
  },
  extra: {
    researcher: searchStringParam(),
  },
});

export type AcademicResearcherListSearch = ReturnType<
  typeof researcherListSearch.parse
>;

/** Schema de busca da lista de coleções (`/console/colecoes`). */
export const collectionListSearch = createListSearch({
  sortBy: ['name', 'slug', 'created_at', 'researcher_count'],
  defaultSortBy: 'name',
  defaultSortOrder: 'asc',
  defaultPerPage: 20,
  yearRange: false,
});

export type AcademicCollectionListSearch = ReturnType<
  typeof collectionListSearch.parse
>;

/** Gera slug kebab-case a partir do nome da coleção. */
export function slugifyCollectionName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const CONFLICT_MESSAGES: Record<string, string> = {
  'Institution with this acronym already exists':
    'Já existe uma instituição com esta sigla.',
  'Institution acronym already exists':
    'Já existe uma instituição com esta sigla.',
  'Institution already exists': 'Esta instituição já está cadastrada.',
  'Researcher with this lattes_id already exists':
    'Já existe um pesquisador com este Lattes ID.',
  'Researcher already exists': 'Este pesquisador já está cadastrado.',
  'Collection with this slug already exists':
    'Já existe uma coleção com este slug.',
  'Collection slug already exists': 'Já existe uma coleção com este slug.',
  'Collection already exists': 'Esta coleção já está cadastrada.',
  'Cannot delete default collection':
    'Não é possível excluir a coleção padrão.',
  'Affiliation already exists':
    'O pesquisador já está vinculado a esta instituição.',
  'Researcher is already affiliated with this institution':
    'O pesquisador já está vinculado a esta instituição.',
  'Researcher is already in this collection':
    'O pesquisador já pertence a esta coleção.',
};

/** Traduz mensagens de conflito (409) vindas em inglês do backend. */
export function academicConflictMessage(message: string): string {
  const exact = CONFLICT_MESSAGES[message];
  if (exact) return exact;

  const lower = message.toLowerCase();
  if (lower.includes('lattes')) {
    return 'Já existe um pesquisador com este Lattes ID.';
  }
  if (lower.includes('acronym')) {
    return 'Já existe uma instituição com esta sigla.';
  }
  if (lower.includes('slug')) {
    return 'Já existe uma coleção com este slug.';
  }
  if (lower.includes('default') && lower.includes('collection')) {
    return 'Não é possível excluir a coleção padrão.';
  }
  if (lower.includes('affiliation') && lower.includes('exists')) {
    return 'O pesquisador já está vinculado a esta instituição.';
  }
  if (lower.includes('already exists')) {
    return 'Registro duplicado: já existe um item com estes dados.';
  }
  return message;
}
