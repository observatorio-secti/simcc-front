import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { GraduateProgramSummary } from '@/entities/graduate-program/model';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  EMPTY_FILL,
  MUNICIPAL_ZOOM,
  getTerritoryBorders,
  getTerritoryColor,
  groupProgramsByGeoJson,
  isValidTerritoryGeoJson,
  normalizeCity,
  type MunicipalityProperties,
  type TerritoryGeoJson,
} from './territory-geo';

function loadGeoJson(
  url: string,
  signal?: AbortSignal,
): Promise<TerritoryGeoJson> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    const onAbort = () => {
      xhr.abort();
      reject(new DOMException('Solicitação cancelada', 'AbortError'));
    };

    if (signal?.aborted) {
      onAbort();
      return;
    }
    signal?.addEventListener('abort', onAbort, { once: true });

    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort);
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error('Não foi possível carregar o mapa dos territórios.'));
        return;
      }
      const parsed =
        typeof xhr.response === 'string'
          ? (JSON.parse(xhr.response) as unknown)
          : (xhr.response as unknown);
      if (!isValidTerritoryGeoJson(parsed)) {
        reject(new Error('GeoJSON de territórios inválido.'));
        return;
      }
      resolve(parsed);
    };

    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort);
      reject(new Error('Erro de rede ao carregar o mapa dos territórios.'));
    };

    xhr.send();
  });
}

