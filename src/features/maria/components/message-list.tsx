import { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CircleStop,
  Loader2,
  RotateCw,
  Sparkles,
  X,
} from 'lucide-react';
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

function UserBubble({ text, time }: { text: string; time?: string }) {
  return (
    <li
      data-slot="maria-user-message"
      className="flex flex-col gap-1 rounded-r-lg border-l-2 border-eng-blue bg-muted/60 px-4 py-3"
    >
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{text}</p>
      {time && (
        <span className="text-[11px] text-muted-foreground">{time}</span>
      )}
    </li>
  );
}

function AssistantMessage({
  children,
  time,
  busy,
}: {
  children: React.ReactNode;
  time?: string;
  busy?: boolean;
}) {
  return (
    <li
      data-slot="maria-assistant-message"
      className="flex min-w-0 flex-col gap-3"
      aria-busy={busy || undefined}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <span
          aria-hidden
          className={cn(
            'grid size-6 shrink-0 place-items-center rounded-full text-white',
            mariaColor.bg,
          )}
        >
          <Sparkles className="size-3.5" />
        </span>
        MarIA
        {time && (
          <span className="text-xs font-normal text-muted-foreground">
            {time}
          </span>
        )}
      </span>
      {children}
    </li>
  );
}

/** Linha "o que a MarIA está fazendo", só enquanto nada da resposta chegou. */
function Activities({ stream }: { stream: ConversationStreamState }) {
  const waiting = stream.status === 'streaming' && stream.blocks.length === 0;
  if (!waiting) return null;
  const last = stream.activities.at(-1);
  return (
    <p
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"
    >
      <Loader2 className="size-4 animate-spin text-eng-blue" aria-hidden />
      {last ? last.description : 'Pensando…'}
    </p>
  );
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
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm',
        stopped
          ? 'bg-card text-muted-foreground'
          : 'border-destructive/40 bg-destructive/10 text-destructive',
      )}
    >
      <span className="flex items-start gap-2">
        {stopped ? (
          <CircleStop className="mt-0.5 size-4 shrink-0" aria-hidden />
        ) : (
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
        )}
        {stopped
          ? 'Resposta interrompida. Nada foi gravado.'
          : (stream.error?.message ?? 'Não foi possível obter a resposta.')}
      </span>
      <span className="flex gap-2">
        {!limitReached && (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            <RotateCw aria-hidden />
            {stopped ? 'Reenviar' : 'Tentar de novo'}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Descartar pergunta"
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

/** Mensagens gravadas e, no fim, a resposta em andamento. */
export function MessageList({
  messages,
  stream,
  onAsk,
  onRetry,
  onDismiss,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastIndex = messages.length - 1;
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
    if (distance < 240) end.scrollIntoView?.({ block: 'end' });
  }, [messages.length, streamSize, stream?.status]);

  return (
    <div className="flex flex-col gap-6">
      <ol aria-label="Mensagens" className="flex flex-col gap-6">
        {messages.map((message, index) =>
          message.role === 'user' ? (
            <UserBubble
              key={message.id}
              text={messageText(message)}
              time={formatMessageTime(message.created_at)}
            />
          ) : (
            <AssistantMessage
              key={message.id}
              time={formatMessageTime(message.created_at)}
            >
              <MessageBlocks
                blocks={message.content}
                // Só a última resposta oferece perguntas de continuação.
                onAsk={index === lastIndex && !stream ? onAsk : undefined}
              />
            </AssistantMessage>
          ),
        )}

        {stream && (
          <>
            <UserBubble
              text={
                stream.userMessage
                  ? messageText(stream.userMessage)
                  : stream.question
              }
            />
            {(stream.status === 'streaming' ||
              stream.blocks.length > 0 ||
              stream.activities.length > 0) && (
              <AssistantMessage busy={stream.status === 'streaming'}>
                <Activities stream={stream} />
                <MessageBlocks blocks={stream.blocks} />
              </AssistantMessage>
            )}
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
