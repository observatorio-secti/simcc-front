import { describe, expect, it } from 'vitest';
import type { ConversationMessage } from '@/entities/conversation/model';
import type { ConversationStreamState } from './conversation-stream';
import { activitySteps, researchContext } from './research-context';

const origin = (source: string, at: string, description = 'Consulta') => ({
  sources: [source],
  description,
  queried_at: at,
});

const assistant: ConversationMessage = {
  id: 'a',
  conversation_id: 'c',
  role: 'assistant',
  created_at: '2026-11-22T10:00:00Z',
  content: [
    { type: 'text', text: 'oi' },
    {
      type: 'table',
      columns: [],
      rows: [],
      truncated: true,
      origin: origin('Simcc', '2026-11-22T10:00:00Z', 'Buscando artigos'),
    },
    {
      type: 'researchers',
      researchers: [{ id: '1', name: 'A' }],
      total: 1,
      truncated: false,
      origin: origin('Fomento', '2026-11-22T11:00:00Z', 'Buscando bolsas'),
    },
  ],
};

function stream(
  overrides: Partial<ConversationStreamState>,
): ConversationStreamState {
  return {
    status: 'streaming',
    question: 'q',
    startedAt: '',
    userMessage: null,
    activities: [],
    blocks: [],
    error: null,
    controller: new AbortController(),
    ...overrides,
  };
}

describe('researchContext', () => {
  it('junta fontes, a consulta mais recente e as contagens', () => {
    const context = researchContext(
      [assistant],
      [{ kind: 'query', source: 'ODA', description: 'x' }],
    );
    expect(context).toMatchObject({
      sources: ['Simcc', 'Fomento', 'ODA'],
      lastQueriedAt: '2026-11-22T11:00:00Z',
      tables: 1,
      researchers: 1,
      truncated: 1,
    });
  });
});

describe('activitySteps', () => {
  it('durante o stream: a última atividade em andamento', () => {
    const steps = activitySteps(
      [],
      stream({
        activities: [
          { kind: 'query', source: 'Simcc', description: 'A' },
          { kind: 'query', source: 'Simcc', description: 'B' },
        ],
      }),
    );
    expect(steps.map((s) => s.status)).toEqual(['done', 'running']);
  });

  it('com texto chegando: consultas concluídas e "Escrevendo"', () => {
    const steps = activitySteps(
      [],
      stream({
        activities: [{ kind: 'query', source: 'Simcc', description: 'A' }],
        blocks: [{ type: 'text', text: 'x' }],
      }),
    );
    expect(steps.at(-1)).toMatchObject({
      description: 'Escrevendo a resposta',
      status: 'running',
    });
    expect(steps[0]?.status).toBe('done');
  });

  it('depois: as consultas da última resposta, pela origem', () => {
    expect(
      activitySteps([assistant], undefined).map((s) => s.description),
    ).toEqual(['Buscando artigos', 'Buscando bolsas', 'Resposta gerada']);
  });
});
