import { describe, expect, it } from 'vitest';
import type { FacetResult } from '@/api/types';
import {
  facetCounts,
  getTerritoryBorders,
  indexGeoJson,
  isValidTerritoryGeoJson,
  type MunicipalityFeature,
  type TerritoryGeoJson,
} from './geo';

function square(
  id: string,
  name: string,
  territorio_id: string,
  [x, y]: [number, number],
): MunicipalityFeature {
  return {
    type: 'Feature',
    properties: {
      id,
      name,
      territorio_id,
      territorio_identidade: `TERRITÓRIO ${territorio_id}`,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [x, y],
          [x + 1, y],
          [x + 1, y + 1],
          [x, y + 1],
          [x, y],
        ],
      ],
    },
  };
}

// Três quadrados lado a lado: os dois primeiros no território 26.
const geoJson: TerritoryGeoJson = {
  type: 'FeatureCollection',
  features: [
    square('2927408', 'Salvador', '26', [0, 0]),
    square('2919207', 'Lauro de Freitas', '26', [1, 0]),
    square('2910800', 'Feira de Santana', '19', [2, 0]),
  ],
};

const facet: FacetResult = {
  param: ['identity_territory', 'city_code'],
  total: 3,
  covered: 12,
  items: [
    {
      value: '26',
      code: 26,
      label: 'METROPOLITANA DE SALVADOR',
      count: 8,
      selected: false,
      children: [
        {
          value: '2927408',
          code: 2927408,
          label: 'Salvador',
          count: 7,
          selected: false,
        },
        {
          value: '2919207',
          code: 2919207,
          label: 'Lauro de Freitas',
          count: 2,
          selected: false,
        },
      ],
    },
    {
      value: '19',
      code: 19,
      label: 'PORTAL DO SERTÃO',
      count: 3,
      selected: true,
      children: [
        {
          value: '2910800',
          code: 2910800,
          label: 'Feira de Santana',
          count: 3,
          selected: false,
        },
      ],
    },
    {
      value: null,
      code: null,
      label: 'Sem território',
      count: 1,
      selected: false,
      children: [
        {
          value: '3550308',
          code: 3550308,
          label: 'São Paulo',
          count: 1,
          selected: false,
        },
      ],
    },
  ],
};

describe('geo dos territórios', () => {
  it('valida o GeoJSON e exige o código IBGE em `id`', () => {
    expect(isValidTerritoryGeoJson(geoJson)).toBe(true);
    const { id: _id, ...withoutId } = geoJson.features[0]!.properties;
    expect(
      isValidTerritoryGeoJson({
        ...geoJson,
        features: [{ ...geoJson.features[0], properties: withoutId }],
      }),
    ).toBe(false);
    expect(isValidTerritoryGeoJson({ type: 'FeatureCollection' })).toBe(false);
  });

  it('indexa municípios por IBGE e territórios por código SEI', () => {
    const index = indexGeoJson(geoJson);
    expect(index.municipalities.get('2910800')?.properties.name).toBe(
      'Feira de Santana',
    );
    expect(
      index.territoryFeatures.get('26')?.map((f) => f.properties.name),
    ).toEqual(['Salvador', 'Lauro de Freitas']);
  });

  it('traça a borda do estado e a divisa entre territórios, sem a divisa interna', () => {
    const borders = getTerritoryBorders(geoJson);
    const segments = borders.geometry.coordinates.map((line) =>
      JSON.stringify(line),
    );
    // Divisa Salvador | Lauro de Freitas (mesmo território): some.
    expect(segments).not.toContain(
      JSON.stringify([
        [1, 0],
        [1, 1],
      ]),
    );
    expect(segments).not.toContain(
      JSON.stringify([
        [1, 1],
        [1, 0],
      ]),
    );
    // Divisa Lauro de Freitas | Feira de Santana (territórios diferentes): fica.
    expect(
      segments.some(
        (s) =>
          s ===
            JSON.stringify([
              [2, 0],
              [2, 1],
            ]) ||
          s ===
            JSON.stringify([
              [2, 1],
              [2, 0],
            ]),
      ),
    ).toBe(true);
  });

  it('lê as contagens da faceta e separa o grupo sem território', () => {
    const counts = facetCounts(facet);
    expect(counts.territories.get('26')?.count).toBe(8);
    expect(counts.territories.has('null')).toBe(false);
    expect(counts.cities.get('2927408')?.count).toBe(7);
    // Municípios do grupo sem território ficam fora do mapa.
    expect(counts.cities.has('3550308')).toBe(false);
    expect(counts.unassigned?.count).toBe(1);
  });

  it('sem faceta, não há contagens', () => {
    const counts = facetCounts(undefined);
    expect(counts.territories.size).toBe(0);
    expect(counts.unassigned).toBeUndefined();
  });
});
