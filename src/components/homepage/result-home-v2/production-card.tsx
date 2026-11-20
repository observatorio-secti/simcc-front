import { MouseEvent } from 'react';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { useModal } from '../../hooks/use-modal-store';
import { Alert } from '../../ui/alert';
import { ResearcherRefV2 } from '../../../types/production-v2';
import { HighlightedText, plainSnippet } from './highlighted-text';
import {
  doiUrl,
  MATCH_FIELD_LABELS,
  ProductionDefinition,
  QUALIS_COLORS,
} from './production-registry';

interface ProductionCardProps {
  definition: ProductionDefinition;
  item: any;
  onOpen: () => void;
}

// Autores além deste limite ficam resumidos em "+N".
const MAX_AUTHORS = 4;

/** Pesquisadores da plataforma que assinam a obra; cada um abre o seu perfil. */
export function PlatformAuthors({
  authors,
  limit,
}: {
  authors: ResearcherRefV2[];
  limit?: number;
}) {
  const { onOpen } = useModal();
  const visible = limit ? authors.slice(0, limit) : authors;
  const hidden = authors.length - visible.length;

  const openResearcher = (event: MouseEvent, name: string) => {
    event.stopPropagation();
    onOpen('researcher-modal', { name });
  };

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((author) => (
        <button
          key={author.id}
          type="button"
          onClick={(event) => openResearcher(event, author.name)}
          className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          {author.name}
        </button>
      ))}
      {hidden > 0 && (
        <span className="px-1 py-0.5 text-xs text-muted-foreground">
          +{hidden}
        </span>
      )}
    </div>
  );
}

export function ProductionCard({
  definition,
  item,
  onOpen,
}: ProductionCardProps) {
  const matches: { field: string; snippet: string }[] = item.matches ?? [];
  // O destaque do título só é usado quando o trecho traz o título inteiro.
  const titleMatch = matches.find(
    (match) =>
      match.field === 'title' &&
      plainSnippet(match.snippet).length >= item.title.length,
  );
  const subtitle = definition.subtitle(item);
  // Campos que o card já mostra por inteiro não repetem o trecho.
  const snippets = matches.filter(
    (match) =>
      match.field !== 'title' &&
      !subtitle?.includes(plainSnippet(match.snippet)),
  );
  const tags = definition.tags(item);
  const qualis: string | undefined = item.magazine?.qualis ?? undefined;
  const stripColor = (qualis && QUALIS_COLORS[qualis]) || definition.color;

  return (
    <div className="flex w-full cursor-pointer group" onClick={onOpen}>
      <div
        className={`w-2 shrink-0 rounded-l-md border border-r-0 border-neutral-200 dark:border-neutral-800 ${stripColor}`}
      />
      <Alert className="flex w-auto min-w-0 flex-1 flex-col gap-3 rounded-l-none p-4 transition-colors group-hover:bg-neutral-50 dark:group-hover:bg-neutral-900">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="truncate">{subtitle}</span>
          {item.year && (
            <span className="flex shrink-0 items-center gap-1">
              <Calendar size={12} />
              {item.year}
            </span>
          )}
        </div>

        <p className="text-sm font-medium leading-snug">
          {titleMatch ? (
            <HighlightedText text={titleMatch.snippet} />
          ) : (
            plainSnippet(item.title)
          )}
        </p>

        {snippets.map((match) => (
          <p key={match.field} className="text-xs text-muted-foreground">
            <span className="font-medium">
              {MATCH_FIELD_LABELS[match.field] ?? match.field}:
            </span>{' '}
            … <HighlightedText text={match.snippet} /> …
          </p>
        ))}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-neutral-200 px-2 py-0.5 text-xs dark:border-neutral-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {item.platform_authors.length > 0 && (
          <PlatformAuthors
            authors={item.platform_authors}
            limit={MAX_AUTHORS}
          />
        )}

        {item.doi && (
          <a
            href={doiUrl(item.doi)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(event) => event.stopPropagation()}
            className="flex w-fit items-center gap-1 text-xs text-eng-blue hover:underline"
          >
            DOI {item.doi}
            <ArrowUpRight size={12} />
          </a>
        )}
      </Alert>
    </div>
  );
}
