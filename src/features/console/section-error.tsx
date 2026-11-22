import { AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { errorMessage } from './error-message';

/**
 * Erro recuperável numa seção (kit: alerta + "Tentar novamente"). Não derruba
 * a tela nem a sessão: 502/504 da API de admin chegam aqui (ADR 0008).
 */
export function SectionError({
  title = 'Não foi possível carregar',
  error,
  onRetry,
  className,
}: {
  title?: string;
  error: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col gap-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm sm:flex-row sm:items-center',
        className,
      )}
    >
      <div className="flex flex-1 items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-4 shrink-0 text-destructive"
          aria-hidden
        />
        <div className="flex flex-col gap-0.5">
          <p className="font-medium text-destructive">{title}</p>
          <p className="text-muted-foreground">{errorMessage(error)}</p>
        </div>
      </div>
      {onRetry && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start sm:self-center"
          onClick={onRetry}
        >
          <RotateCcw aria-hidden />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
