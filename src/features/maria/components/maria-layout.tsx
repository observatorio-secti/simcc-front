import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';
import { isMariaConfigured } from '@/api/maria';
import { EmptyState } from '@/shared/ui/empty-state';
import { BrowserConversations } from './browser-conversations';

/**
 * Template D, variante chat: conversas do navegador (240px) à esquerda, a
 * conversa no centro e, a partir de `xl`, o painel de contexto (280px) à
 * direita. Abaixo de `lg` a lista fica recolhida acima da conversa; abaixo de
 * `xl` o painel abre num drawer pelo botão do cabeçalho.
 */
export function MariaLayout({
  activeId,
  aside,
  children,
}: {
  activeId?: string;
  /** Painel da direita (só a partir de `xl`). */
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

  return (
    <div className="mx-auto grid w-full max-w-[1480px] flex-1 grid-cols-1 gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[240px_minmax(0,1fr)_280px]">
      <aside className="min-w-0 lg:sticky lg:top-[84px] lg:max-h-[calc(100dvh-120px)] lg:self-start lg:overflow-y-auto">
        <BrowserConversations activeId={activeId} />
      </aside>
      <div className="flex min-w-0 flex-col">{children}</div>
      {aside && (
        <aside
          aria-label="Contexto da pesquisa"
          className="hidden min-w-0 xl:sticky xl:top-[84px] xl:block xl:max-h-[calc(100dvh-120px)] xl:self-start xl:overflow-y-auto"
        >
          {aside}
        </aside>
      )}
    </div>
  );
}
