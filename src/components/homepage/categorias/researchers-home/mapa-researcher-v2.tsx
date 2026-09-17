import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  GeoJSON,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import { Loader2, User } from 'lucide-react';
import type {
  Feature,
  FeatureCollection,
  MultiLineString,
  MultiPolygon,
  Polygon,
} from 'geojson';

import 'leaflet/dist/leaflet.css';
import { UserContext } from '../../../../context/context';
import { useModal } from '../../../hooks/use-modal-store';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { loadTerritoryGeoJson } from './territory-geojson';

interface MunicipalityProperties {
  name: string;
  territorio_id: string | number;
  territorio_identidade: string;
}

type Municipality = Feature<Polygon | MultiPolygon, MunicipalityProperties>;
type TerritoryGeoJson = FeatureCollection<
  Polygon | MultiPolygon,
  MunicipalityProperties
>;

interface ResearcherItem {
  id?: string | number;
  name?: string | null;
  city?: string | null;
  description?: string | null;
  university?: string | null;
  abstract?: string | null;
}

interface TerritoryGroup {
  id: string | number;
  name: string;
  items: ResearcherItem[];
}

interface MunicipalityGroup extends TerritoryGroup {
  feature: Municipality;
}

interface MapProps {
  researchers: ResearcherItem[];
  geoJsonUrl?: string;
}

const CORES = [
  '#e6194B',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#42d4f4',
  '#f032e6',
  '#bfef45',
  '#fabed4',
  '#469990',
  '#dcbeff',
  '#9A6324',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#808080',
  '#00e676',
];

const MUNICIPAL_ZOOM = 8;

function normalizeCity(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getColor(id?: string | number) {
  const parsedId = Number(id);
  const numericId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 1;

  return CORES[(numericId - 1) % CORES.length];
}

function getTerritoryBorders(
  geoJson: TerritoryGeoJson,
): Feature<MultiLineString> {
  const segments = new Map<
    string,
    { line: [number[], number[]]; count: number; territoryIds: Set<string> }
  >();

  geoJson.features.forEach((feature) => {
    const polygons =
      feature.geometry.type === 'Polygon'
        ? [feature.geometry.coordinates]
        : feature.geometry.coordinates;

    polygons.forEach((polygon) => {
      polygon.forEach((ring) => {
        for (let index = 1; index < ring.length; index += 1) {
          const start = ring[index - 1];
          const end = ring[index];
          const startKey = start.join(',');
          const endKey = end.join(',');
          const key =
            startKey < endKey
              ? `${startKey}|${endKey}`
              : `${endKey}|${startKey}`;
          const segment = segments.get(key);

          if (segment) {
            segment.count += 1;
            segment.territoryIds.add(String(feature.properties.territorio_id));
          } else {
            segments.set(key, {
              line: [start, end],
              count: 1,
              territoryIds: new Set([String(feature.properties.territorio_id)]),
            });
          }
        }
      });
    });
  });

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

/**
 * Faz o mapa se ajustar automaticamente aos limites
 * do GeoJSON.
 */
function FitBounds({ geoJson }: { geoJson: TerritoryGeoJson }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJson) return;

    const layer = L.geoJSON(geoJson);
    const bounds = layer.getBounds();

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [20, 20],
      });
    }
  }, [geoJson, map]);

  return null;
}

/**
 * Cria um marcador com quantidade dentro dele.
 */
