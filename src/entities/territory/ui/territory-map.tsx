import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, MapPin } from 'lucide-react';
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
import { formatTerritoryName, TERRITORY_NAMES } from '../model';
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

function createMarkerIcon(count: number, selected = false) {
  return L.divIcon({
    className: 'territory-marker-wrapper',
    html: `<div class="flex h-8 min-w-8 items-center justify-center rounded-full border-2 px-1 text-xs font-bold text-white shadow-sm ${
      selected
        ? 'border-white bg-eng-blue ring-2 ring-eng-blue/40'
        : 'border-white bg-neutral-800'
    }">${count.toLocaleString('pt-BR')}</div>`,
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

function fitFeaturesBounds(
  map: L.Map | null,
  features: GeoJSON.GeoJsonObject,
  options: { padding: [number, number]; minZoom?: number; maxZoom?: number },
) {
  if (!map) return;
  try {
    const bounds = L.geoJSON(features).getBounds();
    if (!bounds.isValid()) return;
    const padding = L.point(options.padding[0] * 2, options.padding[1] * 2);
    const boundsZoom = map.getBoundsZoom(bounds, false, padding);
    const minZoom = options.minZoom ?? map.getMinZoom();
    const maxZoom = options.maxZoom ?? map.getMaxZoom();
    const resolvedZoom = Number.isFinite(boundsZoom) ? boundsZoom : minZoom;
    const targetZoom = Math.max(minZoom, Math.min(maxZoom, resolvedZoom));
    map.setView(bounds.getCenter(), targetZoom, { animate: true });
  } catch {
    // Ambiente sem layout real (jsdom).
  }
}

/** Substantivo contado pelo mapa: `['programa', 'programas']`. */
export type TerritoryMapNoun = readonly [singular: string, plural: string];

export interface TerritoryCityCount {
  ibge: string;
  label: string;
  count: number;
}

export type TerritorySelection =
  | {
      kind: 'territory';
      code: string;
      label: string;
      count: number;
      cities: readonly TerritoryCityCount[];
    }
  | {
      kind: 'city';
      ibge: string;
      label: string;
      territoryCode: string;
      territoryLabel: string;
      count: number;
    };

export interface TerritorySelectionContext {
  selection: TerritorySelection;
  onBackToTerritories: () => void;
  onBackToTerritory: () => void;
  onSelectCity: (ibge: string) => void;
}

export interface TerritoryMapProps {
  /** Faceta `territory_city` da resposta (contagens do resultado inteiro). */
  facet: FacetResult | undefined;
  loading?: boolean;
  /** Códigos SEI aplicados no filtro global `identity_territory`. */
  selectedTerritories?: readonly string[];
  /** Códigos IBGE aplicados no filtro global `city_code`. */
  selectedCities?: readonly string[];
  /** Handler legado de filtro global quando não há `renderSelectionPanel`. */
  onToggleTerritory?: (code: string) => void;
  /** Handler legado de filtro global quando não há `renderSelectionPanel`. */
  onToggleCity?: (ibge: string) => void;
  /** Limpa os filtros globais de território e de município (modo legado). */
  onClear?: () => void;
  /** Renderiza o painel lateral contextual ao selecionar um território ou município. */
  renderSelectionPanel?: (context: TerritorySelectionContext) => ReactNode;
  noun: TerritoryMapNoun;
  /** Título da lista lateral. */
  listTitle?: string;
  className?: string;
}

function territoryActiveCities(
  children:
    | readonly { value: string | null; label: string; count: number }[]
    | null
    | undefined,
): TerritoryCityCount[] {
  return (children ?? [])
    .filter(
      (child): child is { value: string; label: string; count: number } =>
        child.value !== null && child.count > 0,
    )
    .map((child) => ({
      ibge: child.value,
      label: child.label,
      count: child.count,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Mapa Leaflet dos Territórios de Identidade da Bahia alimentado pela faceta
 * `territory_city`: cor por território, contagem por território (ou por
 * município, a partir do zoom 8), zoom no local clicado e painel lateral
 * contextual para explorar a área.
 */
export default function TerritoryMap({
  facet,
  loading = false,
  selectedTerritories = [],
  selectedCities = [],
  onToggleTerritory,
  onToggleCity,
  onClear,
  renderSelectionPanel,
  noun,
  listTitle = 'Territórios',
  className,
}: TerritoryMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [zoom, setZoom] = useState(7);
  const [selection, setSelection] = useState<TerritorySelection | null>(null);

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

  const hasSelectionPanel = Boolean(renderSelectionPanel);

  // Referência atualizada em efeito para que os handlers das camadas Leaflet
  // leiam as props e contagens mais recentes sem reconstruir o mapa.
  const interactionRef = useRef({
    counts,
    hasSelectionPanel,
    onToggleTerritory,
    onToggleCity,
  });
  useEffect(() => {
    interactionRef.current = {
      counts,
      hasSelectionPanel,
      onToggleTerritory,
      onToggleCity,
    };
  });

  const selectTerritory = useCallback(
    (code: string, fallbackLabel?: string) => {
      const {
        counts: currentCounts,
        hasSelectionPanel: panelEnabled,
        onToggleTerritory: toggleTerritory,
      } = interactionRef.current;
      const territory = currentCounts.territories.get(code);
      const features = index?.territoryFeatures.get(code);
      const label =
        territory?.label ??
        fallbackLabel ??
        features?.[0]?.properties.territorio_identidade ??
        TERRITORY_NAMES[code] ??
        code;

      if (panelEnabled) {
        setSelection({
          kind: 'territory',
          code,
          label,
          count: territory?.count ?? 0,
          cities: territoryActiveCities(territory?.children),
        });
      } else {
        toggleTerritory?.(code);
      }
    },
    [index],
  );

  const selectCity = useCallback(
    (
      ibge: string,
      territoryCode: string,
      fallbackCityLabel?: string,
      fallbackTerritoryLabel?: string,
    ) => {
      const {
        counts: currentCounts,
        hasSelectionPanel: panelEnabled,
        onToggleCity: toggleCity,
      } = interactionRef.current;
      const feature = index?.municipalities.get(ibge);
      const city = currentCounts.cities.get(ibge);
      const territory = currentCounts.territories.get(territoryCode);

      if (panelEnabled) {
        setSelection({
          kind: 'city',
          ibge,
          label:
            city?.label ??
            fallbackCityLabel ??
            feature?.properties.name ??
            ibge,
          territoryCode,
          territoryLabel:
            territory?.label ??
            fallbackTerritoryLabel ??
            feature?.properties.territorio_identidade ??
            TERRITORY_NAMES[territoryCode] ??
            territoryCode,
          count: city?.count ?? 0,
        });
      } else {
        toggleCity?.(ibge);
      }
    },
    [index],
  );

  function handleBackToTerritories() {
    setSelection(null);
  }

  function handleBackToTerritory() {
    if (selection?.kind !== 'city') return;
    const territory = counts.territories.get(selection.territoryCode);
    setSelection({
      kind: 'territory',
      code: selection.territoryCode,
      label: selection.territoryLabel,
      count: territory?.count ?? 0,
      cities: territoryActiveCities(territory?.children),
    });
  }

  function handleSelectCityFromPanel(ibge: string) {
    if (!selection) return;
    const territoryCode =
      selection.kind === 'territory' ? selection.code : selection.territoryCode;
    const territoryLabel =
      selection.kind === 'territory'
        ? selection.label
        : selection.territoryLabel;
    const feature = index?.municipalities.get(ibge);
    const city = counts.cities.get(ibge);
    const territory = counts.territories.get(territoryCode);

    setSelection({
      kind: 'city',
      ibge,
      label: city?.label ?? feature?.properties.name ?? ibge,
      territoryCode,
      territoryLabel:
        territory?.label ??
        territoryLabel ??
        feature?.properties.territorio_identidade ??
        TERRITORY_NAMES[territoryCode] ??
        territoryCode,
      count: city?.count ?? 0,
    });
  }

  function handleResetView() {
    setSelection(null);
    if (geoJson) {
      fitFeaturesBounds(
        mapRef.current,
        geoJson as unknown as GeoJSON.GeoJsonObject,
        {
          padding: [16, 16],
        },
      );
    }
  }

  const prevSelectionRef = useRef<TerritorySelection | null>(null);
  useEffect(() => {
    if (prevSelectionRef.current === selection) return;
    prevSelectionRef.current = selection;
    const map = mapRef.current;
    if (!map || !geoJson || !index) return;

    if (!selection) {
      fitFeaturesBounds(map, geoJson as unknown as GeoJSON.GeoJsonObject, {
        padding: [16, 16],
      });
      return;
    }

    if (selection.kind === 'territory') {
      const features = index.territoryFeatures.get(selection.code);
      if (features?.length) {
        fitFeaturesBounds(
          map,
          {
            type: 'FeatureCollection',
            features,
          } as unknown as GeoJSON.GeoJsonObject,
          { padding: [24, 24], minZoom: MUNICIPAL_ZOOM, maxZoom: 10 },
        );
      }
      return;
    }

    const feature = index.municipalities.get(selection.ibge);
    if (feature) {
      fitFeaturesBounds(map, feature as unknown as GeoJSON.GeoJsonObject, {
        padding: [32, 32],
        minZoom: MUNICIPAL_ZOOM,
        maxZoom: 11,
      });
    }
  }, [selection, geoJson, index]);

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

    fitFeaturesBounds(map, geoJson as unknown as GeoJSON.GeoJsonObject, {
      padding: [16, 16],
    });

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
    const focusedTerritoryCode =
      selection?.kind === 'territory'
        ? selection.code
        : selection?.kind === 'city'
          ? selection.territoryCode
          : null;
    const focusedCityIbge = selection?.kind === 'city' ? selection.ibge : null;

    const isHighlighted = (props: MunicipalityProperties) => {
      const territoryId = String(props.territorio_id);
      if (focusedCityIbge) return props.id === focusedCityIbge;
      if (focusedTerritoryCode) return territoryId === focusedTerritoryCode;
      return citySet.has(props.id) || territorySet.has(territoryId);
    };

    const geoLayer = L.geoJSON(geoJson as unknown as GeoJSON.GeoJsonObject, {
      style: (feature) => {
        const props = feature?.properties as MunicipalityProperties;
        const territoryId = String(props.territorio_id);
        const hasResults =
          (counts.territories.get(territoryId)?.count ?? 0) > 0;
        const highlighted = isHighlighted(props);
        const dimmedByFocus =
          focusedTerritoryCode !== null && territoryId !== focusedTerritoryCode;

        return {
          fillColor: hasResults
            ? territoryFill(territoryId)
            : TERRITORY_MAP_COLORS.empty,
          fillOpacity: dimmedByFocus
            ? 0.35
            : highlighted
              ? 1
              : hasResults
                ? 0.85
                : 0.65,
          weight:
            focusedCityIbge === props.id
              ? 2.5
              : highlighted
                ? 1.5
                : detailed
                  ? 0.6
                  : 0,
          color: highlighted
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
          if (detailed) {
            selectCity(
              props.id,
              territoryId,
              props.name,
              props.territorio_identidade,
            );
          } else {
            selectTerritory(territoryId, props.territorio_identidade);
          }
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
              const highlighted = isHighlighted(props);
              (event.target as L.Path).setStyle({
                weight:
                  focusedCityIbge === props.id ? 2.5 : highlighted ? 1.5 : 0.6,
                color: highlighted
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
        const territoryId = String(feature.properties.territorio_id);
        if (focusedTerritoryCode && territoryId !== focusedTerritoryCode) {
          continue;
        }
        const center = centerOf(feature as unknown as GeoJSON.GeoJsonObject);
        if (!center) continue;
        L.marker(center, {
          icon: createMarkerIcon(city.count, focusedCityIbge === ibge),
        })
          .bindTooltip(
            `<strong>${escapeHtml(feature.properties.name)}</strong><br/>${countLabel(city.count, noun)}`,
          )
          .on('click', () =>
            selectCity(
              ibge,
              territoryId,
              feature.properties.name,
              feature.properties.territorio_identidade,
            ),
          )
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
        L.marker(center, {
          icon: createMarkerIcon(
            territory.count,
            focusedTerritoryCode === code,
          ),
        })
          .bindTooltip(
            `<strong>${escapeHtml(formatTerritoryName(territory.label))}</strong><br/>${countLabel(territory.count, noun)}`,
          )
          .on('click', () => selectTerritory(code, territory.label))
          .addTo(layerGroup);
      }
    }
  }, [
    geoJson,
    index,
    borders,
    counts,
    zoom,
    selection,
    territorySet,
    citySet,
    noun,
    selectCity,
    selectTerritory,
  ]);

  if (geoQuery.isPending) {
    return (
      <Skeleton
        data-testid="territory-map-skeleton"
        className={cn('h-[420px] w-full rounded-lg md:h-[480px]', className)}
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
  const showDetailPanel =
    selection !== null && renderSelectionPanel !== undefined;
  const showResetZoom = selection !== null || zoom >= MUNICIPAL_ZOOM;

  return (
    <div
      data-slot="territory-map"
      aria-busy={loading || undefined}
      className={cn(
        'grid w-full grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_340px]',
        className,
      )}
    >
      <div className="relative">
        <div
          ref={containerRef}
          aria-label="Mapa dos Territórios de Identidade da Bahia"
          className={cn(
            'z-0 h-[360px] w-full overflow-hidden rounded-lg border bg-neutral-100 transition-opacity md:h-[480px] dark:bg-neutral-900',
            loading && 'opacity-60',
          )}
        />
        {showResetZoom && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetView}
            className="absolute top-3 right-3 z-[500] bg-card/95 shadow-sm backdrop-blur-xs"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Ver toda a Bahia
          </Button>
        )}
      </div>

      {showDetailPanel ? (
        renderSelectionPanel({
          selection,
          onBackToTerritories: handleBackToTerritories,
          onBackToTerritory: handleBackToTerritory,
          onSelectCity: handleSelectCityFromPanel,
        })
      ) : (
        <div className="flex h-[420px] flex-col gap-2 rounded-lg border bg-card p-3 md:h-[480px]">
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
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
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
                    onClick={() => selectTerritory(code, territory.label)}
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
              {countLabel(counts.unassigned.count, noun)} fora dos territórios
              da Bahia
            </p>
          )}
        </div>
      )}
    </div>
  );
}
