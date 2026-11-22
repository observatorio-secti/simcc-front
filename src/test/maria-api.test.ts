import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from './msw/server';
import {
  MARIA_CONVERSATION_ID,
  MARIA_TEST_URL,
  mariaHandlers,
  mariaStreamBody,
  mariaUserMessage,
  mariaUrl,
  sseEvent,
  sseResponse,
} from './msw/maria';

vi.stubEnv('VITE_MARIA_API_URL', MARIA_TEST_URL);

const {
  createConversation,
  getConversation,
  parseSse,
  streamMessage,
  toMariaStreamEvent,
} = await import('@/api/maria');
const { ApiError } = await import('@/api/errors');

function bodyOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const items: T[] = [];
  for await (const item of iterable) items.push(item);
  return items;
}

describe('parseSse', () => {
  it('junta eventos cortados entre pedaços e ignora comentários', async () => {
    const frames = await collect(
      parseSse(
        bodyOf(
          ': keep-alive\n\nevent: activ',
          'ity\ndata: {"a":',
          '1}\n\nevent: content.delta\r\ndata: {"b":2}\r\n\r\n',
        ),
      ),
    );
    expect(frames).toEqual([
      { event: 'activity', data: '{"a":1}', id: undefined },
      { event: 'content.delta', data: '{"b":2}', id: undefined },
    ]);
  });

  it('une linhas `data:` repetidas e fecha o último evento sem linha em branco', async () => {
    const frames = await collect(
      parseSse(bodyOf('data: linha 1\ndata: linha 2\n\ndata: fim')),
    );
    expect(frames.map((frame) => [frame.event, frame.data])).toEqual([
      ['message', 'linha 1\nlinha 2'],
      ['message', 'fim'],
    ]);
  });

  it('decodifica UTF-8 partido no meio de um caractere', async () => {
    const bytes = new TextEncoder().encode('data: robótica\n\n');
    const split = bytes.indexOf(0xc3) + 1;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(bytes.slice(0, split));
        controller.enqueue(bytes.slice(split));
        controller.close();
      },
    });
    const [frame] = await collect(parseSse(body));
    expect(frame?.data).toBe('robótica');
  });
});

describe('toMariaStreamEvent', () => {
  it('normaliza o delta de texto', () => {
    expect(
      toMariaStreamEvent({
        event: 'content.delta',
        data: '{"index":0,"type":"text","text":"Olá"}',
      }),
    ).toEqual({
      event: 'content.delta',
      data: { index: 0, type: 'text', text: 'Olá', block: null },
    });
  });

  it('ignora eventos desconhecidos', () => {
    expect(toMariaStreamEvent({ event: 'ping', data: '{}' })).toBeNull();
  });

  it('rejeita JSON fora do formato com ApiError', () => {
    expect(() =>
      toMariaStreamEvent({ event: 'activity', data: '{"kind":1}' }),
    ).toThrow(ApiError);
  });
});

describe('cliente da MarIA (src/api/maria.ts)', () => {
  it('cria e lê conversas', async () => {
    server.use(...mariaHandlers());
    await expect(createConversation()).resolves.toMatchObject({
      id: MARIA_CONVERSATION_ID,
    });
    await expect(getConversation(MARIA_CONVERSATION_ID)).resolves.toMatchObject(
      { questions_limit: 10 },
    );
  });

  it('normaliza o 404 `{ detail }` em ApiError', async () => {
    server.use(
      http.get(mariaUrl('conversations/:id'), () =>
        HttpResponse.json(
          { detail: 'Conversa não encontrada' },
          { status: 404 },
        ),
      ),
    );
    await expect(getConversation(MARIA_CONVERSATION_ID)).rejects.toMatchObject({
      status: 404,
      code: 'not_found',
      message: 'Conversa não encontrada',
    });
  });

  it('lê o stream completo na ordem dos eventos', async () => {
    server.use(...mariaHandlers());
    const events = await collect(
      streamMessage(MARIA_CONVERSATION_ID, 'Quem pesquisa robótica?'),
    );
    const names = events.map((event) => event.event);
    expect(names[0]).toBe('message.user');
    expect(names[1]).toBe('activity');
    expect(names.at(-1)).toBe('message.assistant');
    const text = events
      .flatMap((event) =>
        event.event === 'content.delta' && event.data.type === 'text'
          ? [event.data.text]
          : [],
      )
      .join('');
    expect(text).toBe('Encontrei **um pesquisador** e um artigo.');
    expect(mariaStreamBody('x')).toContain('event: message.assistant');
  });

  it('transforma o 429 do limite de perguntas em ApiError', async () => {
    server.use(
      http.post(mariaUrl('conversations/:id/messages/stream'), () =>
        HttpResponse.json(
          {
            detail:
              'Limite de 10 perguntas da conversa atingido. Inicie uma nova conversa para continuar.',
          },
          { status: 429 },
        ),
      ),
    );
    await expect(
      collect(streamMessage(MARIA_CONVERSATION_ID, 'Mais uma?')),
    ).rejects.toMatchObject({
      status: 429,
      code: 'rate_limited',
      message: expect.stringContaining('Limite de 10 perguntas'),
    });
  });

  it('transforma o evento `error` em ApiError', async () => {
    server.use(
      http.post(mariaUrl('conversations/:id/messages/stream'), () =>
        sseResponse(
          sseEvent('message.user', mariaUserMessage('Oi')) +
            sseEvent('error', { detail: 'Falha ao gerar resposta do modelo' }),
        ),
      ),
    );
    await expect(
      collect(streamMessage(MARIA_CONVERSATION_ID, 'Oi')),
    ).rejects.toMatchObject({
      code: 'stream_error',
      message: 'Falha ao gerar resposta do modelo',
    });
  });

  it('repassa o cancelamento como AbortError', async () => {
    server.use(...mariaHandlers());
    const controller = new AbortController();
    controller.abort();
    await expect(
      collect(streamMessage(MARIA_CONVERSATION_ID, 'Oi', controller.signal)),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});
