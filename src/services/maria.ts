// Cliente da API independente da Maria (observatorio-maria), em VITE_URL_MARIA.
// Usa fetch em vez de Axios: o streaming SSE precisa ler o corpo aos poucos.
import type {
  MariaConversation,
  MariaMessage,
  MariaStreamEvent,
} from '../types/maria';

const rawBase = import.meta.env.VITE_URL_MARIA || 'http://127.0.0.1:9002/';
export const MARIA_API_URL = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export class MariaApiError extends Error {
  status: number | 'stream';

  constructor(message: string, status: number | 'stream') {
    super(message);
    this.name = 'MariaApiError';
    this.status = status;
  }
}

async function toApiError(response: Response): Promise<MariaApiError> {
  const body = await response.json().catch(() => ({}));
  const detail = Array.isArray(body.detail)
    ? body.detail.map((d: { msg: string }) => d.msg).join('; ')
    : body.detail || response.statusText;
  return new MariaApiError(
    detail || `Erro ${response.status}`,
    response.status,
  );
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(new URL(path, MARIA_API_URL), {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return null as T;
  return response.json();
}

export const createConversation = () =>
  request<MariaConversation>('conversations', { method: 'POST', body: '{}' });

export const getConversation = (id: string) =>
  request<MariaConversation>(`conversations/${id}`);

export const listMessages = (id: string) =>
  request<{ messages: MariaMessage[] }>(`conversations/${id}/messages`);

// Lê o SSE de um POST (EventSource só faz GET).
export async function* streamMessage(
  conversationId: string,
  content: string,
  signal: AbortSignal,
): AsyncGenerator<MariaStreamEvent> {
  const response = await fetch(
    new URL(`conversations/${conversationId}/messages/stream`, MARIA_API_URL),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({ content }),
      signal,
    },
  );
  if (!response.ok) throw await toApiError(response);
  if (!response.body)
    throw new MariaApiError(
      'Streaming não suportado pelo navegador.',
      'stream',
    );

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/);
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      let event = 'message';
      const data: string[] = [];
      for (const line of frame.split(/\r?\n/)) {
        if (line.startsWith(':')) continue; // keep-alive
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:'))
          data.push(line.slice(5).replace(/^ /, ''));
      }
      if (!data.length) continue;
      try {
        yield { event, data: JSON.parse(data.join('\n')) } as MariaStreamEvent;
      } catch (e) {
        console.error('Falha no parse do evento SSE da Maria:', e);
      }
    }
  }
}
