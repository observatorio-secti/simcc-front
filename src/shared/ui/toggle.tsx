import type * as React from 'react';
import { Toggle as TogglePrimitive } from 'radix-ui';
import { cn } from '@/shared/lib/cn';
import { toggleVariants, type ToggleVariantProps } from './toggle-variants';

/** Botão liga/desliga (`aria-pressed`). Só ícone exige `aria-label`. */
export function Toggle({
  className,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & ToggleVariantProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ size }), className)}
      {...props}
    />
  );
}
