import { BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Card } from '@/shared/ui/card';
import {
  formatIssn,
  formatMagazineName,
  interpretQualis,
  type MagazineLike,
} from '../model';
import { JcrBadge, QualisBadge } from './magazine-ref';

export interface MagazineCardProps {
  /** Dados da revista no catálogo ou referência em listagens. */
  magazine: MagazineLike;
  className?: string;
}

/** Card de revista com borda lateral pelo Qualis, ISSN, Qualis e JCR. */
export function MagazineCard({ magazine, className }: MagazineCardProps) {
  const qualisInfo = interpretQualis(magazine);
  const issn = formatIssn(magazine.issn);
  const name = formatMagazineName(magazine.name);
  const referencePeriod = magazine.reference_period?.trim() || null;

  return (
    <Card
      data-slot="magazine-card"
      className={cn(
        'gap-3 border-l-[6px] p-4',
        qualisInfo.color.borderLeft,
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <BookOpen className="size-3.5 shrink-0" aria-hidden />
          <span className="tabular-nums">
            {issn ? `ISSN ${issn}` : 'ISSN não informado'}
          </span>
        </span>
        {referencePeriod && (
          <span className="tabular-nums">{referencePeriod}</span>
        )}
      </div>

      <h3 className="text-sm leading-snug font-semibold break-words text-foreground">
        {name}
      </h3>

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
        <QualisBadge magazine={magazine} />
        <JcrBadge jcr={magazine.jcr} jcrLink={magazine.jcr_link} />
      </div>
    </Card>
  );
}
