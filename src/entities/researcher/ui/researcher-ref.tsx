import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import { researcherHref, type ResearcherSummary } from '../model';
import { ResearcherAvatar } from './researcher-avatar';

export interface ResearcherRefProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'children'
> {
  researcher: Pick<ResearcherSummary, 'id' | 'name'>;
  /** Exibe avatar pequeno (`20px`) antes do nome. */
  showAvatar?: boolean;
  /** URL da foto quando `showAvatar` está ativo. */
  imageUrl?: string | null;
  /** Texto auxiliar ao lado do nome (ex.: sigla da instituição). */
  meta?: ReactNode;
}

/** Referência clicável para o perfil de um pesquisador. */
export function ResearcherRef({
  researcher,
  showAvatar = false,
  imageUrl,
  meta,
  className,
  ...props
}: ResearcherRefProps) {
  return (
    // TODO(T3): migrar para <Link to="/pesquisadores/$id">
    <a
      data-slot="researcher-ref"
      href={researcherHref(researcher.id)}
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-2 rounded-md text-sm font-medium text-foreground underline-offset-4 transition-colors hover:text-eng-blue hover:underline',
        focusRing,
        className,
      )}
      {...props}
    >
      {showAvatar && (
        <ResearcherAvatar
          name={researcher.name}
          imageUrl={imageUrl}
          size="sm"
          decorative
        />
      )}
      <span className="truncate">{researcher.name}</span>
      {meta != null && meta !== '' && (
        <span className="shrink-0 text-xs font-normal text-muted-foreground">
          {meta}
        </span>
      )}
    </a>
  );
}
