import type * as React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Bloco de carregamento (`sc-skeleton`). O kit usa `slate-300` no claro, a
 * única exceção à regra de cinzas `neutral-*`. Número de KPI: `h-7 w-20`.
 */
export function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        'animate-pulse rounded-md bg-slate-300 dark:bg-neutral-700',
        className,
      )}
      {...props}
    />
  );
}
