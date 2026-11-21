import { BookOpen, CheckCircle2, ExternalLink, Hash } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot } from '@/shared/ui/badge';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  formatIssn,
  formatJcr,
  formatMagazineName,
  interpretQualis,
  safeExternalHref,
  type MagazineLike,
  type QualisInput,
} from '../model';

export interface QualisBadgeProps {
  /** Revista ou valor Qualis (`A1`–`C`, `B5`, `SQ`, `not_rated`, `not_applicable`). */
  magazine: QualisInput;
  size?: 'default' | 'sm';
  /** Mostra apenas a sigla (`A1`, `B5`, `SQ`) em espaços reduzidos. */
  short?: boolean;
  className?: string;
}

/**
 * Marcador de estrato Qualis conforme `DESIGN.md` §2.4: cores claras (`A3`,
 * `A4`) e estratos sem token (`B5`) usam `Badge` outline + `Dot` colorido;
 * estratos escuros (`A1`, `A2`, `B1`–`B4`, `C`, `SQ`) usam badge sólido.
 */
export function QualisBadge({
  magazine,
  size = 'default',
  short = false,
  className,
}: QualisBadgeProps) {
  const info = interpretQualis(magazine);
  const label = short ? info.shortLabel : info.label;

  if (info.isLight || info.status === 'not_applicable') {
    return (
      <Badge
        variant="outline"
        size={size}
        data-qualis-status={info.status}
        className={cn(info.status === 'rated' && 'text-foreground', className)}
      >
        <Dot className={cn(info.color.bg, size === 'sm' && 'size-2')} />
        <span>{label}</span>
      </Badge>
    );
  }

  return (
    <Badge
      size={size}
      data-qualis-status={info.status}
      className={cn(info.color.bg, className)}
    >
      {info.status === 'rated' && <CheckCircle2 aria-hidden />}
      <span>{label}</span>
    </Badge>
  );
}

export interface JcrBadgeProps {
  jcr?: number | null;
  jcrLink?: string | null;
  size?: 'default' | 'sm';
  className?: string;
}

/** Marcador do fator de impacto JCR (com link externo quando `jcr_link` existe). */
export function JcrBadge({
  jcr,
  jcrLink,
  size = 'default',
  className,
}: JcrBadgeProps) {
  const formatted = formatJcr(jcr);
  const href = safeExternalHref(jcrLink);

  if (formatted === null && href === null) {
    return null;
  }

  const label = formatted !== null ? `JCR ${formatted}` : 'JCR';

  if (href) {
    return (
      <Badge
        asChild
        variant="outline"
        size={size}
        className={cn(
          'text-foreground tabular-nums transition-colors hover:border-eng-blue hover:text-eng-blue',
          focusRing,
          className,
        )}
      >
        <a href={href} target="_blank" rel="noopener noreferrer">
          <Hash aria-hidden />
          <span>{label}</span>
          <ExternalLink aria-hidden />
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      size={size}
      className={cn('text-foreground tabular-nums', className)}
    >
      <Hash aria-hidden />
      <span>{label}</span>
    </Badge>
  );
}

export interface MagazineRefProps {
  /** Dados da revista (`Magazine` ou `MagazineRef` de um artigo). */
  magazine: MagazineLike;
  variant?: 'default' | 'compact';
  showIssn?: boolean;
  className?: string;
}

/** Referência de revista com nome, ISSN formatado, Qualis e JCR. */
export function MagazineRef({
  magazine,
  variant = 'default',
  showIssn = true,
  className,
}: MagazineRefProps) {
  const name = formatMagazineName(magazine.name);
  const issn = showIssn ? formatIssn(magazine.issn) : null;
  const badgeSize = variant === 'compact' ? 'sm' : 'default';

  return (
    <div
      data-slot="magazine-ref"
      data-variant={variant}
      className={cn(
        'flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5',
        variant === 'compact' ? 'text-xs' : 'text-sm',
        className,
      )}
    >
      <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-foreground">
        <BookOpen
          className={cn(
            'shrink-0 text-muted-foreground',
            variant === 'compact' ? 'size-3.5' : 'size-4',
          )}
          aria-hidden
        />
        <span className="min-w-0 break-words">{name}</span>
      </span>
      {issn && (
        <span className="text-xs text-muted-foreground tabular-nums">
          ISSN {issn}
        </span>
      )}
      <div className="flex flex-wrap items-center gap-1.5">
        <QualisBadge magazine={magazine} size={badgeSize} />
        <JcrBadge
          jcr={magazine.jcr}
          jcrLink={magazine.jcr_link}
          size={badgeSize}
        />
      </div>
    </div>
  );
}
