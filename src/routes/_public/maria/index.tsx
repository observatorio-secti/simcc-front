import { createFileRoute, redirect } from '@tanstack/react-router';
import {
  conversationKeys,
  createNewConversation,
  isMariaConfigured,
} from '@/entities/conversation/queries';
import { MariaLayout } from '@/features/maria/components/maria-layout';
import {
  MariaStartErrorPage,
  MariaStartingPage,
} from '@/features/maria/maria-start-page';

// Abrir `/maria` cria uma conversa nova (`POST /conversations`) e troca a URL
// por `/maria/$conversationId` (replace: voltar não cria outra). O loader roda
// uma vez por navegação, então o modo estrito do React não duplica a criação;
// o preload (hover em links) não cria nada.
export const Route = createFileRoute('/_public/maria/')({
  loader: async ({ context, preload }) => {
    if (preload || !isMariaConfigured()) return;
    const conversation = await createNewConversation();
    // Conversa nova: sem mensagens. A página abre direto no estado vazio.
    context.queryClient.setQueryData(
      conversationKeys.messages(conversation.id),
      [],
    );
    throw redirect({
      to: '/maria/$conversationId',
      params: { conversationId: conversation.id },
      replace: true,
    });
  },
  staleTime: 0,
  gcTime: 0,
  pendingMs: 0,
  pendingComponent: MariaStartingPage,
  errorComponent: MariaStartErrorPage,
  // Só aparece sem `VITE_MARIA_API_URL` (o layout mostra "não disponível").
  component: () => <MariaLayout>{null}</MariaLayout>,
});
