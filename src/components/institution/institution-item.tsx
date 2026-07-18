import { Buildings, Star } from "phosphor-react";

import { Blocks, Briefcase, Building2, Calendar, GraduationCapIcon, Landmark, MapPin, MapPinIcon, User, Users } from "lucide-react";

import { cn } from "../../lib"


import { useLocation, useNavigate } from "react-router-dom";
import { Alert } from "../ui/alert";
import { InfiniteMovingCardsResearchers } from "../ui/infinite-moving-cards-researchers";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useModal } from "../hooks/use-modal-store";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { getInstitutionImage } from "../homepage/categorias/institutions-home/institution-image";
import { getInstitutionImageName } from "../homepage/categorias/institutions-home/institution-image-name";
import { Button } from "../ui/button";

interface GraduateProgram {
id:string
  avatar:string
   name: string;
  count_r:string
  count_gp:string
  count_gpr:string
  count_gps:string
  count_d:string
  count_t:string
  researchers:string[]
acronym:string
  url:string

}

// Lista de áreas com cores associadas
export const areasComCores: [string, string][] = [
  // Ciências Exatas e da Terra
  ['MATEMÁTICA / PROBABILIDADE E ESTATÍSTICA', 'bg-red-200'],
  ['ASTRONOMIA / FÍSICA', 'bg-red-300'],
  ['QUÍMICA', 'bg-red-400'],
  ['GEOCIÊNCIAS', 'bg-red-500'],
  ['CIÊNCIA DA COMPUTAÇÃO', 'bg-red-600'],

  // Ciências Biológicas
  ['BIODIVERSIDADE', 'bg-green-200'],
  ['CIÊNCIAS BIOLÓGICAS I', 'bg-green-300'],
  ['CIÊNCIAS BIOLÓGICAS II', 'bg-green-400'],
  ['CIÊNCIAS BIOLÓGICAS III', 'bg-green-500'],

  // Engenharias
  ['ENGENHARIA I', 'bg-blue-200'],
  ['ENGENHARIA II', 'bg-blue-300'],
  ['ENGENHARIA III', 'bg-blue-400'],
  ['ENGENHARIA IV', 'bg-blue-500'],

  // Ciências da Saúde
  ['MEDICINA I', 'bg-yellow-200'],
  ['MEDICINA II', 'bg-yellow-300'],
  ['MEDICINA III', 'bg-yellow-400'],
  ['NUTRIÇÃO', 'bg-yellow-500'],
  ['ODONTOLOGIA', 'bg-yellow-600'],
  ['FARMÁCIA', 'bg-yellow-700'],
  ['ENFERMAGEM', 'bg-yellow-800'],
  ['SAÚDE COLETIVA', 'bg-yellow-900'],
  ['EDUCAÇÃO FÍSICA', 'bg-yellow-950'],
  ['FISIOTERAPIA, FONOAUDIOLOGIA E TERAPIA OCUPACIONAL', 'bg-orange-200'],
  ['EDUCAÇÃO FÍSICA, FISIOTERAPIA, FONOAUDIOLOGIA E TERAPIA OCUPACIONAL', 'bg-yellow-950'],
  // Ciências Agrárias
  ['CIÊNCIAS AGRÁRIAS I', 'bg-green-600'],
  ['ZOOTECNIA / RECURSOS PESQUEIROS', 'bg-green-700'],
  ['MEDICINA VETERINÁRIA', 'bg-green-800'],
  ['CIÊNCIA DE ALIMENTOS', 'bg-green-900'],

  // Ciências Sociais Aplicadas
  ['DIREITO', 'bg-purple-200'],
  ['ADMINISTRAÇÃO PÚBLICA E DE EMPRESAS, CIÊNCIAS CONTÁBEIS E TURISMO', 'bg-purple-300'],
  ['ECONOMIA', 'bg-purple-400'],
  ['ARQUITETURA, URBANISMO E DESIGN', 'bg-purple-500'],
  ['PLANEJAMENTO URBANO E REGIONAL / DEMOGRAFIA', 'bg-purple-600'],
  ['COMUNICAÇÃO, INFORMAÇÃO E MUSEOLOGIA', 'bg-purple-700'],
  ['SERVIÇO SOCIAL', 'bg-purple-800'],

  // Ciências Humanas
  ['FILOSOFIA', 'bg-pink-200'],
  ['CIÊNCIAS DA RELIGIÃO E TEOLOGIA', 'bg-pink-300'],
  ['SOCIOLOGIA', 'bg-pink-400'],
  ['ANTROPOLOGIA / ARQUEOLOGIA', 'bg-pink-500'],
  ['HISTÓRIA', 'bg-pink-600'],
  ['GEOGRAFIA', 'bg-pink-700'],
  ['PSICOLOGIA', 'bg-pink-800'],
  ['EDUCAÇÃO', 'bg-pink-900'],
  ['CIÊNCIA POLÍTICA E RELAÇÕES INTERNACIONAIS', 'bg-pink-950'],

  // Linguística, Letras e Artes
  ['LETRAS / LINGUÍSTICA', 'bg-orange-400'],
  ['ARTES / MÚSICA', 'bg-orange-500'],

  // Multidisciplinar
  ['INTERDISCIPLINAR', 'bg-teal-200'],
  ['ENSINO', 'bg-teal-300'],
  ['MATERIAIS', 'bg-teal-400'],
  ['BIOTECNOLOGIA', 'bg-teal-500'],
  ['CIÊNCIAS AMBIENTAIS', 'bg-teal-600'],
  ['CIÊNCIAS E HUMANIDADES PARA A EDUCAÇÃO BÁSICA', 'bg-teal-700']
];

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}


