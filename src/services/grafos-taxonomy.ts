import type {
  GrafosGraphResponse,
  TaxonomyListResponse,
} from '../types/grafos-graph';

const API_BASE =
  import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail ?? `Erro ${response.status}`);
  }

  return response.json() as Promise<T>;
}

/** GET /taxonomies — lista taxonomias disponíveis. */
export async function fetchTaxonomyList(): Promise<TaxonomyListResponse> {
  return apiFetch<TaxonomyListResponse>('/classifier/taxonomies');
}

/** GET /taxonomies/{name}/graph — grafo no formato Cytoscape/vis.js. */
export async function fetchTaxonomyGraph(
  taxonomyName: string,
  params?: {
    origins?: string[];
    minLayer?: number;
    maxLayer?: number;
    onlyWithTopics?: boolean;
  },
): Promise<GrafosGraphResponse> {
  const searchParams = new URLSearchParams();

  if (params?.origins) {
    params.origins.forEach((o) => searchParams.append('origins', o));
  }
  if (params?.minLayer !== undefined)
    searchParams.set('min_layer', String(params?.minLayer));
  if (params?.maxLayer !== undefined)
    searchParams.set('max_layer', String(params?.maxLayer));
  if (params?.onlyWithTopics) searchParams.set('only_with_topics', 'true');

  const query = searchParams.toString();
  const queryString = query ? `?${query}` : '';

  return apiFetch<GrafosGraphResponse>(
    `/classifier/taxonomies/${encodeURIComponent(taxonomyName)}/graph${queryString}`,
  );
}

/** GET /classifier/trace/areas — lista áreas de uma taxonomia. */
export async function fetchTaxonomyAreas(
  taxonomyName: string,
): Promise<{ items: { number: number; area: string }[]; total: number }> {
  return apiFetch(`/classifier/trace/areas?taxonomy_name=${encodeURIComponent(taxonomyName)}`);
}

