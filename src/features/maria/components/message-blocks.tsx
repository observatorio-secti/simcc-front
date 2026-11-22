import { useId } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ArrowRight, Info } from 'lucide-react';
import type {
  CitedProduction,
  CitedResearcher,
  ConversationBlock,
  ProductionsBlock,
  ResearchersBlock,
  SuggestionsBlock,
} from '@/entities/conversation/model';
import {
  normalizeProductionKind,
  type ProductionItem,
  type ProductionKind,
} from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { researcherImageUrl } from '@/entities/researcher/queries';
import { ResearcherRef } from '@/entities/researcher/ui/researcher-ref';
import { cn } from '@/shared/lib/cn';
import { formatDate } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Markdown } from '@/shared/ui/markdown';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  BlockTitle,
  ChartBlockView,
  OriginFooter,
  TableBlockView,
  TruncatedNotice,
} from './data-blocks';

const numberFormat = new Intl.NumberFormat('pt-BR');

/** "Mostrando 12 de 42" quando o bloco não traz todos os itens. */
function shownOf(shown: number, total: number | undefined): string | null {
  if (total == null || total <= shown) return null;
  return `Mostrando ${numberFormat.format(shown)} de ${numberFormat.format(total)}`;
}

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

/**
 * Nota do ranking: termo buscado, quantos aparecem frente ao total, campos que
 * entraram na ordem (Qualis, citações e índice h não definem a ordem) e a data
 * dos dados.
 */
function RankingNote({ block }: { block: ResearchersBlock }) {
  const ranking = block.ranking;
  if (!ranking) return null;
  const shown = block.researchers.length;
  const fields = ranking.fields?.length ? ranking.fields.join(', ') : null;
  return (
    <div
      data-slot="maria-ranking"
      className="flex items-start gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground"
    >
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <div className="flex flex-col gap-0.5">
        <p>
          Busca por{' '}
          <strong className="text-foreground">“{ranking.term}”</strong>:{' '}
          {numberFormat.format(shown)}{' '}
          {shown === 1 ? 'pesquisador exibido' : 'pesquisadores exibidos'}
          {block.total > shown &&
            ` de ${numberFormat.format(block.total)} encontrados`}
          .
        </p>
        <p>
          {ranking.criterion}
          {fields && ` Campos considerados: ${fields}.`} Qualis, citações e
          índice h não definem a ordem.
        </p>
        {ranking.data_as_of && (
          <p>Dados de {formatDate(ranking.data_as_of)}.</p>
        )}
      </div>
    </div>
  );
}

/** Pesquisadores citados: o id é o da v2, então o link vai ao perfil. */
function ResearchersBlockView({ block }: { block: ResearchersBlock }) {
  if (block.researchers.length === 0) return null;
  return (
    <section
      data-slot="maria-researchers"
      aria-label={block.title || 'Pesquisadores'}
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <BlockTitle>{block.title || 'Pesquisadores'}</BlockTitle>
      <RankingNote block={block} />
      {block.truncated && (
        <TruncatedNotice>
          A lista foi limitada pela consulta. Refine a pergunta para ver o
          restante.
        </TruncatedNotice>
      )}
      <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
        {block.researchers.map((researcher) => (
          <li key={researcher.id} className="min-w-0">
            <ResearcherRef
              researcher={researcher}
              showAvatar
              imageUrl={researcherImageUrl(researcher.id)}
              meta={affiliationLabel(researcher)}
            />
          </li>
        ))}
      </ul>
      <OriginFooter
        origin={block.origin}
        extra={
          block.ranking ? null : shownOf(block.researchers.length, block.total)
        }
      />
    </section>
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
    <section
      data-slot="maria-productions"
      aria-label={block.title || 'Produções'}
      className="flex flex-col gap-3"
    >
      <BlockTitle>{block.title || 'Produções'}</BlockTitle>
      {block.truncated && (
        <TruncatedNotice>
          A lista foi limitada pela consulta. Refine a pergunta para ver o
          restante.
        </TruncatedNotice>
      )}
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
      <OriginFooter
        origin={block.origin}
        extra={shownOf(block.productions.length, block.total)}
      />
    </section>
  );
}

function SuggestionsBlockView({
  block,
  onAsk,
}: {
  block: SuggestionsBlock;
  onAsk?: (question: string) => void;
}) {
  const headingId = useId();
  if (!onAsk || block.questions.length === 0) return null;
  return (
    <section
      data-slot="maria-suggestions"
      aria-labelledby={headingId}
      className="mt-2 flex flex-col gap-2"
    >
      <h3
        id={headingId}
        className="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
      >
        Próximos caminhos de investigação
      </h3>
      <div className="flex flex-col items-start gap-2">
        {block.questions.map((question) => (
          <Button
            key={question}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto min-h-8 max-w-full shrink justify-start py-1.5 text-left whitespace-normal"
            onClick={() => onAsk(question)}
          >
            {question}
            <ArrowRight className="text-muted-foreground" aria-hidden />
          </Button>
        ))}
      </div>
    </section>
  );
}

export interface MessageBlocksProps {
  blocks: readonly (ConversationBlock | undefined)[];
  /** Envia uma pergunta sugerida; sem ele, as sugestões não aparecem. */
  onAsk?: (question: string) => void;
  /** Resposta ainda chegando: mostra o cursor de escrita no fim do texto. */
  streaming?: boolean;
}

/** Blocos de uma resposta da MarIA, na ordem em que a API os entrega. */
export function MessageBlocks({
  blocks,
  onAsk,
  streaming = false,
}: MessageBlocksProps) {
  const lastIndex = blocks.length - 1;
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {blocks.map((block, index) => {
        if (!block) return null;
        switch (block.type) {
          case 'text':
            return (
              <div
                key={index}
                className={cn(
                  streaming && index === lastIndex && 'maria-typing',
                )}
              >
                <Markdown source={block.text} />
              </div>
            );
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
