import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Card, CardContent } from '@/shared/ui/card';

/**
 * Seção extra da vitrine. Cada arquivo em `./sections/*.tsx` exporta uma
 * `section` com este formato, e a vitrine monta todas sozinha: adicionar uma
 * seção não exige mexer em `vitrine-page.tsx`. `Component` renderiza um
 * `<Showcase id={id}>`.
 */
export interface VitrineSection {
  id: string;
  label: string;
  Component: ComponentType;
}

/** Bloco da vitrine: título, descrição curta e um card com os exemplos. */
export function Showcase({
  id,
  title,
  description,
  children,
  bare = false,
}: {
  id: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  /** Sem o card em volta (para exemplos que já são cards). */
  bare?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="flex scroll-mt-6 flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h2 id={`${id}-title`} className="text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {bare ? (
        children
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-6 p-4 md:p-6">
            {children}
          </CardContent>
        </Card>
      )}
    </section>
  );
}

/** Linha de exemplos com rótulo. */
export function Demo({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
        {label}
      </p>
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {children}
      </div>
    </div>
  );
}
