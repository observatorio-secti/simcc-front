import { useContext, useMemo, useState } from "react"
import { UserContext } from "../../context/context"
import { Skeleton } from "../ui/skeleton"
import { FilterYearPopUp } from "./filters-year-popup"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,

} from "../../components/ui/accordion"
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home"
import { ArrowUDownLeft, CalendarBlank, ChartBar, Rows, SquaresFour } from "phosphor-react"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { BookBlockPopUp } from "./book-block-popup"
import { Button } from "../ui/button"
import { Briefcase, CircleAlert, Clock, Plus, TextSelectionIcon, Waypoints } from "lucide-react"
import { GraficoTrabalhoEvento } from "./graficos/grafico-trabalho-evento"
import { TableTrabalhoEventos } from "./columns/table-trabalho-eventos"
import { Alert } from "../ui/alert"
import { TableCargosFuncoes } from "./columns/table-cargos-funcoes"

type Filter = {
  year: number[]
  qualis: string[]
}

type Props = {
  name: string
}

type Livros = {
  id:string
  researcher_id:string
  enterprise:string
  start_year:string
  end_year:string
  employment_type:string
  other_employment_type:string
  functional_classification:string
  other_functional_classification:string
  workload_hours_weekly:string
  exclusive_dedication:boolean
  additional_info:string
};


export function CargosFuncoes(props: Props) {

  const { urlGeral, searchType, itemsSelecionadosPopUp, setItensSelecionadosPopUp, itemsSelecionados } = useContext(UserContext)
  const [loading, isLoading] = useState(false)
  const [publicacoes, setPublicacoes] = useState<Livros[]>([]);

  const [typeVisu, setTypeVisu] = useState('block')

  const [filters, setFilters] = useState<Filter[]>([]);

  // Função para lidar com a atualização de researcherData
  const handleResearcherUpdate = (newResearcherData: Filter[]) => {
    setFilters(newResearcherData);


  };


  const yearString = filters.length > 0 ? filters[0].year.join(';') : '';

  let urlTermPublicacoes = `${urlGeral}professional_experience?researcher_id=${props.name}&year=${yearString}`;

  console.log(urlTermPublicacoes)

  useMemo(() => {
    const fetchData = async () => {
      try {
        isLoading(true)
        const response = await fetch(urlTermPublicacoes, {
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
          setPublicacoes(data);
          isLoading(false)
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermPublicacoes]);


  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));


  const [distinct] = useState(false)
  //conectores 

  const [count, setCount] = useState(12)

  const groupedByEnterprise = Array.isArray(publicacoes)
  ? publicacoes.reduce((acc, curr) => {
      if (!acc[curr.enterprise]) {
        acc[curr.enterprise] = [];
      }
      acc[curr.enterprise].push(curr);
      return acc;
    }, {} as Record<string, Livros[]>)
  : {};

  
  // Ordena os grupos por start_year
  Object.keys(groupedByEnterprise).forEach((enterprise) => {
    groupedByEnterprise[enterprise].sort((a, b) => {
      const yearA = parseInt(a.start_year);
      const yearB = parseInt(b.start_year);
      return yearA - yearB;
    });
  });

  return (
    <div className="">

     <div className="mb-6">
     <FilterYearPopUp
        onFilterUpdate={handleResearcherUpdate} />
     </div>


   

      <Accordion defaultValue="item-1" type="single" collapsible >
        <AccordionItem value="item-1" >
          <div className="flex mb-2">
            <div className="flex gap-4 w-full justify-between items-center ">
              <div className="flex gap-4 items-center">
                <Waypoints size={24} className="text-gray-400" />
                <p className="font-medium">Todos os cargos e funções</p>
              </div>

              <div className="flex gap-3 mr-3 items-center h-full">
                <Button onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                  <Rows size={16} className=" whitespace-nowrap" />
                </Button>

                <Button onClick={() => setTypeVisu('block')} variant={typeVisu == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                  <SquaresFour size={16} className=" whitespace-nowrap" />
                </Button>
              </div>

            </div>

            <AccordionTrigger>


            </AccordionTrigger>
          </div>
          <AccordionContent>
            {typeVisu == 'block' ? (
              loading ? (
                <ResponsiveMasonry
                  columnsCountBreakPoints={{
                    350: 1,
                    750: 1,
                    900: 2,
                    1200: 2
                  }}
                >
                  <Masonry gutter="16px">
                    {items.map((item, index) => (
                      <div key={index} className="w-full">{item}</div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                publicacoes.length == 0 ? (
                  <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                ) : (
                  <div>
                    {Object.entries(groupedByEnterprise).map(([enterprise, livros]) => (
  <div key={enterprise} className="mb-8">
    <h2 className="text-lg font-bold mb-4">{enterprise}</h2>

    <ResponsiveMasonry
      columnsCountBreakPoints={{
        350: 1,
        750: 1,
        900: 2,
        1200: 2,
        1700: 3
      }}
    >
      <Masonry gutter="16px">
        {livros.slice(0, count).map((props) => (
          <div className="flex group w-full" key={props.id}>
            <div
              className={`
                h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0
                ${props.employment_type.split('_').join(' ') == 'Livre' && 'bg-lime-300'} 
                ${props.employment_type.split('_').join(' ') == 'Celetista' && 'bg-lime-400'} 
                ${props.employment_type.split('_').join(' ') == 'Bolsista' && 'bg-lime-500'} 
                ${props.employment_type.split('_').join(' ') == 'Outro' && 'bg-lime-600'} 
                ${props.employment_type.split('_').join(' ') == 'Servidor Publico' && 'bg-lime-700'} 
                ${props.employment_type.split('_').join(' ') == 'Professor Visitante' && 'bg-lime-800'} 
              `}
            ></div>
            <Alert className="rounded-l-none flex flex-col justify-between p-0 text-left">
              <div className="p-4 pb-0">
                <h3 className="font-semibold mb-4">{props.enterprise}</h3>
                <p className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal">
                  {props.functional_classification} {props.other_functional_classification && `- ${props.other_functional_classification}`}
                </p>

                {props.additional_info && (
                  <p className="text-sm capitalize mt-4 text-gray-500 dark:text-gray-300 font-normal">
                    {props.additional_info}
                  </p>
                )}
              </div>

              <div className="flex items-center flex-wrap mt-4 gap-3 p-4 pt-0">
                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                  <CalendarBlank size={12} />
                  {props.start_year} - {(props.end_year == null || props.end_year === '') ? 'Atual' : props.end_year}
                </div>

                {props.workload_hours_weekly && (
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                    <Clock size={12} /> {props.workload_hours_weekly} horas
                  </p>
                )}

                {props.employment_type && (
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                    <TextSelectionIcon size={12} /> {props.employment_type.split('_').join(' ')}
                  </p>
                )}

                {props.exclusive_dedication && (
                  <p className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                    <CircleAlert size={12} /> Dedicação exclusiva
                  </p>
                )}
              </div>
            </Alert>
          </div>
        ))}
      </Masonry>
    </ResponsiveMasonry>
  </div>
))}


                {publicacoes.length > count && (
                <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 12)}><Plus size={16} />Mostrar mais</Button></div>
            )}
                  </div>
                )
              )
            ) : (
              loading ? (

                <Skeleton className="w-full rounded-md h-[400px]" />
              ) : (
                <TableCargosFuncoes trabalho_evento={publicacoes} />
              )
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}