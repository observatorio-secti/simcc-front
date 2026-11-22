import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  MessageSquareOff,
  PanelRight,
  Plus,
} from 'lucide-react';
import { isApiError } from '@/api/errors';
import { removeBrowserConversation } from '@/entities/conversation/browser-conversations';
import {
  remainingQuestions,
  type Conversation,
} from '@/entities/conversation/model';
import {
  conversationDetailQueryOptions,
  conversationMessagesQueryOptions,
} from '@/entities/conversation/queries';
import { cn } from '@/shared/lib/cn';
import { searchTypeColor } from '@/shared/lib/design-tokens';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
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
import {
  EXAMPLE_QUESTIONS,
  MARIA_DISCLAIMER,
  NEW_CONVERSATION_TITLE,
} from './texts';

const mariaColor = searchTypeColor('maria');

/** Quando faltam até 2 perguntas, o contador ganha destaque. */
const FEW_QUESTIONS_LEFT = 2;

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

/** "3 de 10 perguntas utilizadas", em destaque quando falta pouco. */
function QuestionCounter({
  detail,
  pending,
}: {
  detail: Conversation;
  pending: boolean;
}) {
  const limit = detail.questions_limit;
  if (limit == null) return null;
  // A pergunta em andamento já conta para quem está olhando.
  const used = Math.min(limit, detail.questions_asked + (pending ? 1 : 0));
  const left = limit - used;
  const few = left <= FEW_QUESTIONS_LEFT;
  return (
    <span
      data-slot="maria-question-counter"
      className={cn(
        'shrink-0 rounded-full border px-2.5 py-1 text-xs tabular-nums',
        few
          ? 'border-amber-400 bg-amber-50 font-medium text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200'
          : 'text-muted-foreground',
      )}
      title={
        left === 0
          ? 'Limite de perguntas atingido'
          : `${left === 1 ? 'Resta 1 pergunta' : `Restam ${left} perguntas`}`
      }
    >
      {used} de {limit} perguntas utilizadas
    </span>
  );
}

