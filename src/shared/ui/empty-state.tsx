import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { SearchX } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

/**
 * Estado vazio do kit (`sc-empty`): ícone 40px, título, texto e ação opcional.
 */
export function EmptyState({
  title,
  description,
  icon: Icon = SearchX,
  action,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Ex.: `<Button variant="outline">Limpar filtros</Button>`. */
  action?: React.ReactNode;
}) {
  return (
    <div
      data-slot="empty-state"
      className={cn(
        'flex flex-col items-center gap-2 px-4 py-12 text-center text-sm text-muted-foreground',
        className,
      )}
      {...props}
    >
      <Icon className="size-10 text-neutral-400" aria-hidden />
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-md">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
