import { screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MARIA_ARTICLE_ID,
  MARIA_CONVERSATION_ID,
  MARIA_RESEARCHER_ID,
  MARIA_TEST_URL,
  mariaAssistantMessage,
  mariaConversation,
  mariaHandlers,
  mariaUrl,
  mariaUserMessage,
} from './msw/maria';
import { v2Fixtures } from './msw/fixtures';
import { simccV2Url } from './msw/handlers';

vi.stubEnv('VITE_MARIA_API_URL', MARIA_TEST_URL);

const { renderRoute } = await import('./render-route');
const { BROWSER_CONVERSATIONS_KEY, readBrowserConversationIds } =
  await import('@/entities/conversation/browser-conversations');
const { removeStorage, writeStorage } = await import('@/shared/lib/storage');

const articleTitle = v2Fixtures['/production/article/{article_id}'].data.title;

/** Card da entidade montado com o detalhe da v2 (o título pode vir realçado). */
async function expectProductionCard() {
  await waitFor(() => {
    const card = document.querySelector('[data-slot="production-card"]');
    expect(card?.textContent).toContain(articleTitle);
  });
}

afterEach(() => removeStorage(BROWSER_CONVERSATIONS_KEY));

describe('/maria', () => {
  it('começa uma conversa, recebe o stream e mostra as citações', async () => {
    const articleRequests: string[] = [];
    const { user, router } = await renderRoute('/maria', {
      handlers: [
        ...mariaHandlers(),
        http.get(
          simccV2Url('/production/article/{article_id}'),
          ({ params }) => {
            articleRequests.push(String(params.article_id));
            return HttpResponse.json(
              v2Fixtures['/production/article/{article_id}'],
            );
          },
        ),
      ],
    });

    await user.type(
      await screen.findByRole('textbox', { name: 'Sua pergunta para a MarIA' }),
      'Quem pesquisa robótica?{Enter}',
    );

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(
        `/maria/${MARIA_CONVERSATION_ID}`,
      ),
    );
    expect(readBrowserConversationIds()).toEqual([MARIA_CONVERSATION_ID]);

    // Texto do assistente (Markdown) montado a partir dos deltas. A espera é
    // maior porque a tela da conversa é pesada (Recharts) com a suíte em paralelo.
    expect(
      await screen.findByText('um pesquisador', undefined, { timeout: 5000 }),
    ).toHaveProperty('tagName', 'STRONG');
    expect(screen.getByText('Quem pesquisa robótica?')).toBeInTheDocument();

    // Pesquisador: cartão (PersonCard) com o id da v2.
    const researcher = await screen.findByRole('link', {
      name: /Andre Gustavo Scolari Conceição/,
    });
    expect(researcher).toHaveAttribute(
      'href',
      `/pesquisadores/${MARIA_RESEARCHER_ID}`,
    );

    // Produção: ProductionCard com o detalhe da v2, buscado pelo id e tipo.
    await expectProductionCard();
    expect(articleRequests).toEqual([MARIA_ARTICLE_ID]);

    expect(
      screen.getByRole('button', { name: /E em Salvador\?/ }),
    ).toBeInTheDocument();
  }, 15000);

  it('mostra o erro de criação sem sair da tela', async () => {
    const { user } = await renderRoute('/maria', {
      handlers: [
        http.post(mariaUrl('conversations'), () =>
          HttpResponse.json(
            { detail: 'Serviço indisponível' },
            { status: 503 },
          ),
        ),
      ],
    });
    await user.type(
      await screen.findByRole('textbox', { name: 'Sua pergunta para a MarIA' }),
      'Oi{Enter}',
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Serviço indisponível',
    );
  });
});

