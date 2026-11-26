import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import type { ConversationBlock } from '@/entities/conversation/model';
import { v2Fixtures } from '@/test/msw/fixtures';
import { simccV2Url } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

const ODA_TEST_URL = 'https://oda.test/oda/v1/';
vi.stubEnv('VITE_ODA_API_URL', ODA_TEST_URL);

const { MessageBlocks } =
  await import('@/features/maria/components/message-blocks');

function renderBlocks(blocks: readonly ConversationBlock[]) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const user = userEvent.setup();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MessageBlocks blocks={blocks} />
    </QueryClientProvider>,
  );
  return { user, ...utils };
}

describe('MessageBlocks', () => {
  describe('ResearchersBlockView', () => {
    it('hidrata apenas os pesquisadores visíveis via GET /v2/researcher/{id} e expande em "Ver todos"', async () => {
      const fetched: string[] = [];
      const baseDetail = v2Fixtures['/researcher/{researcher_id}'].data;
      server.use(
        http.get(simccV2Url('/researcher/{researcher_id}'), ({ params }) => {
          const id = String(params.researcher_id);
          fetched.push(id);
          return HttpResponse.json({
            data: {
              ...baseDetail,
              id,
              name: `Pesquisador ${id}`,
              graduation: 'Doutorado',
            },
            meta: {},
          });
        }),
      );

      const { user } = renderBlocks([
        {
          type: 'researchers',
          title: 'Pesquisadores',
          researchers: [
            {
              id: 'r1',
              name: 'R1',
              affiliations: [{ institution_acronym: 'UFBA' }],
            },
            { id: 'r2', name: 'R2' },
            { id: 'r3', name: 'R3' },
            { id: 'r4', name: 'R4' },
          ],
          total: 4,
          truncated: false,
        },
      ]);

      await waitFor(() => {
        expect(fetched).toEqual(['r1', 'r2', 'r3']);
      });
      expect(await screen.findByText('Pesquisador r1')).toBeInTheDocument();
      expect(screen.queryByText('Pesquisador r4')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Ver todos \(4\)/ }));

      await waitFor(() => {
        expect(fetched).toEqual(['r1', 'r2', 'r3', 'r4']);
      });
      expect(await screen.findByText('Pesquisador r4')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Mostrar menos/ }),
      ).toBeInTheDocument();
    });

    it('mantém o fallback da MarIA quando GET /v2/researcher/{id} falha', async () => {
      server.use(
        http.get(simccV2Url('/researcher/{researcher_id}'), () =>
          HttpResponse.json({ detail: 'Erro' }, { status: 500 }),
        ),
      );

      renderBlocks([
        {
          type: 'researchers',
          title: 'Pesquisadores',
          researchers: [
            {
              id: 'r-fail',
              name: 'Pesquisador Fallback',
              affiliations: [{ institution_acronym: 'UESC' }],
              evidence: { total: 2 },
            },
          ],
          total: 1,
          truncated: false,
        },
      ]);

      expect(
        await screen.findByText('Pesquisador Fallback'),
      ).toBeInTheDocument();
      expect(screen.getByText('UESC')).toBeInTheDocument();
    });
  });

  describe('ProductionsBlockView', () => {
    it('suporta os novos tipos da v2 e faz preview/expansão sob demanda', async () => {
      const fetched: string[] = [];
      server.use(
        http.get(
          simccV2Url('/production/research-project/{project_id}'),
          ({ params }) => {
            fetched.push(`research_project:${String(params.project_id)}`);
            return HttpResponse.json(
              v2Fixtures['/production/research-project/{project_id}'],
            );
          },
        ),
        http.get(
          simccV2Url('/production/article/{article_id}'),
          ({ params }) => {
            fetched.push(`article:${String(params.article_id)}`);
            return HttpResponse.json(
              v2Fixtures['/production/article/{article_id}'],
            );
          },
        ),
      );

      const { user } = renderBlocks([
        {
          type: 'productions',
          title: 'Produções',
          productions: [
            {
              id: 'p1',
              title: 'Projeto 1',
              type: 'research_project',
              type_label: 'Projeto de Pesquisa',
              year: 2025,
            },
            {
              id: 'p2',
              title: 'Artigo 2',
              type: 'article',
              type_label: 'Artigo',
              year: 2024,
            },
            {
              id: 'p3',
              title: 'Artigo 3',
              type: 'article',
              type_label: 'Artigo',
              year: 2023,
            },
            {
              id: 'p4',
              title: 'Artigo 4',
              type: 'article',
              type_label: 'Artigo',
              year: 2022,
            },
          ],
          total: 4,
          truncated: false,
        },
      ]);

      await waitFor(() => {
        expect(fetched).toEqual([
          'research_project:p1',
          'article:p2',
          'article:p3',
        ]);
      });

      await user.click(screen.getByRole('button', { name: /Ver todos \(4\)/ }));

      await waitFor(() => {
        expect(fetched).toEqual([
          'research_project:p1',
          'article:p2',
          'article:p3',
          'article:p4',
        ]);
      });
    });
  });

  describe('GraduateProgramsBlockView', () => {
    it('hidrata via GET /v2/graduate-program/{id}, expande e usa fallback em erro', async () => {
      const baseProgram = v2Fixtures['/graduate-program/{program_id}'].data;
      server.use(
        http.get(simccV2Url('/graduate-program/{program_id}'), ({ params }) => {
          const id = String(params.program_id);
          if (id === 'gp-fail') {
            return HttpResponse.json(
              { detail: 'Não encontrado' },
              { status: 404 },
            );
          }
          return HttpResponse.json({
            data: { ...baseProgram, id, name: `Programa ${id}` },
            meta: {},
          });
        }),
      );

      const { user } = renderBlocks([
        {
          type: 'graduate_programs',
          title: 'Programas',
          graduate_programs: [
            {
              id: 'gp-1',
              name: 'GP 1',
              acronym: 'PPGC',
              institution_label: 'UFBA',
            },
            {
              id: 'gp-fail',
              name: 'Programa Fallback',
              acronym: 'PPGF',
              institution_label: 'UEFS',
            },
            { id: 'gp-3', name: 'GP 3' },
            { id: 'gp-4', name: 'GP 4' },
          ],
          total: 4,
          truncated: false,
        },
      ]);

      expect(await screen.findByText('Programa gp-1')).toBeInTheDocument();
      expect(await screen.findByText('Programa Fallback')).toBeInTheDocument();
      expect(screen.getByText('UEFS')).toBeInTheDocument();
      expect(screen.queryByText('Programa gp-4')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Ver todos \(4\)/ }));
      expect(await screen.findByText('Programa gp-4')).toBeInTheDocument();
    });
  });

  describe('ResearchGroupsBlockView', () => {
    it('hidrata via GET /grupos-pesquisa/{id} na API ODA e usa fallback em erro', async () => {
      server.use(
        http.get(`${ODA_TEST_URL}grupos-pesquisa/:id`, ({ params }) => {
          const id = String(params.id);
          if (id === 'rg-fail') {
            return HttpResponse.json({ message: 'Erro' }, { status: 500 });
          }
          return HttpResponse.json({
            data: {
              id,
              nome: `Grupo ${id}`,
              areaPredominante: 'Ciência da Computação',
              instituicoes: [
                { id: 'i1', sigla: 'UFBA', nome: 'UFBA', tipoRelacao: 'SEDE' },
              ],
              membros: [{ id: 'm1', nome: 'Ana Souza', eLider: true }],
              linhasPesquisa: [{ titulo: 'IA' }],
            },
          });
        }),
      );

      const { user } = renderBlocks([
        {
          type: 'research_groups',
          title: 'Grupos de pesquisa',
          research_groups: [
            { id: 'rg-1', name: 'RG 1', institution_label: 'UFBA' },
            {
              id: 'rg-fail',
              name: 'Grupo Fallback',
              institution_label: 'UESC',
            },
            { id: 'rg-3', name: 'RG 3' },
            { id: 'rg-4', name: 'RG 4' },
          ],
          total: 4,
          truncated: false,
        },
      ]);

      expect(await screen.findByText('Grupo rg-1')).toBeInTheDocument();
      expect(await screen.findByText('Grupo Fallback')).toBeInTheDocument();
      expect(screen.getByText('UESC')).toBeInTheDocument();
      expect(screen.queryByText('Grupo rg-4')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: /Ver todos \(4\)/ }));
      expect(await screen.findByText('Grupo rg-4')).toBeInTheDocument();
    });
  });
});
