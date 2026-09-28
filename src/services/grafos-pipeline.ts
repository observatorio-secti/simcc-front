import type { PipelineMessage } from '../types/grafos-pipeline';

const API_BASE =
  import.meta.env.VITE_TAXONOMY_API_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

export function classifyMessage(text: string): PipelineMessage['kind'] {
  if (
    text.includes('✅') ||
    text.includes('concluído') ||
    text.includes('salvo')
  )
    return 'success';
  if (text.includes('Erro') || text.includes('erro') || text.includes('❌'))
    return 'error';
  return 'info';
}

export function parseNodeCount(messages: PipelineMessage[]): number | null {
  for (const m of [...messages].reverse()) {
    const match = /(\d{1,9}) nós/.exec(m.text);
    if (match) return Number.parseInt(match[1], 10);
  }
  return null;
}

export function parseEdgeCount(messages: PipelineMessage[]): number | null {
  for (const m of [...messages].reverse()) {
    const match = /(\d{1,9}) arestas/.exec(m.text);
    if (match) return Number.parseInt(match[1], 10);
  }
  return null;
}

/**
 * Ano mínimo dos artigos feeding o pipeline.
 *
 * O backend usa 2017 por default, o que carrega ~9,3k abstracts e torna a etapa de
 * embeddings inviável em CPU (1h30+ por taxonomia). 2021 reduz o volume e encurta
 * o run para ~30min sem perder cobertura útil. Ajuste com VITE_PIPELINE_MIN_YEAR.
 */
export const PIPELINE_MIN_YEAR = Number.parseInt(
  import.meta.env.VITE_PIPELINE_MIN_YEAR ?? '2021',
  10,
);

/** POST /classifier/pipeline/run/{taxonomy_name} — streaming NDJSON de progresso. */
export async function runPipelineStream(
  taxonomyName: string,
  onMessage: (msg: PipelineMessage) => void,
  onDone: () => void,
  onError: (msg: PipelineMessage) => void,
  minYear: number = PIPELINE_MIN_YEAR,
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/classifier/pipeline/run/${encodeURIComponent(taxonomyName)}?min_year=${minYear}`,
    { method: 'POST' },
  );

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const parsed = JSON.parse(line) as {
          message?: string;
          error?: string;
          step?: number;
        };
        if (parsed.error) {
          onError({ text: parsed.error, kind: 'error', step: parsed.step });
          return;
        }
        if (parsed.message) {
          onMessage({
            text: parsed.message,
            kind: classifyMessage(parsed.message),
            step: parsed.step,
          });
        }
      } catch {
        // linha mal-formada — ignora
      }
    }
  }

  if (buffer.trim()) {
    try {
      const parsed = JSON.parse(buffer) as {
        message?: string;
        error?: string;
        step?: number;
      };
      if (parsed.error) {
        onError({ text: parsed.error, kind: 'error', step: parsed.step });
        return;
      }
      if (parsed.message) {
        onMessage({
          text: parsed.message,
          kind: classifyMessage(parsed.message),
          step: parsed.step,
        });
      }
    } catch {
      // ignora
    }
  }

  onDone();
}
