import { http, HttpResponse } from 'msw';
import type { AdminSchemas } from '@/api/admin';

// Handlers MSW da API de admin (`simcc-admin`) e do endpoint de token do IdP,
// para os testes de rota do console. Os corpos seguem os tipos gerados do
// OpenAPI da API de admin. As URLs saem do ambiente na hora da chamada: o
// teste faz `vi.stubEnv` antes de importar os módulos.

function baseUrl(name: 'VITE_ADMIN_API_URL' | 'VITE_IDP_URL'): string {
  const raw = import.meta.env[name] as string | undefined;
  if (!raw) throw new Error(`${name} precisa de vi.stubEnv no teste.`);
  return raw.endsWith('/') ? raw : `${raw}/`;
}

/** URL completa na API de admin (`/admins/:admin_id`). */
export function adminUrl(path: string): string {
  return `${baseUrl('VITE_ADMIN_API_URL')}${path.replace(/^\//, '')}`;
}

export function idpUrl(path: string): string {
  return `${baseUrl('VITE_IDP_URL')}${path.replace(/^\//, '')}`;
}

export function paginationOf(
  totalItems: number,
  page = 1,
  perPage = 20,
): AdminSchemas['Pagination'] {
  const totalPages = Math.ceil(totalItems / perPage);
  return {
    page,
    per_page: perPage,
    total_items: totalItems,
    total_pages: totalPages,
    has_next: page < totalPages,
    has_prev: page > 1,
  };
}

export const adminFixtures = {
  me: {
    user: { sub: 'sub-ana', name: 'Ana Admin', email: 'ana@secti.ba.gov.br' },
    is_admin: true,
  } satisfies AdminSchemas['MeResponse'],
  admins: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      sub: 'sub-ana',
      name: 'Ana Admin',
      email: 'ana@secti.ba.gov.br',
      created_at: '2026-11-01T12:00:00Z',
      created_by: null,
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      sub: 'sub-bruno',
      name: 'Bruno Operador',
      email: 'bruno@secti.ba.gov.br',
      created_at: '2026-11-10T09:30:00Z',
      created_by: 'sub-ana',
    },
  ] satisfies AdminSchemas['AdminPublic'][],
  latestRun: {
    id: '33333333-3333-4333-8333-333333333333',
    status: 'FAILED',
    started_at: '2026-11-21T02:00:00Z',
    ended_at: '2026-11-21T02:12:30Z',
    triggered_by: 'sub-ana',
    current_routine: null,
    routines: ['lattes', 'openalex'],
    lattes_ids: null,
    steps: {},
    error_message: 'Falha ao baixar currículos do Lattes.',
  } satisfies AdminSchemas['EtlRunDetail'],
};

function listEnvelope<T>(data: T[], total = data.length) {
  return { data, pagination: paginationOf(total, 1, Math.max(1, data.length)) };
}

/** Admin logado com dados de exemplo para a visão geral e a lista de admins. */
export function adminHandlers() {
  return [
    http.post(idpUrl('token'), () =>
      HttpResponse.json({
        access_token: 'at-test',
        refresh_token: 'rt-test',
        expires_in: 900,
      }),
    ),
    http.get(adminUrl('me'), () => HttpResponse.json(adminFixtures.me)),
    http.get(adminUrl('admins'), ({ request }) => {
      const q = new URL(request.url).searchParams.get('q')?.toLowerCase();
      const data = q
        ? adminFixtures.admins.filter((admin) =>
            [admin.name, admin.email, admin.sub].some((value) =>
              value?.toLowerCase().includes(q),
            ),
          )
        : adminFixtures.admins;
      return HttpResponse.json(listEnvelope(data));
    }),
    http.get(adminUrl('etl/runs'), () =>
      HttpResponse.json({
        data: [adminFixtures.latestRun],
        pagination: paginationOf(37, 1, 1),
      }),
    ),
    http.get(adminUrl('academic/institutions'), () =>
      HttpResponse.json({ data: [], pagination: paginationOf(14, 1, 1) }),
    ),
    http.get(adminUrl('academic/researchers'), () =>
      HttpResponse.json({
        data: [],
        pagination: paginationOf(1234, 1, 1),
        filters_applied: {},
        sort: {},
        meta: {},
      }),
    ),
    http.get(adminUrl('academic/collections'), () =>
      HttpResponse.json({ data: [], pagination: paginationOf(3, 1, 1) }),
    ),
  ];
}
