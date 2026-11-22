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

const ufbaInst: AdminSchemas['InstitutionPublic'] = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  acronym: 'UFBA',
  name: 'Universidade Federal da Bahia',
  created_at: '2026-10-01T10:00:00Z',
};

const uefsInst: AdminSchemas['InstitutionPublic'] = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
  acronym: 'UEFS',
  name: 'Universidade Estadual de Feira de Santana',
  created_at: '2026-10-02T10:00:00Z',
};

const defaultCollection: AdminSchemas['CollectionPublic'] = {
  id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
  slug: 'geral',
  name: 'Geral',
  description: 'Coleção padrão do observatório',
  refresh_interval_days: 7,
  is_default: true,
  created_at: '2026-10-01T10:00:00Z',
  researcher_count: 1200,
};

const cnpqCollection: AdminSchemas['CollectionPublic'] = {
  id: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2',
  slug: 'bolsistas-cnpq',
  name: 'Bolsistas CNPq',
  description: 'Pesquisadores com bolsa vigente',
  refresh_interval_days: 30,
  is_default: false,
  created_at: '2026-10-05T10:00:00Z',
  researcher_count: 34,
};

const mariaResearcher: AdminSchemas['ResearcherItem'] = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  name: 'Maria Souza',
  lattes_id: '1234567890123456',
  created_at: '2026-10-10T10:00:00Z',
  affiliations: [
    {
      institution: {
        id: ufbaInst.id,
        acronym: ufbaInst.acronym,
        name: ufbaInst.name,
      },
      created_at: '2026-10-10T10:00:00Z',
    },
  ],
  collections: [
    {
      collection: {
        id: cnpqCollection.id,
        slug: cnpqCollection.slug,
        name: cnpqCollection.name,
      },
      attributes: {},
      created_at: '2026-10-10T10:00:00Z',
    },
  ],
};

const joaoResearcher: AdminSchemas['ResearcherItem'] = {
  id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  name: 'João Silva',
  lattes_id: '9876543210987654',
  created_at: '2026-10-12T10:00:00Z',
  affiliations: [
    {
      institution: {
        id: uefsInst.id,
        acronym: uefsInst.acronym,
        name: uefsInst.name,
      },
      created_at: '2026-10-12T10:00:00Z',
    },
  ],
  collections: [
    {
      collection: {
        id: defaultCollection.id,
        slug: defaultCollection.slug,
        name: defaultCollection.name,
      },
      attributes: {},
      created_at: '2026-10-12T10:00:00Z',
    },
  ],
};

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
  institutions: [
    ufbaInst,
    uefsInst,
  ] satisfies AdminSchemas['InstitutionPublic'][],
  collections: [
    defaultCollection,
    cnpqCollection,
  ] satisfies AdminSchemas['CollectionPublic'][],
  researchers: [
    mariaResearcher,
    joaoResearcher,
  ] satisfies AdminSchemas['ResearcherItem'][],
};

function listEnvelope<T>(data: T[], total = data.length) {
  return { data, pagination: paginationOf(total, 1, Math.max(1, data.length)) };
}

/** Admin logado com dados de exemplo para a visão geral e as listas do console. */
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
    http.post(adminUrl('etl/runs'), () =>
      HttpResponse.json(
        {
          run_id: '55555555-5555-4555-8555-555555555555',
          status: 'ACCEPTED',
        },
        { status: 202 },
      ),
    ),
    http.get(adminUrl('academic/institutions'), ({ request }) => {
      const params = new URL(request.url).searchParams;
      if (params.get('per_page') === '1' && !params.get('q')) {
        return HttpResponse.json({
          data: [],
          pagination: paginationOf(14, 1, 1),
        });
      }
      const q = params.get('q')?.toLowerCase();
      const data = q
        ? adminFixtures.institutions.filter((inst) =>
            [inst.acronym, inst.name].some((v) => v.toLowerCase().includes(q)),
          )
        : adminFixtures.institutions;
      return HttpResponse.json(listEnvelope(data));
    }),
    http.get(adminUrl('academic/institutions/:institutionId'), ({ params }) => {
      const found = adminFixtures.institutions.find(
        (inst) => inst.id === params.institutionId,
      );
      return found
        ? HttpResponse.json(found)
        : HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    }),
    http.get(adminUrl('academic/researchers'), ({ request }) => {
      const params = new URL(request.url).searchParams;
      if (
        params.get('per_page') === '1' &&
        !params.get('q') &&
        !params.get('institution_id') &&
        !params.get('collection_id')
      ) {
        return HttpResponse.json({
          data: [],
          pagination: paginationOf(1234, 1, 1),
          filters_applied: {},
          sort: {},
          meta: {},
        });
      }
      const q = params.get('q')?.toLowerCase();
      const instId = params.get('institution_id');
      const colId = params.get('collection_id');
      const data = adminFixtures.researchers.filter((res) => {
        if (
          q &&
          !res.name.toLowerCase().includes(q) &&
          !res.lattes_id.includes(q)
        ) {
          return false;
        }
        if (
          instId &&
          !(res.affiliations ?? []).some((a) => a.institution.id === instId)
        ) {
          return false;
        }
        if (
          colId &&
          !(res.collections ?? []).some((c) => c.collection.id === colId)
        ) {
          return false;
        }
        return true;
      });
      return HttpResponse.json({
        ...listEnvelope(data),
        filters_applied: {},
        sort: {},
        meta: {},
      });
    }),
    http.get(adminUrl('academic/researchers/:researcherId'), ({ params }) => {
      const found = adminFixtures.researchers.find(
        (res) => res.id === params.researcherId,
      );
      return found
        ? HttpResponse.json(found)
        : HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    }),
    http.get(adminUrl('academic/collections'), ({ request }) => {
      const params = new URL(request.url).searchParams;
      if (params.get('per_page') === '1' && !params.get('q')) {
        return HttpResponse.json({
          data: [],
          pagination: paginationOf(3, 1, 1),
        });
      }
      const q = params.get('q')?.toLowerCase();
      const data = q
        ? adminFixtures.collections.filter((col) =>
            [col.name, col.slug].some((v) => v.toLowerCase().includes(q)),
          )
        : adminFixtures.collections;
      return HttpResponse.json(listEnvelope(data));
    }),
    http.get(adminUrl('academic/collections/:collectionId'), ({ params }) => {
      const found = adminFixtures.collections.find(
        (col) => col.id === params.collectionId,
      );
      return found
        ? HttpResponse.json(found)
        : HttpResponse.json({ detail: 'Not found' }, { status: 404 });
    }),
  ];
}