export function InstitutionItem(props: GraduateProgram) {


  const normalizeArea = (area: string): string =>
    area
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^A-Z0-9 ]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único espaço
      .trim();
  
  
  // Criamos o Map normalizando as chaves antes
  const qualisColor = new Map(areasComCores.map(([area, color]) => [normalizeArea(area), color]));
  
  const getColorByArea = (area: string): string =>
    qualisColor.get(normalizeArea(area)) || 'bg-gray-500';

  const queryUrl = useQuery();
  const navigate = useNavigate();

  // Calcula a diferença em dias entre a data atual e a data do item

  const handlePesquisaFinal = () => {
    queryUrl.set('institution_id', props.id);
    navigate({
      pathname: props.url,
      search: queryUrl.toString(),
    });
  }

  const {onOpen} = useModal()
  const {urlGeral, urlGeralAdm, simcc, version} = useContext(UserContext)

    const [imageUrl, setImageUrl] = useState<string | null>(null);
  
   

  return (
 <div onClick={() => handlePesquisaFinal()} className="flex w-full cursor-pointer" key={props.id}>
  <Alert className="flex flex-col items-center bg-no-repeat bg-center bg-cover" style={{ backgroundImage: `url(${urlGeralAdm}institution/upload/${props.id}/cover)` }}>
    <Avatar className="cursor-pointer z-[1] top-12 rounded-md relative border dark:border-neutral-800 h-20 w-20 flex-shrink-0">
      <AvatarImage className="rounded-md" src={props.avatar} />
      <AvatarFallback className="flex items-center justify-center">
        <Landmark size={16} />
      </AvatarFallback>
    </Avatar>

    <Alert className="flex flex-col items-center pt-16 whitespace-normal">
      <div className="flex gap-3">
        {/* <<<<<< ESTE PAI PRECISA PODER ENCOLHER >>>>>> */}
        <div className="items-center flex flex-col w-full min-w-0">
          {/* largura do bloco do título */}
          <div className="font-semibold text-lg w-full text-center">
            {/* texto com ellipsis */}
            {props.name} ({props.acronym})
          </div>

          <div className="flex gap-2 flex-wrap mt-1">
            <div title="Docentes" className="text-gray-500 text-sm flex gap-1 items-center">
              <Users size={12} className="flex-shrink-0" />
              <span className="truncate">{props.count_r}</span>
            </div>

            <div title="Pós-graduações" className="text-gray-500 text-sm flex gap-1 items-center">
              <GraduationCapIcon size={12} className="flex-shrink-0" />
              <span className="truncate">{props.count_gp}</span>
            </div>

            <div title="Grupos de pesquisa" className="text-gray-500 text-sm flex gap-1 items-center">
              <Blocks size={12} className="flex-shrink-0" />
              <span className="truncate">{props.count_gps}</span>
            </div>
          </div>
        </div>
      </div>

      {props.researchers?.length > 0 && (
        <div className="flex  items-center mt-8">
        
          <div className="flex items-center">
            {props.researchers.slice(0, 5).map((item, index) => (
              <Avatar
                key={item}
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen('researcher-modal', { name: item });
                }}
                className="cursor-pointer rounded-full relative border dark:border-neutral-800 h-8 w-8 hover:z-10 transition-transform hover:scale-110"
                style={{ marginLeft: index > 0 ? '-10px' : '0px' }}
              >
                <AvatarImage className="rounded-md h-8 w-8" src={`${urlGeral}ResearcherData/Image?name=${item}`} />
                <AvatarFallback className="flex items-center justify-center">
                  <User size={16} />
                </AvatarFallback>
              </Avatar>
            ))}

            {props.researchers.length > 5 && (
              <div
                className="h-8 w-8 flex items-center justify-center text-gray-500 bg-gray-100 dark:bg-neutral-800 rounded-full border dark:border-neutral-700 text-xs font-medium"
                style={{ marginLeft: '-10px' }}
              >
                +{props.researchers.length - 5}
              </div>
            )}
          </div>
        </div>
      )}
    </Alert>
  </Alert>
</div>


  )
}