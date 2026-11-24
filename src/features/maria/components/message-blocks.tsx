import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type {
  CitedProduction,
  CitedResearcher,
  ConversationBlock,
  ProductionsBlock,
  ResearchersBlock,
  SuggestionsBlock,
  TableBlock,
} from '@/entities/conversation/model';
import {
  normalizeProductionKind,
  type ProductionItem,
  type ProductionKind,
} from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { researcherImageUrl } from '@/entities/researcher/queries';
import { PersonCard } from '@/entities/researcher/ui/person-card';
import { Button } from '@/shared/ui/button';
import { Markdown } from '@/shared/ui/markdown';
import { Skeleton } from '@/shared/ui/skeleton';
import { BlockCard, BlockTitle, DataTable, OriginNote } from './block-parts';
import { ChartBlockView } from './chart-block';

function affiliationLabel(researcher: CitedResearcher): string {
  const labels = (researcher.affiliations ?? [])
    .map(
      (affiliation) =>
        affiliation.institution_acronym?.trim() ||
        affiliation.institution_name?.trim(),
    )
    .filter((label): label is string => Boolean(label));
  return [...new Set(labels)].join(' / ');
}

/** Cartões mostrados antes de "Ver todos". */
const RESEARCHERS_PREVIEW = 3;

/**
 * Pesquisadores citados, com o cartão da plataforma (o id é o da v2: o link
 * vai ao perfil e a foto vem da v2). Mostra alguns e expande o resto.
 */
function ResearchersBlockView({ block }: { block: ResearchersBlock }) {
  const [expanded, setExpanded] = useState(false);
  const { researchers } = block;
  if (researchers.length === 0) return null;
  const hidden = researchers.length - RESEARCHERS_PREVIEW;
  const visible = expanded
    ? researchers
    : researchers.slice(0, RESEARCHERS_PREVIEW);

  return (
    <BlockCard slot="maria-researchers" className="@container">
      <BlockTitle>{block.title || 'Pesquisadores'}</BlockTitle>
      <ul className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
        {visible.map((researcher) => (
          <li key={researcher.id} className="min-w-0">
            <PersonCard
              researcher={{
                id: researcher.id,
                name: researcher.name,
                image_url: researcherImageUrl(researcher.id),
              }}
              institutionLabel={affiliationLabel(researcher)}
              evidenceTotal={researcher.evidence?.total ?? 0}
              searchType="maria"
            />
          </li>
        ))}
      </ul>
      <OriginNote
        origin={block.origin}
        total={block.total}
        shown={researchers.length}
        truncated={block.truncated}
      >
        {hidden > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
          >
            {expanded ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
            {expanded ? 'Mostrar menos' : `Ver todos (${researchers.length})`}
          </Button>
        )}
      </OriginNote>
    </BlockCard>
  );
}

/** Texto simples, quando a produção não abre na v2 (tipo desconhecido ou erro). */
function PlainProduction({ production }: { production: CitedProduction }) {
  return (
    <article
      data-slot="maria-production-plain"
      className="flex flex-col gap-1 rounded-lg border bg-card p-4 text-sm"
    >
      <span className="text-xs text-muted-foreground">
        {production.type_label}
        {production.year != null && ` · ${production.year}`}
      </span>
      <span className="font-medium">{production.title}</span>
    </article>
  );
}

/**
 * Produções citadas: o `id` e o `type` da MarIA são o id e o tipo da v2, e o
 * card da entidade é montado com o detalhe da v2.
 */
function ProductionsBlockView({ block }: { block: ProductionsBlock }) {
  const entries = block.productions.map((production) => ({
    production,
    kind: normalizeProductionKind(production.type),
  }));
  const results = useQueries({
    queries: entries.map(({ production, kind }) => ({
      ...productionDetailQueryOptions(kind ?? 'article', production.id),
      enabled: kind !== null,
    })),
  });

  if (entries.length === 0) return null;

  return (
    <section data-slot="maria-productions" className="flex flex-col gap-3">
      <BlockTitle>{block.title || 'Produções'}</BlockTitle>
      <ul className="flex flex-col gap-3">
        {entries.map(({ production, kind }, index) => {
          const result = results[index];
          return (
            <li key={production.id} className="min-w-0">
              {kind && result?.data ? (
                <ProductionCard
                  kind={kind as ProductionKind}
                  item={result.data.data as ProductionItem}
                />
              ) : kind && result?.isPending ? (
                <Skeleton
                  className="h-28 w-full rounded-lg"
                  aria-label={`Carregando ${production.title}`}
                />
              ) : (
                <PlainProduction production={production} />
              )}
            </li>
          );
        })}
      </ul>
      <OriginNote
        origin={block.origin}
        total={block.total}
        shown={block.productions.length}
        truncated={block.truncated}
      />
    </section>
  );
}

function TableBlockView({ block }: { block: TableBlock }) {
  return (
    <BlockCard slot="maria-table">
      {block.title && <BlockTitle>{block.title}</BlockTitle>}
      <DataTable columns={block.columns} rows={block.rows} />
      <OriginNote origin={block.origin} truncated={block.truncated} />
    </BlockCard>
  );
}

function SuggestionsBlockView({
  block,
  onAsk,
}: {
  block: SuggestionsBlock;
  onAsk?: (question: string) => void;
}) {
  if (!onAsk || block.questions.length === 0) return null;
  return (
    <section
      data-slot="maria-suggestions"
      aria-labelledby="maria-suggestions-title"
      className="flex flex-col gap-2 pt-2"
    >
      <h3
        id="maria-suggestions-title"
        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Continue a pesquisa
      </h3>
      <ul className="flex flex-col gap-2">
        {block.questions.map((question) => (
          <li key={question}>
            <button
              type="button"
              onClick={() => onAsk(question)}
              className="group flex w-full items-center justify-between gap-3 rounded-lg border bg-card px-3.5 py-2.5 text-left text-sm transition-colors hover:border-eng-blue hover:text-eng-blue focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden"
            >
              {question}
              <ArrowRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-eng-blue"
                aria-hidden
              />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export interface MessageBlocksProps {
  blocks: readonly (ConversationBlock | undefined)[];
  /** Envia uma pergunta sugerida; sem ele, as sugestões não aparecem. */
  onAsk?: (question: string) => void;
}

/** Blocos de uma resposta da MarIA, na ordem em que a API os entrega. */
export function MessageBlocks({ blocks, onAsk }: MessageBlocksProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {blocks.map((block, index) => {
        if (!block) return null;
        switch (block.type) {
          case 'text':
            return <Markdown key={index} source={block.text} />;
          case 'researchers':
            return <ResearchersBlockView key={index} block={block} />;
          case 'productions':
            return <ProductionsBlockView key={index} block={block} />;
          case 'table':
            return <TableBlockView key={index} block={block} />;
          case 'chart':
            return <ChartBlockView key={index} block={block} />;
          case 'suggestions':
            return (
              <SuggestionsBlockView key={index} block={block} onAsk={onAsk} />
            );
          default:
            // Tipos novos da API são ignorados até o front saber mostrá-los.
            return null;
        }
      })}
    </div>
  );
}
