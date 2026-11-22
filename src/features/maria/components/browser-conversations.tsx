import { useState } from 'react';
import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { ChevronDown, MessagesSquare, Plus, X } from 'lucide-react';
import { isApiError } from '@/api/errors';
import {
  removeBrowserConversation,
  useBrowserConversationIds,
} from '@/entities/conversation/browser-conversations';
import {
  conversationTitle,
  type Conversation,
  formatConversationDate,
} from '@/entities/conversation/model';
import { conversationDetailQueryOptions } from '@/entities/conversation/queries';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { focusRing } from '@/shared/ui/focus-ring';
import { Skeleton } from '@/shared/ui/skeleton';

function ConversationItem({
  id,
  active,
  query,
}: {
  id: string;
  active: boolean;
  query: UseQueryResult<Conversation>;
}) {
  const missing = isApiError(query.error) && query.error.status === 404;
  const title = query.data
    ? conversationTitle(query.data)
    : missing
      ? 'Conversa não encontrada'
      : query.isError
        ? 'Conversa indisponível'
        : null;
  const date = query.data ? formatConversationDate(query.data.updated_at) : '';

  return (
    <li
      data-slot="maria-browser-conversation"
      className={cn(
        'group flex items-center gap-1 rounded-md transition-colors',
        active
          ? 'bg-eng-blue text-white'
          : 'hover:bg-neutral-200 dark:hover:bg-neutral-800',
      )}
    >
      <Link
        to="/maria/$conversationId"
        params={{ conversationId: id }}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-0.5 rounded-md px-2.5 py-2',
          focusRing,
        )}
      >
        {title === null ? (
          <Skeleton className="h-4 w-40" aria-label="Carregando conversa" />
        ) : (
          <span
            className={cn(
              'truncate text-sm font-medium',
              !query.data && !active && 'text-muted-foreground italic',
            )}
          >
            {title}
          </span>
        )}
        {date && (
          <span
            className={cn(
              'text-xs',
              active ? 'text-white/80' : 'text-muted-foreground',
            )}
          >
            {date}
          </span>
        )}
      </Link>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className={cn(
          'mr-1 shrink-0',
          active
            ? 'text-white hover:bg-eng-dark-blue'
            : 'text-muted-foreground',
        )}
        aria-label={`Remover "${title ?? 'conversa'}" da lista deste navegador`}
        title="Remover da lista deste navegador"
        onClick={() => removeBrowserConversation(id)}
      >
        <X aria-hidden />
      </Button>
    </li>
  );
}

export interface BrowserConversationsProps {
  activeId?: string;
  className?: string;
}

/**
 * Conversas abertas neste navegador (os ids ficam no `localStorage`). Título
 * e data vêm de `GET /conversations/{id}`. Remover só tira da lista local.
 */
export function BrowserConversations({
  activeId,
  className,
}: BrowserConversationsProps) {
  const ids = useBrowserConversationIds();
  const [open, setOpen] = useState(false);
  const queries = useQueries({
    queries: ids.map((id) => ({
      ...conversationDetailQueryOptions(id),
      retry: false,
    })),
  });

  return (
    <nav
      aria-label="Conversas neste navegador"
      data-slot="maria-browser-conversations"
      className={cn('flex flex-col gap-3', className)}
    >
      <Button asChild variant="outline" className="justify-start">
        <Link to="/maria">
          <Plus aria-hidden />
          Nova conversa
        </Link>
      </Button>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className={cn(
            'flex items-center justify-between gap-2 rounded-md px-1 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:pointer-events-none',
            focusRing,
          )}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="inline-flex items-center gap-1.5">
            <MessagesSquare className="size-3.5" aria-hidden />
            Neste navegador
            {ids.length > 0 && (
              <span className="font-normal tabular-nums">({ids.length})</span>
            )}
          </span>
          <ChevronDown
            className={cn(
              'size-4 transition-transform lg:hidden',
              open && 'rotate-180',
            )}
            aria-hidden
          />
        </button>

        <div className={cn('flex-col gap-2', open ? 'flex' : 'hidden lg:flex')}>
          {ids.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">
              As conversas que você abrir aparecem aqui. Elas ficam guardadas só
              neste navegador.
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {ids.map((id, index) => {
                const query = queries[index];
                return query ? (
                  <ConversationItem
                    key={id}
                    id={id}
                    active={id === activeId}
                    query={query}
                  />
                ) : null;
              })}
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
