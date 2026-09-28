import { useEffect, useState } from 'react';
import { fetchTaxonomyGraph } from '../../services/grafos-taxonomy';
import type { GrafosGraphResponse } from '../../types/grafos-graph';

export function useGrafosTaxonomyGraph(taxonomyName: string | null) {
  const [graphData, setGraphData] = useState<GrafosGraphResponse | null>(null);
  const [graphError, setGraphError] = useState<string | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);

  useEffect(() => {
    if (!taxonomyName) return;
    let cancelled = false;
    setGraphLoading(true);
    fetchTaxonomyGraph(taxonomyName)
      .then((res) => {
        if (cancelled) return;
        setGraphData(res);
        setGraphError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setGraphError(
          err instanceof Error ? err.message : 'Erro ao carregar grafo.',
        );
      })
      .finally(() => {
        if (!cancelled) setGraphLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [taxonomyName]);

  return { graphData, graphError, graphLoading };
}
