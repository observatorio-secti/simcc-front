import { Suspense, useState } from 'react';
import { CatchBoundary, Link } from '@tanstack/react-router';
import { AlertTriangle, Maximize2, UserX, X } from 'lucide-react';
import type { ProductionKind } from '@/entities/production/model';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { isNotFoundApiError } from './queries';
import { ResearcherProfilePage } from './researcher-profile-page';
import type { ResearcherProfileSearch } from './search-schema';

export interface ResearcherProfileOverlayProps {
  /** Pesquisador aberto; `undefined` fecha o overlay. */
  researcherId: string | undefined;
  search: ResearcherProfileSearch;
  /** Search params da página completa (`/pesquisadores/$id`). */
  routeSearch: Partial<ResearcherProfileSearch>;
  onUpdateSearch: (patch: Partial<ResearcherProfileSearch>) => void;
  /** Abre a produção sobre o perfil (T13); quem monta a rota decide a navegação. */
  onOpenProduction: (kind: ProductionKind, id: string) => void;
  onClose: () => void;
}

function OverlayError({ error }: { error: unknown }) {
  if (isNotFoundApiError(error)) {
    return (
      <EmptyState
        icon={UserX}
        title="Pesquisador não encontrado"
        description="O perfil pode ter sido removido ou o link está incorreto."
      />
    );
  }
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Não foi possível carregar o perfil"
      description="Tente novamente em instantes."
    />
  );
}

/**
 * Perfil do pesquisador como overlay sobre uma lista (ADR 0004 e 0010): o
 * mesmo `ResearcherProfilePage` da rota, num painel inferior. Quem abre
 * controla o estado pela URL; fechar é navegar.
 */
export function ResearcherProfileOverlay({
  researcherId,
  search,
  routeSearch,
  onUpdateSearch,
  onOpenProduction,
  onClose,
}: ResearcherProfileOverlayProps) {
  // Mantém o último pesquisador durante a animação de saída do painel.
  const [shownId, setShownId] = useState(researcherId);
  if (researcherId && researcherId !== shownId) {
    setShownId(researcherId);
  }

  return (
    <Sheet
      open={Boolean(researcherId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[92dvh] max-h-[92dvh] w-full gap-0 overflow-y-auto rounded-t-2xl bg-neutral-50 p-0 dark:bg-neutral-900"
      >
        <SheetHeader className="sticky top-0 z-10 flex-row items-center gap-2 border-b bg-neutral-50/85 pr-4 backdrop-blur dark:bg-neutral-900/85">
          <div className="min-w-0 flex-1">
            <SheetTitle>Perfil do pesquisador</SheetTitle>
            <SheetDescription className="sr-only">
              Perfil aberto sobre os resultados. Feche para voltar à lista.
            </SheetDescription>
          </div>
          {shownId && (
            <Button asChild variant="outline" size="sm">
              <Link
                to="/pesquisadores/$id"
                params={{ id: shownId }}
                search={routeSearch as ResearcherProfileSearch}
              >
                <Maximize2 aria-hidden />
                <span className="hidden sm:inline">Abrir página completa</span>
                <span className="sm:hidden">Página completa</span>
              </Link>
            </Button>
          )}
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Fechar perfil"
            >
              <X aria-hidden />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
          {shownId && (
            <CatchBoundary
              getResetKey={() => shownId}
              errorComponent={OverlayError}
            >
              <Suspense fallback={<LoadingBlock className="min-h-80" />}>
                <ResearcherProfilePage
                  researcherId={shownId}
                  search={search}
                  onUpdateSearch={onUpdateSearch}
                  onOpenProduction={onOpenProduction}
                />
              </Suspense>
            </CatchBoundary>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
