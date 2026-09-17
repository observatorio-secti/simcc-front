const DEFAULT_GEOJSON_URL = '/territorio_relacionado.json';
const requests = new Map<string, Promise<unknown>>();

export function loadTerritoryGeoJson(
  url = DEFAULT_GEOJSON_URL,
): Promise<unknown> {
  const cached = requests.get(url);
  if (cached) return cached;

  const request = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error('Erro ao carregar GeoJSON');
      return response.json() as Promise<unknown>;
    })
    .catch((error) => {
      requests.delete(url);
      throw error;
    });

  requests.set(url, request);
  return request;
}

export function preloadTerritoryGeoJson() {
  void loadTerritoryGeoJson().catch(() => {
    // A abertura da aba mostrará o erro e poderá tentar novamente.
  });
}
