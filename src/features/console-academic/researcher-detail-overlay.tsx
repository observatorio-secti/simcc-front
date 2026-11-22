import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet';
import { ResearcherDetailContent } from './researcher-detail-content';

/**
 * Overlay de detalhe do pesquisador sobre `/console/pesquisadores` (ADR 0004 e 0010).
 */
export function ResearcherDetailOverlay({
  researcherId,
  onClose,
}: {
  researcherId: string | undefined;
  onClose: () => void;
}) {
  return (
    <Sheet
      open={Boolean(researcherId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Detalhes do pesquisador</SheetTitle>
          <SheetDescription>
            Edite os dados, gerencie vínculos e dispare a sincronização do
            Lattes.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-6">
          {researcherId && (
            <ResearcherDetailContent
              researcherId={researcherId}
              onDeleted={onClose}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
