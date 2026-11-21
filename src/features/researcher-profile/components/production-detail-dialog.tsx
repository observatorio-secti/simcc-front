import { useQuery } from '@tanstack/react-query';
import type { ProductionKind } from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { getProductionDefinition } from '@/entities/production/registry';
import { ProductionDetail } from '@/entities/production/ui/production-detail';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { LoadingBlock } from '@/shared/ui/loading-block';

export interface ProductionDetailDialogProps {
  kind?: ProductionKind;
  id?: string;
  onClose: () => void;
}

/**
 * Modal de dossiê detalhado de uma produção selecionada via URL (`prod_kind`, `prod_id`).
 */
export function ProductionDetailDialog({
  kind,
  id,
  onClose,
}: ProductionDetailDialogProps) {
  const open = Boolean(kind && id);
  const definition = kind ? getProductionDefinition(kind) : null;

  const { data, isLoading, isError } = useQuery({
    ...productionDetailQueryOptions(kind ?? 'article', id ?? ''),
    enabled: open,
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent className="max-h-[85dvh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {definition ? definition.title : 'Detalhes da produção'}
          </DialogTitle>
          <DialogDescription>
            Registro completo da produção científica ou técnica.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <LoadingBlock />
        ) : isError || !data?.data || !kind ? (
          <EmptyState
            title="Não foi possível carregar os detalhes"
            description="Verifique sua conexão e tente abrir o item novamente."
          />
        ) : (
          <ProductionDetail kind={kind} item={data.data} />
        )}
      </DialogContent>
    </Dialog>
  );
}
