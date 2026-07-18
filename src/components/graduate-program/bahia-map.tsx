import Highcharts from 'highcharts';
import Highmaps from 'highcharts/highmaps';
import HighchartsAccessibility from 'highcharts/modules/accessibility';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsOfflineExporting from 'highcharts/modules/offline-exporting';

import { useEffect, useState, useContext } from "react";

// Inicializa os módulos do Highcharts
HighchartsAccessibility(Highcharts);
HighchartsExporting(Highcharts);
HighchartsOfflineExporting(Highcharts);

interface GraduateProgram {
  area: string;
  code: string;
  graduate_program_id: string;
  modality: string;
  name: string;
  rating: string;
  type: string;
  city: string;
  state: string;
  instituicao: string;
  url_image: string;
  region: string;
  sigla: string;
  latitude: string;
  longitude: string;
  visible: boolean;
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};


import brazilStatesGeoJSON from './ba_state.json';
import mgStateGeoJSON from './mg_state.json'; // Substitua pelo caminho correto
import { UserContext } from '../../context/context';
import { useLocation, useNavigate } from 'react-router-dom';


interface Props {
  setSelectedCities: React.Dispatch<React.SetStateAction<string[]>>;
}

function BahiaMap({ setSelectedCities }: Props) {


  const { version, urlGeral, setUrlGeral, simcc } = useContext(UserContext);
  const { idGraduateProgram, setIdGraduateProgram } = useContext(UserContext);
  const [graduatePrograms, setGraduatePrograms] = useState<GraduateProgram[]>([]);

  const navigate = useNavigate();
  const queryUrl = useQuery();

  const urlGraduateProgram = `${urlGeral}graduate_program_profnit?id=`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlGraduateProgram, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });
        const data = await response.json();
        if (data) {
          setGraduatePrograms(data);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlGraduateProgram]);

  // Função de normalização de strings (para cidade e programas)
  const normalizeString = (str: string): string => {
    return str
      .normalize("NFD") // Decompõe caracteres acentuados
      .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (acentos)
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove caracteres especiais
      .toUpperCase(); // Converte para maiúsculas
  };

  useEffect(() => {
    // Criação do objeto para contagem dos programas por cidade
    const cityProgramCount: Record<string, number> = {};

    graduatePrograms
      .filter(item => item.visible === true)
      .forEach((program) => {
        const normalizedCity = normalizeString(program.city); // Normaliza a cidade do programa
        console.log("Program City:", program.city, "Normalized:", normalizedCity);
        if (cityProgramCount[normalizedCity]) {
          cityProgramCount[normalizedCity] += 1;
        } else {
          cityProgramCount[normalizedCity] = 1;
        }
      });

    // Define um máximo para normalizar a opacidade
    const maxPrograms = Math.max(...Object.values(cityProgramCount), 1);

    // Mapeia os dados das cidades com opacidade variável
    const brazilCityData = Object.entries(cityProgramCount).map(([city, count]) => ({
      name: city,
      value: parseFloat(String(count)) || 0,
      color: Highcharts.color('#559FB8').setOpacity(count / maxPrograms).get(),
    }));

    // Normaliza os nomes das cidades do GeoJSON
    const normalizedGeoJSON = {
      ...brazilStatesGeoJSON,
      features: brazilStatesGeoJSON.features.map((feature: any) => ({
        ...feature,
        properties: {
          ...feature.properties,
          name: normalizeString(feature.properties.name), // Substitui pelo nome normalizado
        },
      })),
    };
    // Verificar as cidades no GeoJSON


    // Inicializa o gráfico
    const chart = Highmaps.mapChart({
      chart: {
        renderTo: 'containerone',
        map: !version ? normalizedGeoJSON : mgStateGeoJSON,
        backgroundColor: 'transparent',
      },
      title: {
        text: '',
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      colorAxis: {
        tickPixelInterval: 100,
      },
      series: [
        {
          type: 'map',
          data: brazilCityData,
          keys: ['name', 'value', 'color'], // Adiciona a chave 'color'
          joinBy: 'name',
          allowPointSelect: false,
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                const city = normalizeString((this.options as { name: string })['name']); // Normaliza a cidade ao clicar
                setSelectedCities(prevCities => {
                  if (!prevCities.includes(city)) {
                    return [...prevCities, city];  // Adiciona a cidade se não estiver presente
                  }
                  return prevCities;  // Retorna o estado atual se a cidade já estiver na lista
                });
              },
            },
          },
        },
      ],
    });

    // Limpar o gráfico quando o componente for desmontado
    return () => {
      chart.destroy();
    };
  }, [graduatePrograms, version]); // Dependência de graduatePrograms para re-executar quando os dados mudarem

  return <div className={` absolute w-[140%] z-[2] h-full left-[-20px]`} id="containerone" />;
}

export default BahiaMap;
