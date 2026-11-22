import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, Sparkles } from 'lucide-react';
import { createConversation } from '@/api/maria';
import { addBrowserConversation } from '@/entities/conversation/browser-conversations';
import { conversationKeys } from '@/entities/conversation/queries';
import { cn } from '@/shared/lib/cn';
import { searchTypeColor } from '@/shared/lib/design-tokens';
import { Button } from '@/shared/ui/button';
import { Composer } from './components/composer';
import { MariaLayout } from './components/maria-layout';
import { startConversationStream } from './conversation-stream';
import { MARIA_DISCLAIMER } from './texts';

const mariaColor = searchTypeColor('maria');

const EXAMPLE_QUESTIONS = [
  'Quais pesquisadores trabalham com inteligência artificial na Bahia?',
  'Quais instituições baianas mais publicam sobre energia solar?',
  'Liste artigos recentes sobre doenças tropicais com Qualis A1.',
  'Como evoluiu a produção científica sobre semiárido nos últimos anos?',
];

/** `/maria`: tela inicial, onde se começa uma conversa nova. */
export function MariaHomePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const start = useMutation({
    mutationFn: async (question: string) => {
      const conversation = await createConversation();
      return { conversation, question };
    },
    onSuccess: ({ conversation, question }) => {
      addBrowserConversation(conversation.id);
      // Conversa nova: ainda sem mensagens gravadas.
      queryClient.setQueryData(conversationKeys.messages(conversation.id), []);
      void startConversationStream(queryClient, conversation.id, question);
      void navigate({
        to: '/maria/$conversationId',
        params: { conversationId: conversation.id },
      });
    },
  });

  return (
    <MariaLayout>
      <div className="mx-auto flex w-full max-w-[800px] flex-1 flex-col justify-center gap-8 py-4 md:py-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <span
            aria-hidden
            className={cn(
              'grid size-12 place-items-center rounded-full text-white',
              mariaColor.bg,
            )}
          >
            <Sparkles className="size-6" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Pesquise com a <span className={mariaColor.text}>MarIA</span>
          </h1>
          <p className="max-w-[600px] text-sm text-muted-foreground md:text-base">
            Faça perguntas em linguagem natural. A MarIA consulta os dados do
            Simcc e responde citando pesquisadores e produções da plataforma.
          </p>
        </header>

        <Composer
          onSubmit={(question) => start.mutate(question)}
          disabled={start.isPending}
          notice={start.isPending ? 'Iniciando a conversa…' : MARIA_DISCLAIMER}
          autoFocus
        />

        {start.isError && (
          <div
            role="alert"
            className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {start.error.message}
          </div>
        )}

        <section
          aria-labelledby="maria-examples"
          className="flex flex-col gap-3"
        >
          <h2
            id="maria-examples"
            className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Experimente perguntar
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {EXAMPLE_QUESTIONS.map((question) => (
              <li key={question}>
                <Button
                  type="button"
                  variant="outline"
                  className="h-full w-full justify-start py-2.5 text-left whitespace-normal"
                  disabled={start.isPending}
                  onClick={() => start.mutate(question)}
                >
                  {question}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </MariaLayout>
  );
}
