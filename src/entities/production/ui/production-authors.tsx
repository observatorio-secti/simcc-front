import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import { researcherHref, type ProductionAuthorRef } from '../model';

export interface ProductionAuthorsProps {
  authors: readonly ProductionAuthorRef[];
  /** Quantidade máxima de pesquisadores visíveis antes do resumo `+N`. */
  limit?: number;
  className?: string;
}

/** Lista de pesquisadores da plataforma ligados a uma produção. */
export function ProductionAuthors({
  authors,
  limit,
  className,
}: ProductionAuthorsProps) {
  if (authors.length === 0) return null;

  const visible = limit && limit > 0 ? authors.slice(0, limit) : authors;
  const hiddenCount = authors.length - visible.length;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {visible.map((author) => (
        // TODO(E1/T3): migrar para <ResearcherRef /> / <Link to="/pesquisadores/$id">
        <a
          key={author.id}
          href={researcherHref(author.id)}
          className={cn(
            'inline-flex h-6 items-center rounded-md bg-secondary px-2 text-xs text-foreground transition-colors hover:bg-accent',
            focusRing,
          )}
        >
          {author.name}
        </a>
      ))}
      {hiddenCount > 0 && (
        <span className="px-1 text-xs text-muted-foreground tabular-nums">
          +{hiddenCount.toLocaleString('pt-BR')}
        </span>
      )}
    </div>
  );
}
