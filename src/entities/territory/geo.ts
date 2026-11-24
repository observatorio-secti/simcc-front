import type { FacetResult } from '@/api/types';
import type { TerritoryFacetItem } from './model';

/** Propriedades de um município em `public/territorio_relacionado.json`. */
export interface MunicipalityProperties {
  /** Código IBGE (7 dígitos). */
  id: string;
  name: string;
  /** Código SEI do território (1 a 27). */
  territorio_id: string | number;
  territorio_identidade: string;
}

export interface MunicipalityFeature {
  type: 'Feature';
  properties: MunicipalityProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface TerritoryGeoJson {
  type: 'FeatureCollection';
  features: MunicipalityFeature[];
}

export interface TerritoryBorderFeature {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: {
    type: 'MultiLineString';
    coordinates: number[][][];
  };
}

/** A partir deste zoom o mapa mostra municípios em vez de territórios. */
export const MUNICIPAL_ZOOM = 8;

export function isValidTerritoryGeoJson(
  data: unknown,
): data is TerritoryGeoJson {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Partial<TerritoryGeoJson>;
  return (
    candidate.type === 'FeatureCollection' &&
    Array.isArray(candidate.features) &&
    candidate.features.length > 0 &&
    candidate.features.every(
      (feature) =>
        feature?.type === 'Feature' &&
        (feature.geometry?.type === 'Polygon' ||
          feature.geometry?.type === 'MultiPolygon') &&
        Array.isArray(feature.geometry?.coordinates) &&
        typeof feature.properties?.id === 'string' &&
        typeof feature.properties?.name === 'string' &&
        ['string', 'number'].includes(
          typeof feature.properties?.territorio_id,
        ) &&
        typeof feature.properties?.territorio_identidade === 'string',
    )
  );
}

/** Extrai só a borda do estado e as divisas entre territórios. */
export function getTerritoryBorders(
  geoJson: TerritoryGeoJson,
): TerritoryBorderFeature {
  const segments = new Map<
    string,
    { line: number[][]; count: number; territoryIds: Set<string> }
  >();

  for (const feature of geoJson.features) {
    const territoryId = String(feature.properties.territorio_id);
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates as number[][][]]
        : (feature.geometry.coordinates as number[][][][]);

    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (let index = 1; index < ring.length; index += 1) {
          const start = ring[index - 1];
          const end = ring[index];
          if (!start || !end) continue;
          const startKey = start.join(',');
          const endKey = end.join(',');
          const key =
            startKey < endKey
              ? `${startKey}|${endKey}`
              : `${endKey}|${startKey}`;
          const existing = segments.get(key);
          if (existing) {
            existing.count += 1;
            existing.territoryIds.add(territoryId);
          } else {
            segments.set(key, {
              line: [start, end],
              count: 1,
              territoryIds: new Set([territoryId]),
            });
          }
        }
      }
    }
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiLineString',
      coordinates: Array.from(segments.values())
        .filter(
          (segment) => segment.count === 1 || segment.territoryIds.size > 1,
        )
        .map((segment) => segment.line),
    },
  };
}

export interface TerritoryGeoIndex {
  /** Código SEI → municípios do território. */
  territoryFeatures: Map<string, MunicipalityFeature[]>;
  /** Código IBGE → município. */
  municipalities: Map<string, MunicipalityFeature>;
}

export function indexGeoJson(geoJson: TerritoryGeoJson): TerritoryGeoIndex {
  const territoryFeatures = new Map<string, MunicipalityFeature[]>();
  const municipalities = new Map<string, MunicipalityFeature>();

  for (const feature of geoJson.features) {
    municipalities.set(feature.properties.id, feature);
    const territoryId = String(feature.properties.territorio_id);
    const features = territoryFeatures.get(territoryId) ?? [];
    features.push(feature);
    territoryFeatures.set(territoryId, features);
  }

  return { territoryFeatures, municipalities };
}

export interface TerritoryCounts {
  /** Código SEI → item do território. */
  territories: Map<string, TerritoryFacetItem>;
  /** Código IBGE → item do município (só municípios de algum território). */
  cities: Map<string, TerritoryFacetItem>;
  /** Grupo de itens fora dos territórios (`value: null`), se houver. */
  unassigned: TerritoryFacetItem | undefined;
}

/** Indexa a faceta `territory_city` por código SEI e por código IBGE. */
export function facetCounts(facet: FacetResult | undefined): TerritoryCounts {
  const territories = new Map<string, TerritoryFacetItem>();
  const cities = new Map<string, TerritoryFacetItem>();
  let unassigned: TerritoryFacetItem | undefined;

  for (const item of facet?.items ?? []) {
    if (item.value === null) {
      unassigned = item;
      continue;
    }
    territories.set(item.value, item);
    for (const child of item.children ?? []) {
      if (child.value !== null) cities.set(child.value, child);
    }
  }

  return { territories, cities, unassigned };
}
