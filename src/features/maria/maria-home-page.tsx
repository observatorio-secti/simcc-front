import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { createConversation } from '@/api/maria';
import { addBrowserConversation } from '@/entities/conversation/browser-conversations';
import { conversationKeys } from '@/entities/conversation/queries';
import { cn } from '@/shared/lib/cn';
import { searchTypeColor } from '@/shared/lib/design-tokens';
import { Composer } from './components/composer';
import { MariaLayout } from './components/maria-layout';
import { startConversationStream } from './conversation-stream';
import { MARIA_DISCLAIMER } from './texts';

const mariaColor = searchTypeColor('maria');

const EXAMPLE_QUESTIONS = [
  'Quem pesquisa inteligência artificial na Bahia?',
  'Como evoluíram as bolsas de pesquisa entre 2021 e 2024?',
  'Quais instituições mais publicam sobre energia solar?',
  'Artigos recentes sobre doenças tropicais com Qualis A1',
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
      <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-6">
        <div className="flex flex-1 flex-col justify-center gap-8 py-4 md:py-10">
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
              Pergunte sobre pesquisadores, produções e bolsas da Bahia.
            </p>
          </header>

          <section
            aria-labelledby="maria-examples"
            className="flex flex-col gap-3"
          >
            <h2
              id="maria-examples"
              className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
            >
              Experimente
            </h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {EXAMPLE_QUESTIONS.map((question) => (
                <li key={question}>
                  <button
                    type="button"
                    disabled={start.isPending}
                    onClick={() => start.mutate(question)}
                    className="group flex h-full w-full items-center justify-between gap-3 rounded-lg border bg-card px-3.5 py-3 text-left text-sm transition-colors hover:border-eng-blue hover:text-eng-blue focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-60"
                  >
                    {question}
                    <ArrowRight
                      className="size-4 shrink-0 text-muted-foreground group-hover:text-eng-blue"
                      aria-hidden
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {start.isError && (
            <div
              role="alert"
              className="flex items-center gap-2.5 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              <AlertTriangle className="size-4 shrink-0" aria-hidden />
              {start.error.message}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-[2] -mx-1 bg-neutral-50/95 px-1 pt-2 pb-4 backdrop-blur dark:bg-neutral-900/95">
          <Composer
            onSubmit={(question) => start.mutate(question)}
            disabled={start.isPending}
            notice={
              start.isPending ? 'Iniciando a conversa…' : MARIA_DISCLAIMER
            }
            autoFocus
          />
        </div>
      </div>
    </MariaLayout>
  );
}
