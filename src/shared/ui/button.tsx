import type * as React from 'react';
import { Slot } from 'radix-ui';
import { cn } from '@/shared/lib/cn';
import { buttonVariants, type ButtonVariantProps } from './button-variants';

/**
 * Botão do kit. Só ícone exige `aria-label`. Para colorir pelo tipo de busca,
 * use `variant="searchType" className={searchTypeColor(type).bg}`.
 */
export function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  type,
  ...props
}: React.ComponentProps<'button'> &
  ButtonVariantProps & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={asChild ? type : (type ?? 'button')}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
