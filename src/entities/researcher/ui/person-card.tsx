import { useState, type ComponentProps } from 'react';
import { BookOpen, Building2, GraduationCap, User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { searchTypeColor } from '@/shared/lib/design-tokens';
import { Badge } from '@/shared/ui/badge';
import { focusRing } from '@/shared/ui/focus-ring';
import {
  formatAffiliationAcronyms,
  formatCount,
  formatEvidenceCount,
  researcherHref,
  type ResearcherCounts,
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
      | 'image_url'
      | 'classification'
      | 'graduation'
      | 'counts'
      | 'matches'
      | 'affiliations'
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
  /** Disposição em grade (`aspect-[3/4]`), lista (`min-h-24`) ou compacta com foto à esquerda (`compact`). */
  layout?: 'grid' | 'list' | 'compact';
}

function productionSummaryLabel(
  counts: ResearcherCounts | undefined,
): string | null {
  if (!counts) return null;
  if (counts.articles > 0) {
    return counts.articles === 1
      ? '1 artigo'
      : `${formatCount(counts.articles)} artigos`;
  }
  const total =
    counts.articles +
    counts.books +
    counts.book_chapters +
    counts.patents +
    counts.software +
    counts.brands +
    counts.guidance +
    counts.reports;
  if (total <= 0) return null;
  return total === 1 ? '1 produção' : `${formatCount(total)} produções`;
}

/**
 * Cartão de pesquisador (`sc-person` em `design-kit/reference/components.md`).
 * Nos modos `grid` e `list`, usa foto em tela cheia com overlay escuro; no modo
 * `compact`, posiciona a foto à esquerda com os dados da listagem à direita.
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
  const graduation = researcher.graduation?.trim() || null;
  const evidenceTotal = evidenceOverride ?? researcher.matches?.total ?? 0;
  const institutionLabel =
    institutionOverride ?? formatAffiliationAcronyms(researcher.affiliations);
  const productionLabel = productionSummaryLabel(researcher.counts);
  const evidenceColor = searchTypeColor(searchType);
  const isList = layout === 'list';

  if (layout === 'compact') {
    return (
      // TODO(T3): migrar para <Link to="/pesquisadores/$id">
      <a
        data-slot="person-card"
        data-layout={layout}
        href={researcherHref(researcher.id)}
        className={cn(
          'group flex items-start gap-2.5 rounded-lg border bg-card p-2.5 text-card-foreground transition-colors hover:border-eng-blue',
          focusRing,
          className,
        )}
        {...props}
      >
        <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 text-white">
          {showImage ? (
            <img
              src={src}
              alt=""
              aria-hidden
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              onError={() => setFailedSrc(src)}
            />
          ) : (
            <User
              className="size-7 text-white/75"
              strokeWidth={1.75}
              aria-hidden
            />
          )}
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-start justify-between gap-1.5">
            <p className="line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-eng-blue">
              {researcher.name}
            </p>
            {(classification !== null || evidenceTotal > 0) && (
              <div className="flex shrink-0 items-center gap-1">
                {classification !== null && (
                  <Badge variant="outline" size="sm">
                    {classification}
                  </Badge>
                )}
                {evidenceTotal > 0 && (
                  <Badge size="sm" className={evidenceColor.bg}>
                    {formatEvidenceCount(evidenceTotal)}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {(institutionLabel || graduation || productionLabel) && (
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-xs text-muted-foreground">
              {institutionLabel && (
                <span className="inline-flex max-w-full items-center gap-1">
                  <Building2 className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{institutionLabel}</span>
                </span>
              )}
              {graduation && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="size-3 shrink-0" aria-hidden />
                  <span className="truncate">{graduation}</span>
                </span>
              )}
              {productionLabel && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <BookOpen className="size-3 shrink-0" aria-hidden />
                  <span>{productionLabel}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </a>
    );
  }

  return (
    // TODO(T3): migrar para <Link to="/pesquisadores/$id">
    <a
      data-slot="person-card"
      data-layout={layout}
      href={researcherHref(researcher.id)}
      className={cn(
        'group relative isolate flex overflow-hidden rounded-lg border bg-neutral-300 text-white dark:bg-neutral-800',
        isList
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
          <User className="size-16 text-white/35" strokeWidth={1.75} />
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
        className={cn('min-w-0', isList ? 'sm:order-1 sm:flex-1' : 'mt-auto')}
      >
        <p className="line-clamp-2 text-lg leading-tight font-medium text-white">
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
