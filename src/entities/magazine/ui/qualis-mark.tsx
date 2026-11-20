import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';
import { qualisColor } from '@/shared/lib/design-tokens';
import { Dot } from '@/shared/ui/badge';
import { qualisLabel, type MagazineLike } from '../model';

/**
 * Qualis como marcador (`sc-dot` + rótulo): "● Qualis A1". O dot e não o
 * badge sólido, porque A3 e A4 são cores claras (DESIGN.md §2.4). Com
 * `reference_period` (item do catálogo), mostra o período: "Qualis A1
 * (2021–2025)".
 */
export function QualisMark({
  qualis,
  qualis_status,
  reference_period,
  className,
  ...props
}: Pick<MagazineLike, 'qualis' | 'qualis_status' | 'reference_period'> &
  ComponentProps<'span'>) {
  const period = reference_period?.trim().replace('-', '–');

  return (
    <span
      data-slot="qualis-mark"
      className={cn('inline-flex items-center gap-1.5', className)}
      {...props}
    >
      <Dot className={qualisColor(qualis ?? qualis_status).bg} />
      <span>
        {qualisLabel({ qualis, qualis_status })}
        {period && ` (${period})`}
      </span>
    </span>
  );
}
