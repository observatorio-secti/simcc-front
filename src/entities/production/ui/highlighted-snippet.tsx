import { Fragment } from 'react';

export interface HighlightedSnippetProps {
  text: string;
  highlights?: readonly [number, number][];
}

function mergeRanges(
  length: number,
  highlights: readonly [number, number][] | undefined,
): Array<readonly [number, number]> {
  if (!highlights || highlights.length === 0) return [];
  const sorted = highlights
    .map(([start, end]): readonly [number, number] => [
      Math.max(0, Math.min(start, length)),
      Math.max(0, Math.min(end, length)),
    ])
    .filter(([start, end]) => end > start)
    .sort((a, b) => a[0] - b[0]);

  const merged: Array<readonly [number, number]> = [];
  for (const [start, end] of sorted) {
    const prev = merged.at(-1);
    if (prev && start <= prev[1]) {
      merged[merged.length - 1] = [prev[0], Math.max(prev[1], end)];
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

/**
 * Renderiza um trecho de busca (`ArticleMatch`) destacando os intervalos UTF-16
 * sem injetar HTML vindo da API.
 */
export function HighlightedSnippet({
  text,
  highlights,
}: HighlightedSnippetProps) {
  const ranges = mergeRanges(text.length, highlights);
  if (ranges.length === 0) return <>{text}</>;

  const nodes: Array<{ key: string; value: string; mark: boolean }> = [];
  let cursor = 0;

  for (const [start, end] of ranges) {
    if (start > cursor) {
      nodes.push({
        key: `t-${cursor}`,
        value: text.slice(cursor, start),
        mark: false,
      });
    }
    nodes.push({
      key: `m-${start}`,
      value: text.slice(start, end),
      mark: true,
    });
    cursor = end;
  }

  if (cursor < text.length) {
    nodes.push({
      key: `t-${cursor}`,
      value: text.slice(cursor),
      mark: false,
    });
  }

  return (
    <>
      {nodes.map((node) =>
        node.mark ? (
          <mark
            key={node.key}
            className="bg-transparent font-semibold text-eng-blue"
          >
            {node.value}
          </mark>
        ) : (
          <Fragment key={node.key}>{node.value}</Fragment>
        ),
      )}
    </>
  );
}
