import { useQuery } from '@tanstack/react-query';

/**
 * Busca o resumo de um artigo no OpenAlex a partir do DOI.
 *
 * Opção B: quando a API da plataforma não traz `abstract`, tentamos o
 * OpenAlex (gratuito, sem chave), que indexa o resumo da editora.
 * O OpenAlex devolve o resumo como índice invertido
 * (palavra -> posições), reconstruído aqui para texto corrido.
 *
 * O resultado (inclusive ausência) fica em cache em memória pela sessão,
 * então reabrir o mesmo artigo não refaz a chamada.
 */

type InvertedIndex = Record<string, number[]>;

/** Cache de sessão: doi normalizado -> resumo (ou null quando não há). */
const sessionCache = new Map<string, string | null>();

export function normalizeDoi(doi: string | null | undefined): string {
  return (doi ?? '')
    .trim()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    .replace(/^doi:/i, '');
}

export function reconstructAbstract(inverted: InvertedIndex): string | null {
  const positioned: Array<[number, string]> = [];

  for (const [word, positions] of Object.entries(inverted ?? {})) {
    if (!Array.isArray(positions)) continue;
    for (const pos of positions) {
      positioned.push([pos, word]);
    }
  }

  if (positioned.length === 0) return null;

  return positioned
    .sort((a, b) => a[0] - b[0])
    .map(([, word]) => word)
    .join(' ');
}

async function fetchOpenAlexAbstract(cleanDoi: string): Promise<string | null> {
  if (sessionCache.has(cleanDoi)) {
    return sessionCache.get(cleanDoi) ?? null;
  }

  try {
    const response = await fetch(
      `https://api.openalex.org/works/https://doi.org/${cleanDoi}`,
    );

    if (!response.ok) {
      sessionCache.set(cleanDoi, null);
      return null;
    }

    const json = await response.json();
    const abstract = json?.abstract_inverted_index
      ? reconstructAbstract(json.abstract_inverted_index)
      : null;

    sessionCache.set(cleanDoi, abstract);
    return abstract;
  } catch {
    // Falha de rede/serviço: trata como "sem resumo" sem quebrar o modal.
    return null;
  }
}

/**
 * @param doi DOI do artigo (qualquer formato aceito).
 * @param enabled só busca quando true: usar `!hasApiAbstract && !!doi`.
 */
export function useOpenAlexAbstract(
  doi: string | null | undefined,
  enabled: boolean,
) {
  const cleanDoi = normalizeDoi(doi);

  return useQuery({
    queryKey: ['openalex-abstract', cleanDoi],
    queryFn: () => fetchOpenAlexAbstract(cleanDoi),
    enabled: enabled && cleanDoi !== '',
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });
}
