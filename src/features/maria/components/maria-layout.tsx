import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { isMariaConfigured } from '@/api/maria';
import { EmptyState } from '@/shared/ui/empty-state';
import { BrowserConversations } from './browser-conversations';

/**
 * Template D, variante chat: coluna de 260px com as conversas do navegador e
 * coluna principal com a conversa. Abaixo de `lg`, a lista fica recolhida
 * acima da conversa.
 */
export function MariaLayout({
  activeId,
  children,
}: {
  activeId?: string;
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

  return (
    <div className="mx-auto grid w-full max-w-[1200px] flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
      <aside className="min-w-0 lg:sticky lg:top-[84px] lg:max-h-[calc(100dvh-120px)] lg:self-start lg:overflow-y-auto">
        <BrowserConversations activeId={activeId} />
      </aside>
      <div className="flex min-w-0 flex-col">{children}</div>
    </div>
  );
}
