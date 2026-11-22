import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse, type RequestHandler } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.stubEnv('VITE_ADMIN_API_URL', 'https://api.test/simcc/admin/');
vi.stubEnv('VITE_IDP_URL', 'https://api.test/idp/');

const { idp } = await import('@/api/idp');
const { sessionStore } = await import('@/entities/session');
const { renderRoute } = await import('./render-route');
const { server } = await import('./msw/server');
const { adminFixtures, adminHandlers, adminUrl } =
  await import('./msw/admin-handlers');

async function signIn(overrides: RequestHandler[] = []) {
  server.use(...overrides, ...adminHandlers());
  await idp.exchangeCodeForTokens({ code: 'code-test', codeVerifier: 'v' });
}

afterEach(() => {
  sessionStore.reset();
});

describe('menu do console (T12.2)', () => {
  it('exibe Pesquisadores, Instituições e Coleções no menu do console', async () => {
    await signIn();
    await renderRoute('/console');

    const nav = (
      await screen.findAllByRole('navigation', { name: 'Menu do console' })
    )[0]!;
    expect(
      within(nav).getByRole('link', { name: 'Pesquisadores' }),
    ).toHaveAttribute('href', '/console/pesquisadores');
    expect(
      within(nav).getByRole('link', { name: 'Instituições' }),
    ).toHaveAttribute('href', '/console/instituicoes');
    expect(within(nav).getByRole('link', { name: 'Coleções' })).toHaveAttribute(
      'href',
      '/console/colecoes',
    );
  });
});

describe('instituições (/console/instituicoes)', () => {
  it('lista, filtra por ?q= na URL e navega para o detalhe', async () => {
    await signIn();
    const { router, user } = await renderRoute('/console/instituicoes');

    const table = await screen.findByRole('table');
    expect(within(table).getByText('UFBA')).toBeInTheDocument();
    expect(within(table).getByText('UEFS')).toBeInTheDocument();

    await user.type(
      screen.getByRole('searchbox', { name: /Pesquisar instituições/ }),
      'ufba',
    );
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: 'ufba' });
    });
    await waitFor(() => {
      expect(
        within(screen.getByRole('table')).queryByText('UEFS'),
      ).not.toBeInTheDocument();
    });

    await user.click(
      within(screen.getByRole('table')).getByRole('link', {
        name: 'Universidade Federal da Bahia',
      }),
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        `/console/instituicoes/${adminFixtures.institutions[0]!.id}`,
      );
    });
  });

  it('cria instituição mantendo aberto em 409, edita e exclui com confirmação', async () => {
    const posted: unknown[] = [];
    const updated: unknown[] = [];
    const deleted: string[] = [];

    await signIn([
      http.post(adminUrl('academic/institutions'), async ({ request }) => {
        const body = (await request.json()) as {
          acronym: string;
          name: string;
        };
        posted.push(body);
        if (body.acronym === 'UFBA') {
          return HttpResponse.json(
            { detail: 'Institution with this acronym already exists' },
            { status: 409 },
          );
        }
        return HttpResponse.json(
          {
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa9',
            acronym: body.acronym,
            name: body.name,
            created_at: '2026-11-22T10:00:00Z',
          },
          { status: 201 },
        );
      }),
      http.put(
        adminUrl('academic/institutions/:institutionId'),
        async ({ params, request }) => {
          const body = (await request.json()) as {
            acronym: string;
            name: string;
          };
          updated.push({ id: params.institutionId, ...body });
          return HttpResponse.json({
            id: String(params.institutionId),
            acronym: body.acronym,
            name: body.name,
            created_at: '2026-10-01T10:00:00Z',
          });
        },
      ),
      http.delete(
        adminUrl('academic/institutions/:institutionId'),
        ({ params }) => {
          deleted.push(String(params.institutionId));
          return HttpResponse.json({ message: 'Deleted' });
        },
      ),
    ]);

    const { user } = await renderRoute('/console/instituicoes');
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Nova instituição' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Sigla'), 'ufba');
    await user.type(within(dialog).getByLabelText('Nome'), 'Dup');
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    expect(
      await within(dialog).findByText(
        'Já existe uma instituição com esta sigla.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    const acronymInput = within(dialog).getByLabelText('Sigla');
    await user.clear(acronymInput);
    await user.type(acronymInput, 'UESB');
    const nameInput = within(dialog).getByLabelText('Nome');
    await user.clear(nameInput);
    await user.type(nameInput, 'Universidade Estadual do Sudoeste da Bahia');
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(posted).toHaveLength(2);
    expect(posted[1]).toEqual({
      acronym: 'UESB',
      name: 'Universidade Estadual do Sudoeste da Bahia',
    });

    await user.click(screen.getByRole('button', { name: 'Editar UFBA' }));
    const editDialog = await screen.findByRole('dialog');
    const editName = within(editDialog).getByLabelText('Nome');
    await user.clear(editName);
    await user.type(editName, 'UFBA Atualizada');
    await user.click(
      within(editDialog).getByRole('button', { name: 'Salvar' }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(updated).toEqual([
      {
        id: adminFixtures.institutions[0]!.id,
        acronym: 'UFBA',
        name: 'UFBA Atualizada',
      },
    ]);

    await user.click(screen.getByRole('button', { name: 'Excluir UEFS' }));
    const alert = await screen.findByRole('alertdialog');
    await user.click(within(alert).getByRole('button', { name: 'Excluir' }));
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(deleted).toEqual([adminFixtures.institutions[1]!.id]);
  });
});

