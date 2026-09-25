// Mapa dos Territórios de Identidade para a busca por perfil (v2).
//
// Diferente do mapa da busca antiga (mapa-researcher-v2), que agrupa no navegador
// os pesquisadores carregados, este consome os facets `identity_territory` e
// `city`: as contagens cobrem o resultado inteiro e clicar num território ou
// cidade aplica o filtro correspondente. Paleta, bordas e GeoJSON são os mesmos.
import { useEffect, useMemo, useState } from 'react';
import {
  GeoJSON,
  MapContainer,
  Marker,
  Tooltip,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Check } from 'lucide-react';
import { Skeleton } from '../../../ui/skeleton';
import { cn } from '../../../../lib/utils';
import { FacetItemV2, FacetV2 } from '../../../../types/researcher-v2';
import {
  EMPTY_FILL,
  FitBounds,
  getColor,
  getTerritoryBorders,
  MAP_BACKGROUND,
  Municipality,
  MUNICIPAL_ZOOM,
  normalizeCity,
  TerritoryGeoJson,
} from '../researchers-home/mapa-researcher-v2';
import { formatTerritory } from './facets/facet-registry';

const GEOJSON_URL = `${import.meta.env.BASE_URL}territorio_relacionado.json`;
const MAP_HEIGHT = 'h-[clamp(350px,60vh,650px)]';

interface ProfileTerritoryMapProps {
  territoryFacet?: FacetV2;
  cityFacet?: FacetV2;
  onToggleTerritory: (value: string) => void;
  onToggleCity: (value: string) => void;
}

interface TerritoryEntry {
  id: string;
  name: string;
  features: Municipality[];
  item?: FacetItemV2;
}

interface MarkerEntry {
  key: string;
  name: string;
  count: number;
  selected: boolean;
  position: L.LatLng;
  onClick: () => void;
}

function useTerritoryGeoJson() {
  const [geoJson, setGeoJson] = useState<TerritoryGeoJson | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch(GEOJSON_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Erro ao carregar GeoJSON');
        return response.json();
      })
      .then((data: TerritoryGeoJson) => setGeoJson(data))
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Erro ao carregar mapa:', err);
          setError(true);
        }
      });
    return () => controller.abort();
  }, []);

  return { geoJson, error };
}

