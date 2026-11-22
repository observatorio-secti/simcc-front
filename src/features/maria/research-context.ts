import type { MariaActivity } from '@/api/maria';
import type {
  BlockOrigin,
  ConversationBlock,
  ConversationMessage,
} from '@/entities/conversation/model';
import type { ConversationStreamState } from './conversation-stream';

// Resumo do painel "Contexto da pesquisa" e "Atividade da MarIA", montado só
// com o que já está na conversa: a origem (`origin`) de cada bloco de dados
// gravado e as atividades do stream em andamento.

export interface ResearchContext {
  /** Fontes consultadas, na ordem em que apareceram. */
  sources: string[];
  /** Momento da consulta mais recente (ISO). */
  lastQueriedAt: string | null;
  charts: number;
  tables: number;
  researchers: number;
  productions: number;
  /** Blocos cortados pelo limite da consulta. */
  truncated: number;
}

function blockOrigin(block: ConversationBlock): BlockOrigin | null {
  return 'origin' in block ? (block.origin ?? null) : null;
}

export function researchContext(
  messages: readonly ConversationMessage[],
  activities: readonly MariaActivity[] = [],
): ResearchContext {
  const sources = new Set<string>();
  const context: ResearchContext = {
    sources: [],
    lastQueriedAt: null,
    charts: 0,
    tables: 0,
    researchers: 0,
    productions: 0,
    truncated: 0,
  };
  let latest = Number.NEGATIVE_INFINITY;

  for (const message of messages) {
    if (message.role !== 'assistant') continue;
    for (const block of message.content) {
      switch (block.type) {
        case 'chart':
          context.charts += 1;
          break;
        case 'table':
          context.tables += 1;
          break;
        case 'researchers':
          context.researchers += block.researchers.length;
          break;
        case 'productions':
          context.productions += block.productions.length;
          break;
        default:
          continue;
      }
      if ('truncated' in block && block.truncated) context.truncated += 1;
      const origin = blockOrigin(block);
      if (!origin) continue;
      for (const source of origin.sources) sources.add(source);
      const time = Date.parse(origin.queried_at);
      if (!Number.isNaN(time) && time > latest) {
        latest = time;
        context.lastQueriedAt = origin.queried_at;
      }
    }
  }
  for (const activity of activities) {
    if (activity.source) sources.add(activity.source);
  }

  context.sources = [...sources];
  return context;
}

export type ActivityStatus = 'done' | 'running';

export interface ActivityStep {
  description: string;
  source: string | null;
  status: ActivityStatus;
}

/**
 * Passos da última resposta. Durante o stream: as atividades recebidas (a
 * última em andamento) e a escrita da resposta. Depois: as consultas
 * registradas na origem dos blocos da última resposta.
 */
export function activitySteps(
  messages: readonly ConversationMessage[],
  stream: ConversationStreamState | undefined,
): ActivityStep[] {
  if (stream?.status === 'streaming') {
    const writing = stream.blocks.length > 0;
    const steps: ActivityStep[] = stream.activities.map(
      (activity, index, list) => ({
        description: activity.description,
        source: activity.source || null,
        status: index === list.length - 1 && !writing ? 'running' : 'done',
      }),
    );
    if (steps.length === 0 && !writing) {
      steps.push({
        description: 'Analisando a pergunta',
        source: null,
        status: 'running',
      });
    }
    if (writing) {
      steps.push({
        description: 'Escrevendo a resposta',
        source: null,
        status: 'running',
      });
    }
    return steps;
  }

  const last = [...messages].reverse().find((m) => m.role === 'assistant');
  if (!last) return [];
  const steps: ActivityStep[] = [];
  const seen = new Set<string>();
  for (const block of last.content) {
    const origin = blockOrigin(block);
    if (!origin?.description || seen.has(origin.description)) continue;
    seen.add(origin.description);
    steps.push({
      description: origin.description,
      source: origin.sources.join(', ') || null,
      status: 'done',
    });
  }
  steps.push({
    description: 'Resposta gerada',
    source: null,
    status: 'done',
  });
  return steps;
}
