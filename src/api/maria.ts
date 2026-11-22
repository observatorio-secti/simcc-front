import createClient from 'openapi-fetch';
import { z } from 'zod';
import { env } from '@/config/env';
import {
  ApiError,
  apiErrorFromResponse,
  apiErrorMiddleware,
  clientErrorCodes,
  isAbortError,
  networkError,
} from './errors';
import type { components, paths } from './generated/maria';
import { unwrap } from './simcc';

// Cliente da API da MarIA (`observatorio-maria`), em `VITE_MARIA_API_URL`.
//
// O front usa só `/conversations/{id}`, `/conversations/{id}/messages` e o
// stream. A listagem `GET /conversations` traz as conversas de todo mundo e
// não é usada: cada navegador guarda os ids que abriu (entities/conversation).
//
// Erros chegam como `{ detail }` do FastAPI e viram `ApiError` pelo mesmo
// middleware da v2 (ex.: 429 do limite de perguntas, 404, 422).

export type MariaSchema<K extends keyof components['schemas']> =
  components['schemas'][K];

export type MariaConversation = MariaSchema<'ConversationPublic'>;
export type MariaConversationDetail = MariaSchema<'ConversationDetail'>;
export type MariaMessage = MariaSchema<'MessagePublic'>;
export type MariaMessageList = MariaSchema<'MessageList'>;
export type MariaBlock = MariaMessage['content'][number];

/** Tamanho máximo de uma mensagem (`MessageCreate.content.maxLength`). */
export const MARIA_MESSAGE_MAX_LENGTH = 10000;

export const mariaErrorCodes = {
  notConfigured: 'maria_not_configured',
  stream: 'stream_error',
} as const;

export function isMariaConfigured(
  url: string | undefined = env.mariaApiUrl,
): url is string {
  return typeof url === 'string' && url.trim() !== '';
}

function notConfiguredError(): ApiError {
  return new ApiError({
    status: 0,
    code: mariaErrorCodes.notConfigured,
    message: 'A MarIA não está configurada neste ambiente.',
  });
}

function mariaBaseUrl(): string {
  const url = env.mariaApiUrl;
  if (!isMariaConfigured(url)) throw notConfiguredError();
  return url.endsWith('/') ? url : `${url}/`;
}

/** Cria um cliente tipado da MarIA com a normalização de erro instalada. */
export function createMariaClient(baseUrl: string) {
  const client = createClient<paths>({
    baseUrl: baseUrl.replace(/\/+$/, ''),
    // Lido a cada chamada, para o MSW interceptar nos testes.
    fetch: (request) => globalThis.fetch(request),
  });
  client.use(apiErrorMiddleware);
  return client;
}

let cachedClient: { baseUrl: string; client: MariaClient } | null = null;
type MariaClient = ReturnType<typeof createMariaClient>;

function mariaClient(): MariaClient {
  const baseUrl = mariaBaseUrl();
  if (cachedClient?.baseUrl !== baseUrl) {
    cachedClient = { baseUrl, client: createMariaClient(baseUrl) };
  }
  return cachedClient.client;
}

export function createConversation(
  signal?: AbortSignal,
): Promise<MariaConversation> {
  return unwrap(mariaClient().POST('/conversations', { body: {}, signal }));
}

export function getConversation(
  conversationId: string,
  signal?: AbortSignal,
): Promise<MariaConversationDetail> {
  return unwrap(
    mariaClient().GET('/conversations/{conversation_id}', {
      params: { path: { conversation_id: conversationId } },
      signal,
    }),
  );
}

export function listMessages(
  conversationId: string,
  signal?: AbortSignal,
): Promise<MariaMessageList> {
  return unwrap(
    mariaClient().GET('/conversations/{conversation_id}/messages', {
      params: { path: { conversation_id: conversationId } },
      signal,
    }),
  );
}

// --- Stream (Server-Sent Events) ---------------------------------------------
//
// `POST /conversations/{id}/messages/stream` responde `text/event-stream` com
// os eventos, nesta ordem: `message.user` (MessagePublic), `activity` (zero ou
// mais), `content.delta` (zero ou mais) e `message.assistant` (MessagePublic
// persistida). Falha do modelo depois do início chega como `error`. A API só
// grava pergunta e resposta no fim: interromper (abort) não deixa registro.
//
// `ActivityPublic`, `ContentDeltaPublic` e `StreamError` não estão nos
// `components` do OpenAPI (o 200 declara só `text/event-stream`), então são
// validados aqui com zod. Os blocos completos usam os tipos gerados.

/** Um evento SSE cru: nome e o texto de `data` (linhas juntadas por `\n`). */
export interface SseFrame {
  event: string;
  data: string;
  id?: string;
}

/**
 * Lê um corpo `text/event-stream` e devolve cada evento completo. Segue a
 * especificação do SSE: eventos separados por linha em branco, `data:`
 * repetido vira várias linhas, comentários (`:`) são ignorados.
 */
