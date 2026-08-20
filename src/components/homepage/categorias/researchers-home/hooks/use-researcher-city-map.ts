import { useMemo } from 'react';
import { CityData, Research } from '../../../../../types/researcher';
import municipios from '../municipios.json';

const normalizeCityName = (cityName: string) => {
  return (cityName || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
};

export function useResearcherCityMap(researchers: Research[]): CityData[] {
  return useMemo(() => {
    const cityMap = new Map<string, CityData>();

    const municipioMap = new Map(
      (municipios as Array<{ nome: string; latitude: number; longitude: number }>).map((m) => [
        normalizeCityName(m.nome),
        m,
      ]),
    );

    researchers.forEach((r) => {
      if (!r.city) return;

      const normalizedCity = normalizeCityName(r.city);
      const municipio = municipioMap.get(normalizedCity);

      if (!municipio) {
        return;
      }

      if (!cityMap.has(normalizedCity)) {
        cityMap.set(normalizedCity, {
          nome: r.city,
          latitude: municipio.latitude,
          longitude: municipio.longitude,
          pesquisadores: 1,
          professores: [r.name],
          lattes_10_id: r.lattes_10_id,
        });
      } else {
        const city = cityMap.get(normalizedCity)!;
        city.pesquisadores += 1;
        city.professores.push(r.name);
      }
    });

    return Array.from(cityMap.values());
  }, [researchers]);
}
