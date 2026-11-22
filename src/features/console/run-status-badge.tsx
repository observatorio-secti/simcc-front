import { cn } from '@/shared/lib/cn';
import { runStatusColor } from '@/shared/lib/design-tokens';

/**
 * Status de um run ou etapa do ETL: dot na cor do dicionário `run-*` e rótulo
 * (a cor nunca aparece sozinha, DESIGN.md §9).
 */
export function RunStatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const color = runStatusColor(status);
  return (
    <span
      data-slot="run-status"
      className={cn(
        'inline-flex h-7 w-fit items-center gap-2 rounded-md border bg-card px-2.5 text-xs font-medium',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('size-2.5 shrink-0 rounded-full', color.bg)}
      />
      {color.label}
    </span>
  );
}
