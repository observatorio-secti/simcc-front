import { isRedirect } from '@tanstack/react-router';
import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse, type RequestHandler } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.test/simcc/admin/');
vi.stubEnv('VITE_IDP_URL', 'https://api.test/idp/');

const { idp, readPkceTransaction } = await import('@/api/idp');
const { sessionStore } = await import('@/entities/session');
const { Route: ConsoleRoute } = await import('@/routes/console');
const { renderRoute, createTestQueryClient } = await import('./render-route');
const { server } = await import('./msw/server');
const { adminFixtures, adminHandlers, adminUrl, paginationOf } =
  await import('./msw/admin-handlers');

/**
 * Simula a volta do IdP: tokens em memória, como depois do callback. Os
 * `overrides` vêm antes dos handlers padrão (o MSW usa o primeiro que casa).
 */
async function signIn(overrides: RequestHandler[] = []) {
  server.use(...overrides, ...adminHandlers());
  await idp.exchangeCodeForTokens({ code: 'code-test', codeVerifier: 'v' });
}

afterEach(() => {
  sessionStore.reset();
});

describe('guarda do console', () => {
  it('sem sessão, retoma no IdP com prompt=none guardando o destino', async () => {
    const beforeLoad = ConsoleRoute.options.beforeLoad as (args: {
      context: { session: typeof sessionStore };
      location: { href: string };
    }) => Promise<unknown>;

    const thrown = await beforeLoad({
      context: { session: sessionStore },
      location: { href: '/console/admins?q=ana' },
    }).catch((error: unknown) => error);

    expect(isRedirect(thrown)).toBe(true);
    const href = (thrown as { options: { href: string } }).options.href;
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe('https://api.test/idp/authorize');
    expect(url.searchParams.get('prompt')).toBe('none');
    expect(readPkceTransaction()?.returnTo).toBe('/console/admins?q=ana');
  });

  it('logado sem is_admin vai para "sem acesso" com o sub e o botão de copiar', async () => {
    await signIn([
      http.get(adminUrl('me'), () =>
        HttpResponse.json({
          user: { sub: 'sub-carla-123', name: 'Carla', email: null },
          is_admin: false,
        }),
      ),
    ]);

    const { router, user } = await renderRoute('/console/admins');

    await screen.findByRole('heading', { name: 'Sem acesso' });
    expect(router.state.location.pathname).toBe('/auth/sem-acesso');
    expect(router.state.location.search).toMatchObject({
      from: '/console/admins',
    });
    expect(screen.getByTestId('session-sub')).toHaveTextContent(
      'sub-carla-123',
    );
    expect(
      screen.getByRole('link', { name: /Voltar ao observatório/ }),
    ).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('button', { name: /Trocar de conta/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sair/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Copiar sub' }));
    await expect(navigator.clipboard.readText()).resolves.toBe('sub-carla-123');
    expect(
      await screen.findByRole('button', { name: 'Sub copiado' }),
    ).toBeInTheDocument();
  });

  it('admin entra no console com o menu próprio', async () => {
    await signIn();
    const { router } = await renderRoute('/console');

    await screen.findByRole('heading', { name: 'Visão geral' });
    expect(router.state.location.pathname).toBe('/console');
    const nav = screen.getAllByRole('navigation', {
      name: 'Menu do console',
    })[0]!;
    expect(
      within(nav).getByRole('link', { name: 'Visão geral' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(
      within(nav).getByRole('link', { name: 'Administradores' }),
    ).toBeInTheDocument();
    expect(
      within(nav).getByRole('link', { name: 'Voltar ao observatório' }),
    ).toHaveAttribute('href', '/');
  });
});

describe('visão geral (/console)', () => {
  it('mostra o último run do ETL e os totais do cadastro', async () => {
    await signIn();
    await renderRoute('/console');

    expect(await screen.findByText('Falha')).toBeInTheDocument();
    expect(
      screen.getByText('Falha ao baixar currículos do Lattes.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Base completa')).toBeInTheDocument();
    expect(screen.getByText('12 min 30 s')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('1.234')).toBeInTheDocument();
    });
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('em 502 do ETL mostra erro recuperável sem derrubar a sessão', async () => {
    let etlCalls = 0;
    await signIn([
      http.get(adminUrl('etl/runs'), () => {
        etlCalls += 1;
        return HttpResponse.json(
          { detail: 'ETL service unavailable' },
          { status: 502 },
        );
      }),
    ]);
    // Sem retry automático (o client de teste desliga), para ver o erro já.
    const { user } = await renderRoute('/console', {
      queryClient: createTestQueryClient(),
    });

    expect(
      await screen.findByText('Não foi possível consultar a sincronização'),
    ).toBeInTheDocument();
    expect(screen.getByText('ETL service unavailable')).toBeInTheDocument();
    expect(sessionStore.getSnapshot()).toMatchObject({
      status: 'authenticated',
      isAdmin: true,
    });
    expect(sessionStore.hasTokensInMemory()).toBe(true);

    const calls = etlCalls;
    await user.click(screen.getByRole('button', { name: /Tentar novamente/ }));
    await waitFor(() => expect(etlCalls).toBe(calls + 1));
  });

  it('sem nenhum run, mostra o estado vazio', async () => {
    await signIn([
      http.get(adminUrl('etl/runs'), () =>
        HttpResponse.json({ data: [], pagination: paginationOf(0) }),
      ),
    ]);
    await renderRoute('/console');

    expect(
      await screen.findByText('Nenhuma sincronização registrada'),
    ).toBeInTheDocument();
  });
});

describe('administradores (/console/admins)', () => {
  it('lista os admins, marca a própria conta e busca pelo ?q= da URL', async () => {
    await signIn();
    const { router, user } = await renderRoute('/console/admins');

    const table = await screen.findByRole('table');
    expect(within(table).getByText('Bruno Operador')).toBeInTheDocument();
    expect(within(table).getByText('Você')).toBeInTheDocument();
    expect(
      within(table).getByRole('button', {
        name: 'Você não pode remover a si mesmo',
      }),
    ).toBeDisabled();

    await user.type(
      screen.getByRole('searchbox', { name: /Pesquisar administradores/ }),
      'bruno',
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'bruno' });
    });
    await waitFor(() => {
      expect(
        within(screen.getByRole('table')).queryByText('Ana Admin'),
      ).not.toBeInTheDocument();
    });
    expect(
      within(screen.getByRole('table')).getByText('Bruno Operador'),
    ).toBeInTheDocument();
  });

  it('cadastra por sub e mostra o 409 no próprio campo, sem fechar o diálogo', async () => {
    const posted: unknown[] = [];
    await signIn([
      http.post(adminUrl('admins'), async ({ request }) => {
        const body = (await request.json()) as { sub: string };
        posted.push(body);
        if (body.sub === 'sub-bruno') {
          return HttpResponse.json(
            { detail: 'Admin with this sub already exists' },
            { status: 409 },
          );
        }
        return HttpResponse.json(
          {
            id: '44444444-4444-4444-8444-444444444444',
            sub: body.sub,
            name: null,
            email: null,
            created_at: '2026-11-22T10:00:00Z',
            created_by: 'sub-ana',
          },
          { status: 201 },
        );
      }),
    ]);
    const { user } = await renderRoute('/console/admins');
    await screen.findByRole('table');

    await user.click(
      screen.getByRole('button', { name: 'Adicionar administrador' }),
    );
    const dialog = await screen.findByRole('dialog');
    const subInput = within(dialog).getByLabelText('Sub no IdP');

    await user.type(subInput, 'sub-bruno');
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }));

    expect(
      await within(dialog).findByText(
        'Este sub já está cadastrado como administrador.',
      ),
    ).toBeInTheDocument();
    expect(subInput).toHaveAttribute('aria-invalid', 'true');
    expect(subInput).toHaveValue('sub-bruno');
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.clear(subInput);
    await user.type(subInput, 'sub-nova');
    await user.click(within(dialog).getByRole('button', { name: 'Adicionar' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(posted).toEqual([
      { sub: 'sub-bruno', name: null, email: null },
      { sub: 'sub-nova', name: null, email: null },
    ]);
    expect(
      await screen.findByText('sub-nova agora é administrador.'),
    ).toBeInTheDocument();
  });

  it('remove com confirmação e mostra o 409 dentro do diálogo', async () => {
    const deleted: string[] = [];
    let conflict = true;
    await signIn([
      http.delete(adminUrl('admins/:adminId'), ({ params }) => {
        if (conflict) {
          return HttpResponse.json(
            { detail: 'Cannot remove the last admin' },
            { status: 409 },
          );
        }
        deleted.push(String(params.adminId));
        return new HttpResponse(null, { status: 204 });
      }),
    ]);
    const { user } = await renderRoute('/console/admins');
    await screen.findByRole('table');

    await user.click(
      screen.getByRole('button', { name: 'Remover Bruno Operador' }),
    );
    const dialog = await screen.findByRole('alertdialog');
    expect(
      within(dialog).getByText('Remover administrador?'),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Remover' }));
    expect(
      await within(dialog).findByText(
        'Não é possível remover o último administrador.',
      ),
    ).toBeInTheDocument();

    conflict = false;
    await user.click(within(dialog).getByRole('button', { name: 'Remover' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(deleted).toEqual([adminFixtures.admins[1]!.id]);
    expect(
      await screen.findByText('Bruno Operador não é mais administrador.'),
    ).toBeInTheDocument();
  });

  it('403 no meio da sessão leva para "sem acesso" sem encerrar a sessão', async () => {
    await signIn([
      http.get(adminUrl('admins'), () =>
        HttpResponse.json(
          { detail: 'Not enough permissions' },
          { status: 403 },
        ),
      ),
    ]);
    const { router } = await renderRoute('/console/admins');

    await screen.findByRole('heading', { name: 'Sem acesso' });
    expect(router.state.location.pathname).toBe('/auth/sem-acesso');
    expect(sessionStore.getSnapshot()).toMatchObject({
      status: 'authenticated',
      isAdmin: false,
    });
    expect(sessionStore.hasTokensInMemory()).toBe(true);
  });
});

describe('atalho "Console" na topbar pública', () => {
  it('aparece para visitante anônimo junto com o botão Entrar e leva ao console', async () => {
    await renderRoute('/incites');
    await screen.findByRole('heading', { level: 1 });
    expect(
      await screen.findByRole('link', { name: 'Console' }),
    ).toHaveAttribute('href', '/console');
    expect(
      screen.getByRole('button', { name: 'Entrar' }),
    ).toBeInTheDocument();
  });

  it('não aparece para logado sem is_admin, mas exibe Sair', async () => {
    await signIn([
      http.get(adminUrl('me'), () =>
        HttpResponse.json({
          user: { sub: 'sub-carla', name: 'Carla', email: null },
          is_admin: false,
        }),
      ),
    ]);
    await sessionStore.ensureSession();
    await renderRoute('/incites');
    await screen.findByRole('heading', { level: 1 });
    expect(
      screen.queryByRole('link', { name: 'Console' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });

  it('aparece para admin junto com Sair e leva ao console', async () => {
    await signIn();
    await sessionStore.ensureSession();
    await renderRoute('/incites');

    expect(
      await screen.findByRole('link', { name: 'Console' }),
    ).toHaveAttribute('href', '/console');
    expect(screen.getByRole('button', { name: 'Sair' })).toBeInTheDocument();
  });
});
