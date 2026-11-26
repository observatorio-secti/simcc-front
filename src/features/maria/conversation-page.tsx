import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, MessageSquareOff } from 'lucide-react';
import { isApiError } from '@/api/errors';
import { removeBrowserConversation } from '@/entities/conversation/browser-conversations';
import {
  conversationTitle,
  remainingQuestions,
} from '@/entities/conversation/model';
import {
  conversationDetailQueryOptions,
  conversationMessagesQueryOptions,
} from '@/entities/conversation/queries';
import type { ProductionKind } from '@/entities/production/model';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import { Skeleton } from '@/shared/ui/skeleton';
import { Composer } from './components/composer';
import { ContextPanel } from './components/context-panel';
import { MariaLayout } from './components/maria-layout';
import { MessageList } from './components/message-list';
import {
  dismissConversationStream,
  startConversationStream,
  stopConversationStream,
  useConversationStream,
} from './conversation-stream';
import { MARIA_DISCLAIMER } from './texts';

function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
    >
      <span className="flex items-center gap-2.5">
        <AlertTriangle className="size-4 shrink-0" aria-hidden />
        {message}
      </span>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}

function ConversationNotFound({ conversationId }: { conversationId: string }) {
  return (
    <EmptyState
      icon={MessageSquareOff}
      title="Conversa não encontrada"
      description="Ela pode ter sido apagada ou o link está incompleto."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => removeBrowserConversation(conversationId)}
          >
            Remover da lista
          </Button>
          <Button asChild>
            <Link to="/maria">Nova conversa</Link>
          </Button>
        </div>
      }
    />
  );
}

/** `/maria/$conversationId`: uma conversa, com a resposta em streaming. */
export function ConversationPage({
  conversationId,
  onOpenProduction,
}: {
  conversationId: string;
  onOpenProduction?: (kind: ProductionKind, itemId: string) => void;
}) {
  const queryClient = useQueryClient();
  const detail = useQuery(conversationDetailQueryOptions(conversationId));
  const messages = useQuery(conversationMessagesQueryOptions(conversationId));
  const stream = useConversationStream(conversationId);

  const streaming = stream?.status === 'streaming';
  const remaining = detail.data ? remainingQuestions(detail.data) : null;
  // A pergunta em andamento ainda não conta no `questions_asked` da API.
  const limitReached =
    remaining !== null && remaining - (streaming ? 1 : 0) <= 0;

  function ask(question: string) {
    void startConversationStream(queryClient, conversationId, question);
  }

  const notFound =
    isApiError(detail.error) && detail.error.status === 404 && !stream;

  const lastAnswer = [...(messages.data ?? [])]
    .reverse()
    .find((message) => message.role === 'assistant');
  const questions =
    detail.data?.questions_limit != null
      ? {
          used: detail.data.questions_asked,
          limit: detail.data.questions_limit,
        }
      : null;
  const aside = notFound ? undefined : stream ? (
    <ContextPanel
      blocks={stream.blocks}
      activities={stream.activities}
      streaming={streaming}
      questions={questions}
    />
  ) : (
    <ContextPanel blocks={lastAnswer?.content ?? []} questions={questions} />
  );

  return (
    <MariaLayout activeId={conversationId} aside={aside}>
      {notFound ? (
        <ConversationNotFound conversationId={conversationId} />
      ) : (
        <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-6">
          <header className="flex items-start justify-between gap-4 border-b pb-4">
            {detail.data ? (
              <h1 className="min-w-0 text-lg font-semibold tracking-tight md:text-xl">
                {conversationTitle(detail.data)}
              </h1>
            ) : detail.isError ? (
              <h1 className="text-lg font-semibold tracking-tight md:text-xl">
                Conversa com a MarIA
              </h1>
            ) : (
              <Skeleton className="h-7 w-2/3" aria-label="Carregando título" />
            )}
            {detail.data?.questions_limit != null && (
              <span
                className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground tabular-nums @5xl:hidden"
                title="Perguntas usadas nesta conversa"
              >
                {detail.data.questions_asked + (streaming ? 1 : 0)} de{' '}
                {detail.data.questions_limit} perguntas
              </span>
            )}
          </header>

          {detail.isError && !notFound && (
            <ErrorAlert
              message={detail.error.message}
              onRetry={() => void detail.refetch()}
            />
          )}

          <div className="flex-1">
            {messages.isPending && !stream ? (
              <LoadingBlock
                title="Carregando a conversa..."
                caption="Buscando as mensagens, aguarde um instante"
              />
            ) : messages.isError && !stream ? (
              <ErrorAlert
                message={messages.error.message}
                onRetry={() => void messages.refetch()}
              />
            ) : (
              <MessageList
                messages={messages.data ?? []}
                stream={stream}
                onAsk={limitReached ? undefined : ask}
                onOpenProduction={onOpenProduction}
                onRetry={() => stream && ask(stream.question)}
                onDismiss={() =>
                  dismissConversationStream(queryClient, conversationId)
                }
              />
            )}
          </div>

          <div className="sticky bottom-0 z-[2] -mx-1 bg-neutral-50/95 px-1 pt-2 pb-4 backdrop-blur dark:bg-neutral-900/95">
            <Composer
              onSubmit={ask}
              streaming={streaming}
              onStop={() => stopConversationStream(queryClient, conversationId)}
              disabled={limitReached || (detail.isPending && !stream)}
              notice={
                limitReached && !streaming ? (
                  <>
                    Esta conversa chegou ao limite de perguntas.{' '}
                    <Link
                      to="/maria"
                      className="font-medium text-eng-blue underline-offset-4 hover:underline"
                    >
                      Comece uma nova conversa
                    </Link>
                    .
                  </>
                ) : (
                  MARIA_DISCLAIMER
                )
              }
            />
          </div>
        </div>
      )}
    </MariaLayout>
  );
}
