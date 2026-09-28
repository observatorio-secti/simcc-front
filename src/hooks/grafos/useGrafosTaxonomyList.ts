import { useEffect, useState } from 'react';
import { fetchTaxonomyList } from '../../services/grafos-taxonomy';
import type { TaxonomyItem } from '../../types/grafos-graph';

export function useGrafosTaxonomyList() {
  const [taxonomies, setTaxonomies] = useState<TaxonomyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchTaxonomyList()
      .then((res) => {
        if (cancelled) return;
        setTaxonomies(res.items);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : 'Erro ao carregar taxonomias.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { taxonomies, loading, error };
}