function EmptyConversation({
  onAsk,
  disabled,
}: {
  onAsk: (question: string) => void;
  disabled: boolean;
}) {
  return (
    <section
      data-slot="maria-empty"
      aria-labelledby="maria-welcome"
      className="flex flex-col gap-6 py-4 md:py-8"
    >
      <div className="flex flex-col gap-2">
        <span
          className={cn(
            'text-xs font-semibold tracking-wide uppercase',
            mariaColor.text,
          )}
        >
          Observatório MarIA
        </span>
        <h2
          id="maria-welcome"
          className="text-2xl font-semibold tracking-tight md:text-3xl"
        >
          O que você quer investigar hoje?
        </h2>
        <p className="max-w-[640px] text-sm text-muted-foreground md:text-base">
          A MarIA consulta as bases do observatório (Simcc, fomento à pesquisa e
          ODA), em modo somente leitura, e responde com texto, gráficos,
          tabelas, pesquisadores e produções, sempre com a fonte de cada dado.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Comece por uma destas perguntas
        </h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {EXAMPLE_QUESTIONS.map((question) => (
            <li key={question}>
              <Button
                type="button"
                variant="outline"
                className="h-full w-full justify-start py-2.5 text-left whitespace-normal"
                disabled={disabled}
                onClick={() => onAsk(question)}
              >
                {question}
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * `/maria/$conversationId`: cabeçalho com título e contador, mensagens,
 * painel de contexto e campo de pergunta com a resposta em streaming.
 */
export function ConversationPage({
  conversationId,
}: {
  conversationId: string;
}) {
  const queryClient = useQueryClient();
  const detail = useQuery(conversationDetailQueryOptions(conversationId));
  const messages = useQuery(conversationMessagesQueryOptions(conversationId));
  const stream = useConversationStream(conversationId);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);

  // Falhou ou foi interrompida: a pergunta volta ao campo (uma vez por envio).
  const [restoredFor, setRestoredFor] = useState<string | null>(null);
  if (
    stream &&
    stream.status !== 'streaming' &&
    restoredFor !== stream.startedAt
  ) {
    setRestoredFor(stream.startedAt);
    if (draft.trim() === '') setDraft(stream.question);
  }

  const streaming = stream?.status === 'streaming';
  const remaining = detail.data ? remainingQuestions(detail.data) : null;
  const limitReached =
    (remaining !== null && remaining - (streaming ? 1 : 0) <= 0) ||
    stream?.error?.status === 429;
  const notFound =
    isApiError(detail.error) && detail.error.status === 404 && !stream;
  const savedMessages = messages.data ?? [];
  const empty = savedMessages.length === 0 && !streaming;
  const waiting = detail.isPending || messages.isPending;

  function ask(question: string) {
    const text = question.trim();
    if (!text || streaming || limitReached) return;
    dismissConversationStream(queryClient, conversationId);
    if (draft.trim() === text) setDraft('');
    void startConversationStream(queryClient, conversationId, text);
  }

  function retry() {
    if (stream) ask(stream.question);
  }

  const contextPanel = (
    <ContextPanel messages={savedMessages} stream={stream} />
  );

  const title = detail.data?.title?.trim() || NEW_CONVERSATION_TITLE;

  return (
    <MariaLayout activeId={conversationId} aside={contextPanel}>
      {notFound ? (
        <ConversationNotFound conversationId={conversationId} />
      ) : (
        <div className="mx-auto flex w-full max-w-[860px] flex-1 flex-col gap-6">
          <header className="flex items-start justify-between gap-3 border-b pb-4">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Pesquisa com a MarIA
              </span>
              {detail.data || detail.isError ? (
                <h1
                  className={cn(
                    'text-lg font-semibold tracking-tight break-words md:text-xl',
                    !detail.data?.title && 'text-muted-foreground',
                  )}
                >
                  {title}
                </h1>
              ) : (
                <Skeleton
                  className="h-7 w-64 max-w-full"
                  aria-label="Carregando título"
                />
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {detail.data && (
                <QuestionCounter detail={detail.data} pending={streaming} />
              )}
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="xl:hidden"
                aria-label="Abrir contexto da pesquisa"
                aria-expanded={panelOpen}
                onClick={() => setPanelOpen(true)}
              >
                <PanelRight aria-hidden />
              </Button>
            </div>
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
              <>
                {empty && (
                  <EmptyConversation
                    onAsk={ask}
                    disabled={waiting || limitReached}
                  />
                )}
                <MessageList
                  messages={savedMessages}
                  stream={stream}
                  onAsk={limitReached ? undefined : ask}
                  onRetry={retry}
                  onDismiss={() =>
                    dismissConversationStream(queryClient, conversationId)
                  }
                />
              </>
            )}
          </div>

          <div className="sticky bottom-0 z-[2] -mx-1 bg-neutral-50/95 px-1 pt-2 pb-4 backdrop-blur dark:bg-neutral-900/95">
            {limitReached && !streaming ? (
              <div
                data-slot="maria-limit"
                className="mb-2 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-200"
              >
                <span>
                  Esta conversa chegou ao limite de perguntas. Para continuar a
                  pesquisa, comece uma nova conversa.
                </span>
                <Button asChild size="sm">
                  <Link to="/maria">
                    <Plus aria-hidden />
                    Iniciar nova conversa
                  </Link>
                </Button>
              </div>
            ) : null}
            <Composer
              value={draft}
              onValueChange={setDraft}
              onSubmit={ask}
              textareaRef={textareaRef}
              streaming={streaming}
              onStop={() => stopConversationStream(queryClient, conversationId)}
              disabled={(limitReached && !streaming) || (waiting && !stream)}
              autoFocus={empty}
              placeholder={
                empty
                  ? 'Pergunte sobre pesquisadores, produções, bolsas ou instituições'
                  : 'Continue a pesquisa com uma nova pergunta'
              }
              notice={MARIA_DISCLAIMER}
            />
          </div>
        </div>
      )}

      <Sheet open={panelOpen} onOpenChange={setPanelOpen}>
        <SheetContent side="right" className="w-[320px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Contexto da pesquisa</SheetTitle>
            <SheetDescription>
              Fontes, datas e o que a MarIA consultou nesta conversa.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">{contextPanel}</div>
        </SheetContent>
      </Sheet>
    </MariaLayout>
  );
}
