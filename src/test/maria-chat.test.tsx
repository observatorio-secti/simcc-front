import { screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { MariaMessage } from '@/api/maria';
import {
  MARIA_CONVERSATION_ID,
  MARIA_TEST_URL,
  mariaConversation,
  mariaHandlers,
  mariaUrl,
  mariaUserMessage,
  sseEvent,
  sseResponse,
} from './msw/maria';

vi.stubEnv('VITE_MARIA_API_URL', MARIA_TEST_URL);

const { renderRoute } = await import('./render-route');
const { BROWSER_CONVERSATIONS_KEY, readBrowserConversationIds } =
  await import('@/entities/conversation/browser-conversations');
const { removeStorage } = await import('@/shared/lib/storage');

afterEach(() => removeStorage(BROWSER_CONVERSATIONS_KEY));

const textbox = () =>
  screen.findByRole('textbox', { name: 'Sua pergunta para a MarIA' });

const origin = {
  sources: ['Fomento à pesquisa'],
  description: 'Buscando bolsas por ano e modalidade',
  queried_at: '2026-11-22T15:54:02Z',
  coverage: null,
};

function chartMessage(): MariaMessage {
  return {
    id: 'bbbbbbbb-0000-4000-8000-000000000002',
    conversation_id: MARIA_CONVERSATION_ID,
    role: 'assistant',
    content: [
      { type: 'text', text: 'As bolsas **cresceram** no período.' },
      {
        type: 'chart',
        chart_type: 'bar',
        title: 'Bolsas por ano e modalidade',
        x: { key: 'ano', label: 'Ano', type: 'number' },
        series: [
          { key: 'mestrado', label: 'Mestrado', unit: 'bolsas' },
          { key: 'doutorado', label: 'Doutorado', unit: 'bolsas' },
        ],
        data: [
          { ano: 2021, mestrado: 393, doutorado: 241 },
          { ano: 2022, mestrado: 1385, doutorado: 206 },
        ],
        group: { key: 'modalidade', label: 'Modalidade' },
        orientation: 'vertical',
        stacking: 'percent',
        truncated: true,
        origin,
      },
      {
        type: 'table',
        title: 'Bolsas por território',
        columns: [
          { key: 'territorio', label: 'Território', type: 'string' },
          { key: 'bolsas', label: 'Bolsas', type: 'number' },
        ],
        rows: [{ territorio: 'Metropolitano de Salvador', bolsas: 12512 }],
        truncated: false,
        origin,
      },
      // Tipo que o front ainda não conhece: ignorado sem quebrar.
      {
        type: 'map',
        regions: [],
      } as unknown as MariaMessage['content'][number],
      {
        type: 'researchers',
        title: 'Especialistas em dengue',
        total: 42,
        truncated: false,
        ranking: {
          term: 'dengue',
          criterion: 'Relevância textual nas produções.',
          fields: ['título', 'resumo'],
          data_as_of: '2026-10-20T00:00:00Z',
        },
        researchers: [
          {
            id: '6cfd7af4-d287-4c2b-8f11-0861b54f5cf4',
            name: 'Ana Pesquisadora',
            affiliations: [{ institution_acronym: 'UFBA' }],
          },
        ],
      },
      { type: 'suggestions', questions: ['E por instituição?'] },
    ],
    created_at: '2026-11-22T15:55:00Z',
  };
}

describe('/maria (criação ao acessar)', () => {
  it('cria a conversa uma vez, troca a URL e mostra o estado vazio', async () => {
    let created = 0;
    const { router } = await renderRoute('/maria', {
      handlers: [
        http.post(mariaUrl('conversations'), async () => {
          created += 1;
          return HttpResponse.json(
            mariaConversation({ title: null, questions_asked: 0 }),
            { status: 201 },
          );
        }),
        ...mariaHandlers().slice(1),
      ],
    });

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/maria/${MARIA_CONVERSATION_ID}`,
      ),
    );
    expect(
      await screen.findByRole('heading', {
        name: 'O que você quer investigar hoje?',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nova conversa' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('0 de 10 perguntas utilizadas'),
    ).toBeInTheDocument();
    expect(created).toBe(1);
    // Ainda vazia: não entra na lista do navegador.
    expect(readBrowserConversationIds()).toEqual([]);
  }, 15000);

  it('envia a pergunta inicial ao clicar e grava a conversa no fim', async () => {
    const { user } = await renderRoute('/maria', {
      handlers: mariaHandlers(),
    });
    await user.click(
      await screen.findByRole('button', {
        name: /Como evoluiu o número de bolsas/,
      }),
    );
    expect(await screen.findByText('um pesquisador')).toBeInTheDocument();
    await waitFor(() =>
      expect(readBrowserConversationIds()).toEqual([MARIA_CONVERSATION_ID]),
    );
    expect(
      await screen.findByText('1 de 10 perguntas utilizadas'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: 'Próximos caminhos de investigação',
      }),
    ).toBeInTheDocument();
  }, 15000);

  it('mostra o erro de criação com "Tentar novamente"', async () => {
    let attempts = 0;
    const { user, router } = await renderRoute('/maria', {
      handlers: [
        http.post(mariaUrl('conversations'), () => {
          attempts += 1;
          return attempts === 1
            ? HttpResponse.json(
                { detail: 'Serviço indisponível' },
                { status: 503 },
              )
            : HttpResponse.json(mariaConversation({ title: null }), {
                status: 201,
              });
        }),
        ...mariaHandlers().slice(1),
      ],
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Não foi possível iniciar a conversa/,
    );
    expect(await textbox()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/maria/${MARIA_CONVERSATION_ID}`,
      ),
    );
  }, 15000);
});

