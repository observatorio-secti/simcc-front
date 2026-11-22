import { useSuspenseQuery } from '@tanstack/react-query';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ProductionKind } from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { ProductionDetail } from '@/entities/production/ui/production-detail';
import { Button } from '@/shared/ui/button';

export interface ProductionDetailPageProps {
  kind: ProductionKind;
  id: string;
  /** `h1` na página completa; `h2` no overlay, que já tem o título do painel. */
  titleAs?: 'h1' | 'h2';
}

async function copyLink() {
  try {
    // No overlay, a barra mostra a URL mascarada (`/producoes/...`), que é a
    // da página completa: o link copiado abre a produção fora da lista.
    await navigator.clipboard.writeText(window.location.href);
    toast.success('Link da produção copiado');
  } catch {
    toast.error('Não foi possível copiar o link da produção');
  }
}

/**
 * Detalhe de uma produção (T13, template E de `DESIGN.md`): o
 * `ProductionDetail` da E2 com cabeçalho e coluna lateral. Usado pela rota
 * `/producoes/$kind/$id` e pelo overlay sobre a busca e o perfil.
 */
export function ProductionDetailPage({
  kind,
  id,
  titleAs = 'h1',
}: ProductionDetailPageProps) {
  const { data } = useSuspenseQuery(productionDetailQueryOptions(kind, id));

  return (
    <ProductionDetail
      kind={kind}
      item={data.data}
      layout="profile"
      titleAs={titleAs}
      className="pb-8"
      actions={
        <Button
          type="button"
          size="icon-sm"
          variant="outline"
          aria-label="Copiar link da produção"
          onClick={() => void copyLink()}
        >
          <Share2 aria-hidden />
        </Button>
      }
    />
  );
}
