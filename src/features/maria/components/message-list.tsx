import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  CircleStop,
  ClipboardCopy,
  Loader2,
  Plus,
  RotateCw,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  formatMessageTime,
  messageText,
  type ConversationMessage,
} from '@/entities/conversation/model';
import { cn } from '@/shared/lib/cn';
import { searchTypeColor } from '@/shared/lib/design-tokens';
import { Button } from '@/shared/ui/button';
import type { ConversationStreamState } from '../conversation-stream';
import { MessageBlocks } from './message-blocks';

const mariaColor = searchTypeColor('maria');

function UserQuestion({
  text,
  time,
  pending = false,
}: {
  text: string;
  time?: string;
  pending?: boolean;
}) {
  return (
    <li
      data-slot="maria-user-message"
      data-pending={pending || undefined}
      className={cn(
        'flex flex-col gap-1 border-l-2 border-eng-blue pl-4 transition-opacity',
        pending && 'opacity-70',
      )}
    >
      <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        Sua pergunta
        {pending ? (
          <span className="inline-flex items-center gap-1">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            enviando…
          </span>
        ) : (
          time && <span className="font-normal">{time}</span>
        )}
      </span>
      <p className="text-base font-medium whitespace-pre-wrap text-foreground">
        {text}
      </p>
    </li>
  );
}

function MariaSeal() {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold text-white',
        mariaColor.bg,
      )}
    >
      M
    </span>
  );
}

function AssistantMessage({
  children,
  time,
  busy,
  actions,
}: {
  children: ReactNode;
  time?: string;
  busy?: boolean;
  actions?: ReactNode;
}) {
  return (
    <li
      data-slot="maria-assistant-message"
      className="flex flex-col gap-3"
      aria-busy={busy || undefined}
    >
      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <MariaSeal />
        MarIA
        {time && (
          <span className="text-xs font-normal text-muted-foreground">
            {time}
          </span>
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
      {actions && <div className="flex flex-wrap gap-1">{actions}</div>}
    </li>
  );
}

/** Texto em Markdown da resposta, para "Copiar texto". */
function answerText(message: Pick<ConversationMessage, 'content'>) {
  return messageText(message);
}

function CopyAnswerButton({ message }: { message: ConversationMessage }) {
  const text = answerText(message);
  if (!text) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={() => {
        navigator.clipboard.writeText(text).then(
          () => toast.success('Texto copiado.'),
          () => toast.error('Não foi possível copiar o texto.'),
        );
      }}
    >
      <ClipboardCopy aria-hidden />
      Copiar texto
    </Button>
  );
}

/** O que a MarIA está fazendo agora (substitui o "digitando…"). */
function LiveActivity({ stream }: { stream: ConversationStreamState }) {
  const last = stream.activities.at(-1);
  return (
    <p
      role="status"
      aria-live="polite"
      data-slot="maria-live-activity"
      className="inline-flex items-start gap-2 text-sm text-muted-foreground"
    >
      <Loader2
        className="mt-0.5 size-4 shrink-0 animate-spin text-eng-blue"
        aria-hidden
      />
      <span>
        {last ? last.description : 'Analisando a pergunta…'}
        {last?.source && <span className="ml-1 text-xs">· {last.source}</span>}
      </span>
    </p>
  );
}

/** Mensagem de erro conforme o status (429, 503, rede, stream). */
function outcomeMessage(stream: ConversationStreamState): string {
  const status = stream.error?.status;
  if (status === 429) {
    return 'Esta conversa chegou ao limite de perguntas. Inicie uma nova conversa para continuar.';
  }
  if (status === 503) {
    return 'O serviço de IA está temporariamente indisponível. Tente de novo em alguns minutos.';
  }
  return stream.error?.message ?? 'Não foi possível obter a resposta.';
}

function StreamOutcome({
  stream,
  onRetry,
  onDismiss,
}: {
  stream: ConversationStreamState;
  onRetry: () => void;
  onDismiss: () => void;
}) {
  if (stream.status === 'streaming') return null;
  const stopped = stream.status === 'stopped';
  const limitReached = stream.error?.status === 429;

  return (
    <div
      role={stopped ? 'status' : 'alert'}
      data-slot="maria-stream-outcome"
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm',
        stopped
          ? 'bg-card text-foreground'
          : 'border-destructive/40 bg-destructive/10 text-destructive',
      )}
    >
      <span className="flex items-start gap-2">
        {stopped ? (
          <CircleStop className="mt-0.5 size-4 shrink-0" aria-hidden />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        )}
        <span>
          {stopped ? 'Resposta interrompida.' : outcomeMessage(stream)}{' '}
          <strong className="font-semibold">Nada foi gravado</strong>
          {limitReached ? '.' : ': sua pergunta voltou para o campo de texto.'}
        </span>
      </span>
      <span className="flex gap-2">
        {limitReached ? (
          <Button asChild size="sm">
            <Link to="/maria">
              <Plus aria-hidden />
              Iniciar nova conversa
            </Link>
          </Button>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden />
            {stopped ? 'Reenviar' : 'Tentar novamente'}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDismiss}
          aria-label="Fechar aviso"
        >
          <X aria-hidden />
        </Button>
      </span>
    </div>
  );
}

