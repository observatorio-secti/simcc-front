import { Buildings, Star } from "phosphor-react";

import { Blocks, Building2, Calendar, GraduationCapIcon, MapPin, MapPinIcon, User, Users } from "lucide-react";

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

interface GraduateProgram {
  area: string;
  code: string;
  graduate_program_id: string;
  modality: string;
  name: string;
  rating: string;
  type: string;
  city: string
  state: string
  instituicao: string
  url_image: string
  region: string
  sigla: string
  visible: boolean
  qtd_discente: string
  qtd_colaborador: string
  qtd_permanente: string
  create_at: string
  institution: string;
  researchers:string[]
  acronym:string
  fromInstitution?: boolean;
  institutionId?: string;
  institutionName?: string;
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


export function ProgramItem(props: GraduateProgram) {


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
    queryUrl.set('graduate_program_id', props.graduate_program_id);
    
    // Se veio da página de instituição, preserva o contexto
    if (props.fromInstitution && props.institutionId && props.institutionName) {
      queryUrl.set('from_institution', 'true');
      queryUrl.set('institution_id', props.institutionId);
      queryUrl.set('institution_name', props.institutionName);
    }
    
    navigate({
      pathname: '/pos-graduacao',
      search: queryUrl.toString(),
    });
  }

  const {onOpen} = useModal()
  const {urlGeral, simcc} = useContext(UserContext)

    const [imageUrl, setImageUrl] = useState<string | null>(null);
  
      useEffect(() => {
        const fetchImage = async () => {
          const url = await getInstitutionImageName(props.institution);
          setImageUrl(url);
        };
    
        fetchImage();
      }, []);

  return (
    <div onClick={() => handlePesquisaFinal()}   className="flex w-full cursor-pointer" key={props.graduate_program_id}>
    <Alert className={`rounded-r-none border-r-0 w-2 min-w-2 p-0 ${getColorByArea(props.area)}`} />
    <Alert className="rounded-l-none">
    <div className="flex justify-between items-center">
                                      <div className="text-xs font-medium mb-2 flex items-center gap-2">{props.modality}
                                      </div>
                                      <p
  className={`text-white mb-1 px-2 rounded-md p-1 h-fit text-xs flex items-center gap-1 
    ${ Number(props.rating) <= 2 ? 'bg-gray-500' : 
      Number(props.rating) <= 4 ? 'bg-yellow-500' : 
      Number(props.rating) ? 'bg-green-500' : 
      'bg-blue-500'}`}
>
  <Star size={12} />{props.rating}
</p>

                                    </div>
    <div className="flex justify-between gap-8 items-start">
 
           <div className="flex gap-3 w-full">
       
           <div className="w-full">
           <div className="font-semibold text-lg">{props.name}</div>
             <div>
            {props.acronym && (
               <p className="text-gray-500 text-sm">
               {props.acronym}
             </p>
            )}

             
             </div>
              
            </div>
           </div>

           
          </div>

          <div className="flex gap-2 flex-wrap my-3">
                <div className="text-gray-500 text-sm flex gap-1 items-center">
                  <MapPin size={12} />
                  <p>{props.city}</p>
                </div>
               
             

                <div className="text-gray-500 text-sm flex gap-1 items-center">
                  <Blocks size={12} />
                  <p>{props.area}</p>
                </div>

              {simcc && (
                  <div className="text-gray-500 text-sm flex gap-1 items-center">
                 {!imageUrl ? (
                      <Buildings size={16} className="" />
                    ) : (
                      <img src={imageUrl} alt="" className="h-6" />
                    )}
                  <p>{props.institution}</p>
                </div>
              )}

              
              </div>

<div className="mt-4 flex gap-2 items-center">
  {props.researchers.slice(0,5).map((item) => (
    <Avatar onClick={(event) => {
      event.stopPropagation(); 
      onOpen('researcher-modal', {name:item})

    }} className="cursor-pointer rounded-md  h-8 w-8">
    <AvatarImage className={'rounded-md h-8 w-8'} src={`${urlGeral}ResearcherData/Image?name=${item}`} />
    <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
  </Avatar>
  ))}

  {props.researchers.length > 5 && (<p className="h-8 w-8 flex items-center justify-center text-gray-500">+</p>)}
</div>


      </Alert>
      </div>

  )
}