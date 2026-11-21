import type { GraduateProgramSummary } from '@/entities/graduate-program/model';

export interface MunicipalityProperties {
  name: string;
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

export interface TerritoryGroup {
  id: string;
  name: string;
  cities: string[];
  programs: GraduateProgramSummary[];
}

export interface MunicipalityGroup {
  id: string;
  name: string;
  feature: MunicipalityFeature;
  programs: GraduateProgramSummary[];
}

/**
 * Paleta em tons pastéis inspirada no mapa oficial dos Territórios de
 * Identidade da Bahia (SEI, 2021 — Lei nº 14.172/2019).
 */
export const TERRITORY_COLORS: Record<string, string> = {
  '1': '#ead091',
  '2': '#bbda92',
  '3': '#c9c0ed',
  '4': '#cfe195',
  '5': '#eaca7f',
  '6': '#daac69',
  '7': '#c1dd94',
  '8': '#cec3ab',
  '9': '#c5dc92',
  '10': '#f2aed2',
  '11': '#e9c67d',
  '12': '#f6acd2',
  '13': '#ead493',
  '14': '#ebd798',
  '15': '#f3aac5',
  '16': '#e7db8d',
  '17': '#e8ce8c',
  '18': '#ecc17c',
  '19': '#ecdcb0',
  '20': '#e6d789',
  '21': '#b0cae5',
  '22': '#e8b2cd',
  '23': '#f5aac4',
  '24': '#e8df91',
  '25': '#b8c5d3',
  '26': '#e9bb78',
  '27': '#c7bdec',
};

export const EMPTY_FILL = '#e5e7eb';
export const MUNICIPAL_ZOOM = 8;

/** Normaliza nome de município para cruzamento entre API e GeoJSON. */
export function normalizeCity(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

/** Retorna a cor fixa do território de identidade pelo ID. */
export function getTerritoryColor(id?: string | number): string {
  const key = String(id ?? '');
  if (TERRITORY_COLORS[key]) return TERRITORY_COLORS[key];
  const parsed = Number(id);
  const numericId = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
  const palette = Object.values(TERRITORY_COLORS);
  return palette[(numericId - 1) % palette.length] ?? '#ead091';
}

/** Extrai apenas as fronteiras externas e entre territórios do GeoJSON. */
export function getTerritoryBorders(
  geoJson: TerritoryGeoJson,
): TerritoryBorderFeature {
  const segments = new Map<
    string,
    { line: number[][]; count: number; territoryIds: Set<string> }
  >();

  for (const feature of geoJson.features) {
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
            existing.territoryIds.add(String(feature.properties.territorio_id));
          } else {
            segments.set(key, {
              line: [start, end],
              count: 1,
              territoryIds: new Set([String(feature.properties.territorio_id)]),
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

/** Agrupa programas por Território de Identidade e por Município. */
export function groupProgramsByGeoJson(
  geoJson: TerritoryGeoJson,
  programs: readonly GraduateProgramSummary[],
) {
  const cityIndex = new Map<string, MunicipalityFeature>();
  const territoryCities = new Map<string, string[]>();
  const territoryFeatures = new Map<string, MunicipalityFeature[]>();
  const territoryNames = new Map<string, string>();

  for (const feature of geoJson.features) {
    const cityKey = normalizeCity(feature.properties.name);
    if (cityKey) cityIndex.set(cityKey, feature);

    const territoryId = String(feature.properties.territorio_id);
    territoryNames.set(territoryId, feature.properties.territorio_identidade);

    const cities = territoryCities.get(territoryId) ?? [];
    cities.push(feature.properties.name);
    territoryCities.set(territoryId, cities);

    const features = territoryFeatures.get(territoryId) ?? [];
    features.push(feature);
    territoryFeatures.set(territoryId, features);
  }

  const territoryGroups = new Map<string, TerritoryGroup>();
  const municipalityGroups = new Map<string, MunicipalityGroup>();

  for (const program of programs) {
    const cityKey = normalizeCity(program.city);
    const feature = cityIndex.get(cityKey);
    if (!feature) continue;

    const territoryId = String(feature.properties.territorio_id);
    let tGroup = territoryGroups.get(territoryId);
    if (!tGroup) {
      tGroup = {
        id: territoryId,
        name: feature.properties.territorio_identidade,
        cities: territoryCities.get(territoryId) ?? [],
        programs: [],
      };
      territoryGroups.set(territoryId, tGroup);
    }
    tGroup.programs.push(program);

    let mGroup = municipalityGroups.get(cityKey);
    if (!mGroup) {
      mGroup = {
        id: cityKey,
        name: feature.properties.name,
        feature,
        programs: [],
      };
      municipalityGroups.set(cityKey, mGroup);
    }
    mGroup.programs.push(program);
  }

  return {
    territoryGroups,
    municipalityGroups,
    territoryCities,
    territoryFeatures,
    territoryNames,
  };
}

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
        typeof feature.properties?.name === 'string' &&
        ['string', 'number'].includes(
          typeof feature.properties?.territorio_id,
        ) &&
        typeof feature.properties?.territorio_identidade === 'string',
    )
  );
}
