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
import { User } from 'lucide-react';
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
import { Skeleton } from '../../../ui/skeleton';

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

/**
 * Paleta em tons pastéis inspirada no mapa oficial dos Territórios de
 * Identidade da Bahia (SEI, 2021 — Lei nº 14.172/2019).
 *
 * Cada território tem cor própria e fixa (não há reaproveitamento como
 * num esquema de "cor por resto de divisão").
 */
const TERRITORY_COLORS: Record<string, string> = {
  '1': '#ead091', // Irecê — bege
  '2': '#bbda92', // Velho Chico — verde-claro
  '3': '#c9c0ed', // Chapada Diamantina — lilás-claro
  '4': '#cfe195', // Sisal — amarelo-esverdeado claro
  '5': '#eaca7f', // Litoral Sul — pêssego claro
  '6': '#daac69', // Baixo Sul — ocre claro
  '7': '#c1dd94', // Extremo Sul — verde-claro
  '8': '#cec3ab', // Médio Sudoeste — cinza quente claro
  '9': '#c5dc92', // Vale do Jiquiriçá — verde-claro
  '10': '#f2aed2', // Sertão do São Francisco — rosa-claro
  '11': '#e9c67d', // Bacia do Rio Grande — âmbar claro
  '12': '#f6acd2', // Bacia do Paramirim — rosa-claro
  '13': '#ead493', // Sertão Produtivo — creme
  '14': '#ebd798', // Piemonte do Paraguaçu — creme
  '15': '#f3aac5', // Bacia do Jacuípe — rosa-claro
  '16': '#e7db8d', // Piemonte da Diamantina — amarelo-claro
  '17': '#e8ce8c', // Semiárido Nordeste II — areia clara
  '18': '#ecc17c', // Litoral Norte e Agreste — laranja-claro
  '19': '#ecdcb0', // Portal do Sertão — creme
  '20': '#e6d789', // Sudoeste Baiano — amarelo-claro
  '21': '#b0cae5', // Recôncavo — azul-acinzentado claro
  '22': '#e8b2cd', // Médio Rio de Contas — malva claro
  '23': '#f5aac4', // Bacia do Rio Corrente — rosa-claro
  '24': '#e8df91', // Itaparica — amarelo-claro
  '25': '#b8c5d3', // Piemonte Norte do Itapicuru — cinza-neutro claro
  '26': '#e9bb78', // Metropolitano de Salvador — caramelo claro
  '27': '#c7bdec', // Costa do Descobrimento — lilás-claro
};

/** Preenchimento dos territórios sem pesquisadores. */
const EMPTY_FILL = '#e5e7eb';

/** Fundo do mapa (áreas fora da Bahia). Bem mais claro que o cinza interno. */
const MAP_BACKGROUND = '#f1f5f9';

const MUNICIPAL_ZOOM = 8;

function normalizeCity(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function getColor(id?: string | number) {
  const key = String(id ?? '');

  if (TERRITORY_COLORS[key]) {
    return TERRITORY_COLORS[key];
  }

  const parsedId = Number(id);
  const numericId = Number.isInteger(parsedId) && parsedId > 0 ? parsedId : 1;
  const palette = Object.values(TERRITORY_COLORS);

  return palette[(numericId - 1) % palette.length];
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

export default function BahiaTerritoriosMap({
  researchers,
  geoJsonUrl = '/territorio_relacionado.json',
}: MapProps) {
  const [geoJson, setGeoJson] = useState<TerritoryGeoJson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const geoResponse = await fetch(geoJsonUrl, {
          signal: controller.signal,
        });

        if (!geoResponse.ok) {
          throw new Error('Erro ao carregar GeoJSON');
        }

        const geo = await geoResponse.json();

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
        if (controller.signal.aborted) return;

        setGeoJson(geo);
      } catch (error) {
        if (controller.signal.aborted) return;
        setGeoJson(null);
        setError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar o mapa.',
        );
        console.error('Erro ao carregar mapa:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
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
    return <Skeleton className="h-[480px] w-full lg:h-[520px] xl:h-[560px]" />;
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
      <MapContainer
        center={[-12.5, -41.7]}
        zoom={7}
        minZoom={6}
        maxZoom={11}
        boxZoom={false}
        zoomControl
        style={{ backgroundColor: MAP_BACKGROUND }}
        className="z-0 h-[clamp(350px,60vh,650px)] min-w-0 w-full rounded-lg border border-slate-200 dark:border-neutral-800 [&:focus:not(:focus-visible)]:outline-none [&_.leaflet-interactive:focus:not(:focus-visible)]:outline-none [&_path.leaflet-interactive:focus-visible]:outline-none [&_path.leaflet-interactive:focus-visible]:stroke-gray-900 [&_path.leaflet-interactive:focus-visible]:stroke-[2px] [&_.leaflet-marker-icon:focus-visible]:outline-none [&_.leaflet-marker-icon:focus-visible_.territory-marker]:shadow-[0_0_0_3px_#111827]"
      >
        <FitBounds geoJson={geoJson} />

        <ZoomAwareLayers
          geoJson={geoJson}
          groupedData={groupedData}
          territoryMarkers={territoryMarkers}
          municipalityMarkers={municipalityMarkers}
        />
      </MapContainer>

      <Legend geoJson={geoJson} groupedData={groupedData} />
    </div>
  );
}

function ZoomAwareLayers({
  geoJson,
  groupedData,
  territoryMarkers,
  municipalityMarkers,
}: {
  geoJson: TerritoryGeoJson;
  groupedData: Record<string, TerritoryGroup>;
  territoryMarkers: Array<TerritoryGroup & { position: L.LatLng }>;
  municipalityMarkers: Array<MunicipalityGroup & { position: L.LatLng }>;
}) {
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

  return (
    <>
      <GeoJSON
        key={`${detailed}-${Object.keys(groupedData).sort().join(',')}`}
        data={geoJson}
        style={(feature) => ({
          fillColor: groupedData[feature?.properties?.territorio_id]
            ? getColor(feature?.properties?.territorio_id)
            : EMPTY_FILL,
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
    <div className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white text-sm dark:border-neutral-800 dark:bg-neutral-900 md:max-h-[clamp(350px,60vh,650px)]">
      <div className="border-b border-slate-200 px-3 py-2.5 font-semibold dark:border-neutral-800">
        Territórios de Identidade
      </div>

      <div className="grid content-start grid-cols-1 gap-0.5 overflow-y-auto p-2 sm:grid-cols-2 md:grid-cols-1">
        {territories.map(([id, name]) => {
          const count = groupedData[id]?.items?.length ?? 0;

          return (
            <div
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-neutral-800"
              key={id}
              title={count > 0 ? `${count} pesquisador${count !== 1 ? 'es' : ''}` : 'Sem pesquisadores'}
            >
              <div
                className="h-4 w-4 shrink-0 rounded-[4px] border border-black/10 dark:border-white/10"
                style={{
                  backgroundColor: count > 0 ? getColor(id) : EMPTY_FILL,
                }}
              />

              <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                <span className="font-semibold">{id}</span>
                <span className="text-muted-foreground"> - </span>
                {name}
              </div>

              {count > 0 && (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums dark:bg-neutral-800">
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