describe('/maria/$conversationId (chat)', () => {
  function handlers(messages: MariaMessage[], asked = messages.length / 2) {
    return [
      http.get(mariaUrl('conversations/:id'), () =>
        HttpResponse.json(mariaConversation({ questions_asked: asked })),
      ),
      http.get(mariaUrl('conversations/:id/messages'), () =>
        HttpResponse.json({ messages }),
      ),
    ];
  }

  it('desenha gráfico, tabela, ranking e ignora tipo desconhecido', async () => {
    await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: handlers([
        mariaUserMessage('Como evoluíram as bolsas?'),
        chartMessage(),
      ]),
    });

    const chart = await screen.findByRole('region', {
      name: 'Gráfico de barras: Bolsas por ano e modalidade',
    });
    expect(within(chart).getByRole('img')).toBeInTheDocument();
    expect(within(chart).getByText('Mestrado')).toBeInTheDocument();
    expect(within(chart).getByText('Modalidade:')).toBeInTheDocument();
    expect(
      within(chart).getByText(/Resultado limitado a 100 linhas/),
    ).toBeInTheDocument();
    expect(
      within(chart).getByText(/Fonte: Fomento à pesquisa/),
    ).toBeInTheDocument();
    // Empilhamento percentual: eixo de 0 a 100%.
    expect(within(chart).getByText('100%')).toBeInTheDocument();
    for (const action of ['Copiar CSV', 'Baixar CSV', 'Baixar PNG']) {
      expect(
        within(chart).getByRole('button', { name: action }),
      ).toBeInTheDocument();
    }

    const table = screen.getByRole('region', { name: 'Bolsas por território' });
    expect(within(table).getByText('12.512')).toBeInTheDocument();

    const ranking = screen.getByRole('region', {
      name: 'Especialistas em dengue',
    });
    expect(ranking).toHaveTextContent(
      '1 pesquisador exibido de 42 encontrados',
    );
    expect(ranking).toHaveTextContent('Campos considerados: título, resumo.');
    expect(ranking).toHaveTextContent('Dados de 20/10/2026');

    // Painel de contexto (a partir de xl; no jsdom está no DOM).
    const panel = screen.getByRole('complementary', {
      name: 'Contexto da pesquisa',
    });
    expect(within(panel).getByText('Fomento à pesquisa')).toBeInTheDocument();
    expect(
      within(panel).getByText(
        'Buscando bolsas por ano e modalidade · Fomento à pesquisa',
      ),
    ).toBeInTheDocument();
  }, 15000);

  it('mostra a tabela do gráfico em "Ver tabela"', async () => {
    const { user } = await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: handlers([mariaUserMessage('Bolsas?'), chartMessage()]),
    });
    const chart = await screen.findByRole('region', {
      name: /Bolsas por ano e modalidade/,
    });
    await user.click(within(chart).getByRole('button', { name: 'Ver tabela' }));
    expect(within(chart).getByText('1.385')).toBeInTheDocument();
    expect(within(chart).getByText('2021')).toBeInTheDocument();
  }, 15000);

  it('destaca o contador quando faltam 2 perguntas', async () => {
    await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: handlers([], 8),
    });
    const counter = await screen.findByText('8 de 10 perguntas utilizadas');
    expect(counter).toHaveAttribute('title', 'Restam 2 perguntas');
    expect(counter.className).toContain('amber');
  }, 15000);

  it('em erro do stream descarta o rascunho e devolve a pergunta', async () => {
    const { user } = await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: [
        ...handlers([]),
        http.post(mariaUrl('conversations/:id/messages/stream'), () =>
          sseResponse(
            [
              sseEvent('message.user', mariaUserMessage('Pergunta difícil')),
              sseEvent('content.delta', {
                index: 0,
                type: 'text',
                text: 'Rascunho parcial',
                block: null,
              }),
              sseEvent('error', {
                detail: 'Falha ao gerar resposta do modelo',
              }),
            ].join(''),
          ),
        ),
      ],
    });
    const field = await textbox();
    await user.type(field, 'Pergunta difícil{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /Falha ao gerar resposta do modelo.*Nada foi gravado/,
    );
    expect(screen.queryByText('Rascunho parcial')).toBeNull();
    expect(field).toHaveValue('Pergunta difícil');
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument();
  }, 15000);

  it('"Parar" interrompe, avisa que nada foi gravado e devolve o texto', async () => {
    const { user } = await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: [
        ...handlers([]),
        http.post(mariaUrl('conversations/:id/messages/stream'), async () => {
          await delay('infinite');
          return HttpResponse.text('');
        }),
      ],
    });
    const field = await textbox();
    await user.type(field, 'Quem pesquisa dengue?{Enter}');
    expect(field).toHaveValue('');
    expect(await screen.findByText('enviando…')).toBeInTheDocument();
    expect(screen.getByText('Analisando a pergunta…')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Parar' }));
    expect(
      await screen.findByText(/Resposta interrompida\./),
    ).toBeInTheDocument();
    expect(screen.getByText('Nada foi gravado')).toBeInTheDocument();
    expect(field).toHaveValue('Quem pesquisa dengue?');
  }, 15000);
});