export async function* parseSse(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseFrame> {
  const reader = body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let event = '';
  let id: string | undefined;
  let data: string[] = [];

  function* dispatchLine(line: string): Generator<SseFrame> {
    if (line === '') {
      if (data.length > 0) {
        yield { event: event || 'message', data: data.join('\n'), id };
      }
      event = '';
      data = [];
      return;
    }
    if (line.startsWith(':')) return;
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') event = value;
    else if (field === 'data') data.push(value);
    else if (field === 'id') id = value;
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      const lines = buffer.split(/\r\n|\r|\n/);
      // A última linha pode estar incompleta; só no fim do corpo ela fecha.
      buffer = done ? '' : (lines.pop() ?? '');
      for (const line of lines) yield* dispatchLine(line);
      if (done) {
        yield* dispatchLine('');
        return;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

const messageSchema = z.looseObject({
  id: z.string(),
  conversation_id: z.string(),
  role: z.enum(['user', 'assistant']),
  content: z.array(z.looseObject({ type: z.string() })),
  created_at: z.string(),
});

const activitySchema = z.object({
  kind: z.string(),
  source: z.string(),
  description: z.string(),
});

const contentDeltaSchema = z.object({
  index: z.number().int().nonnegative(),
  type: z.string(),
  text: z.string().nullish(),
  block: z.looseObject({ type: z.string() }).nullish(),
});

const streamErrorSchema = z.object({ detail: z.string() });

export type MariaActivity = z.infer<typeof activitySchema>;
export type MariaContentDelta = {
  index: number;
  type: string;
  text: string | null;
  block: MariaBlock | null;
};

export type MariaStreamEvent =
  | { event: 'message.user'; data: MariaMessage }
  | { event: 'activity'; data: MariaActivity }
  | { event: 'content.delta'; data: MariaContentDelta }
  | { event: 'message.assistant'; data: MariaMessage }
  | { event: 'error'; data: { detail: string } };

function invalidStreamError(cause?: unknown): ApiError {
  return new ApiError({
    status: 200,
    code: clientErrorCodes.invalidResponse,
    message: 'A MarIA respondeu num formato inesperado.',
    cause,
  });
}

/**
 * Converte um evento SSE no evento tipado da MarIA. Eventos desconhecidos
 * devolvem `null` (a API pode ganhar eventos novos sem quebrar o cliente).
 */
export function toMariaStreamEvent(frame: SseFrame): MariaStreamEvent | null {
  const known = new Set([
    'message.user',
    'activity',
    'content.delta',
    'message.assistant',
    'error',
  ]);
  if (!known.has(frame.event)) return null;

  let json: unknown;
  try {
    json = JSON.parse(frame.data);
  } catch (error) {
    throw invalidStreamError(error);
  }

  switch (frame.event) {
    case 'message.user':
    case 'message.assistant': {
      const parsed = messageSchema.safeParse(json);
      if (!parsed.success) throw invalidStreamError(parsed.error);
      // Blocos completos seguem o contrato gerado (`MessagePublic`).
      return { event: frame.event, data: json as MariaMessage };
    }
    case 'activity': {
      const parsed = activitySchema.safeParse(json);
      if (!parsed.success) throw invalidStreamError(parsed.error);
      return { event: 'activity', data: parsed.data };
    }
    case 'content.delta': {
      const parsed = contentDeltaSchema.safeParse(json);
      if (!parsed.success) throw invalidStreamError(parsed.error);
      return {
        event: 'content.delta',
        data: {
          index: parsed.data.index,
          type: parsed.data.type,
          text: parsed.data.text ?? null,
          block: (parsed.data.block ?? null) as MariaBlock | null,
        },
      };
    }
    default: {
      const parsed = streamErrorSchema.safeParse(json);
      return {
        event: 'error',
        data: {
          detail: parsed.success
            ? parsed.data.detail
            : 'A MarIA não conseguiu gerar a resposta.',
        },
      };
    }
  }
}

/**
 * Envia uma pergunta e lê a resposta em streaming. Rejeita com `ApiError` em
 * erro HTTP (ex.: 429 do limite de perguntas), falha de rede ou evento
 * `error`; o cancelamento (`signal`) passa adiante como `AbortError`.
 */
export async function* streamMessage(
  conversationId: string,
  content: string,
  signal?: AbortSignal,
): AsyncGenerator<MariaStreamEvent> {
  const url = new URL(
    `conversations/${encodeURIComponent(conversationId)}/messages/stream`,
    mariaBaseUrl(),
  );

  let response: Response;
  try {
    response = await globalThis.fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ content }),
      signal,
    });
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw networkError(error);
  }

  if (!response.ok) throw await apiErrorFromResponse(response);
  if (!response.body) throw invalidStreamError();

  try {
    for await (const frame of parseSse(response.body)) {
      const event = toMariaStreamEvent(frame);
      if (!event) continue;
      if (event.event === 'error') {
        throw new ApiError({
          status: response.status,
          code: mariaErrorCodes.stream,
          message: event.data.detail,
        });
      }
      yield event;
    }
  } catch (error) {
    if (isAbortError(error) || error instanceof ApiError) throw error;
    throw networkError(error);
  }
}
