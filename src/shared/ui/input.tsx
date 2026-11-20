import type * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from './focus-ring';

/** Campo do kit (`sc-input`): 40px, `rounded-md`, superfície branca. */
export function Input({
  className,
  type,
  ...props
}: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-md border bg-card px-3 text-sm text-foreground transition-colors selection:bg-eng-blue selection:text-white file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-red-500',
        focusRing,
        'focus-visible:ring-offset-1',
        className,
      )}
      {...props}
    />
  );
}
