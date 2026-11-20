import type * as React from 'react';
import { Slot } from 'radix-ui';
import { cn } from '@/shared/lib/cn';
import {
  badgeVariants,
  tagVariants,
  type BadgeVariantProps,
  type TagVariantProps,
} from './badge-variants';

/**
 * Badge sólido (`sc-badge`). A cor vem do dicionário:
 * `<Badge className={cn(areaColor(area).bg, 'uppercase')}>`. Para cores claras
 * (`light` no dicionário), prefira `Dot` ou borda a usar a cor como fundo de texto.
 */
export function Badge({
  className,
  variant = 'solid',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & BadgeVariantProps & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'span';

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/** Tag suave (`sc-tag`): `<Tag>Artigos <b>131</b></Tag>`. */
export function Tag({
  className,
  variant = 'brand',
  ...props
}: React.ComponentProps<'span'> & TagVariantProps) {
  return (
    <span
      data-slot="tag"
      data-variant={variant}
      className={cn(tagVariants({ variant }), className)}
      {...props}
    />
  );
}

/**
 * Marcador de cor (`sc-dot`). É decorativo: acompanhe sempre de um rótulo.
 * `<Dot className={qualisColor(q).bg} />`
 */
export function Dot({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="dot"
      aria-hidden
      className={cn(
        'inline-block size-2.5 shrink-0 rounded-full bg-neutral-400',
        className,
      )}
      {...props}
    />
  );
}
