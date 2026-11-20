import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { CollapseButton } from './collapse-button';

/**
 * Cabeçalho de seção colapsável (`sc-section__head`): ícone 20px, título
 * `text-base font-medium` e ferramentas à direita. Passe `open` e
 * `onOpenChange` para mostrar o botão de recolher (estado local de quem usa).
 */
export function SectionHeader({
  title,
  icon: Icon,
  as: Heading = 'h2',
  open,
  onOpenChange,
  controls,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  title: React.ReactNode;
  icon?: LucideIcon;
  as?: 'h2' | 'h3';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** `id` do conteúdo da seção, para o `aria-controls` do botão. */
  controls?: string;
}) {
  return (
    <div
      data-slot="section-header"
      className={cn('flex min-h-10 items-center gap-3', className)}
      {...props}
    >
      {Icon && (
        <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      )}
      <Heading className="min-w-0 flex-1 text-base font-medium">
        {title}
      </Heading>
      {(children || onOpenChange) && (
        <div className="flex shrink-0 items-center gap-1">
          {children}
          {onOpenChange && (
            <CollapseButton
              open={open ?? true}
              onOpenChange={onOpenChange}
              controls={controls}
            />
          )}
        </div>
      )}
    </div>
  );
}
