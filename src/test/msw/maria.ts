import { http, HttpResponse, type RequestHandler } from 'msw';
import type { MariaConversationDetail, MariaMessage } from '@/api/maria';

// API da MarIA simulada para testes. Os testes que usam estes handlers fazem
// `vi.stubEnv('VITE_MARIA_API_URL', MARIA_TEST_URL)` antes de importar o app.

export const MARIA_TEST_URL = 'http://maria.test/';

export const MARIA_CONVERSATION_ID = '3f1c2b4a-1111-4222-8333-444455556666';
export const MARIA_RESEARCHER_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';
export const MARIA_ARTICLE_ID = 'c92dfe9d-a8f4-4d6b-8ba0-b7f0d7729da3';

export function mariaConversation(
  overrides: Partial<MariaConversationDetail> = {},
): MariaConversationDetail {
  return {
    id: MARIA_CONVERSATION_ID,
    title: 'Pesquisadores de robótica na Bahia',
    total_tokens: 0,
    created_at: '2026-11-22T08:54:56Z',
    updated_at: '2026-11-22T08:55:23Z',
    questions_asked: 1,
    questions_limit: 10,
    ...overrides,
  };
}

export function mariaUserMessage(
  text: string,
  id = 'aaaaaaaa-0000-4000-8000-000000000001',
): MariaMessage {
  return {
    id,
    conversation_id: MARIA_CONVERSATION_ID,
    role: 'user',
    content: [{ type: 'text', text }],
    created_at: '2026-11-22T08:54:57Z',
  };
}

/** Resposta com texto, pesquisador e artigo citados e sugestões. */
export function mariaAssistantMessage(
  text = 'Encontrei **um pesquisador** e um artigo.',
  id = 'aaaaaaaa-0000-4000-8000-000000000002',
): MariaMessage {
  return {
    id,
    conversation_id: MARIA_CONVERSATION_ID,
    role: 'assistant',
    content: [
      { type: 'text', text },
      {
        type: 'researchers',
        title: 'Pesquisadores citados',
        researchers: [
          {
            id: MARIA_RESEARCHER_ID,
            name: 'Andre Gustavo Scolari Conceição',
            affiliations: [{ institution_acronym: 'UFBA' }],
          },
        ],
        total: 1,
        truncated: false,
      },
      {
        type: 'productions',
        title: 'Artigos citados',
        productions: [
          {
            id: MARIA_ARTICLE_ID,
            title: 'Robótica educacional',
            type: 'article',
            type_label: 'Artigo em Periódico',
            year: 2026,
          },
        ],
        total: 1,
        truncated: false,
      },
      { type: 'suggestions', questions: ['E em Salvador?'] },
    ],
    created_at: '2026-11-22T08:55:20Z',
  };
}

export function sseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

/** Corpo `text/event-stream` entregue em pedaços (cortando eventos ao meio). */
export function sseResponse(body: string, chunkSize = 37) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (let index = 0; index < body.length; index += chunkSize) {
        controller.enqueue(
          encoder.encode(body.slice(index, index + chunkSize)),
        );
      }
      controller.close();
    },
  });
  return new HttpResponse(stream, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8' },
  });
}

/** Stream completo de uma resposta: eco, atividade, deltas e mensagem final. */
export function mariaStreamBody(question: string): string {
  const assistant = mariaAssistantMessage();
  const text =
    assistant.content[0]?.type === 'text' ? assistant.content[0].text : '';
  return [
    sseEvent('message.user', mariaUserMessage(question)),
    sseEvent('activity', {
      kind: 'query',
      source: 'Produção científica (Simcc)',
      description: 'Buscando pesquisadores',
    }),
    ...(text.match(/.{1,6}/g) ?? []).map((piece) =>
      sseEvent('content.delta', {
        index: 0,
        type: 'text',
        text: piece,
        block: null,
      }),
    ),
    ...assistant.content.slice(1).map((block, offset) =>
      sseEvent('content.delta', {
        index: offset + 1,
        type: block.type,
        text: null,
        block,
      }),
    ),
    sseEvent('message.assistant', assistant),
  ].join('');
}

export const mariaUrl = (path: string) => `${MARIA_TEST_URL}${path}`;

/**
 * Conversa nova que responde ao stream com `mariaStreamBody`. Como a API, só
 * grava pergunta e resposta quando o stream termina.
 */
export function mariaHandlers(): RequestHandler[] {
  let saved: MariaMessage[] = [];
  return [
    http.post(mariaUrl('conversations'), () =>
      HttpResponse.json(
        {
          id: MARIA_CONVERSATION_ID,
          title: null,
          total_tokens: 0,
          created_at: '2026-11-22T08:54:56Z',
          updated_at: '2026-11-22T08:54:56Z',
        },
        { status: 201 },
      ),
    ),
    http.get(mariaUrl('conversations/:id'), () =>
      HttpResponse.json(
        mariaConversation({ title: null, questions_asked: saved.length / 2 }),
      ),
    ),
    http.get(mariaUrl('conversations/:id/messages'), () =>
      HttpResponse.json({ messages: saved }),
    ),
    http.post(
      mariaUrl('conversations/:id/messages/stream'),
      async ({ request }) => {
        const { content } = (await request.json()) as { content: string };
        saved = [...saved, mariaUserMessage(content), mariaAssistantMessage()];
        return sseResponse(mariaStreamBody(content));
      },
    ),
  ];
}
