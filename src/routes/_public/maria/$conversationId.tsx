import { createFileRoute, notFound } from '@tanstack/react-router';
import { addBrowserConversation } from '@/entities/conversation/browser-conversations';
import {
  conversationDetailQueryOptions,
  conversationMessagesQueryOptions,
} from '@/entities/conversation/queries';
import { NotFoundPage } from '@/features/errors/not-found-page';
import { ConversationPage } from '@/features/maria/conversation-page';
import { conversationParamsSchema } from '@/features/maria/params';

export const Route = createFileRoute('/_public/maria/$conversationId')({
  staticData: { crumb: 'Conversa' },
  loader: async ({ context, params, preload }) => {
    if (!conversationParamsSchema.safeParse(params).success) throw notFound();

    const { queryClient } = context;
    void queryClient.prefetchQuery(
      conversationMessagesQueryOptions(params.conversationId),
    );
    try {
      await queryClient.ensureQueryData(
        conversationDetailQueryOptions(params.conversationId),
      );
      // Abrir a conversa (inclusive por link) a guarda neste navegador.
      if (!preload) addBrowserConversation(params.conversationId);
    } catch {
      // A página mostra o erro (404: "Conversa não encontrada").
    }
  },
  notFoundComponent: NotFoundPage,
  component: ConversationRoute,
});

function ConversationRoute() {
  const { conversationId } = Route.useParams();
  return (
    <ConversationPage key={conversationId} conversationId={conversationId} />
  );
}
