import {  useEffect, useState } from "react"

import { ScrollArea } from "../../ui/scroll-area"

import { cn } from "../../../lib"


import {  Plus, Shapes, Users } from "lucide-react"


interface Patrimonio {
  area: string,
  institution: string,
  first_leader: string,
  first_leader_id: string,
  second_leader:string,
  leader_two_id: string,
second_leader_id: string,
name:string
  }

  interface Props {
    onResearcherUpdate: (newResearcher: Patrimonio) => void;
    url:string
    search:string
  }


import { Button } from "../../ui/button"
import { Skeleton } from "../../ui/skeleton"

export function ItensListGrupoPesquisa(props:Props) {
    const [total, setTotal] = useState<Patrimonio[]>([]);
    const [selectedResearcher, setSelectedResearcher] = useState<Patrimonio | null>(null);
    // Atualize essa função para chamar a propriedade `onResearcherUpdate`
    const updateResearcher = (newResearcher: Patrimonio) => {
        if (props.onResearcherUpdate) {
          props.onResearcherUpdate(newResearcher);
          setSelectedResearcher(newResearcher);
        }
      };

      useEffect(() => {
        if (selectedResearcher) {
          props.onResearcherUpdate(selectedResearcher);
        }
      }, [selectedResearcher, props]);
      
      const [isLoading, setIsLoading] = useState(false)



    const urlPatrimonioInsert = props.url;

    useEffect(() => {
        setIsLoading(true)
      const fetchData = async () => {
       
        try {
            
          const response = await fetch(urlPatrimonioInsert , {
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
              setTotal(data)
              setIsLoading(false)
          }
        } catch (err) {
          console.log(err);
        }
      };
      fetchData()
  
     
    }, [urlPatrimonioInsert]);



    const normalizeArea = (area: string): string => {
      return area

        .toUpperCase(); // Converte para maiúsculas
    };
    
    const qualisColor: { [key: string]: string } = {
      "ASTRONOMIA": "bg-red-200",
      "FÍSICA": "bg-blue-200",
      "GEOCIÊNCIAS": "bg-green-200",
      "MATEMÁTICA": "bg-yellow-200",
      "OCEANOGRAFIA": "bg-teal-200",
      "PROBABILIDADE E ESTATÍSTICA": "bg-purple-200",
      "QUÍMICA": "bg-orange-200",
      "AGRONOMIA": "bg-red-800",
      "CIÊNCIA E TECNOLOGIA DE ALIMENTOS": "bg-blue-800",
      "ENGENHARIA AGRÍCOLA": "bg-green-800",
      "MEDICINA VETERINÁRIA": "bg-yellow-800",
      "RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL": "bg-teal-800",
      "RECURSOS PESQUEIROS E ENGENHARIA DE PESCA": "bg-purple-800",
      "ZOOTECNIA": "bg-orange-800",
      "BIOFÍSICA": "bg-red-600",
      "BIOLOGIA GERAL": "bg-blue-600",
      "BIOQUÍMICA": "bg-green-600",
      "BIOTECNOLOGIA": "bg-yellow-600",
      "BOTÂNICA": "bg-teal-600",
      "ECOLOGIA": "bg-purple-600",
      "FARMACOLOGIA": "bg-orange-600",
      "FISIOLOGIA": "bg-red-400",
      "GENÉTICA": "bg-blue-400",
      "IMUNOLOGIA": "bg-green-400",
      "MICROBIOLOGIA": "bg-yellow-400",
      "MORFOLOGIA": "bg-teal-400",
      "PARASITOLOGIA": "bg-purple-400",
      "ZOOLOGIA": "bg-orange-400",
      "EDUCAÇÃO FÍSICA": "bg-red-300",
      "ENFERMAGEM": "bg-blue-300",
      "FARMÁCIA": "bg-green-300",
      "FISIOTERAPIA E TERAPIA OCUPACIONAL": "bg-yellow-300",
      "FONOAUDIOLOGIA": "bg-teal-300",
      "MEDICINA": "bg-purple-300",
      "NUTRIÇÃO": "bg-orange-300",
      "ODONTOLOGIA": "bg-red-100",
      "SAÚDE COLETIVA": "bg-blue-100",
      "ANTROPOLOGIA": "bg-green-100",
      "ARQUEOLOGIA": "bg-yellow-100",
      "CIÊNCIA POLÍTICA": "bg-teal-100",
      "EDUCAÇÃO": "bg-purple-100",
      "FILOSOFIA": "bg-orange-100",
      "GEOGRAFIA": "bg-red-900",
      "HISTÓRIA": "bg-blue-900",
      "PSICOLOGIA": "bg-green-900",
      "SOCIOLOGIA": "bg-yellow-900",
      "TEOLOGIA": "bg-teal-900",
      "CIÊNCIA DA COMPUTAÇÃO": "bg-purple-900",
      "DESENHO INDUSTRIAL": "bg-orange-900",
      "ENGENHARIA AEROESPACIAL": "bg-red-500",
      "ENGENHARIA BIOMÉDICA": "bg-blue-500",
      "ENGENHARIA CIVIL": "bg-green-500",
      "ENGENHARIA DE ENERGIA": "bg-yellow-500",
      "ENGENHARIA DE MATERIAIS E METALÚRGICA": "bg-teal-500",
      "ENGENHARIA DE MINAS": "bg-purple-500",
      "ENGENHARIA DE PRODUÇÃO": "bg-orange-500",
      "ENGENHARIA DE TRANSPORTES": "bg-red-700",
      "ENGENHARIA ELÉTRICA": "bg-blue-700",
      "ENGENHARIA MECÂNICA": "bg-green-700",
      "ENGENHARIA NAVAL E OCEÂNICA": "bg-yellow-700",
      "ENGENHARIA NUCLEAR": "bg-teal-700",
      "ENGENHARIA QUÍMICA": "bg-purple-700",
      "ENGENHARIA SANITÁRIA": "bg-orange-700",
      "ARTES": "bg-red-50",
      "LETRAS": "bg-blue-50",
      "LINGÜÍSTICA": "bg-green-50",
      "BIOÉTICA": "bg-yellow-50",
      "CIÊNCIAS AMBIENTAIS": "bg-teal-50",
      "DEFESA": "bg-purple-50",
      "DIVULGAÇÃO CIENTÍFICA": "bg-orange-50",
      "MICROELETRÔNICA": "bg-red-700",
      "ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO": "bg-blue-700",
      "SEGURANÇA CONTRA INCÊNDIO": "bg-green-700",
      "ADMINISTRAÇÃO": "bg-yellow-700",
      "ARQUITETURA E URBANISMO": "bg-teal-700",
      "CIÊNCIA DA INFORMAÇÃO": "bg-purple-700",
      "COMUNICAÇÃO": "bg-orange-700",
      "DEMOGRAFIA": "bg-red-100",
      "DIREITO": "bg-blue-100",
      "ECONOMIA": "bg-green-100",
      "ECONOMIA DOMÉSTICA": "bg-yellow-100",
      "MUSEOLOGIA": "bg-teal-100",
      "PLANEJAMENTO URBANO E REGIONAL": "bg-purple-100",
      "SERVIÇO SOCIAL": "bg-orange-100",
      "TURISMO": "bg-red-200",
    };
      console.log(total)
      const [count, setCount] = useState(12)

      const search = props.search

      const filteredTotal = Array.isArray(total) ? total.filter(item => {
        // Normaliza a string do item e da busca para comparação
        const normalizeString = (str:any) => str
          .normalize("NFD") // Decompõe os caracteres acentuados
          .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos
          .toLowerCase(); // Converte para minúsculas
      
        const searchString = normalizeString(item.name);
        const normalizedSearch = normalizeString(search);
      
        return searchString.includes(normalizedSearch);
      }) : [];
      

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4 pt-0">
        <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
        <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
        <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
        <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
        <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>

        <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
        <Skeleton className="w-full h-[120px] rounded-md"></Skeleton>
        </div>
      ):(
        <div className="flex flex-col gap-2 p-4 pt-0">
        {filteredTotal.slice(0, count).map((item) => {
          
          return(
        <div className="flex" onClick={() => updateResearcher(item)}>
            <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[120px] border-neutral-200 border-r-0 ${qualisColor[normalizeArea(item.area || '')]} min-h-full relative`}></div>
          
            <button
       
            className={cn(
              `flex flex-col rounded-lg w-full rounded-l-none ${item.name === selectedResearcher?.name ? 'bg-neutral-100 dark:bg-neutral-700': 'bg-white dark:bg-neutral-800' }  dark:border-neutral-700 items-start gap-2  border p-3 text-left text-sm transition-all hover:bg-accent`,
            
            )}
           
          >
            <div className="flex w-full flex-col gap-1">
           <div className="flex justify-between items-center">
           <div className="text-xs font-medium mb-2 flex items-center gap-2">{item.area != '' ? (item.area):('Sem código')}
          </div>
           <Shapes size={16}/>
           </div>
              <div className="flex items-center">
                
                <div className="flex items-center gap-2">
                    
                  <div className="font-semibold text-lg">{item.name}</div>
                  
                 
                </div>
                <div
                  
                >
                  
                </div>
              </div>
              
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground flex flex-wrap gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Users size={12}/>{item.first_leader}</div>
{item.second_leader != 'nan' && ( <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Users size={12}/>{item.second_leader}</div>)}
          
            </div>
           
          </button>
          </div>
          )
            })}

    {filteredTotal.length > count && (
            <Button variant={'outline'} onClick={() => setCount(count + 12)}><Plus size={16} />Mostrar mais</Button>
        )}
      </div>
      )}
    </ScrollArea>
  )
}