function createMarkerIcon(count: number) {
  return L.divIcon({
    className: 'territory-marker-wrapper',
    html: `
      <div class="territory-marker flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white bg-slate-800 font-bold text-white shadow-[0_2px_6px_#0004]">
        ${count}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function MapLoading({ overlay = false }: { overlay?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 rounded-md bg-slate-100 text-slate-600 dark:bg-neutral-800 dark:text-neutral-300 ${overlay ? 'absolute inset-0 z-[1001]' : 'h-[clamp(350px,60vh,650px)] w-full'}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      Carregando territórios...
    </div>
  );
}

export default function BahiaTerritoriosMap({
  researchers,
  geoJsonUrl = '/territorio_relacionado.json',
}: MapProps) {
  const [geoJson, setGeoJson] = useState<TerritoryGeoJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        setLoading(true);
        setMapReady(false);
        setError(null);

        const geo = (await loadTerritoryGeoJson(
          geoJsonUrl,
        )) as TerritoryGeoJson;

        if (
          geo?.type !== 'FeatureCollection' ||
          !Array.isArray(geo.features) ||
          !geo.features.length ||
          !geo.features.every(
            (feature: Municipality) =>
              feature?.type === 'Feature' &&
              ['Polygon', 'MultiPolygon'].includes(feature.geometry?.type) &&
              Array.isArray(feature.geometry?.coordinates) &&
              typeof feature.properties?.name === 'string' &&
              ['string', 'number'].includes(
                typeof feature.properties?.territorio_id,
              ) &&
              typeof feature.properties?.territorio_identidade === 'string',
          )
        ) {
          throw new Error('GeoJSON de territórios inválido');
        }
        if (!active) return;

        setGeoJson(geo);
      } catch (error) {
        if (!active) return;
        setGeoJson(null);
        setError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o mapa.',
        );
        console.error('Erro ao carregar mapa:', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [geoJsonUrl]);

  /**
   * Cria um índice:
   *
   * camaçari -> feature do GeoJSON
   * salvador -> feature do GeoJSON
   * barreiras -> feature do GeoJSON
   *
   * Isso evita percorrer todo o GeoJSON para cada item.
   */
  const cityIndex = useMemo<Record<string, Municipality>>(() => {
    if (!geoJson) return {};

    const index: Record<string, Municipality> = Object.create(null);

    geoJson.features.forEach((feature) => {
      const city = normalizeCity(feature.properties?.name);

      if (city) {
        index[city] = feature;
      }
    });

    return index;
  }, [geoJson]);

  /**
   * Agrupa todas as features municipais que pertencem
   * ao mesmo território.
   */
  const territories = useMemo<
    Record<
      string,
      { id: string | number; name: string; features: Municipality[] }
    >
  >(() => {
    if (!geoJson) return {};

    const result: Record<
      string,
      { id: string | number; name: string; features: Municipality[] }
    > = Object.create(null);

    geoJson.features.forEach((feature) => {
      const properties = feature.properties;

      const territorioId = properties.territorio_id;

      if (!result[territorioId]) {
        result[territorioId] = {
          id: territorioId,
          name: properties.territorio_identidade,
          features: [],
        };
      }

      result[territorioId].features.push(feature);
    });

    return result;
  }, [geoJson]);

  /**
   * Relaciona:
   *
   * API.city
   *      ↓
   * município GeoJSON
   *      ↓
   * territorio_id
   *      ↓
   * grupo de registros
   */
  const groupedData = useMemo<Record<string, TerritoryGroup>>(() => {
    if (!geoJson) return {};

    const groups: Record<string, TerritoryGroup> = Object.create(null);

    researchers.forEach((item) => {
      const normalizedCity = normalizeCity(item.city);

      const municipality = cityIndex[normalizedCity];

      if (!municipality) {
        return;
      }

      const properties = municipality.properties;

      const territoryId = properties.territorio_id;

      if (!groups[territoryId]) {
        groups[territoryId] = {
          id: territoryId,
          name: properties.territorio_identidade,
          items: [],
        };
      }

      groups[territoryId].items.push(item);
    });

    return groups;
  }, [researchers, cityIndex, geoJson]);

  const municipalityGroups = useMemo<Record<string, MunicipalityGroup>>(() => {
    const groups: Record<string, MunicipalityGroup> = Object.create(null);

    researchers.forEach((item) => {
      const cityKey = normalizeCity(item.city);
      const feature = cityIndex[cityKey];
      if (!feature) return;

      if (!groups[cityKey]) {
        groups[cityKey] = {
          id: cityKey,
          name: feature.properties.name,
          items: [],
          feature,
        };
      }
      groups[cityKey].items.push(item);
    });

    return groups;
  }, [researchers, cityIndex]);

  /**
   * Calcula o centro de cada território.
   *
   * Como o território contém vários municípios,
   * montamos um FeatureCollection apenas daquele
   * território e usamos getBounds().getCenter().
   */
  const territoryMarkers = useMemo(() => {
    return Object.values(groupedData)
      .map((group) => {
        const territory = territories[group.id];

        if (!territory) return null;

        const featureCollection: TerritoryGeoJson = {
          type: 'FeatureCollection',
          features: territory.features,
        };

        const layer = L.geoJSON(featureCollection);
        const bounds = layer.getBounds();

        if (!bounds.isValid()) return null;

        return {
          ...group,
          position: bounds.getCenter(),
        };
      })
      .filter(
        (territory): territory is NonNullable<typeof territory> =>
          territory !== null,
      );
  }, [groupedData, territories]);

  const municipalityMarkers = useMemo(() => {
    return Object.values(municipalityGroups)
      .map((group) => {
        const bounds = L.geoJSON(group.feature).getBounds();
        if (!bounds.isValid()) return null;

        return { ...group, position: bounds.getCenter() };
      })
      .filter(
        (municipality): municipality is NonNullable<typeof municipality> =>
          municipality !== null,
      );
  }, [municipalityGroups]);

  if (loading) {
    return <MapLoading />;
  }

  if (error || !geoJson) {
    return (
      <div className="map-error" role="alert">
        {error ?? 'Não foi possível carregar o mapa.'}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="relative min-w-0">
        <MapContainer
          center={[-12.5, -41.7]}
          zoom={7}
          minZoom={6}
          maxZoom={11}
          boxZoom={false}
          zoomControl
          className="z-0 h-[clamp(350px,60vh,650px)] min-w-0 w-full rounded-lg [&:focus:not(:focus-visible)]:outline-none [&_.leaflet-interactive:focus:not(:focus-visible)]:outline-none [&_path.leaflet-interactive:focus-visible]:outline-none [&_path.leaflet-interactive:focus-visible]:stroke-gray-900 [&_path.leaflet-interactive:focus-visible]:stroke-[2px] [&_.leaflet-marker-icon:focus-visible]:outline-none [&_.leaflet-marker-icon:focus-visible_.territory-marker]:shadow-[0_0_0_3px_#111827]"
        >
          <FitBounds geoJson={geoJson} />

          <ZoomAwareLayers
            geoJson={geoJson}
            groupedData={groupedData}
            territoryMarkers={territoryMarkers}
            municipalityMarkers={municipalityMarkers}
            onReady={setMapReady}
          />
        </MapContainer>
        {!mapReady && <MapLoading overlay />}
      </div>

      <Legend geoJson={geoJson} groupedData={groupedData} />
    </div>
  );
}

function ZoomAwareLayers({
  geoJson,
  groupedData,
  territoryMarkers,
  municipalityMarkers,
  onReady,
}: {
  geoJson: TerritoryGeoJson;
  groupedData: Record<string, TerritoryGroup>;
  territoryMarkers: Array<TerritoryGroup & { position: L.LatLng }>;
  municipalityMarkers: Array<MunicipalityGroup & { position: L.LatLng }>;
  onReady: (ready: boolean) => void;
}) {
  const map = useMap();
  const geoJsonLayerRef = useRef<L.GeoJSON>(null);
  const [zoom, setZoom] = useState(7);
  useMapEvents({
    zoomend(event) {
      setZoom(event.target.getZoom());
    },
  });
  const detailed = zoom >= MUNICIPAL_ZOOM;
  const markers = detailed ? municipalityMarkers : territoryMarkers;
  const territoryBorders = useMemo(
    () => getTerritoryBorders(geoJson),
    [geoJson],
  );

  useEffect(() => {
    const layer = geoJsonLayerRef.current;
    if (!layer) return;

    let firstFrame = 0;
    let secondFrame = 0;
    const revealMap = () => {
      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => onReady(true));
      });
    };

    if (map.hasLayer(layer)) revealMap();
    else layer.on('add', revealMap);

    return () => {
      layer.off('add', revealMap);
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [map, onReady, geoJson]);

  return (
    <>
      <GeoJSON
        ref={geoJsonLayerRef}
        key={`${detailed}-${Object.keys(groupedData).sort().join(',')}`}
        data={geoJson}
        style={(feature) => ({
          fillColor: groupedData[feature?.properties?.territorio_id]
            ? getColor(feature?.properties?.territorio_id)
            : '#d1d5db',
          fillOpacity: 0.85,
          weight: detailed ? 0.6 : 0,
          color: '#ffffff',
        })}
        onEachFeature={(feature, layer) => {
          const properties = feature.properties;
          const tooltip = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = properties.territorio_identidade;
          tooltip.append(title);
          if (detailed) {
            tooltip.append(
              document.createElement('br'),
              document.createTextNode(`Município: ${properties.name}`),
            );
          }
          layer.bindTooltip(tooltip, { sticky: true });

          if (detailed) {
            layer.on({
              mouseover(event) {
                event.target.setStyle({ weight: 2, color: '#000000' });
              },
              mouseout(event) {
                event.target.setStyle({ weight: 0.6, color: '#ffffff' });
              },
            });
          }
        }}
      />

      {!detailed && (
        <GeoJSON
          data={territoryBorders}
          interactive={false}
          style={{ color: '#6b7280', weight: 1.2, opacity: 0.9 }}
        />
      )}

      {markers.map((group) => (
        <ResearcherMarker
          key={`${detailed ? 'city' : 'territory'}-${group.id}`}
          group={group}
        />
      ))}
    </>
  );
}

function ResearcherMarker({
  group,
}: {
  group: TerritoryGroup & { position: L.LatLng };
}) {
  const markerRef = useRef<L.Marker>(null);

  return (
    <Marker
      ref={markerRef}
      position={group.position}
      icon={createMarkerIcon(group.items.length)}
      title={`Ver ${group.items.length} pesquisadores em ${group.name}`}
      alt={`Pesquisadores em ${group.name}`}
    >
      <Tooltip
        direction="top"
        interactive
        className="cursor-pointer"
        eventHandlers={{ click: () => markerRef.current?.openPopup() }}
      >
        <strong>{group.name}</strong>
        <br />
        {group.items.length} pesquisador
        {group.items.length !== 1 ? 'es' : ''}
      </Tooltip>

      <Popup
        maxWidth={380}
        minWidth={280}
        className="[&_.leaflet-popup-content-wrapper]:rounded-md [&_.leaflet-popup-content-wrapper]:border [&_.leaflet-popup-content-wrapper]:border-slate-200 [&_.leaflet-popup-content-wrapper]:bg-white [&_.leaflet-popup-content-wrapper]:text-slate-900 [&_.leaflet-popup-content]:m-4 [&_.leaflet-popup-content_h3]:m-0 dark:[&_.leaflet-popup-content-wrapper]:border-neutral-800 dark:[&_.leaflet-popup-content-wrapper]:bg-neutral-900 dark:[&_.leaflet-popup-content-wrapper]:text-slate-50 dark:[&_.leaflet-popup-tip]:border-neutral-800 dark:[&_.leaflet-popup-tip]:bg-neutral-900"
      >
        <ResearcherPopup group={group} />
      </Popup>
    </Marker>
  );
}

function ResearcherPopup({ group }: { group: TerritoryGroup }) {
  const { urlGeral } = useContext(UserContext);
  const { onOpen } = useModal();

  return (
    <div>
      <h3 className="text-lg font-semibold">{group.name}</h3>
      <div className="text-sm text-gray-600 mb-4 dark:text-gray-300">
        Pesquisadores: {group.items.length}
      </div>
      <ul
        className="m-0 flex max-h-64 list-none flex-col gap-3 overflow-y-auto p-0 text-sm"
        aria-label={`Pesquisadores de ${group.name}`}
        tabIndex={0}
      >
        {group.items.map((item, index) => (
          <li key={item.id ?? index}>
            <button
              type="button"
              className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-eng-blue dark:hover:bg-neutral-800"
              onClick={() =>
                item.name && onOpen('researcher-modal', { name: item.name })
              }
              disabled={!item.name}
            >
              <Avatar className="h-6 w-6 rounded-md">
                <AvatarImage
                  className="h-6 w-6 rounded-md"
                  src={`${urlGeral}ResearcherData/Image?name=${encodeURIComponent(item.name ?? '')}`}
                />
                <AvatarFallback>
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
              <span>{item.name || `Pesquisador ${index + 1}`}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Legend({
  geoJson,
  groupedData,
}: {
  geoJson: TerritoryGeoJson;
  groupedData: Record<string, TerritoryGroup>;
}) {
  const territories = useMemo(() => {
    const map: Record<string, string> = Object.create(null);

    geoJson.features.forEach((feature) => {
      const properties = feature.properties;

      map[properties.territorio_id] = properties.territorio_identidade;
    });

    return Object.entries(map).sort(
      ([idA], [idB]) => Number(idA) - Number(idB),
    );
  }, [geoJson]);

  return (
    <div className="grid content-start grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2 md:max-h-[clamp(350px,60vh,650px)] md:grid-cols-1 md:overflow-y-auto md:border-l md:border-slate-200 md:px-3 md:py-2 dark:md:border-neutral-800">
      <div className="col-span-full font-bold">Territórios de Identidade</div>

      {territories.map(([id, name]) => {
        const count = groupedData[id]?.items?.length ?? 0;

        return (
          <div className="flex items-center gap-2" key={id}>
            <div
              className="h-4 w-4 shrink-0 rounded-[3px]"
              style={{
                backgroundColor: count > 0 ? getColor(id) : '#d1d5db',
              }}
            />

            <div className="min-w-0 [overflow-wrap:anywhere]">
              <strong>{id}</strong>
              {' - '}
              {name}

              {count > 0 && <span className="legend-count"> ({count})</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
