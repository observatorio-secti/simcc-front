import { queryOptions } from '@tanstack/react-query';
import { fetchTerritoryGeoJson } from '@/api/static-assets';
import { isValidTerritoryGeoJson } from './geo';

export const territoryKeys = {
  all: ['territory'] as const,
  geoJson: () => ['territory', 'geojson'] as const,
};

/** Malha dos municípios da Bahia com o território (arquivo estático). */
export function territoryGeoJsonQueryOptions() {
  return queryOptions({
    queryKey: territoryKeys.geoJson(),
    queryFn: async ({ signal }) => {
      const data = await fetchTerritoryGeoJson(signal);
      if (!isValidTerritoryGeoJson(data)) {
        throw new Error('GeoJSON de territórios inválido.');
      }
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
