import { Calendar, ExternalLink } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge, Dot } from '@/shared/ui/badge';
import { focusRing } from '@/shared/ui/focus-ring';
import type { ProductionItem, ProductionKind } from '../model';
import { getProductionDefinition, MATCH_FIELD_LABELS } from '../registry';
import { ArticleMetricsMeta } from './article-metrics-meta';
import { HighlightedSnippet } from './highlighted-snippet';
import { ProductionAuthors } from './production-authors';

const DEFAULT_MAX_AUTHORS = 4;

export interface ProductionCardProps<
  K extends ProductionKind = ProductionKind,
> {
  kind: K;
  item: ProductionItem<K>;
  /** Ação opcional para abrir o detalhe da produção a partir do título. */
  onOpen?: (item: ProductionItem<K>) => void;
  /** Exibe os chips de pesquisadores da plataforma (padrão: true). */
  showAuthors?: boolean;
  /** Quantidade máxima de pesquisadores antes de resumir em `+N`. */
  maxAuthors?: number;
  className?: string;
}

/**
 * Card padronizado de produção científica e técnica (`sc-prod`, DESIGN.md).
 * Não usa sombra; recebe borda esquerda de 6px com a cor semântica do item.
 */
export function ProductionCard<K extends ProductionKind>({
  kind,
  item,
  onOpen,
  showAuthors = true,
  maxAuthors = DEFAULT_MAX_AUTHORS,
  className,
}: ProductionCardProps<K>) {
  const definition = getProductionDefinition(kind);
  const accent = definition.itemColor(item);
  const title = definition.itemTitle(item);
  const subtitle = definition.subtitle(item);
  const year = definition.yearLabel(item);
  const tags = definition.tags(item);
  const primaryLink = definition.externalLinks(item)[0];

  const concrete: ProductionItem = item;
  const matches = concrete.matches ?? [];
  const titleMatch = matches.find(
    (match) =>
      match.field === 'title' &&
      match.snippet.trim().toLowerCase() === title.trim().toLowerCase(),
  );
  const extraMatches = matches.filter(
    (match) =>
      match.field !== 'title' &&
      (!subtitle || !subtitle.includes(match.snippet)),
  );

  const coloredTags = tags.filter((tag) => tag.color !== undefined);
  const plainTags = tags.filter((tag) => tag.color === undefined);
  const authors = concrete.platform_authors ?? [];
  const articleMetrics = definition.articleMetrics?.(item);

  const titleNode = titleMatch ? (
    <HighlightedSnippet
      text={titleMatch.snippet}
      highlights={titleMatch.highlights}
    />
  ) : (
    title
  );

  return (
    <article
      data-slot="production-card"
      data-kind={kind}
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-lg border border-l-[6px] bg-white p-4 text-card-foreground dark:bg-neutral-950',
        accent.borderLeft,
        onOpen &&
          'transition-colors hover:border-neutral-300 dark:hover:border-neutral-700',
        className,
      )}
    >
      {subtitle && (
        <p className="text-sm leading-snug font-semibold wrap-break-word">
          {subtitle}
        </p>
      )}

      <h3 className="text-sm leading-snug wrap-break-word uppercase">
        {onOpen ? (
          <button
            type="button"
            onClick={() => onOpen(item)}
            className={cn(
              'cursor-pointer rounded-xs text-left uppercase transition-colors hover:text-eng-blue',
              focusRing,
            )}
          >
            {titleNode}
          </button>
        ) : (
          titleNode
        )}
      </h3>

      {extraMatches.length > 0 && (
        <div className="flex flex-col gap-1">
          {extraMatches.map((match) => (
            <p
              key={`${match.field}-${match.snippet}`}
              className="text-xs leading-relaxed wrap-break-word text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                {MATCH_FIELD_LABELS[match.field] ?? match.field}:
              </span>{' '}
              <HighlightedSnippet
                text={match.snippet}
                highlights={match.highlights}
              />
            </p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-xs text-muted-foreground">
        {year && (
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <Calendar className="h-3 w-3 shrink-0" aria-hidden />
            {year}
          </span>
        )}

        {articleMetrics && <ArticleMetricsMeta {...articleMetrics} />}

        {coloredTags.map((tag) => (
          <span key={tag.label} className="inline-flex items-center gap-1.5">
            {tag.color && <Dot className={tag.color.bg} />}
            {tag.label}
          </span>
        ))}
      </div>

      {plainTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {plainTags.map((tag) => (
            <Badge key={tag.label} variant="outline" size="sm">
              {tag.label}
            </Badge>
          ))}
        </div>
      )}

      {showAuthors && authors.length > 0 && (
        <ProductionAuthors authors={authors} limit={maxAuthors} />
      )}

      {primaryLink && (
        <a
          href={primaryLink.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex w-fit items-center gap-1 rounded-xs text-xs font-medium text-eng-blue transition-colors hover:text-eng-dark-blue hover:underline',
            focusRing,
          )}
        >
          {primaryLink.label}
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
        </a>
      )}
    </article>
  );
}
