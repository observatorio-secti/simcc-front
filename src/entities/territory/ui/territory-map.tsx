import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { FacetResult } from '@/api/types';
import { cn } from '@/shared/lib/cn';
import {
  TERRITORY_MAP_COLORS,
  territoryFill,
} from '@/shared/lib/design-tokens';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import {
  facetCounts,
  getTerritoryBorders,
  indexGeoJson,
  MUNICIPAL_ZOOM,
  type MunicipalityProperties,
} from '../geo';
import { formatTerritoryName } from '../model';
import { territoryGeoJsonQueryOptions } from '../queries';

function countLabel(count: number, [singular, plural]: TerritoryMapNoun) {
  return `${count.toLocaleString('pt-BR')} ${count === 1 ? singular : plural}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function createMarkerIcon(count: number) {
  return L.divIcon({
    className: 'territory-marker-wrapper',
    html: `<div class="flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-white bg-neutral-800 px-1 text-xs font-bold text-white shadow-sm">${count.toLocaleString('pt-BR')}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function centerOf(features: GeoJSON.GeoJsonObject): L.LatLng | null {
  try {
    const bounds = L.geoJSON(features).getBounds();
    return bounds.isValid() ? bounds.getCenter() : null;
  } catch {
    // Ambiente sem layout real (jsdom).
    return null;
  }
}

/** Substantivo contado pelo mapa: `['programa', 'programas']`. */
export type TerritoryMapNoun = readonly [singular: string, plural: string];

export interface TerritoryMapProps {
  /** Faceta `territory_city` da resposta (contagens do resultado inteiro). */
  facet: FacetResult | undefined;
  loading?: boolean;
  /** Códigos SEI no filtro `identity_territory`. */
  selectedTerritories?: readonly string[];
  /** Códigos IBGE no filtro `city_code`. */
  selectedCities?: readonly string[];
  onToggleTerritory: (code: string) => void;
  onToggleCity: (ibge: string) => void;
  /** Limpa os filtros de território e de município. */
  onClear?: () => void;
  noun: TerritoryMapNoun;
  /** Título da lista lateral. */
  listTitle?: string;
  className?: string;
}

/**
 * Mapa Leaflet dos Territórios de Identidade da Bahia alimentado pela faceta
 * `territory_city`: cor por território, contagem por território (ou por
 * município, a partir do zoom 8) e filtro ao clicar.
 */
export default function TerritoryMap({
  facet,
  loading = false,
  selectedTerritories = [],
  selectedCities = [],
  onToggleTerritory,
  onToggleCity,
  onClear,
  noun,
  listTitle = 'Territórios',
  className,
}: TerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState(7);

  const geoQuery = useQuery(territoryGeoJsonQueryOptions());
  const geoJson = geoQuery.data ?? null;

  const index = useMemo(
    () => (geoJson ? indexGeoJson(geoJson) : null),
    [geoJson],
  );
  const borders = useMemo(
    () => (geoJson ? getTerritoryBorders(geoJson) : null),
    [geoJson],
  );
  const counts = useMemo(() => facetCounts(facet), [facet]);

  const territorySet = useMemo(
    () => new Set(selectedTerritories),
    [selectedTerritories],
  );
  const citySet = useMemo(() => new Set(selectedCities), [selectedCities]);

  const sortedTerritories = useMemo(
    () =>
      Array.from(counts.territories.values())
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count),
    [counts],
  );

  // Cria o mapa quando o contêiner existe (depois do GeoJSON carregar).
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current || !geoJson) return;

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
    map.on('zoomend', () => setZoom(map.getZoom()));
    mapRef.current = map;
    layerGroupRef.current = layerGroup;

    try {
      const bounds = L.geoJSON(
        geoJson as unknown as GeoJSON.GeoJsonObject,
      ).getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [16, 16] });
    } catch {
      // Ambiente sem layout real (jsdom).
    }

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, [geoJson]);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup || !geoJson || !index) return;

    layerGroup.clearLayers();
    const detailed = zoom >= MUNICIPAL_ZOOM;

    const isSelected = (props: MunicipalityProperties) =>
      citySet.has(props.id) || territorySet.has(String(props.territorio_id));

    const geoLayer = L.geoJSON(geoJson as unknown as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const props = feature?.properties as MunicipalityProperties;
        const territoryId = String(props.territorio_id);
        const hasResults =
          (counts.territories.get(territoryId)?.count ?? 0) > 0;
        const selected = isSelected(props);
        return {
          fillColor: hasResults
            ? territoryFill(territoryId)
            : TERRITORY_MAP_COLORS.empty,
          fillOpacity: selected ? 1 : hasResults ? 0.85 : 0.65,
          weight: selected ? 2 : detailed ? 0.6 : 0,
          color: selected
            ? TERRITORY_MAP_COLORS.selected
            : TERRITORY_MAP_COLORS.border,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties as MunicipalityProperties;
        const territoryId = String(props.territorio_id);
        const territory = counts.territories.get(territoryId);
        const territoryName = formatTerritoryName(
          territory?.label ?? props.territorio_identidade,
        );

        const lines = [`<strong>${escapeHtml(territoryName)}</strong>`];
        if (detailed) {
          const city = counts.cities.get(props.id);
          lines.push(
            `<span>${escapeHtml(props.name)}${city ? `: ${countLabel(city.count, noun)}` : ''}</span>`,
          );
        } else if (territory && territory.count > 0) {
          lines.push(`<span>${countLabel(territory.count, noun)}</span>`);
        }
        layer.bindTooltip(lines.join('<br/>'), { sticky: true });

        layer.on('click', () => {
          if (detailed) onToggleCity(props.id);
          else onToggleTerritory(territoryId);
        });

        if (detailed) {
          layer.on({
            mouseover(event) {
              (event.target as L.Path).setStyle({
                weight: 2,
                color: TERRITORY_MAP_COLORS.hover,
              });
            },
            mouseout(event) {
              const selected = isSelected(props);
              (event.target as L.Path).setStyle({
                weight: selected ? 2 : 0.6,
                color: selected
                  ? TERRITORY_MAP_COLORS.selected
                  : TERRITORY_MAP_COLORS.border,
              });
            },
          });
        }
      },
    });
    geoLayer.addTo(layerGroup);

    if (!detailed && borders) {
      L.geoJSON(borders as unknown as GeoJSON.GeoJsonObject, {
        style: {
          color: TERRITORY_MAP_COLORS.border,
          weight: 1.5,
          opacity: 0.9,
        },
        interactive: false,
      }).addTo(layerGroup);
    }

    if (detailed) {
      for (const [ibge, city] of counts.cities) {
        const feature = index.municipalities.get(ibge);
        if (!feature || city.count === 0) continue;
        const center = centerOf(feature as unknown as GeoJSON.GeoJsonObject);
        if (!center) continue;
        L.marker(center, { icon: createMarkerIcon(city.count) })
          .bindTooltip(
            `<strong>${escapeHtml(feature.properties.name)}</strong><br/>${countLabel(city.count, noun)}`,
          )
          .on('click', () => onToggleCity(ibge))
          .addTo(layerGroup);
      }
    } else {
      for (const [code, territory] of counts.territories) {
        const features = index.territoryFeatures.get(code);
        if (!features?.length || territory.count === 0) continue;
        const center = centerOf({
          type: 'FeatureCollection',
          features,
        } as unknown as GeoJSON.GeoJsonObject);
        if (!center) continue;
        L.marker(center, { icon: createMarkerIcon(territory.count) })
          .bindTooltip(
            `<strong>${escapeHtml(formatTerritoryName(territory.label))}</strong><br/>${countLabel(territory.count, noun)}`,
          )
          .on('click', () => onToggleTerritory(code))
          .addTo(layerGroup);
      }
    }
  }, [
    geoJson,
    index,
    borders,
    counts,
    zoom,
    territorySet,
    citySet,
    noun,
    onToggleTerritory,
    onToggleCity,
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

  const hasSelection = territorySet.size > 0 || citySet.size > 0;

  return (
    <div
      data-slot="territory-map"
      aria-busy={loading || undefined}
      className={cn(
        'grid w-full grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_240px]',
        className,
      )}
    >
      <div
        ref={containerRef}
        aria-label="Mapa dos Territórios de Identidade da Bahia"
        className={cn(
          'z-0 h-[360px] w-full overflow-hidden rounded-lg border bg-neutral-100 transition-opacity md:h-[420px] dark:bg-neutral-900',
          loading && 'opacity-60',
        )}
      />

      <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-foreground">
            {listTitle}
          </span>
          {hasSelection && onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onClear}
            >
              Limpar
            </Button>
          )}
        </div>
        <div className="flex max-h-[340px] flex-col gap-1 overflow-y-auto pr-1">
          {loading && sortedTerritories.length === 0 ? (
            Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))
          ) : sortedTerritories.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Nenhum resultado nos territórios.
            </p>
          ) : (
            sortedTerritories.map((territory) => {
              const code = territory.value ?? '';
              const isSelected = territorySet.has(code);
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => onToggleTerritory(code)}
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
                      style={{ backgroundColor: territoryFill(code) }}
                    />
                    <span className="truncate">
                      {formatTerritoryName(territory.label)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 font-semibold tabular-nums',
                      isSelected ? 'text-white' : 'text-muted-foreground',
                    )}
                  >
                    {territory.count.toLocaleString('pt-BR')}
                  </span>
                </button>
              );
            })
          )}
        </div>
        {counts.unassigned && counts.unassigned.count > 0 && (
          <p className="border-t pt-2 text-xs text-muted-foreground">
            {countLabel(counts.unassigned.count, noun)} fora dos territórios da
            Bahia
          </p>
        )}
      </div>
    </div>
  );
}
