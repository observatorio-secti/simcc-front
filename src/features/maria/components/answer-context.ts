import type {
  BlockOrigin,
  ConversationBlock,
} from '@/entities/conversation/model';

// Fonte e hora da consulta dos blocos de dados de uma resposta.

const queriedAtFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatQueriedAt(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : queriedAtFormat.format(date);
}

interface SourceSummary {
  name: string;
  queriedAt: string;
}

function blockOrigin(block: ConversationBlock | undefined): BlockOrigin | null {
  if (!block || !('origin' in block)) return null;
  return block.origin ?? null;
}

/** Fontes (sem repetir) e consultas citadas nos blocos de uma resposta. */
export function answerContext(
  blocks: readonly (ConversationBlock | undefined)[],
) {
  const sources = new Map<string, SourceSummary>();
  const queries: string[] = [];
  for (const block of blocks) {
    const origin = blockOrigin(block);
    if (!origin) continue;
    for (const name of origin.sources) {
      const previous = sources.get(name);
      if (!previous || previous.queriedAt < origin.queried_at) {
        sources.set(name, { name, queriedAt: origin.queried_at });
      }
    }
    if (origin.description && !queries.includes(origin.description)) {
      queries.push(origin.description);
    }
  }
  return { sources: [...sources.values()], queries };
}
