import { Suspense, useState, type MouseEvent } from 'react';
import { CatchBoundary, Link } from '@tanstack/react-router';
import { AlertTriangle, FileX, Maximize2, X } from 'lucide-react';
import { isProductionNotFoundError } from './errors';
import {
  productionRouteParams,
  type ProductionRef,
} from '@/entities/production/links';
import { getProductionDefinition } from '@/entities/production/registry';
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
import { ProductionDetailPage } from './production-detail-page';

declare module '@tanstack/react-router' {
  interface HistoryState {
    /** Marca a entrada do histórico em que a lista abriu o overlay da produção. */
    productionOverlay?: boolean;
  }
}

export interface ProductionDetailOverlayProps {
  /** Produção aberta; `undefined` fecha o overlay. */
  production: ProductionRef | undefined;
  onClose: () => void;
  /** Delegação de clique no conteúdo (ex.: chips de autor viram overlay do perfil). */
  onContentClick?: (event: MouseEvent<HTMLDivElement>) => void;
}

function OverlayError({ error }: { error: unknown }) {
  if (isProductionNotFoundError(error)) {
    return (
      <EmptyState
        icon={FileX}
        title="Produção não encontrada"
        description="A produção pode ter sido removida ou o link está incorreto."
      />
    );
  }
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Não foi possível carregar a produção"
      description="Tente novamente em instantes."
    />
  );
}

/**
 * Detalhe da produção como overlay sobre uma lista (ADR 0004 e 0010): o
 * mesmo `ProductionDetailPage` da rota, num painel lateral. Quem abre
 * controla o estado pela URL (`production=<kind>:<id>`); fechar é navegar.
 */
export function ProductionDetailOverlay({
  production,
  onClose,
  onContentClick,
}: ProductionDetailOverlayProps) {
  // Mantém a última produção durante a animação de saída do painel.
  const [shown, setShown] = useState(production);
  if (
    production &&
    (production.kind !== shown?.kind || production.id !== shown.id)
  ) {
    setShown(production);
  }
  const definition = shown ? getProductionDefinition(shown.kind) : null;
  const noun = definition?.noun[0] ?? 'produção';

  return (
    <Sheet
      open={Boolean(production)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-full gap-0 overflow-y-auto bg-neutral-50 p-0 sm:max-w-[min(64rem,90vw)] dark:bg-neutral-900"
      >
        <SheetHeader className="sticky top-0 z-10 flex-row items-center gap-2 border-b bg-neutral-50/85 pr-4 backdrop-blur dark:bg-neutral-900/85">
          <div className="min-w-0 flex-1">
            <SheetTitle className="truncate first-letter:uppercase">
              {noun}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Detalhe da produção aberto sobre a lista. Feche para voltar.
            </SheetDescription>
          </div>
          {shown && (
            <Button asChild variant="outline" size="sm">
              <Link
                to="/producoes/$kind/$id"
                params={productionRouteParams(shown)}
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
              aria-label="Fechar produção"
            >
              <X aria-hidden />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="p-4 md:p-6" onClick={onContentClick}>
          {shown && (
            <CatchBoundary
              getResetKey={() => `${shown.kind}:${shown.id}`}
              errorComponent={OverlayError}
            >
              <Suspense fallback={<LoadingBlock className="min-h-80" />}>
                <ProductionDetailPage
                  kind={shown.kind}
                  id={shown.id}
                  titleAs="h2"
                />
              </Suspense>
            </CatchBoundary>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
