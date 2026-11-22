import { queryOptions } from '@tanstack/react-query';
import {
  createConversation,
  getConversation,
  isMariaConfigured,
  listMessages,
} from '@/api/maria';

export { isMariaConfigured };

export const conversationKeys = {
  all: ['conversation'] as const,
  detail: (id: string) => ['conversation', 'detail', id] as const,
  messages: (id: string) => ['conversation', 'messages', id] as const,
  /** Resposta em andamento (escrita pelo stream com `setQueryData`). */
  stream: (id: string) => ['conversation', 'stream', id] as const,
};

/** Título, datas e contagem de perguntas (`GET /conversations/{id}`). */
export function conversationDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: conversationKeys.detail(id),
    queryFn: ({ signal }) => getConversation(id, signal),
  });
}

/** Mensagens gravadas da conversa (`GET /conversations/{id}/messages`). */
export function conversationMessagesQueryOptions(id: string) {
  return queryOptions({
    queryKey: conversationKeys.messages(id),
    queryFn: async ({ signal }) => (await listMessages(id, signal)).messages,
  });
}

/** Cria uma conversa vazia (`POST /conversations`). */
export function createNewConversation(signal?: AbortSignal) {
  return createConversation(signal);
}