describe('/maria/$conversationId', () => {
  function conversationHandlers() {
    return [
      http.get(mariaUrl('conversations/:id'), () =>
        HttpResponse.json(mariaConversation()),
      ),
      http.get(mariaUrl('conversations/:id/messages'), () =>
        HttpResponse.json({
          messages: [
            mariaUserMessage('Quem pesquisa robótica?'),
            mariaAssistantMessage(),
          ],
        }),
      ),
    ];
  }

  it('recarrega a conversa (F5) e a guarda na lista do navegador', async () => {
    await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: conversationHandlers(),
    });

    expect(
      await screen.findByRole('heading', {
        name: 'Pesquisadores de robótica na Bahia',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/1 de 10 perguntas/)).toBeInTheDocument();
    expect(screen.getByText('Quem pesquisa robótica?')).toBeInTheDocument();
    await expectProductionCard();

    const list = screen.getByRole('navigation', {
      name: 'Conversas neste navegador',
    });
    const item = within(list).getByRole('link', {
      name: /Pesquisadores de robótica na Bahia/,
    });
    expect(item).toHaveAttribute('aria-current', 'page');
    expect(readBrowserConversationIds()).toEqual([MARIA_CONVERSATION_ID]);
  }, 15000);

  it('remove a conversa só da lista local', async () => {
    const { user } = await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: conversationHandlers(),
    });
    await user.click(
      await screen.findByRole('button', {
        name: /Remover "Pesquisadores de robótica na Bahia"/,
      }),
    );
    expect(readBrowserConversationIds()).toEqual([]);
  }, 15000);

  it('envia uma nova pergunta e acrescenta a resposta', async () => {
    let saved = [
      mariaUserMessage(
        'Quem pesquisa robótica?',
        'aaaaaaaa-0000-4000-8000-0000000000a1',
      ),
      mariaAssistantMessage(
        'Primeira resposta.',
        'aaaaaaaa-0000-4000-8000-0000000000a2',
      ),
    ];
    const { user } = await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: [
        http.get(mariaUrl('conversations/:id'), () =>
          HttpResponse.json(
            mariaConversation({ questions_asked: saved.length / 2 }),
          ),
        ),
        http.get(mariaUrl('conversations/:id/messages'), () =>
          HttpResponse.json({ messages: saved }),
        ),
        ...mariaHandlers(),
      ],
    });
    expect(await screen.findByText('Primeira resposta.')).toBeInTheDocument();
    // A API grava pergunta e resposta ao fim do stream.
    saved = [
      ...saved,
      mariaUserMessage('E em Salvador?'),
      mariaAssistantMessage(),
    ];
    await user.type(
      await screen.findByRole('textbox', { name: 'Sua pergunta para a MarIA' }),
      'E em Salvador?{Enter}',
    );
    expect(await screen.findByText(/2 de 10 perguntas/)).toBeInTheDocument();
    expect(
      screen.getAllByText('E em Salvador?', { selector: 'p' }),
    ).toHaveLength(1);
    expect(screen.getByText('Primeira resposta.')).toBeInTheDocument();
    expect(await screen.findByText('um pesquisador')).toBeInTheDocument();
  }, 15000);

  it('mostra o limite de perguntas (429) sem oferecer reenvio', async () => {
    const { user } = await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: [
        ...conversationHandlers(),
        http.post(mariaUrl('conversations/:id/messages/stream'), () =>
          HttpResponse.json(
            { detail: 'Limite de 10 perguntas da conversa atingido.' },
            { status: 429 },
          ),
        ),
      ],
    });
    await user.type(
      await screen.findByRole('textbox', { name: 'Sua pergunta para a MarIA' }),
      'Mais uma{Enter}',
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Limite de 10 perguntas da conversa atingido.',
    );
    expect(screen.queryByRole('button', { name: /Tentar de novo/ })).toBeNull();
  }, 15000);

  it('desliga o envio quando a conversa chegou ao limite', async () => {
    await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: [
        http.get(mariaUrl('conversations/:id'), () =>
          HttpResponse.json(mariaConversation({ questions_asked: 10 })),
        ),
        ...conversationHandlers(),
      ],
    });
    expect(
      await screen.findByText(/chegou ao limite de perguntas/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Sua pergunta para a MarIA' }),
    ).toBeDisabled();
  }, 15000);

  it('mostra "não encontrada" para conversa apagada', async () => {
    writeStorage(BROWSER_CONVERSATIONS_KEY, [MARIA_CONVERSATION_ID]);
    const { user } = await renderRoute(`/maria/${MARIA_CONVERSATION_ID}`, {
      handlers: [
        http.get(mariaUrl('conversations/:id'), () =>
          HttpResponse.json(
            { detail: 'Conversa não encontrada' },
            { status: 404 },
          ),
        ),
        http.get(mariaUrl('conversations/:id/messages'), () =>
          HttpResponse.json(
            { detail: 'Conversa não encontrada' },
            { status: 404 },
          ),
        ),
      ],
    });
    expect(
      await screen.findByText('Conversa não encontrada', { selector: 'p' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remover da lista' }));
    expect(readBrowserConversationIds()).toEqual([]);
  }, 15000);

  it('responde 404 para id que não é UUID', async () => {
    await renderRoute('/maria/nao-e-uuid');
    expect(
      await screen.findByText(/não encontrada|não existe/i),
    ).toBeInTheDocument();
  });
});
