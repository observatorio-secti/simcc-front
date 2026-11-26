import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import type {
  CitedGraduateProgram,
  CitedProduction,
  CitedResearcher,
  CitedResearchGroup,
  ConversationBlock,
  GraduateProgramsBlock,
  ProductionsBlock,
  ResearchersBlock,
  ResearchGroupsBlock,
  SuggestionsBlock,
  TableBlock,
} from '@/entities/conversation/model';
import { graduateProgramDetailQueryOptions } from '@/entities/graduate-program/queries';
import { ProgramCard } from '@/entities/graduate-program/ui/program-card';
import {
  normalizeProductionKind,
  type ProductionItem,
  type ProductionKind,
} from '@/entities/production/model';
import { productionDetailQueryOptions } from '@/entities/production/queries';
import { ProductionCard } from '@/entities/production/ui/production-card';
import { researchGroupHref } from '@/entities/research-group/model';
import { researchGroupDetailQueryOptions } from '@/entities/research-group/queries';
import { ResearchGroupCard } from '@/entities/research-group/ui/research-group-card';
import {
  researcherDetailQueryOptions,
  researcherImageUrl,
} from '@/entities/researcher/queries';
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
const BLOCK_PREVIEW_LIMIT = 3;

function ExpandToggle({
  total,
  expanded,
  onToggle,
}: {
  total: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  if (total <= BLOCK_PREVIEW_LIMIT) return null;
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-7 px-2 text-xs"
      aria-expanded={expanded}
      onClick={onToggle}
    >
      {expanded ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
      {expanded ? 'Mostrar menos' : `Ver todos (${total})`}
    </Button>
  );
}

/**
 * Pesquisadores citados, com o cartão da plataforma hidratado via
 * `GET /v2/researcher/{id}` (com fallback imediato pelos dados da MarIA).
 * Mostra alguns e expande o resto.
 */
function ResearchersBlockView({ block }: { block: ResearchersBlock }) {
  const [expanded, setExpanded] = useState(false);
  const { researchers } = block;
  const visible = expanded
    ? researchers
    : researchers.slice(0, BLOCK_PREVIEW_LIMIT);
  const results = useQueries({
    queries: visible.map((researcher) =>
      researcherDetailQueryOptions(researcher.id),
    ),
  });

  if (researchers.length === 0) return null;

  return (
    <BlockCard slot="maria-researchers" className="@container">
      <BlockTitle>{block.title || 'Pesquisadores'}</BlockTitle>
      <ul className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
        {visible.map((researcher, index) => {
          const detail = results[index]?.data?.data;
          const fallbackAffiliation = affiliationLabel(researcher);
          return (
            <li key={researcher.id} className="min-w-0">
              <PersonCard
                researcher={
                  detail ?? {
                    id: researcher.id,
                    name: researcher.name,
                    image_url: researcherImageUrl(researcher.id),
                  }
                }
                institutionLabel={
                  detail?.affiliations?.length
                    ? undefined
                    : fallbackAffiliation || undefined
                }
                evidenceTotal={researcher.evidence?.total ?? 0}
                searchType="maria"
              />
            </li>
          );
        })}
      </ul>
      <OriginNote
        origin={block.origin}
        total={block.total}
        shown={researchers.length}
        truncated={block.truncated}
      >
        <ExpandToggle
          total={researchers.length}
          expanded={expanded}
          onToggle={() => setExpanded((open) => !open)}
        />
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
 * card da entidade é montado com o detalhe da v2. Mostra algumas e expande o resto.
 */
function ProductionsBlockView({ block }: { block: ProductionsBlock }) {
  const [expanded, setExpanded] = useState(false);
  const entries = block.productions.map((production) => ({
    production,
    kind: normalizeProductionKind(production.type),
  }));
  const visible = expanded ? entries : entries.slice(0, BLOCK_PREVIEW_LIMIT);
  const results = useQueries({
    queries: visible.map(({ production, kind }) => ({
      ...productionDetailQueryOptions(kind ?? 'article', production.id),
      enabled: kind !== null,
    })),
  });

  if (entries.length === 0) return null;

  return (
    <section data-slot="maria-productions" className="flex flex-col gap-3">
      <BlockTitle>{block.title || 'Produções'}</BlockTitle>
      <ul className="flex flex-col gap-3">
        {visible.map(({ production, kind }, index) => {
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
      >
        <ExpandToggle
          total={entries.length}
          expanded={expanded}
          onToggle={() => setExpanded((open) => !open)}
        />
      </OriginNote>
    </section>
  );
}

function PlainGraduateProgram({ program }: { program: CitedGraduateProgram }) {
  return (
    <ProgramCard
      program={{
        id: program.id,
        name: program.name,
        acronym: program.acronym,
      }}
      institutionLabel={program.institution_label}
      layout="compact"
    />
  );
}

/**
 * Programas de pós-graduação citados, hidratados via
 * `GET /v2/graduate-program/{id}` para exibir o `ProgramCard`.
 */
function GraduateProgramsBlockView({
  block,
}: {
  block: GraduateProgramsBlock;
}) {
  const [expanded, setExpanded] = useState(false);
  const { graduate_programs: programs } = block;
  const visible = expanded ? programs : programs.slice(0, BLOCK_PREVIEW_LIMIT);
  const results = useQueries({
    queries: visible.map((program) =>
      graduateProgramDetailQueryOptions(program.id),
    ),
  });

  if (programs.length === 0) return null;

  return (
    <BlockCard slot="maria-graduate-programs" className="@container">
      <BlockTitle>{block.title || 'Programas de pós-graduação'}</BlockTitle>
      <ul className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
        {visible.map((program, index) => {
          const result = results[index];
          const detail = result?.data?.data;
          return (
            <li key={program.id} className="min-w-0">
              {detail ? (
                <ProgramCard
                  program={detail}
                  institutionLabel={
                    detail.institution ? undefined : program.institution_label
                  }
                  layout="compact"
                />
              ) : result?.isPending ? (
                <Skeleton
                  className="h-24 w-full rounded-lg"
                  aria-label={`Carregando ${program.name}`}
                />
              ) : (
                <PlainGraduateProgram program={program} />
              )}
            </li>
          );
        })}
      </ul>
      <OriginNote
        origin={block.origin}
        total={block.total}
        shown={programs.length}
        truncated={block.truncated}
      >
        <ExpandToggle
          total={programs.length}
          expanded={expanded}
          onToggle={() => setExpanded((open) => !open)}
        />
      </OriginNote>
    </BlockCard>
  );
}

function PlainResearchGroup({ group }: { group: CitedResearchGroup }) {
  return (
    <article
      data-slot="maria-research-group-plain"
      className="flex flex-col gap-1 rounded-lg border bg-card p-4 text-sm"
    >
      {group.institution_label && (
        <span className="text-xs text-muted-foreground">
          {group.institution_label}
        </span>
      )}
      <a
        href={researchGroupHref(group.id)}
        className="font-medium hover:text-eng-blue hover:underline"
      >
        {group.name}
      </a>
    </article>
  );
}

/**
 * Grupos de pesquisa citados, hidratados via `GET /grupos-pesquisa/{id}` na
 * API ODA para exibir o `ResearchGroupCard`.
 */
function ResearchGroupsBlockView({ block }: { block: ResearchGroupsBlock }) {
  const [expanded, setExpanded] = useState(false);
  const { research_groups: groups } = block;
  const visible = expanded ? groups : groups.slice(0, BLOCK_PREVIEW_LIMIT);
  const results = useQueries({
    queries: visible.map((group) => researchGroupDetailQueryOptions(group.id)),
  });

  if (groups.length === 0) return null;

  return (
    <BlockCard slot="maria-research-groups" className="@container">
      <BlockTitle>{block.title || 'Grupos de pesquisa'}</BlockTitle>
      <ul className="grid grid-cols-1 gap-3 @lg:grid-cols-2">
        {visible.map((group, index) => {
          const result = results[index];
          return (
            <li key={group.id} className="min-w-0">
              {result?.data ? (
                <ResearchGroupCard group={result.data} />
              ) : result?.isPending ? (
                <Skeleton
                  className="h-36 w-full rounded-lg"
                  aria-label={`Carregando ${group.name}`}
                />
              ) : (
                <PlainResearchGroup group={group} />
              )}
            </li>
          );
        })}
      </ul>
      <OriginNote
        origin={block.origin}
        total={block.total}
        shown={groups.length}
        truncated={block.truncated}
      >
        <ExpandToggle
          total={groups.length}
          expanded={expanded}
          onToggle={() => setExpanded((open) => !open)}
        />
      </OriginNote>
    </BlockCard>
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
          case 'graduate_programs':
            return <GraduateProgramsBlockView key={index} block={block} />;
          case 'research_groups':
            return <ResearchGroupsBlockView key={index} block={block} />;
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
