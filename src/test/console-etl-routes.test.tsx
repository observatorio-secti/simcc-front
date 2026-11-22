import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse, type RequestHandler } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.test/simcc/admin/');
vi.stubEnv('VITE_IDP_URL', 'https://api.test/idp/');

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

const { idp } = await import('@/api/idp');
const { sessionStore } = await import('@/entities/session');
const { renderRoute, createTestQueryClient } = await import('./render-route');
const { server } = await import('./msw/server');
const { adminFixtures, adminHandlers, adminUrl } =
  await import('./msw/admin-handlers');

async function signIn(overrides: RequestHandler[] = []) {
  server.use(...overrides, ...adminHandlers());
  await idp.exchangeCodeForTokens({ code: 'code-test', codeVerifier: 'v' });
}

afterEach(() => {
  sessionStore.reset();
  vi.useRealTimers();
});

describe('sincronização ETL (/console/etl)', () => {
  it('lista histórico de execuções e navega para /console/etl/$runId', async () => {
    await signIn();
    const { router, user } = await renderRoute('/console/etl');

    await screen.findByRole('heading', { name: 'Sincronização (ETL)' });
    const table = await screen.findByRole('table');
    expect(within(table).getByText('#333333')).toBeInTheDocument();
    expect(within(table).getByText('Falha')).toBeInTheDocument();
    expect(within(table).getByText('Base completa')).toBeInTheDocument();
    expect(within(table).getByText('12 min 30 s')).toBeInTheDocument();

    await user.click(within(table).getByRole('link', { name: /Ver detalhes/ }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        `/console/etl/${adminFixtures.latestRun.id}`,
      );
    });
  });

  it('em 502 na listagem mostra SectionError sem encerrar a sessão', async () => {
    let calls = 0;
    await signIn([
      http.get(adminUrl('etl/runs'), () => {
        calls += 1;
        return HttpResponse.json(
          { detail: 'ETL indisponível' },
          { status: 502 },
        );
      }),
    ]);

    const { user } = await renderRoute('/console/etl', {
      queryClient: createTestQueryClient(),
    });

    expect(
      await screen.findByText(
        'Não foi possível carregar o histórico de sincronização',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('ETL indisponível')).toBeInTheDocument();
    expect(sessionStore.hasTokensInMemory()).toBe(true);

    const prevCalls = calls;
    await user.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    await waitFor(() => expect(calls).toBe(prevCalls + 1));
  });
});

describe('EtlTriggerDialog', () => {
  it('dispara base completa sem triggered_by e navega para /console/etl/$runId', async () => {
    const bodies: unknown[] = [];
    await signIn([
      http.post(adminUrl('etl/runs'), async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(
          {
            run_id: '55555555-5555-4555-8555-555555555555',
            status: 'ACCEPTED',
          },
          { status: 202 },
        );
      }),
    ]);

    const { router, user } = await renderRoute('/console/etl');
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: /Sincronizar agora/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(
      within(dialog).getByRole('button', { name: /Iniciar sincronização/ }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(bodies).toEqual([
      { routines: null, lattes_ids: null, force: false },
    ]);
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/console/etl/55555555-5555-4555-8555-555555555555',
      );
    });
  });

  it('valida lattes_ids de 16 dígitos e envia rotinas no modo avançado', async () => {
    const bodies: unknown[] = [];
    await signIn([
      http.post(adminUrl('etl/runs'), async ({ request }) => {
        bodies.push(await request.json());
        return HttpResponse.json(
          {
            run_id: '66666666-6666-4666-8666-666666666666',
            status: 'ACCEPTED',
          },
          { status: 202 },
        );
      }),
    ]);

    const { user } = await renderRoute('/console/etl');
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: /Sincronizar agora/ }));
    const dialog = await screen.findByRole('dialog');

    await user.click(
      within(dialog).getByRole('button', { name: /Modo avançado/ }),
    );
    await within(dialog).findByText('Coleta de Currículos Lattes');

    await user.click(
      within(dialog).getByRole('checkbox', {
        name: /Coleta de Currículos Lattes/,
      }),
    );

    const lattesField = within(dialog).getByLabelText(/IDs Lattes específicos/);
    await user.type(lattesField, '12345');
    await user.click(
      within(dialog).getByRole('button', { name: /Iniciar sincronização/ }),
    );

    expect(
      await within(dialog).findByText(/exatamente 16 dígitos numéricos/),
    ).toBeInTheDocument();
    expect(bodies).toHaveLength(0);

    await user.clear(lattesField);
    await user.type(lattesField, '1234567890123456');
    await user.click(
      within(dialog).getByRole('button', { name: /Iniciar sincronização/ }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(bodies).toEqual([
      {
        routines: ['soap_lattes'],
        lattes_ids: ['1234567890123456'],
        force: false,
      },
    ]);
  });

  it('trata 409 (lock ativo) e 502 sem fechar diálogo nem limpar sessão', async () => {
    let statusToReturn = 409;
    await signIn([
      http.post(adminUrl('etl/runs'), () =>
        HttpResponse.json(
          {
            detail:
              statusToReturn === 409
                ? 'Já existe uma sincronização em andamento.'
                : 'Bad Gateway',
          },
          { status: statusToReturn },
        ),
      ),
    ]);

    const { user } = await renderRoute('/console/etl');
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: /Sincronizar agora/ }));
    const dialog = await screen.findByRole('dialog');

    await user.click(
      within(dialog).getByRole('button', { name: /Iniciar sincronização/ }),
    );
    expect(
      await within(dialog).findByText(
        'Já existe uma sincronização em andamento.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(sessionStore.hasTokensInMemory()).toBe(true);

    statusToReturn = 502;
    await user.click(
      within(dialog).getByRole('button', { name: /Iniciar sincronização/ }),
    );
    expect(
      await within(dialog).findByText(/Serviço de sincronização indisponível/),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(sessionStore.hasTokensInMemory()).toBe(true);
  });
});

