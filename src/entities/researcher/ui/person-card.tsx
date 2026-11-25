import { useState, type ComponentProps } from 'react';
import { Building2, User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { searchTypeColor } from '@/shared/lib/design-tokens';
import { Badge } from '@/shared/ui/badge';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  formatAffiliationAcronyms,
  formatEvidenceCount,
  researcherHref,
  type ResearcherSummary,
} from '../model';

/**
 * O que o cartão lê de um pesquisador. Além do item de lista da v2, aceita
 * pesquisadores citados por outras fontes (ex.: MarIA), que trazem só o
 * básico e passam instituição e evidências já prontas.
 */
export type PersonCardResearcher = Pick<ResearcherSummary, 'id' | 'name'> &
  Partial<
    Pick<
      ResearcherSummary,
      'image_url' | 'classification' | 'matches' | 'affiliations'
    >
  >;

export interface PersonCardProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'children'
> {
  researcher: PersonCardResearcher;
  /** Sobrepõe as siglas montadas de `affiliations`. */
  institutionLabel?: string;
  /** Sobrepõe `matches.total`. */
  evidenceTotal?: number;
  /** Tipo de busca para colorir o badge de evidências (`bg-search-*`). */
  searchType?: string | null;
  /** Disposição em grade (`aspect-[3/4]`), lista (`min-h-24`) ou compacta (`min-h-18`). */
  layout?: 'grid' | 'list' | 'compact';
}

/**
 * Cartão de pesquisador (`sc-person` em `design-kit/reference/components.md`).
 * Card plano sem sombra com foto ou gradiente slate, classificação e evidências.
 */
export function PersonCard({
  researcher,
  searchType = 'profile',
  layout = 'grid',
  institutionLabel: institutionOverride,
  evidenceTotal: evidenceOverride,
  className,
  ...props
}: PersonCardProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = researcher.image_url?.trim() ? researcher.image_url.trim() : null;
  const showImage = src !== null && failedSrc !== src;

  const classification = researcher.classification?.trim() || null;
  const evidenceTotal = evidenceOverride ?? researcher.matches?.total ?? 0;
  const institutionLabel =
    institutionOverride ?? formatAffiliationAcronyms(researcher.affiliations);
  const evidenceColor = searchTypeColor(searchType);
  const isList = layout === 'list';
  const isCompact = layout === 'compact';

  return (
    // TODO(T3): migrar para <Link to="/pesquisadores/$id">
    <a
      data-slot="person-card"
      data-layout={layout}
      href={researcherHref(researcher.id)}
      className={cn(
        'group relative isolate flex overflow-hidden rounded-lg border bg-neutral-300 text-white dark:bg-neutral-800',
        isCompact
          ? 'min-h-[74px] flex-row items-end justify-between gap-2.5 p-2.5'
          : isList
            ? 'min-h-24 flex-col justify-between gap-3 p-3 sm:flex-row sm:items-end sm:gap-4'
            : 'aspect-[3/4] flex-col justify-between p-3',
        focusRing,
        className,
      )}
      {...props}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          aria-hidden
          loading="lazy"
          className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 -z-20 grid place-items-center bg-gradient-to-br from-slate-400 to-slate-600 transition-transform duration-300 ease-out group-hover:scale-[1.04]"
        >
          <User
            className={cn(
              'text-white/35',
              isCompact ? 'size-10' : 'size-16',
            )}
            strokeWidth={1.75}
          />
        </div>
      )}

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/75 via-black/5 to-black/15"
      />

      {(classification !== null || evidenceTotal > 0) && (
        <div
          className={cn(
            'flex items-center justify-between gap-1.5',
            isCompact && 'order-2 shrink-0 self-start',
            isList && 'sm:order-2 sm:shrink-0',
          )}
        >
          {classification !== null && (
            <Badge size="sm" className="bg-white/85 text-neutral-900">
              {classification}
            </Badge>
          )}
          {evidenceTotal > 0 && (
            <Badge size="sm" className={cn('ml-auto', evidenceColor.bg)}>
              {formatEvidenceCount(evidenceTotal)}
            </Badge>
          )}
        </div>
      )}

      <div
        className={cn(
          'min-w-0',
          isCompact
            ? 'order-1 flex-1'
            : isList
              ? 'sm:order-1 sm:flex-1'
              : 'mt-auto',
        )}
      >
        <p
          className={cn(
            'line-clamp-2 leading-tight font-medium text-white',
            isCompact ? 'text-sm' : 'text-lg',
          )}
        >
          {researcher.name}
        </p>
        {institutionLabel && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-white/90">
            <Building2 className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{institutionLabel}</span>
          </p>
        )}
      </div>
    </a>
  );
}
