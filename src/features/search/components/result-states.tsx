import type { LucideIcon } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';

export function ResultsError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Não foi possível carregar os resultados"
      description="A consulta falhou. Tente novamente em instantes."
      action={
        <Button type="button" variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      }
    />
  );
}

export interface ResultsEmptyProps {
  icon: LucideIcon;
  noun: string;
  q?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  onClearQuery: () => void;
}

export function ResultsEmpty({
  icon,
  noun,
  q,
  hasFilters,
  onClearFilters,
  onClearQuery,
}: ResultsEmptyProps) {
  return (
    <EmptyState
      icon={icon}
      title={`Nenhum resultado em ${noun}`}
      description={
        q
          ? `Não encontramos ${noun} para "${q}"${hasFilters ? ' com os filtros aplicados' : ''}.`
          : 'Não há itens para exibir com os filtros aplicados.'
      }
      action={
        hasFilters ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Limpar filtros
          </Button>
        ) : q ? (
          <Button type="button" variant="outline" onClick={onClearQuery}>
            Limpar busca
          </Button>
        ) : undefined
      }
    />
  );
}
