import { FlaskConical } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { researchGroupHref, type ResearchGroupRef } from '../model';

export interface GroupRefProps {
  group: ResearchGroupRef;
  href?: string;
  showIcon?: boolean;
  className?: string;
}

/** Referência inline de grupo de pesquisa com link para a futura rota de detalhe. */
export function GroupRef({
  group,
  href,
  showIcon = true,
  className,
}: GroupRefProps) {
  const label = group.name?.trim() || 'Grupo de pesquisa';
  const targetHref = href ?? researchGroupHref(group.id);

  return (
    // TODO(T6): migrar para <Link to="/grupos-pesquisa/$id">
    <a
      href={targetHref}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-sm text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-eng-blue hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden',
        className,
      )}
    >
      {showIcon && (
        <FlaskConical
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      )}
      <span className="truncate">{label}</span>
      {group.institutionAcronym && (
        <span className="shrink-0 text-xs font-normal text-muted-foreground">
          ({group.institutionAcronym})
        </span>
      )}
    </a>
  );
}