export interface MessageListProps {
  messages: readonly ConversationMessage[];
  stream?: ConversationStreamState;
  onAsk?: (question: string) => void;
  onRetry: () => void;
  onDismiss: () => void;
}

/** Pares pergunta e resposta gravados e, no fim, a resposta em andamento. */
export function MessageList({
  messages,
  stream,
  onAsk,
  onRetry,
  onDismiss,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastIndex = messages.length - 1;
  const streaming = stream?.status === 'streaming';
  const streamSize = stream
    ? stream.blocks.reduce(
        (size, block) =>
          size + (block?.type === 'text' ? block.text.length : 1000),
        stream.activities.length,
      )
    : 0;

  // Acompanha a resposta enquanto ela chega, se o leitor está perto do fim.
  useEffect(() => {
    const end = endRef.current;
    const panel = end?.closest<HTMLElement>('[data-slot="shell-panel"]');
    if (!end || !panel) return;
    const distance = panel.scrollHeight - panel.scrollTop - panel.clientHeight;
    if (distance < 320) end.scrollIntoView?.({ block: 'end' });
  }, [messages.length, streamSize, stream?.status]);

  return (
    <div className="flex flex-col gap-8">
      <ol aria-label="Mensagens" className="flex flex-col gap-8">
        {messages.map((message, index) =>
          message.role === 'user' ? (
            <UserQuestion
              key={message.id}
              text={messageText(message)}
              time={formatMessageTime(message.created_at)}
            />
          ) : (
            <AssistantMessage
              key={message.id}
              time={formatMessageTime(message.created_at)}
              actions={<CopyAnswerButton message={message} />}
            >
              <MessageBlocks
                blocks={message.content}
                // Só a última resposta oferece os próximos caminhos.
                onAsk={index === lastIndex && !stream ? onAsk : undefined}
              />
            </AssistantMessage>
          ),
        )}

        {/* Rascunho: some em erro ou interrupção (nada foi gravado). */}
        {streaming && (
          <>
            <UserQuestion
              text={
                stream.userMessage
                  ? messageText(stream.userMessage)
                  : stream.question
              }
              pending
            />
            <AssistantMessage busy>
              {stream.blocks.length === 0 ? (
                <LiveActivity stream={stream} />
              ) : (
                <>
                  <MessageBlocks blocks={stream.blocks} streaming />
                  {stream.blocks.at(-1)?.type !== 'text' && (
                    <LiveActivity stream={stream} />
                  )}
                </>
              )}
            </AssistantMessage>
          </>
        )}
      </ol>
      {stream && (
        <StreamOutcome
          stream={stream}
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      )}
      <div ref={endRef} />
    </div>
  );
}
