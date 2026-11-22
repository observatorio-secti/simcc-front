import { Suspense, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CatchBoundary, Link } from '@tanstack/react-router';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Maximize2,
  UserX,
  X,
} from 'lucide-react';
import type { ProductionKind } from '@/entities/production/model';
import {
  formatAffiliationNames,
  formatLattesUpdate,
} from '@/entities/researcher/model';
import { researcherDetailQueryOptions } from '@/entities/researcher/queries';
import { ResearcherAvatar } from '@/entities/researcher/ui/researcher-avatar';
import { cn } from '@/shared/lib/cn';
import { Tag } from '@/shared/ui/badge';
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
import { ResearcherProfileActions } from './components/researcher-profile-actions';
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

  const { data: detailResponse } = useQuery({
    ...researcherDetailQueryOptions(shownId ?? ''),
    enabled: Boolean(shownId),
  });
  const researcher = detailResponse?.data;
  const affiliationNames = researcher
    ? formatAffiliationNames(researcher.affiliations)
    : null;
  const lattesUpdate = researcher
    ? formatLattesUpdate(researcher.lattes_update)
    : null;

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
        className="h-[92dvh] max-h-[92dvh] w-full gap-0 rounded-t-2xl bg-neutral-50 p-0 dark:bg-neutral-900"
      >
        {researcher && (
          <ResearcherAvatar
            name={researcher.name}
            imageUrl={researcher.image_url}
            size="lg"
            decorative
            className="absolute -top-12 left-1/2 z-20 -translate-x-1/2"
          />
        )}

        <SheetHeader
          className={cn(
            'relative shrink-0 items-center gap-2 border-b bg-neutral-50/85 px-4 pb-4 text-center backdrop-blur sm:px-6 dark:bg-neutral-900/85',
            researcher ? 'pt-14' : 'pt-4',
          )}
        >
          <div className="flex w-full flex-wrap items-center justify-between gap-2 md:contents">
            {lattesUpdate !== null && (
              <div className="flex flex-wrap items-center gap-2 md:absolute md:top-4 md:left-4 md:max-w-[calc(50%-64px)]">
                <Tag variant="outline">
                  <Calendar aria-hidden />
                  <span>Atualização do Lattes: {lattesUpdate}</span>
                </Tag>
              </div>
            )}
            <div className="ml-auto flex shrink-0 items-center gap-1.5 md:absolute md:top-4 md:right-4">
              {researcher && (
                <ResearcherProfileActions researcher={researcher} />
              )}
              {shownId && (
                <Button asChild variant="outline" size="sm">
                  <Link
                    to="/pesquisadores/$id"
                    params={{ id: shownId }}
                    search={routeSearch as ResearcherProfileSearch}
                  >
                    <Maximize2 aria-hidden />
                    <span className="hidden sm:inline">
                      Abrir página completa
                    </span>
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
            </div>
          </div>

          <SheetTitle
            className={cn(
              'max-w-3xl',
              researcher &&
                'text-2xl font-semibold tracking-tight text-foreground sm:text-3xl',
            )}
          >
            {researcher ? researcher.name : 'Perfil do pesquisador'}
          </SheetTitle>

          {affiliationNames && (
            <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:text-base">
              <Building2 className="size-4 shrink-0" aria-hidden />
              <span>{affiliationNames}</span>
            </p>
          )}

          <SheetDescription className="sr-only">
            Perfil aberto sobre os resultados. Feche para voltar à lista.
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
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
                    hideHeaderIdentity
                  />
                </Suspense>
              </CatchBoundary>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
