import type * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from './card';

/** Item da linha de metadados: ícone 12px e texto curto. */
export interface EntityCardMetaItem {
  icon: LucideIcon;
  label: React.ReactNode;
}

/**
 * Card de entidade do kit (`sc-entity`): instituição, programa, grupo.
 * Centralizado, com logo ou ícone num quadrado de 56px, nome e metadados.
 *
 * Não conhece nenhuma entidade: quem usa (`src/entities/<nome>/ui/`) decide
 * o ícone, o texto e o link. Para o card inteiro virar link, passe o nome
 * como `<Link>` e deixe o resto como está.
 */
export function EntityCard({
  name,
  icon: Icon,
  logo,
  meta = [],
  className,
  children,
  ...props
}: Omit<React.ComponentProps<'div'>, 'title'> & {
  name: React.ReactNode;
  /** Ícone quando não há logo. */
  icon?: LucideIcon;
  /** Logo da entidade (ex.: `<img>`). Tem precedência sobre `icon`. */
  logo?: React.ReactNode;
  meta?: EntityCardMetaItem[];
}) {
  return (
    <Card
      data-slot="entity-card"
      className={cn('items-center gap-3 p-6 text-center', className)}
      {...props}
    >
      {(logo ?? Icon) && (
        <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-md border bg-card text-muted-foreground">
          {logo ?? (Icon && <Icon className="size-6" aria-hidden />)}
        </div>
      )}
      <h3 className="text-base leading-snug font-semibold">{name}</h3>
      {meta.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {meta.map(({ icon: MetaIcon, label }, index) => (
            <li key={index} className="inline-flex items-center gap-1">
              <MetaIcon className="size-3 shrink-0" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      )}
      {children}
    </Card>
  );
}