describe('detalhe da instituição (/console/instituicoes/$institutionId)', () => {
  it('lista pesquisadores vinculados, permite cadastrar pré-vinculado e desvincular', async () => {
    const createdPayloads: unknown[] = [];
    const unlinked: unknown[] = [];
    const ufba = adminFixtures.institutions[0]!;

    await signIn([
      http.post(adminUrl('academic/researchers'), async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        createdPayloads.push(body);
        return HttpResponse.json(
          {
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb9',
            name: body.name,
            lattes_id: body.lattes_id,
            created_at: '2026-11-22T10:00:00Z',
            affiliations: [],
            collections: [],
          },
          { status: 201 },
        );
      }),
      http.delete(
        adminUrl(
          'academic/researchers/:researcherId/institutions/:institutionId',
        ),
        ({ params }) => {
          unlinked.push(params);
          return HttpResponse.json({ message: 'Removed' });
        },
      ),
    ]);

    const { user } = await renderRoute(`/console/instituicoes/${ufba.id}`);

    expect(
      await screen.findByRole('heading', { name: ufba.name }),
    ).toBeInTheDocument();
    const table = await screen.findByRole('table');
    expect(within(table).getByText('Maria Souza')).toBeInTheDocument();
    expect(within(table).queryByText('João Silva')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Novo pesquisador' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nome'), 'Carlos Lima');
    await user.type(
      within(dialog).getByLabelText('Lattes ID'),
      '1111222233334444',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(createdPayloads).toEqual([
      {
        name: 'Carlos Lima',
        lattes_id: '1111222233334444',
        institution_ids: [ufba.id],
        collection_ids: [],
      },
    ]);

    await user.click(screen.getByRole('button', { name: 'Desvincular' }));
    const alert = await screen.findByRole('alertdialog');
    await user.click(
      within(alert).getByRole('button', { name: 'Desvincular' }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
    expect(unlinked).toEqual([
      {
        researcherId: adminFixtures.researchers[0]!.id,
        institutionId: ufba.id,
      },
    ]);
  });
});

describe('pesquisadores (/console/pesquisadores e $researcherId)', () => {
  it('sincroniza pesquisador por linha sem enviar triggered_by e mostra link para o ETL', async () => {
    const etlBodies: unknown[] = [];
    await signIn([
      http.post(adminUrl('etl/runs'), async ({ request }) => {
        etlBodies.push(await request.json());
        return HttpResponse.json(
          {
            run_id: '55555555-5555-4555-8555-555555555555',
            status: 'ACCEPTED',
          },
          { status: 202 },
        );
      }),
    ]);

    const { user } = await renderRoute('/console/pesquisadores');
    const table = await screen.findByRole('table');
    expect(within(table).getByText('Maria Souza')).toBeInTheDocument();

    await user.click(
      within(table).getByRole('button', { name: 'Sincronizar Maria Souza' }),
    );

    const link = await screen.findByRole('link', {
      name: /Ver execução no ETL/,
    });
    expect(link).toHaveAttribute(
      'href',
      '/console/etl/55555555-5555-4555-8555-555555555555',
    );
    expect(etlBodies).toEqual([
      { lattes_ids: ['1234567890123456'], force: false },
    ]);
  });

  it('valida 16 dígitos do Lattes, trata 409 e navega para o detalhe ao criar', async () => {
    await signIn([
      http.post(adminUrl('academic/researchers'), async ({ request }) => {
        const body = (await request.json()) as {
          name: string;
          lattes_id: string;
        };
        if (body.lattes_id === '1234567890123456') {
          return HttpResponse.json(
            { detail: 'Researcher with this lattes_id already exists' },
            { status: 409 },
          );
        }
        return HttpResponse.json(
          {
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8',
            name: body.name,
            lattes_id: body.lattes_id,
            created_at: '2026-11-22T10:00:00Z',
            affiliations: [],
            collections: [],
          },
          { status: 201 },
        );
      }),
      http.get(
        adminUrl('academic/researchers/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8'),
        () =>
          HttpResponse.json({
            id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8',
            name: 'Ana Pesquisadora',
            lattes_id: '0000111122223333',
            created_at: '2026-11-22T10:00:00Z',
            affiliations: [],
            collections: [],
          }),
      ),
    ]);

    const { router, user } = await renderRoute('/console/pesquisadores');
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Novo pesquisador' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nome'), 'Ana Pesquisadora');
    await user.type(within(dialog).getByLabelText('Lattes ID'), '12345');
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    expect(
      await within(dialog).findByText(
        'O Lattes ID deve ter exatamente 16 dígitos numéricos.',
      ),
    ).toBeInTheDocument();

    const lattesInput = within(dialog).getByLabelText('Lattes ID');
    await user.clear(lattesInput);
    await user.type(lattesInput, '1234567890123456');
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    expect(
      await within(dialog).findByText(
        'Já existe um pesquisador com este Lattes ID.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.clear(lattesInput);
    await user.type(lattesInput, '0000111122223333');
    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe(
        '/console/pesquisadores/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb8',
      );
    });
  });

  it('abre o pesquisador em overlay com máscara e permite editar e excluir', async () => {
    const maria = adminFixtures.researchers[0]!;
    const updatedPayloads: unknown[] = [];
    const deletedIds: string[] = [];

    await signIn([
      http.put(
        adminUrl('academic/researchers/:researcherId'),
        async ({ request }) => {
          const body = (await request.json()) as {
            name: string;
            lattes_id: string;
          };
          updatedPayloads.push(body);
          return HttpResponse.json({ ...maria, ...body });
        },
      ),
      http.delete(
        adminUrl('academic/researchers/:researcherId'),
        ({ params }) => {
          deletedIds.push(String(params.researcherId));
          return HttpResponse.json({ message: 'Deleted' });
        },
      ),
    ]);

    const { router, user } = await renderRoute('/console/pesquisadores');
    const table = await screen.findByRole('table');

    await user.click(within(table).getByRole('link', { name: 'Maria Souza' }));

    const sheet = await screen.findByRole('dialog');
    expect(
      within(sheet).getByText('Detalhes do pesquisador'),
    ).toBeInTheDocument();
    expect(router.state.location.search).toMatchObject({
      researcher: maria.id,
    });

    const nameInput = await within(sheet).findByLabelText('Nome');
    await user.clear(nameInput);
    await user.type(nameInput, 'Maria Souza Editada');
    await user.click(
      within(sheet).getByRole('button', { name: 'Salvar alterações' }),
    );
    await waitFor(() => {
      expect(updatedPayloads).toEqual([
        { name: 'Maria Souza Editada', lattes_id: maria.lattes_id },
      ]);
    });

    await user.click(
      within(sheet).getByRole('button', { name: 'Excluir pesquisador' }),
    );
    const alert = await screen.findByRole('alertdialog');
    await user.click(within(alert).getByRole('button', { name: 'Excluir' }));

    await waitFor(() => {
      expect(deletedIds).toEqual([maria.id]);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});

describe('coleções (/console/colecoes)', () => {
  it('bloqueia exclusão da coleção padrão, cria com 422 inline e navega para pesquisadores filtrados', async () => {
    await signIn([
      http.post(adminUrl('academic/collections'), () =>
        HttpResponse.json(
          {
            detail: [
              {
                loc: ['body', 'slug'],
                msg: 'Slug inválido',
                type: 'value_error',
              },
            ],
          },
          { status: 422 },
        ),
      ),
    ]);

    const { router, user } = await renderRoute('/console/colecoes');
    const table = await screen.findByRole('table');

    expect(within(table).getByText('Padrão')).toBeInTheDocument();
    expect(
      within(table).getByRole('button', {
        name: 'A coleção padrão não pode ser excluída',
      }),
    ).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Nova coleção' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nome'), 'Nova Coleção');
    expect(within(dialog).getByLabelText('Slug')).toHaveValue('nova-colecao');

    await user.click(within(dialog).getByRole('button', { name: 'Cadastrar' }));
    expect(
      await within(dialog).findByText('Slug inválido'),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    await user.click(
      within(table).getByRole('link', {
        name: 'Ver pesquisadores de Bolsistas CNPq',
      }),
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/console/pesquisadores');
      expect(router.state.location.search).toMatchObject({
        collection_id: adminFixtures.collections[1]!.id,
      });
    });
  });
});