function createMarkerIcon(count: number) {
  return L.divIcon({
    className: 'territory-marker-wrapper',
    html: `<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-neutral-800 text-xs font-bold text-white shadow-sm">${count}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export interface TerritoryMapProps {
  programs: readonly GraduateProgramSummary[];
  selectedCities?: readonly string[];
  onSelectCities?: (cities: string[]) => void;
  geoJsonUrl?: string;
  className?: string;
}

/**
 * Mapa Leaflet dos Territórios de Identidade da Bahia com contagem de
 * programas de pós-graduação e filtro interativo por território ou município.
 */
export function TerritoryMap({
  programs,
  selectedCities = [],
  onSelectCities,
  geoJsonUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/territorio_relacionado.json`,
  className,
}: TerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState(7);

  const geoQuery = useQuery({
    queryKey: ['graduate-programs', 'territory-geojson', geoJsonUrl],
    queryFn: ({ signal }) => loadGeoJson(geoJsonUrl, signal),
    staleTime: Infinity,
  });

  const geoJson = geoQuery.data ?? null;

  const grouped = useMemo(
    () => (geoJson ? groupProgramsByGeoJson(geoJson, programs) : null),
    [geoJson, programs],
  );

  const territoryBorders = useMemo(
    () => (geoJson ? getTerritoryBorders(geoJson) : null),
    [geoJson],
  );

  const selectedCitySet = useMemo(
    () => new Set(selectedCities.map((c) => normalizeCity(c))),
    [selectedCities],
  );

  const sortedTerritories = useMemo(() => {
    if (!grouped) return [];
    return Array.from(grouped.territoryGroups.values()).sort(
      (a, b) => b.programs.length - a.programs.length,
    );
  }, [grouped]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [-12.5, -41.7],
      zoom: 7,
      minZoom: 6,
      maxZoom: 11,
      boxZoom: false,
      zoomControl: true,
      attributionControl: false,
    });

    const layerGroup = L.layerGroup().addTo(map);
    map.on('zoomend', () => {
      setZoom(map.getZoom());
    });

    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, [geoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJson) return;
    try {
      const bounds = L.geoJSON(
        geoJson as unknown as GeoJSON.GeoJsonObject,
      ).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [16, 16] });
      }
    } catch {
      // Ambiente sem layout real (ex.: jsdom)
    }
  }, [geoJson]);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup || !geoJson || !grouped) return;

    layerGroup.clearLayers();
    const detailed = zoom >= MUNICIPAL_ZOOM;

    const geoLayer = L.geoJSON(geoJson as unknown as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const props = feature?.properties as MunicipalityProperties | undefined;
        const tId = props ? String(props.territorio_id) : '';
        const hasPrograms = grouped.territoryGroups.has(tId);
        const isSelected =
          props && selectedCitySet.has(normalizeCity(props.name));

        return {
          fillColor: hasPrograms ? getTerritoryColor(tId) : EMPTY_FILL,
          fillOpacity: isSelected ? 1 : hasPrograms ? 0.85 : 0.65,
          weight: isSelected ? 2 : detailed ? 0.6 : 0,
          color: isSelected ? '#024A60' : '#ffffff',
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties as MunicipalityProperties;
        const tGroup = grouped.territoryGroups.get(String(props.territorio_id));
        const count = tGroup?.programs.length ?? 0;

        const tooltipLines = [
          `<strong>${props.territorio_identidade}</strong>`,
        ];
        if (detailed) {
          tooltipLines.push(`<span>Município: ${props.name}</span>`);
        } else if (count > 0) {
          const unit = count === 1 ? 'programa' : 'programas';
          tooltipLines.push(`<span>${count} ${unit}</span>`);
        }
        layer.bindTooltip(tooltipLines.join('<br/>'), { sticky: true });

        if (detailed && 'setStyle' in layer) {
          layer.on({
            mouseover(event) {
              (event.target as L.Path).setStyle({
                weight: 2,
                color: '#171717',
              });
            },
            mouseout(event) {
              const isSel = selectedCitySet.has(normalizeCity(props.name));
              (event.target as L.Path).setStyle({
                weight: isSel ? 2 : 0.6,
                color: isSel ? '#024A60' : '#ffffff',
              });
            },
          });
        }

        if (onSelectCities) {
          layer.on({
            click() {
              if (detailed) {
                onSelectCities([props.name]);
              } else {
                const cities =
                  grouped.territoryCities.get(String(props.territorio_id)) ??
                  [];
                onSelectCities(cities);
              }
            },
          });
        }
      },
    });
    geoLayer.addTo(layerGroup);

    if (!detailed && territoryBorders) {
      L.geoJSON(territoryBorders as unknown as GeoJSON.GeoJsonObject, {
        style: {
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
        },
        interactive: false,
      }).addTo(layerGroup);
    }

    if (detailed) {
      for (const mGroup of grouped.municipalityGroups.values()) {
        try {
          const bounds = L.geoJSON(
            mGroup.feature as unknown as GeoJSON.GeoJsonObject,
          ).getBounds();
          if (!bounds.isValid()) continue;
          const marker = L.marker(bounds.getCenter(), {
            icon: createMarkerIcon(mGroup.programs.length),
          });
          marker.bindTooltip(
            `<strong>${mGroup.name}</strong><br/>${mGroup.programs.length} ${mGroup.programs.length === 1 ? 'programa' : 'programas'}`,
          );
          if (onSelectCities) {
            marker.on('click', () => onSelectCities([mGroup.name]));
          }
          marker.addTo(layerGroup);
        } catch {
          // Ignora bounds inválidos em ambiente de teste
        }
      }
    } else {
      for (const tGroup of grouped.territoryGroups.values()) {
        const features = grouped.territoryFeatures.get(tGroup.id);
        if (!features?.length) continue;
        try {
          const fc: TerritoryGeoJson = {
            type: 'FeatureCollection',
            features,
          };
          const bounds = L.geoJSON(
            fc as unknown as GeoJSON.GeoJsonObject,
          ).getBounds();
          if (!bounds.isValid()) continue;
          const marker = L.marker(bounds.getCenter(), {
            icon: createMarkerIcon(tGroup.programs.length),
          });
          marker.bindTooltip(
            `<strong>${tGroup.name}</strong><br/>${tGroup.programs.length} ${tGroup.programs.length === 1 ? 'programa' : 'programas'}`,
          );
          if (onSelectCities) {
            marker.on('click', () => onSelectCities(tGroup.cities));
          }
          marker.addTo(layerGroup);
        } catch {
          // Ignora bounds inválidos em ambiente de teste
        }
      }
    }
  }, [
    geoJson,
    grouped,
    territoryBorders,
    zoom,
    selectedCitySet,
    onSelectCities,
  ]);

  if (geoQuery.isPending) {
    return (
      <Skeleton
        data-testid="territory-map-skeleton"
        className={cn('h-[380px] w-full rounded-lg', className)}
      />
    );
  }

  if (geoQuery.isError || !geoJson) {
    return (
      <div
        role="alert"
        className={cn(
          'flex h-[240px] flex-col items-center justify-center gap-2 rounded-lg border bg-card p-6 text-center text-sm text-muted-foreground',
          className,
        )}
      >
        <MapPin className="size-6 text-neutral-400" aria-hidden />
        <p>Não foi possível carregar o mapa dos territórios.</p>
      </div>
    );
  }

  return (
    <div
      data-slot="territory-map"
      className={cn(
        'grid w-full grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_240px]',
        className,
      )}
    >
      <div
        ref={containerRef}
        aria-label="Mapa dos Territórios de Identidade da Bahia"
        className="z-0 h-[360px] w-full overflow-hidden rounded-lg border bg-neutral-100 md:h-[420px] dark:bg-neutral-900"
      />

      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            Territórios com oferta
          </span>
          {selectedCities.length > 0 && onSelectCities && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onSelectCities([])}
            >
              Limpar
            </Button>
          )}
        </div>
        <div className="flex max-h-[340px] flex-col gap-1 overflow-y-auto pr-1">
          {sortedTerritories.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Nenhum programa mapeado nos territórios.
            </p>
          ) : (
            sortedTerritories.map((territory) => {
              const isSelected = territory.cities.some((c) =>
                selectedCitySet.has(normalizeCity(c)),
              );
              return (
                <button
                  key={territory.id}
                  type="button"
                  onClick={() =>
                    onSelectCities?.(isSelected ? [] : territory.cities)
                  }
                  aria-pressed={isSelected}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                    isSelected
                      ? 'bg-eng-blue text-white'
                      : 'text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800',
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-xs border border-black/10"
                      style={{
                        backgroundColor: getTerritoryColor(territory.id),
                      }}
                    />
                    <span className="truncate">{territory.name}</span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 font-semibold tabular-nums',
                      isSelected ? 'text-white' : 'text-muted-foreground',
                    )}
                  >
                    {territory.programs.length}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
