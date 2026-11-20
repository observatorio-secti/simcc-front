import type { ReactNode } from 'react';
import { ExternalLink, Hash } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { focusRing } from '@/shared/ui/focus-ring';
import { formatJcr, type MagazineLike } from '../model';

/**
 * Fator de impacto JCR (`Hash` 12px + "JCR 4,5"). Não renderiza nada sem JCR.
 * Com `jcr_link`, vira link externo.
 */
export function JcrMark({
  jcr,
  jcr_link,
  className,
}: Pick<MagazineLike, 'jcr' | 'jcr_link'> & { className?: string }) {
  const value = formatJcr(jcr);
  if (!value) return null;

  const content: ReactNode = (
    <>
      <Hash className="size-3 shrink-0" aria-hidden />
      <span>
        JCR <span className="tabular-nums">{value}</span>
      </span>
    </>
  );
  const base = cn('inline-flex items-center gap-1', className);

  if (jcr_link) {
    return (
      <a
        data-slot="jcr-mark"
        href={jcr_link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          base,
          'rounded-xs underline-offset-2 transition-colors hover:text-foreground hover:underline',
          focusRing,
        )}
      >
        {content}
        <ExternalLink className="size-3 shrink-0" aria-hidden />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
    );
  }

  return (
    <span data-slot="jcr-mark" className={base}>
      {content}
    </span>
  );
}
