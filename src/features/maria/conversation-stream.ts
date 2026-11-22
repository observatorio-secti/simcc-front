import { skipToken, useQuery, type QueryClient } from '@tanstack/react-query';
import { ApiError, clientErrorCodes, isAbortError } from '@/api/errors';
import { streamMessage, type MariaActivity } from '@/api/maria';
import { addBrowserConversation } from '@/entities/conversation/browser-conversations';
import type {
  ConversationBlock,
  ConversationMessage,
} from '@/entities/conversation/model';
import { conversationKeys } from '@/entities/conversation/queries';

// Resposta em andamento de uma conversa. Vive no cache do TanStack Query
// (`['conversation', 'stream', id]`), escrita com `setQueryData` a cada evento
// do stream: sobrevive à troca de rota (de `/maria` para `/maria/$id`) e não
// depende de nenhum componente montado. Quando a resposta termina, as duas
// mensagens entram no cache de mensagens e este estado sai do cache.
//
// Erro ou interrupção descartam o rascunho da resposta (a API não grava nada)
// e deixam só a pergunta, para a tela devolvê-la ao campo de texto.

export type ConversationStreamStatus = 'streaming' | 'error' | 'stopped';

export interface ConversationStreamState {
  status: ConversationStreamStatus;
  /** Pergunta enviada (para reenviar em caso de erro ou interrupção). */
  question: string;
  startedAt: string;
  /** Mensagem do usuário como a API ecoou (`message.user`). */
  userMessage: ConversationMessage | null;
  activities: MariaActivity[];
  /** Blocos da resposta, na posição `index` de cada `content.delta`. */
  blocks: ConversationBlock[];
  error: ApiError | null;
  controller: AbortController;
}

export function applyDelta(
  blocks: ConversationBlock[],
  index: number,
  type: string,
  text: string | null,
  block: ConversationBlock | null,
): ConversationBlock[] {
  const next = [...blocks];
  if (type === 'text') {
    const previous = next[index];
    const previousText = previous?.type === 'text' ? previous.text : '';
    next[index] = { type: 'text', text: previousText + (text ?? '') };
  } else if (block) {
    next[index] = block;
  }
  return next;
}

/**
 * Envia a pergunta e acompanha o stream, escrevendo no cache. Não lança:
 * erros e interrupção viram `status` no estado. Ignora uma segunda chamada
 * enquanto a conversa ainda está respondendo.
 */
export async function startConversationStream(
  queryClient: QueryClient,
  conversationId: string,
  question: string,
): Promise<void> {
  const key = conversationKeys.stream(conversationId);
  const current = queryClient.getQueryData<ConversationStreamState>(key);
  if (current?.status === 'streaming') return;

  const controller = new AbortController();
  const update = (
    change: (state: ConversationStreamState) => ConversationStreamState,
  ) =>
    queryClient.setQueryData<ConversationStreamState>(key, (state) =>
      state && state.controller === controller ? change(state) : state,
    );

  queryClient.setQueryData<ConversationStreamState>(key, {
    status: 'streaming',
    question,
    startedAt: new Date().toISOString(),
    userMessage: null,
    activities: [],
    blocks: [],
    error: null,
    controller,
  });

  try {
    for await (const event of streamMessage(
      conversationId,
      question,
      controller.signal,
    )) {
      switch (event.event) {
        case 'message.user':
          update((state) => ({ ...state, userMessage: event.data }));
          break;
        case 'activity':
          update((state) => ({
            ...state,
            activities: [...state.activities, event.data],
          }));
          break;
        case 'content.delta': {
          const { index, type, text, block } = event.data;
          update((state) => ({
            ...state,
            blocks: applyDelta(state.blocks, index, type, text, block),
          }));
          break;
        }
        case 'message.assistant': {
          const userMessage =
            queryClient.getQueryData<ConversationStreamState>(key)
              ?.userMessage ?? null;
          queryClient.setQueryData<ConversationMessage[]>(
            conversationKeys.messages(conversationId),
            (messages = []) => [
              ...messages.filter(
                (message) =>
                  message.id !== event.data.id &&
                  message.id !== userMessage?.id,
              ),
              ...(userMessage ? [userMessage] : []),
              event.data,
            ],
          );
          queryClient.removeQueries({ queryKey: key, exact: true });
          // Só agora a conversa existe de fato: entra na lista do navegador.
          addBrowserConversation(conversationId);
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: conversationKeys.detail(conversationId),
            }),
            queryClient.invalidateQueries({
              queryKey: conversationKeys.messages(conversationId),
            }),
          ]);
          return;
        }
      }
    }
    // O corpo acabou sem a resposta final.
    throw new ApiError({
      status: 200,
      code: clientErrorCodes.invalidResponse,
      message: 'A resposta da MarIA foi interrompida antes do fim.',
    });
  } catch (error) {
    if (isAbortError(error) || controller.signal.aborted) {
      update((state) => ({
        ...state,
        status: 'stopped',
        blocks: [],
        activities: [],
      }));
      return;
    }
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError({
            status: 0,
            code: clientErrorCodes.invalidResponse,
            message: 'Não foi possível concluir a resposta da MarIA.',
            cause: error,
          });
    update((state) => ({
      ...state,
      status: 'error',
      error: apiError,
      blocks: [],
      activities: [],
    }));
    // O limite de perguntas pode ter mudado.
    void queryClient.invalidateQueries({
      queryKey: conversationKeys.detail(conversationId),
    });
  }
}

/** Interrompe a resposta em andamento. A API não grava pergunta nem resposta. */
export function stopConversationStream(
  queryClient: QueryClient,
  conversationId: string,
) {
  queryClient
    .getQueryData<ConversationStreamState>(
      conversationKeys.stream(conversationId),
    )
    ?.controller.abort();
}

/** Descarta o aviso de erro ou de interrupção (nunca uma resposta em curso). */
export function dismissConversationStream(
  queryClient: QueryClient,
  conversationId: string,
) {
  const key = conversationKeys.stream(conversationId);
  if (
    queryClient.getQueryData<ConversationStreamState>(key)?.status ===
    'streaming'
  )
    return;
  queryClient.removeQueries({ queryKey: key, exact: true });
}

/** Lê do cache a resposta em andamento (nunca busca nada). */
export function useConversationStream(conversationId: string) {
  return useQuery<ConversationStreamState>({
    queryKey: conversationKeys.stream(conversationId),
    queryFn: skipToken,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
  }).data;
}
