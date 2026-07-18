import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useRef, useContext } from 'react';

import { useTheme } from "next-themes";
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '../../../ui/avatar';
import { User } from 'lucide-react';
import { UserContext } from '../../../../context/context';
import { useModal } from '../../../hooks/use-modal-store';
import { Button } from '../../../ui/button';

const defaultCenter = {
  latitude: -14.235,
  longitude: -51.9253,
};
const defaultZoom = 4;

type CityData = {
  nome: string;
  latitude: number;
  longitude: number;
  pesquisadores: number;
  professores: string[];
};

interface Props {
  cityData: CityData[];
}

export default function MapaResearcher({ cityData }: Props) {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const mapRef = useRef(null);
  const { theme } = useTheme();

  const mapStyle = theme === "dark" 
    ? "mapbox://styles/mapbox/dark-v11" 
    : "mapbox://styles/mapbox/light-v11";

  if (!import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN) {
    return <div>Mapbox token não encontrado</div>;
  }

  const {urlGeral} = useContext(UserContext)
  const {onOpen} = useModal()

  return (
    <div className="h-[350px] w-full rounded-md ">
      <Map
        ref={mapRef}
        initialViewState={{
          latitude: defaultCenter.latitude,
          longitude: defaultCenter.longitude,
          zoom: defaultZoom,
        }}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
        mapStyle={mapStyle}
        mapboxAccessToken={import.meta.env.VITE_PUBLIC_MAPBOX_TOKEN}
        reuseMaps
        attributionControl={false} 
        interactive
        renderWorldCopies={false}
      >
        {cityData.map((city) => {
          const markerSize = Math.max(20, Math.log2(city.pesquisadores + 1) * 6);

          return (
            <Marker
              key={city.nome}
              latitude={city.latitude}
              longitude={city.longitude}
              style={{ cursor: 'pointer' }}
            >
              <Popover>
                <PopoverTrigger asChild>
                  <div
                    className="flex justify-center items-center bg-eng-blue/70 border-4 border-eng-blue text-white rounded-full"
                    style={{
                      width: `${markerSize}px`,
                      height: `${markerSize}px`,
                      fontSize: `${markerSize / 4}px`,
                    }}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city.pesquisadores}
                  </div>
                </PopoverTrigger>
                <PopoverContent className='w-auto'>
                  <div className="">
                    <div>
                    <h3 className="text-lg font-semibold">{city.nome}</h3>
                    <div className="text-sm text-gray-600 mb-4">
                      Pesquisadores: {city.pesquisadores}
                    </div>
                    </div>
                    <div className="text-sm max-h-64 w-auto overflow-y-auto flex flex-col gap-3">
                      {city.professores.map((professor, index) => (
                        <div onClick={() => onOpen('researcher-modal', {name:professor})} key={index} className="flex cursor-pointer gap-3 items-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all h-10 p-2">
                         
                         <Avatar className="cursor-pointer rounded-md  h-6 w-6">
                        <AvatarImage className={'rounded-md h-6 w-6'} src={`${urlGeral}ResearcherData/Image?name=${professor}`} />
                        <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                      </Avatar>
                          {professor}
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
