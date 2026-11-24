import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { isMariaConfigured } from '@/api/maria';
import { cn } from '@/shared/lib/cn';
import { EmptyState } from '@/shared/ui/empty-state';
import { BrowserConversations } from './browser-conversations';

/**
 * Template D, variante chat: conversas do navegador (220px), a conversa e,
 * quando há espaço, o contexto da resposta (240px). As colunas seguem a
 * largura do painel (container queries), não a da janela: abaixo de 1024px
 * o contexto some e, abaixo de 768px, a lista fica acima da conversa.
 */
export function MariaLayout({
  activeId,
  aside,
  children,
}: {
  activeId?: string;
  /** Coluna da direita (contexto da resposta). */
  aside?: ReactNode;
  children: ReactNode;
}) {
  if (!isMariaConfigured()) {
    return (
      <EmptyState
        icon={Sparkles}
        title="A MarIA não está disponível"
        description="A pesquisa com IA não está configurada neste ambiente."
      />
    );
  }

  const sticky =
    '@3xl:sticky @3xl:top-[84px] @3xl:max-h-[calc(100dvh-120px)] @3xl:self-start @3xl:overflow-y-auto';

  return (
    <div className="@container flex w-full flex-1 flex-col">
      <div
        className={cn(
          'mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 gap-4 @3xl:grid-cols-[220px_minmax(0,1fr)] @3xl:gap-6 @5xl:gap-8',
          aside && '@5xl:grid-cols-[220px_minmax(0,1fr)_240px]',
        )}
      >
        <aside className={cn('min-w-0', sticky)}>
          <BrowserConversations activeId={activeId} />
        </aside>
        <div className="flex min-w-0 flex-col">{children}</div>
        {aside && (
          <aside
            aria-label="Contexto da resposta"
            className={cn('hidden min-w-0 @5xl:block', sticky)}
          >
            {aside}
          </aside>
        )}
      </div>
    </div>
  );
}
