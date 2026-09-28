import type {
  GeneratedTaxonomyConfig,
  TaxonomyGenerateResponse,
  TaxonomySaveResponse,
} from '../types/grafos-taxonomy-generator';

const API_BASE =
  import.meta.env.VITE_TAXONOMY_API_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8001';

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

/** POST /classifier/taxonomies/generate — gera estrutura via LLM a partir de prompt livre. */
export async function generateTaxonomy(
  prompt: string,
): Promise<TaxonomyGenerateResponse> {
  return apiFetch<TaxonomyGenerateResponse>('/classifier/taxonomies/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });
}

/** POST /classifier/taxonomies/structure/save — persiste config editado em disco no backend. */
export async function saveTaxonomy(
  config: GeneratedTaxonomyConfig,
): Promise<TaxonomySaveResponse> {
  return apiFetch<TaxonomySaveResponse>('/classifier/taxonomies/structure/save', {
    method: 'POST',
    body: JSON.stringify({ config }),
  });
}

export function getTaxonomyApiBase(): string {
  return API_BASE;
}
