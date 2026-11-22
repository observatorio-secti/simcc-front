import { useQueries } from '@tanstack/react-query';
import { Database, MessageCircleQuestion } from 'lucide-react';
import type {
  BlockOrigin,
  ChartBlock,
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
import { ResearcherRef } from '@/entities/researcher/ui/researcher-ref';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Markdown } from '@/shared/ui/markdown';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

const numberFormat = new Intl.NumberFormat('pt-BR');

function BlockTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground">{children}</h3>;
}

function OriginNote({
  origin,
  total,
  shown,
  truncated,
}: {
  origin?: BlockOrigin | null;
  total?: number;
  shown?: number;
  truncated?: boolean;
}) {
  const parts: string[] = [];
  if (total != null && shown != null && total > shown) {
    parts.push(
      `Mostrando ${numberFormat.format(shown)} de ${numberFormat.format(total)}`,
    );
  } else if (truncated) {
    parts.push('Resultado cortado pelo limite de linhas');
  }
  if (origin?.sources.length) parts.push(`Fonte: ${origin.sources.join(', ')}`);
  if (parts.length === 0) return null;

  return (
    <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
      <Database className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{parts.join(' · ')}</span>
    </p>
  );
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

/** Pesquisadores citados: o id é o da v2, então o link vai ao perfil. */
function ResearchersBlockView({ block }: { block: ResearchersBlock }) {
  if (block.researchers.length === 0) return null;
  return (
    <section
      data-slot="maria-researchers"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      <BlockTitle>{block.title || 'Pesquisadores'}</BlockTitle>
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
      <OriginNote
        origin={block.origin}
        total={block.total}
        shown={block.researchers.length}
        truncated={block.truncated}
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

function formatCell(value: unknown, type?: string): string {
  if (value == null || value === '') return '—';
  if (type === 'number' && typeof value === 'number') {
    return numberFormat.format(value);
  }
  return String(value);
}

function DataTable({
  title,
  columns,
  rows,
  origin,
  truncated,
}: {
  title?: string | null;
  columns: { key: string; label: string; type?: string }[];
  rows: Record<string, unknown>[];
  origin?: BlockOrigin | null;
  truncated?: boolean;
}) {
  return (
    <section
      data-slot="maria-table"
      className="flex flex-col gap-3 rounded-lg border bg-card p-4"
    >
      {title && <BlockTitle>{title}</BlockTitle>}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(column.type === 'number' && 'text-right')}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.type === 'number' && 'text-right tabular-nums',
                  )}
                >
                  {formatCell(row[column.key], column.type)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <OriginNote origin={origin} truncated={truncated} />
    </section>
  );
}

function TableBlockView({ block }: { block: TableBlock }) {
  return (
    <DataTable
      title={block.title}
      columns={block.columns}
      rows={block.rows}
      origin={block.origin}
      truncated={block.truncated}
    />
  );
}

/** Gráfico mostrado como tabela dos mesmos dados (o front ainda não desenha). */
function ChartBlockView({ block }: { block: ChartBlock }) {
  const columns = [
    { key: block.x.key, label: block.x.label, type: block.x.type },
    ...(block.group
      ? [{ key: block.group.key, label: block.group.label }]
      : []),
    ...block.series.map((series) => ({
      key: series.key,
      label: series.unit ? `${series.label} (${series.unit})` : series.label,
      type: 'number',
    })),
  ];
  return (
    <DataTable
      title={block.title}
      columns={columns}
      rows={block.data}
      origin={block.origin}
      truncated={block.truncated}
    />
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
      aria-label="Perguntas sugeridas"
      className="flex flex-col gap-2"
    >
      <span className="text-xs font-medium text-muted-foreground">
        Continue a conversa
      </span>
      <div className="flex flex-wrap gap-2">
        {block.questions.map((question) => (
          <Button
            key={question}
            type="button"
            variant="outline"
            size="sm"
            className="h-auto min-h-8 max-w-full shrink justify-start py-1.5 text-left whitespace-normal"
            onClick={() => onAsk(question)}
          >
            <MessageCircleQuestion aria-hidden />
            {question}
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
