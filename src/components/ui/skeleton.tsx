import { Loader2 } from 'lucide-react';

import { cn } from '../../lib';

function getSkeletonVariant(
  className?: string,
): 'full' | 'spinner' | 'pulse' {
  if (!className) return 'pulse';
  const regex = /h-\[(\d+)px\]/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(className)) !== null) {
    const h = parseInt(match[1], 10);
    if (h >= 100) return 'full';
  }
  if (
    /h-(4|5|6|8|10|12|14|16|20|24)/.test(className) ||
    /w-(4|5|6|8|10|12|14|16|20|24)/.test(className) ||
    /h-\[\d+px\]/.test(className)
  ) {
    return 'spinner';
  }
  if (className.includes('h-') || className.includes('w-')) return 'spinner';
  return 'pulse';
}

function Skeleton({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const variant = getSkeletonVariant(className);

  if (variant === 'pulse') {
    return (
      <div
        className={cn(
          'animate-pulse rounded-md bg-slate-300 dark:bg-neutral-700',
          className,
        )}
        aria-hidden="true"
        {...props}
      >
        {children}
      </div>
    );
  }

  if (variant === 'spinner') {
    const isTiny =
      /h-\[([0-9]+)px\]/.test(className || '') &&
      (() => {
        const m = (className || '').match(/h-\[([0-9]+)px\]/);
        return m ? parseInt(m[1], 10) < 40 : false;
      })();

    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-md bg-slate-200 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700',
          'flex items-center justify-center p-2',
          className,
        )}
        role="status"
        aria-live="polite"
        aria-busy="true"
        aria-label="Carregando"
        {...props}
      >
        <div
          className="absolute inset-0 animate-pulse bg-slate-300 dark:bg-neutral-700 rounded-md"
          aria-hidden="true"
        />
        <Loader2
          className={cn(
            'relative animate-spin text-slate-500 dark:text-neutral-400',
            isTiny ? 'h-3 w-3' : 'h-4 w-4',
          )}
          aria-hidden="true"
        />
        <span className="sr-only">Carregando...</span>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-200 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700',
        'flex flex-col items-center justify-center gap-3 p-6 text-center',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Processando sua solicitação"
      {...props}
    >
      <div
        className="absolute inset-0 animate-pulse bg-slate-300 dark:bg-neutral-700 rounded-md"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center justify-center gap-3">
        <Loader2
          className="h-7 w-7 animate-spin text-slate-500 dark:text-neutral-400"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold leading-none text-slate-700 dark:text-neutral-100">
            Processando sua solicitação...
          </p>
          <p className="text-xs font-normal leading-none text-slate-500 dark:text-neutral-400">
            Buscando resultados, aguarde um instante
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

export { Skeleton };