function markerIcon(count: number, selected: boolean) {
  return L.divIcon({
    className: 'territory-marker-wrapper',
    html: `
      <div class="territory-marker flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 font-bold text-white shadow-[0_2px_6px_#0004] ${
        selected
          ? 'border-[#559FB8] bg-[#024A60] ring-2 ring-[#559FB8]'
          : 'border-white bg-slate-800'
      }">
        ${count.toLocaleString('pt-BR')}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

export function ProfileTerritoryMap({
  territoryFacet,
  cityFacet,
  onToggleTerritory,
  onToggleCity,
}: ProfileTerritoryMapProps) {
  const { geoJson, error } = useTerritoryGeoJson();

  // Territórios do GeoJSON com o item do facet correspondente (casado pelo nome).
  const territories = useMemo(() => {
    const result: Record<string, TerritoryEntry> = {};
    if (!geoJson) return result;

    const facetByName = new Map(
      (territoryFacet?.items ?? []).map((item) => [
        normalizeCity(item.label),
        item,
      ]),
    );

    geoJson.features.forEach((feature) => {
      const { territorio_id, territorio_identidade } = feature.properties;
      const id = String(territorio_id);
      if (!result[id]) {
        result[id] = {
          id,
          name: territorio_identidade,
          features: [],
          item: facetByName.get(normalizeCity(territorio_identidade)),
        };
      }
      result[id].features.push(feature);
    });
    return result;
  }, [geoJson, territoryFacet]);

  // Valores do facet que não existem no GeoJSON (ex.: vínculos fora da Bahia).
  const unmatchedTerritories = useMemo(() => {
    const known = new Set(
      Object.values(territories).map((territory) =>
        normalizeCity(territory.name),
      ),
    );
    return (territoryFacet?.items ?? []).filter(
      (item) => !known.has(normalizeCity(item.label)),
    );
  }, [territories, territoryFacet]);

  const territoryMarkers = useMemo<MarkerEntry[]>(
    () =>
      Object.values(territories)
        .filter((territory) => territory.item && territory.item.count > 0)
        .map((territory) => {
          const item = territory.item as FacetItemV2;
          const bounds = L.geoJSON({
            type: 'FeatureCollection',
            features: territory.features,
          } as TerritoryGeoJson).getBounds();
          return {
            key: `territory-${territory.id}`,
            name: formatTerritory(territory.name),
            count: item.count,
            selected: item.selected,
            position: bounds.getCenter(),
            onClick: () => onToggleTerritory(item.value),
          };
        }),
    [territories, onToggleTerritory],
  );

  const cityMarkers = useMemo<MarkerEntry[]>(() => {
    if (!geoJson) return [];
    const cityIndex = new Map(
      geoJson.features.map((feature) => [
        normalizeCity(feature.properties.name),
        feature,
      ]),
    );
    return (cityFacet?.items ?? []).flatMap((item) => {
      const feature = cityIndex.get(normalizeCity(item.label));
      if (!feature || item.count === 0) return [];
      return [
        {
          key: `city-${item.value}`,
          name: feature.properties.name,
          count: item.count,
          selected: item.selected,
          position: L.geoJSON(feature).getBounds().getCenter(),
          onClick: () => onToggleCity(item.value),
        },
      ];
    });
  }, [geoJson, cityFacet, onToggleCity]);

  if (error) {
    return (
      <div className="p-6 text-sm text-muted-foreground" role="alert">
        Não foi possível carregar o mapa.
      </div>
    );
  }

  if (!geoJson) {
    return <Skeleton className={cn('w-full', MAP_HEIGHT)} />;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
      <MapContainer
        center={[-12.5, -41.7]}
        zoom={7}
        minZoom={6}
        maxZoom={11}
        boxZoom={false}
        zoomControl
        style={{ backgroundColor: MAP_BACKGROUND }}
        className={cn(
          'z-0 min-w-0 w-full rounded-lg border border-slate-200 dark:border-neutral-800 [&:focus:not(:focus-visible)]:outline-none [&_.leaflet-interactive:focus:not(:focus-visible)]:outline-none',
          MAP_HEIGHT,
        )}
      >
        <FitBounds geoJson={geoJson} />
        <MapLayers
          geoJson={geoJson}
          territories={territories}
          territoryMarkers={territoryMarkers}
          cityMarkers={cityMarkers}
          onToggleTerritory={onToggleTerritory}
        />
      </MapContainer>

      <TerritoryLegend
        territories={territories}
        unmatched={unmatchedTerritories}
        onToggleTerritory={onToggleTerritory}
      />
    </div>
  );
}

function MapLayers({
  geoJson,
  territories,
  territoryMarkers,
  cityMarkers,
  onToggleTerritory,
}: {
  geoJson: TerritoryGeoJson;
  territories: Record<string, TerritoryEntry>;
  territoryMarkers: MarkerEntry[];
  cityMarkers: MarkerEntry[];
  onToggleTerritory: (value: string) => void;
}) {
  const [zoom, setZoom] = useState(7);
  useMapEvents({
    zoomend(event) {
      setZoom(event.target.getZoom());
    },
  });
  const detailed = zoom >= MUNICIPAL_ZOOM;
  const borders = useMemo(() => getTerritoryBorders(geoJson), [geoJson]);

  // Recria a camada quando contagens ou seleção mudam (os estilos são estáticos no Leaflet).
  const layerKey = `${detailed}-${Object.values(territories)
    .map((t) => `${t.id}:${t.item?.count ?? 0}:${t.item?.selected ? 1 : 0}`)
    .join(',')}`;

  return (
    <>
      <GeoJSON
        key={layerKey}
        data={geoJson}
        style={(feature) => {
          const territory =
            territories[String(feature?.properties?.territorio_id)];
          const count = territory?.item?.count ?? 0;
          return {
            fillColor: count > 0 ? getColor(territory.id) : EMPTY_FILL,
            fillOpacity: territory?.item?.selected ? 1 : 0.85,
            weight: detailed ? 0.6 : 0,
            color: '#ffffff',
          };
        }}
        onEachFeature={(feature, layer) => {
          const territory =
            territories[String(feature.properties.territorio_id)];
          const count = territory?.item?.count ?? 0;

          const tooltip = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = formatTerritory(
            feature.properties.territorio_identidade,
          );
          tooltip.append(title, document.createElement('br'));
          if (detailed) {
            tooltip.append(
              document.createTextNode(`Município: ${feature.properties.name}`),
              document.createElement('br'),
            );
          }
          tooltip.append(
            document.createTextNode(
              count > 0
                ? `${count.toLocaleString('pt-BR')} pesquisador${count !== 1 ? 'es' : ''} · clique para filtrar`
                : 'Sem pesquisadores',
            ),
          );
          layer.bindTooltip(tooltip, { sticky: true });

          if (territory?.item && count > 0) {
            const value = territory.item.value;
            layer.on({ click: () => onToggleTerritory(value) });
          }
        }}
      />

      {!detailed && (
        <GeoJSON
          data={borders}
          interactive={false}
          style={{ color: '#6b7280', weight: 1.2, opacity: 0.9 }}
        />
      )}

      {(detailed ? cityMarkers : territoryMarkers).map((marker) => (
        <Marker
          key={`${marker.key}-${marker.selected}`}
          position={marker.position}
          icon={markerIcon(marker.count, marker.selected)}
          title={`${marker.name}: ${marker.count} pesquisadores`}
          eventHandlers={{ click: marker.onClick }}
        >
          <Tooltip direction="top">
            <strong>{marker.name}</strong>
            <br />
            {marker.count.toLocaleString('pt-BR')} pesquisador
            {marker.count !== 1 ? 'es' : ''}
            <br />
            {marker.selected
              ? 'Clique para remover o filtro'
              : 'Clique para filtrar'}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

function TerritoryLegend({
  territories,
  unmatched,
  onToggleTerritory,
}: {
  territories: Record<string, TerritoryEntry>;
  unmatched: FacetItemV2[];
  onToggleTerritory: (value: string) => void;
}) {
  const entries = Object.values(territories).sort(
    (a, b) => Number(a.id) - Number(b.id),
  );
  const unmatchedCount = unmatched.reduce((sum, item) => sum + item.count, 0);

  return (
    <div
      className={cn(
        'flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white text-sm dark:border-neutral-800 dark:bg-neutral-900',
        'md:max-h-[clamp(350px,60vh,650px)]',
      )}
    >
      <div className="border-b border-slate-200 px-3 py-2.5 font-semibold dark:border-neutral-800">
        Territórios de Identidade
      </div>

      <div className="grid content-start grid-cols-1 gap-0.5 overflow-y-auto p-2 sm:grid-cols-2 md:grid-cols-1">
        {entries.map((territory) => {
          const item = territory.item;
          const count = item?.count ?? 0;
          const clickable = Boolean(item) && (count > 0 || item?.selected);

          return (
            <button
              type="button"
              key={territory.id}
              disabled={!clickable}
              onClick={() => item && onToggleTerritory(item.value)}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                clickable
                  ? 'hover:bg-slate-100 dark:hover:bg-neutral-800'
                  : 'cursor-default opacity-60',
                item?.selected && 'bg-eng-blue/15 dark:bg-eng-blue/20',
              )}
            >
              <div
                className="h-4 w-4 shrink-0 rounded-[4px] border border-black/10 dark:border-white/10 flex items-center justify-center"
                style={{
                  backgroundColor:
                    count > 0 ? getColor(territory.id) : EMPTY_FILL,
                }}
              >
                {item?.selected && (
                  <Check size={12} className="text-eng-dark-blue" />
                )}
              </div>

              <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                <span className="font-semibold">{territory.id}</span>
                <span className="text-muted-foreground"> - </span>
                {formatTerritory(territory.name)}
              </div>

              {count > 0 && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums dark:bg-neutral-800">
                  {count.toLocaleString('pt-BR')}
                </span>
              )}
            </button>
          );
        })}

        {unmatchedCount > 0 && (
          <p
            className="px-2 py-1.5 text-xs text-muted-foreground"
            title={unmatched.map((item) => item.label).join(', ')}
          >
            {unmatchedCount.toLocaleString('pt-BR')} pesquisador
            {unmatchedCount !== 1 ? 'es' : ''} em territórios fora do mapa
          </p>
        )}
      </div>
    </div>
  );
}