describe('detalhe da execução (/console/etl/$runId)', () => {
  it('exibe etapas com métricas expandíveis e navega para aba logs com paginação e filtros', async () => {
    const pagedLogs = Array.from({ length: 105 }, (_, i) => ({
      timestamp: '2026-11-21T02:00:05Z',
      level: i === 104 ? 'ERROR' : 'INFO',
      routine: 'openalex',
      message: i === 104 ? 'Falha crítica na página 2' : `Linha ${i + 1}`,
    }));

    await signIn([
      http.get(adminUrl('etl/runs/:runId/logs'), ({ request }) => {
        const url = new URL(request.url);
        const offset = Number(url.searchParams.get('offset') ?? '0');
        const limit = Number(url.searchParams.get('limit') ?? '100');
        const slice = pagedLogs.slice(offset, offset + limit);
        return HttpResponse.json({
          lines: slice,
          next_offset: offset + slice.length,
          status: 'FAILED',
        });
      }),
    ]);

    const { router, user } = await renderRoute(
      `/console/etl/${adminFixtures.latestRun.id}`,
    );

    expect(
      await screen.findByText('Coleta de Currículos Lattes'),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: 'Ver métricas de Enriquecimento com OpenAlex',
      }),
    );
    expect(
      await screen.findByText('Timeout ao consultar OpenAlex'),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /Logs/ }));
    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ tab: 'logs' });
    });

    const loadMoreBtn = await screen.findByRole('button', {
      name: /Carregar mais logs/,
    });
    await user.click(loadMoreBtn);

    expect(
      await screen.findByText('Falha crítica na página 2'),
    ).toBeInTheDocument();
  });

  it('encerra polling automaticamente quando status atinge SUCCEEDED', async () => {
    let runCalls = 0;
    await signIn([
      http.get(adminUrl('etl/runs/:runId'), ({ params }) => {
        runCalls += 1;
        const isDone = runCalls >= 2;
        return HttpResponse.json({
          ...adminFixtures.latestRun,
          id: String(params.runId),
          status: isDone ? 'SUCCEEDED' : 'RUNNING',
          ended_at: isDone ? '2026-11-21T02:05:00Z' : null,
          current_routine: isDone ? null : 'lattes',
          error_message: null,
        });
      }),
    ]);

    vi.useFakeTimers({ shouldAdvanceTime: true });
    await renderRoute(`/console/etl/${adminFixtures.latestRun.id}`);

    expect(await screen.findByText('Em execução')).toBeInTheDocument();
    const callsBeforePoll = runCalls;

    await vi.advanceTimersByTimeAsync(4_500);
    await waitFor(() => {
      expect(runCalls).toBeGreaterThan(callsBeforePoll);
    });

    await waitFor(() => {
      expect(screen.getAllByText('Sucesso').length).toBeGreaterThan(0);
    });
    const callsAfterDone = runCalls;

    await vi.advanceTimersByTimeAsync(10_000);
    expect(runCalls).toBe(callsAfterDone);
  });

  it('em 502 nos logs mostra SectionError sem encerrar a sessão', async () => {
    await signIn([
      http.get(adminUrl('etl/runs/:runId/logs'), () =>
        HttpResponse.json({ detail: 'Logs indisponíveis' }, { status: 502 }),
      ),
    ]);

    await renderRoute(`/console/etl/${adminFixtures.latestRun.id}?tab=logs`, {
      queryClient: createTestQueryClient(),
    });

    expect(
      await screen.findByText('Não foi possível carregar os logs'),
    ).toBeInTheDocument();
    expect(screen.getByText('Logs indisponíveis')).toBeInTheDocument();
    expect(sessionStore.hasTokensInMemory()).toBe(true);
  });
});
