// Gerado por scripts/test-fixtures.mjs a partir do OpenAPI da v2. Não edite:
// rode `npm run test:fixtures` (junto com `npm run api:types`).
import type { ResponseOf } from '@/api/types';

/** Corpo da resposta 200 de cada GET da v2, servido pelos handlers padrão. */
export const examples = {
  '/analytics': {
    data: [
      {
        active_users: 1,
        country: 'country de exemplo',
        date: '2026-01-15',
        event_count: 1,
        event_name: 'event_name de exemplo',
        host_name: 'host_name de exemplo',
      },
    ],
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    summary: {
      end_date: 'end_date de exemplo',
      start_date: 'start_date de exemplo',
      total_active_users: 1,
      total_events: 1,
    },
  } satisfies ResponseOf<'/analytics'>,
  '/graduate-program': {
    data: [
      {
        acronym: 'acronym de exemplo',
        area: 'area de exemplo',
        city: 'city de exemplo',
        id: '00000000-0000-4000-8000-000000000001',
        institution_id: '00000000-0000-4000-8000-000000000002',
        modality: 'modality de exemplo',
        name: 'name de exemplo',
        rating: 'rating de exemplo',
        state: 'state de exemplo',
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city: ['city de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000003'],
      modality: ['modality de exemplo'],
      q: 'q de exemplo',
      rating: ['rating de exemplo'],
      state: ['state de exemplo'],
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/graduate-program'>,
  '/graduate-program/{program_id}': {
    data: {
      acronym: 'acronym de exemplo',
      area: 'area de exemplo',
      city: 'city de exemplo',
      code: 'code de exemplo',
      coordinator: 'coordinator de exemplo',
      counts: { researchers: 0 },
      description: 'description de exemplo',
      email: 'email de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      institution: {
        acronym: 'acronym de exemplo',
        cover: 'cover de exemplo',
        id: '00000000-0000-4000-8000-000000000002',
        image: 'image de exemplo',
        name: 'name de exemplo',
      },
      institution_id: '00000000-0000-4000-8000-000000000003',
      modality: 'modality de exemplo',
      name: 'name de exemplo',
      name_en: 'name_en de exemplo',
      phone: 'phone de exemplo',
      rating: 'rating de exemplo',
      research_lines: [
        {
          area: 'area de exemplo',
          end_year: 2024,
          name: 'name de exemplo',
          start_year: 2024,
        },
      ],
      site: 'site de exemplo',
      start: '2026-01-15',
      state: 'state de exemplo',
      type: 'type de exemplo',
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/graduate-program/{program_id}'>,
  '/institution': {
    data: [
      {
        acronym: 'acronym de exemplo',
        cover: 'cover de exemplo',
        id: '00000000-0000-4000-8000-000000000001',
        image: 'image de exemplo',
        name: 'name de exemplo',
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: { q: 'q de exemplo' },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/institution'>,
  '/institution/{institution_id}': {
    data: {
      acronym: 'acronym de exemplo',
      counts: { graduate_programs: 0, researchers: 0 },
      cover: 'cover de exemplo',
      description: 'description de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      image: 'image de exemplo',
      latitude: 1,
      lattes_id: 'lattes_id de exemplo',
      longitude: 1,
      name: 'name de exemplo',
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/institution/{institution_id}'>,
  '/magazine': {
    data: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        issn: 'issn de exemplo',
        jcr: 1,
        jcr_link: 'jcr_link de exemplo',
        name: 'name de exemplo',
        qualis: 'A1',
        qualis_status: 'not_rated',
        reference_period: 'reference_period de exemplo',
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      issn: ['issn de exemplo'],
      q: 'q de exemplo',
      qualis: ['A1'],
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/magazine'>,
  '/magazine/{magazine_id}': {
    data: {
      id: '00000000-0000-4000-8000-000000000001',
      issn: 'issn de exemplo',
      jcr: 1,
      jcr_link: 'jcr_link de exemplo',
      name: 'name de exemplo',
      qualis: 'A1',
      qualis_status: 'not_rated',
      reference_period: 'reference_period de exemplo',
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/magazine/{magazine_id}'>,
  '/metrics/production/{kind}': {
    data: [{ period: 1, value: 1 }],
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000001'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000002'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000003'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000004'],
      year_end: 2024,
      year_start: 2024,
    },
    kind: 'article',
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/metrics/production/{kind}'>,
  '/production/article': {
    data: [
      {
        citations_count: 0,
        doi: 'doi de exemplo',
        has_abstract: false,
        has_open_access_pdf: false,
        id: '00000000-0000-4000-8000-000000000001',
        magazine: {
          issn: 'issn de exemplo',
          jcr: 1,
          name: 'name de exemplo',
          qualis: 'A1',
          qualis_status: 'not_rated',
        },
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        title: 'title de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      has_open_access: false,
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      issn: ['issn de exemplo'],
      magazine_name: ['magazine_name de exemplo'],
      q: 'q de exemplo',
      qualis: ['A1'],
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/article'>,
  '/production/article/{article_id}': {
    data: {
      abstract: 'abstract de exemplo',
      all_authors_raw: 'all_authors_raw de exemplo',
      authors: [{ name: 'name de exemplo' }],
      citations_count: 0,
      doi: 'doi de exemplo',
      has_abstract: false,
      has_open_access_pdf: false,
      id: '00000000-0000-4000-8000-000000000001',
      keywords: ['keywords de exemplo'],
      landing_page_url: 'https://example.org/landing_page_url',
      language: 'language de exemplo',
      magazine: {
        issn: 'issn de exemplo',
        jcr: 1,
        name: 'name de exemplo',
        qualis: 'A1',
        qualis_status: 'not_rated',
      },
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      pdf_url: 'https://example.org/pdf_url',
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      title: 'title de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/article/{article_id}'>,
  '/production/book': {
    data: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        isbn: 'isbn de exemplo',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        publishing_company: 'publishing_company de exemplo',
        title: 'title de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/book'>,
  '/production/book-chapter': {
    data: [
      {
        book_title: 'book_title de exemplo',
        id: '00000000-0000-4000-8000-000000000001',
        isbn: 'isbn de exemplo',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        publishing_company: 'publishing_company de exemplo',
        title: 'title de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/book-chapter'>,
  '/production/book-chapter/{chapter_id}': {
    data: {
      all_authors_raw: 'all_authors_raw de exemplo',
      authors: [{ name: 'name de exemplo' }],
      book_title: 'book_title de exemplo',
      doi: 'doi de exemplo',
      end_page: 'end_page de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      isbn: 'isbn de exemplo',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      organizers: 'organizers de exemplo',
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      publishing_company: 'publishing_company de exemplo',
      start_page: 'start_page de exemplo',
      title: 'title de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/book-chapter/{chapter_id}'>,
  '/production/book/{book_id}': {
    data: {
      all_authors_raw: 'all_authors_raw de exemplo',
      authors: [{ name: 'name de exemplo' }],
      doi: 'doi de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      isbn: 'isbn de exemplo',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      publishing_company: 'publishing_company de exemplo',
      publishing_company_city: 'publishing_company_city de exemplo',
      title: 'title de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/book/{book_id}'>,
  '/production/brand': {
    data: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        nature: 'nature de exemplo',
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        title: 'title de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      nature: ['nature de exemplo'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/brand'>,
  '/production/brand/{item_id}': {
    data: {
      goal: 'goal de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      nature: 'nature de exemplo',
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      title: 'title de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/brand/{item_id}'>,
  '/production/event': {
    data: [
      {
        event_name: 'event_name de exemplo',
        id: '00000000-0000-4000-8000-000000000001',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        nature: 'nature de exemplo',
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        title: 'title de exemplo',
        type_participation: 'type_participation de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      form_participation: ['form_participation de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      nature: ['nature de exemplo'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      type_participation: ['type_participation de exemplo'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/event'>,
  '/production/event/{event_id}': {
    data: {
      event_name: 'event_name de exemplo',
      form_participation: 'form_participation de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      nature: 'nature de exemplo',
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      title: 'title de exemplo',
      type_participation: 'type_participation de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/event/{event_id}'>,
  '/production/guidance': {
    data: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        nature: 'nature de exemplo',
        oriented: 'oriented de exemplo',
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        status: 'status de exemplo',
        title: 'title de exemplo',
        type: 'type de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      nature: ['nature de exemplo'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      status: ['status de exemplo'],
      type: ['type de exemplo'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/guidance'>,
  '/production/guidance/{item_id}': {
    data: {
      id: '00000000-0000-4000-8000-000000000001',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      nature: 'nature de exemplo',
      oriented: 'oriented de exemplo',
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      status: 'status de exemplo',
      title: 'title de exemplo',
      type: 'type de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/guidance/{item_id}'>,
  '/production/patent': {
    data: [
      {
        category: 'category de exemplo',
        code: 'code de exemplo',
        id: '00000000-0000-4000-8000-000000000001',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        title: 'title de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      category: ['category de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      granted: false,
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/patent'>,
  '/production/patent/{patent_id}': {
    data: {
      category: 'category de exemplo',
      code: 'code de exemplo',
      deposit_date: 'deposit_date de exemplo',
      details: 'details de exemplo',
      grant_date: '2026-01-15T12:00:00Z',
      id: '00000000-0000-4000-8000-000000000001',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      title: 'title de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/patent/{patent_id}'>,
  '/production/report': {
    data: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        project_name: 'project_name de exemplo',
        title: 'title de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/report'>,
  '/production/report/{item_id}': {
    data: {
      financing: 'financing de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      project_name: 'project_name de exemplo',
      title: 'title de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/report/{item_id}'>,
  '/production/research-project': {
    data: [
      {
        agency_name: 'agency_name de exemplo',
        end_year: 2024,
        id: '00000000-0000-4000-8000-000000000001',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        nature: 'nature de exemplo',
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        start_year: 2024,
        status: 'status de exemplo',
        title: 'title de exemplo',
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      nature: ['nature de exemplo'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      status: ['status de exemplo'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/research-project'>,
  '/production/research-project/{project_id}': {
    data: {
      agency_code: 'agency_code de exemplo',
      agency_name: 'agency_name de exemplo',
      components: [
        {
          citations: 'citations de exemplo',
          coordinator: false,
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      description: 'description de exemplo',
      end_year: 2024,
      foment: [
        {
          agency_code: 'agency_code de exemplo',
          agency_name: 'agency_name de exemplo',
          nature: 'nature de exemplo',
        },
      ],
      id: '00000000-0000-4000-8000-000000000001',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      nature: 'nature de exemplo',
      number_academic_masters: 1,
      number_phd: 1,
      number_specialists: 1,
      number_undergraduates: 1,
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      productions: [{ title: 'title de exemplo', type: 'type de exemplo' }],
      start_year: 2024,
      status: 'status de exemplo',
      title: 'title de exemplo',
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/research-project/{project_id}'>,
  '/production/software': {
    data: [
      {
        code: 'code de exemplo',
        environment: 'environment de exemplo',
        id: '00000000-0000-4000-8000-000000000001',
        matches: [
          {
            field: 'field de exemplo',
            highlights: [[1, 1]],
            snippet: 'snippet de exemplo',
          },
        ],
        platform: 'platform de exemplo',
        platform_authors: [
          {
            id: '00000000-0000-4000-8000-000000000002',
            lattes_id: 'lattes_id de exemplo',
            name: 'name de exemplo',
          },
        ],
        title: 'title de exemplo',
        year: 2024,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000003'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000004'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000005'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000006'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/production/software'>,
  '/production/software/{software_id}': {
    data: {
      availability: 'availability de exemplo',
      code: 'code de exemplo',
      environment: 'environment de exemplo',
      financing: 'financing de exemplo',
      id: '00000000-0000-4000-8000-000000000001',
      matches: [
        {
          field: 'field de exemplo',
          highlights: [[1, 1]],
          snippet: 'snippet de exemplo',
        },
      ],
      platform: 'platform de exemplo',
      platform_authors: [
        {
          id: '00000000-0000-4000-8000-000000000002',
          lattes_id: 'lattes_id de exemplo',
          name: 'name de exemplo',
        },
      ],
      title: 'title de exemplo',
      year: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/production/software/{software_id}'>,
  '/researcher': {
    data: [
      {
        affiliations: [
          {
            city: {
              id: '00000000-0000-4000-8000-000000000001',
              name: 'name de exemplo',
            },
            identity_territory: 'identity_territory de exemplo',
            institution: {
              acronym: 'acronym de exemplo',
              cover: 'cover de exemplo',
              id: '00000000-0000-4000-8000-000000000002',
              image: 'image de exemplo',
              name: 'name de exemplo',
            },
            workload: 1,
          },
        ],
        classification: 'classification de exemplo',
        counts: {
          articles: 0,
          book_chapters: 0,
          books: 0,
          brands: 0,
          guidance: 0,
          patents: 0,
          reports: 0,
          software: 0,
        },
        graduation: 'graduation de exemplo',
        id: '00000000-0000-4000-8000-000000000003',
        image: 'image de exemplo',
        image_url: 'https://example.org/image_url',
        lattes_update: '2026-01-15T12:00:00Z',
        matches: {
          by_type: { article: 1 },
          items: [
            {
              highlights: [[0, 13]],
              snippet: 'Redes neurais aplicadas a solos',
              source_id: '0b6f1c1e-2d4a-4c55-9f0e-2b7f3c9d1a11',
              source_type: 'article',
              title: 'Redes neurais aplicadas a solos',
              year: 2023,
            },
          ],
          total: 1,
        },
        name: 'name de exemplo',
        researcher_id: '00000000-0000-4000-8000-000000000004',
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      area: ['area de exemplo'],
      city_id: ['00000000-0000-4000-8000-000000000005'],
      classification: ['A+'],
      collection: ['collection de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000006'],
      graduation: ['graduation de exemplo'],
      identity_territory: ['identity_territory de exemplo'],
      institution_id: ['00000000-0000-4000-8000-000000000007'],
      modality: ['modality de exemplo'],
      q: 'q de exemplo',
      researcher_id: ['00000000-0000-4000-8000-000000000008'],
      source_type: ['article'],
      year_end: 2024,
      year_start: 2024,
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/researcher'>,
  '/researcher/{researcher_id}': {
    data: {
      abstract: 'abstract de exemplo',
      abstract_ai: 'abstract_ai de exemplo',
      affiliations: [
        {
          city: {
            id: '00000000-0000-4000-8000-000000000001',
            name: 'name de exemplo',
          },
          identity_territory: 'identity_territory de exemplo',
          institution: {
            acronym: 'acronym de exemplo',
            cover: 'cover de exemplo',
            id: '00000000-0000-4000-8000-000000000002',
            image: 'image de exemplo',
            name: 'name de exemplo',
          },
          workload: 1,
        },
      ],
      bibliometrics: {
        cited_by_count: 1,
        h_index: 1,
        i10_index: 1,
        works_count: 1,
      },
      classification: 'classification de exemplo',
      counts: {
        articles: 0,
        book_chapters: 0,
        books: 0,
        brands: 0,
        guidance: 0,
        patents: 0,
        reports: 0,
        software: 0,
      },
      education: [
        {
          course: 'course de exemplo',
          degree: 'degree de exemplo',
          end_year: 2024,
          institution: 'institution de exemplo',
          keywords: ['keywords de exemplo'],
          start_year: 2024,
          status: 'status de exemplo',
        },
      ],
      experience: [
        {
          additional_info: 'additional_info de exemplo',
          employment_type: 'employment_type de exemplo',
          end_year: 2024,
          exclusive_dedication: false,
          functional_classification: 'functional_classification de exemplo',
          organization: 'organization de exemplo',
          start_year: 2024,
          workload_hours_weekly: 1,
        },
      ],
      foment: [
        {
          aid_quantity: 1,
          call_title: 'call_title de exemplo',
          category_level: 'category_level de exemplo',
          funding_program: 'funding_program de exemplo',
          institute: 'institute de exemplo',
          modality: 'modality de exemplo',
          modality_code: 'modality_code de exemplo',
          scholarship_quantity: 1,
        },
      ],
      graduate_programs: [
        {
          program: {
            acronym: 'acronym de exemplo',
            id: '00000000-0000-4000-8000-000000000003',
            name: 'name de exemplo',
          },
          type: 'type de exemplo',
        },
      ],
      graduation: 'graduation de exemplo',
      id: '00000000-0000-4000-8000-000000000004',
      identifiers: {
        lattes_10_id: 'lattes_10_id de exemplo',
        lattes_id: 'lattes_id de exemplo',
        openalex: 'openalex de exemplo',
        orcid: 'orcid de exemplo',
        scopus: 'scopus de exemplo',
      },
      image: 'image de exemplo',
      image_url: 'https://example.org/image_url',
      lattes_update: '2026-01-15T12:00:00Z',
      name: 'name de exemplo',
      research_groups: [
        { id: '00000000-0000-4000-8000-000000000005', name: 'name de exemplo' },
      ],
      researcher_id: '00000000-0000-4000-8000-000000000006',
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/researcher/{researcher_id}'>,
  '/researcher/{researcher_id}/terms': {
    data: [{ frequency: 1, term: 'term de exemplo' }],
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/researcher/{researcher_id}/terms'>,
  '/scholarship': {
    data: [
      {
        aid_quantity: 1,
        call_title: 'call_title de exemplo',
        category_level: 'category_level de exemplo',
        funding_program: 'funding_program de exemplo',
        id: '00000000-0000-4000-8000-000000000001',
        institute: 'institute de exemplo',
        modality: 'modality de exemplo',
        researcher: {
          id: '00000000-0000-4000-8000-000000000002',
          name: 'name de exemplo',
        },
        scholarship_quantity: 1,
      },
    ],
    facets: {
      exemplo: {
        items: [
          {
            acronym: 'UESC',
            count: 120,
            label: 'Universidade Estadual de Santa Cruz',
            selected: true,
            value: '3f2a9c1e-5b7d-4e8a-9c21-7d4e5f6a8b90',
          },
        ],
        param: 'institution_id',
        total: 2,
      },
    },
    filters_applied: {
      category_level: ['category_level de exemplo'],
      graduate_program_id: ['00000000-0000-4000-8000-000000000003'],
      institution_id: ['00000000-0000-4000-8000-000000000004'],
      modality: ['modality de exemplo'],
      researcher_id: ['00000000-0000-4000-8000-000000000005'],
    },
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
    pagination: {
      has_next: true,
      has_prev: false,
      page: 1,
      per_page: 20,
      total_items: 137,
      total_pages: 7,
    },
    sort: { by: 'by de exemplo', order: 'order de exemplo' },
  } satisfies ResponseOf<'/scholarship'>,
  '/suggestion': {
    data: [
      { frequency: 1, source_types: ['article'], term: 'term de exemplo' },
    ],
    meta: {
      cached: false,
      data_as_of: '2026-11-20T03:00:00Z',
      timestamp: '2026-11-20T14:00:00Z',
      took_ms: 42,
    },
  } satisfies ResponseOf<'/suggestion'>,
};
