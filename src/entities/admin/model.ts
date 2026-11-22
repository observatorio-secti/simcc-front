import type { AdminSchemas } from '@/api/admin';
import { createListSearch } from '@/shared/lib/search-params';

// Administradores do Simcc (`/admins` na API de admin, ADR 0008). Os tipos vêm
// do OpenAPI da API de admin; aqui fica só o que é do front.

export type Admin = AdminSchemas['AdminPublic'];
export type AdminCreateInput = AdminSchemas['AdminCreate'];
export type AdminList = AdminSchemas['GenericEnvelope_AdminPublic_'];

/** Parâmetros aceitos por `GET /admins`. */
export interface AdminListParams {
  q?: string;
  page?: number;
  per_page?: number;
}

/** Busca da lista de admins na URL (`?q=&page=&per_page=`). */
export const adminListSearch = createListSearch({
  defaultPerPage: 20,
  yearRange: false,
});

export type AdminListSearch = ReturnType<typeof adminListSearch.parse>;

/** Só os parâmetros que a API aceita (a lista não tem ordenação). */
export function adminListParams(search: AdminListSearch): AdminListParams {
  return {
    ...(search.q ? { q: search.q } : {}),
    page: search.page,
    per_page: search.per_page,
  };
}

/** Nome para exibir: nome, e-mail ou, na falta dos dois, o `sub`. */
export function adminDisplayName(
  admin: Pick<Admin, 'sub' | 'name' | 'email'>,
): string {
  return admin.name?.trim() || admin.email?.trim() || admin.sub;
}

/** Mensagens de conflito do backend (em inglês) traduzidas para a interface. */
const CONFLICT_MESSAGES: Record<string, string> = {
  'Admin with this sub already exists':
    'Este sub já está cadastrado como administrador.',
  'Cannot remove yourself from admins':
    'Você não pode remover a si mesmo da lista de administradores.',
  'Cannot remove the last admin':
    'Não é possível remover o último administrador.',
};

export function adminConflictMessage(message: string): string {
  return CONFLICT_MESSAGES[message] ?? message;
}
