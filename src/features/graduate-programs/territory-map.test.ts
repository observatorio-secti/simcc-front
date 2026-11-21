import { describe, expect, it } from 'vitest';
import type { GraduateProgramSummary } from '@/entities/graduate-program/model';
import {
  getTerritoryBorders,
  getTerritoryColor,
  groupProgramsByGeoJson,
  normalizeCity,
  type TerritoryGeoJson,
} from './territory-geo';

const sampleGeoJson: TerritoryGeoJson = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        name: 'Salvador',
        territorio_id: '26',
        territorio_identidade: 'METROPOLITANO DE SALVADOR',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-38.5, -13.0],
            [-38.4, -13.0],
            [-38.4, -12.9],
            [-38.5, -12.9],
            [-38.5, -13.0],
          ],
        ],
      },
    },
    {
      type: 'Feature',
      properties: {
        name: 'Feira de Santana',
        territorio_id: '19',
        territorio_identidade: 'PORTAL DO SERTÃO',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-39.0, -12.3],
            [-38.9, -12.3],
            [-38.9, -12.2],
            [-39.0, -12.2],
            [-39.0, -12.3],
          ],
        ],
      },
    },
  ],
};

describe('territory-map helpers', () => {
  it('normaliza nomes de cidades removendo acentos e caixa', () => {
    expect(normalizeCity('  Feira de Santana  ')).toBe('feira de santana');
    expect(normalizeCity('Vitória da Conquista')).toBe('vitoria da conquista');
    expect(normalizeCity(null)).toBe('');
  });

  it('retorna cores fixas para territórios conhecidos e faz fallback seguro', () => {
    expect(getTerritoryColor('26')).toBe('#e9bb78');
    expect(getTerritoryColor('999')).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('agrupa programas por território e município via GeoJSON', () => {
    const programs: GraduateProgramSummary[] = [
      { id: '1', name: 'Programa A', city: 'SALVADOR', state: 'BA' },
      { id: '2', name: 'Programa B', city: 'Salvador', state: 'BA' },
      { id: '3', name: 'Programa C', city: 'Feira de Santana', state: 'BA' },
      {
        id: '4',
        name: 'Programa D',
        city: 'Município Desconhecido',
        state: 'BA',
      },
    ];

    const grouped = groupProgramsByGeoJson(sampleGeoJson, programs);
    expect(grouped.territoryGroups.get('26')?.programs).toHaveLength(2);
    expect(grouped.territoryGroups.get('19')?.programs).toHaveLength(1);
    expect(grouped.municipalityGroups.get('salvador')?.programs).toHaveLength(
      2,
    );
  });

  it('gera MultiLineString com fronteiras externas dos territórios', () => {
    const borders = getTerritoryBorders(sampleGeoJson);
    expect(borders.type).toBe('Feature');
    expect(borders.geometry.type).toBe('MultiLineString');
    expect(borders.geometry.coordinates.length).toBe(8);
  });
});
