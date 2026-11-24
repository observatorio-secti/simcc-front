// Arquivos estáticos servidos pelo próprio front (`public/`).

function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path}`;
}

/**
 * GeoJSON dos municípios da Bahia com o território de identidade
 * (`public/territorio_relacionado.json`). Quem chama valida o formato.
 */
export async function fetchTerritoryGeoJson(
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetch(publicUrl('territorio_relacionado.json'), {
    signal,
  });
  if (!response.ok) {
    throw new Error('Não foi possível carregar o mapa dos territórios.');
  }
  return (await response.json()) as unknown;
}
