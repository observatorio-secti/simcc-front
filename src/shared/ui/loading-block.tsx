import type * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

// Estados de carregamento do kit (`sc-loading`, `sc-spinner`). O bloco usa
// `slate-*` no claro, a exceção do kit à regra de cinzas `neutral-*`.

/** Bloco grande de carregamento, no lugar de uma seção ou grade. */
export function LoadingBlock({
  title = 'Processando sua solicitação...',
  caption = 'Buscando resultados, aguarde um instante',
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  title?: React.ReactNode;
  caption?: React.ReactNode;
}) {
  return (
    <div
      data-slot="loading-block"
      role="status"
      aria-live="polite"
      className={cn(
        'relative isolate grid min-h-40 place-items-center overflow-hidden rounded-md p-6 text-center',
        className,
      )}
      {...props}
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 animate-pulse bg-slate-300 dark:bg-neutral-700"
      />
      <div className="flex flex-col items-center gap-1">
        <Loader2
          className="mb-1.5 size-7 animate-spin text-slate-500 dark:text-neutral-400"
          aria-hidden
        />
        <p className="text-sm font-semibold text-slate-700 dark:text-neutral-100">
          {title}
        </p>
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          {caption}
        </p>
      </div>
    </div>
  );
}

/** Spinner de página (substitui o `#006699` do legado). */
export function Spinner({
  className,
  label = 'Carregando',
  ...props
}: React.ComponentProps<'div'> & { label?: string }) {
  return (
    <div
      data-slot="spinner"
      role="status"
      className={cn(
        'size-8 animate-spin rounded-full border-4 border-eng-blue border-t-transparent',
        className,
      )}
      {...props}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
