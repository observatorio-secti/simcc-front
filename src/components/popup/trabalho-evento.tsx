import { useContext, useMemo, useState } from "react"
import { UserContext } from "../../context/context"
import { Skeleton } from "../ui/skeleton"
import { FilterYearPopUp } from "./filters-year-popup"
import { Filter } from "../../types"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,

} from "../../components/ui/accordion"
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home"
import { ArrowUDownLeft, ChartBar, Rows, SquaresFour } from "phosphor-react"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { BookBlockPopUp } from "./book-block-popup"
import { Button } from "../ui/button"
import { Briefcase } from "lucide-react"
import { GraficoTrabalhoEvento } from "./graficos/grafico-trabalho-evento"
import { TableTrabalhoEventos } from "./columns/table-trabalho-eventos"


type Props = {
  name: string
}

type Livros = {
  authors: string;
  homepage: string;
  language: string;
  means_divulgation: string;
  nature: string;
  relevance: boolean;
  scientific_divulgation: boolean;
  title: string;
  title_en: string;
  year_: string;
};


export function WorkEvent(props: Props) {

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

  let urlTermPublicacoes = `${urlGeral}researcher_production/events?researcher_id=${props.name}&year=${yearString}`;

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



  return (
    <div className="">

      <div className="mb-6">
        <FilterYearPopUp
          onFilterUpdate={handleResearcherUpdate} />
      </div>


      <Accordion type="single" collapsible defaultValue="item-1" >
        <AccordionItem value="item-1" className="text-left" >
          <div className="flex mb-2">
            <HeaderResultTypeHome title="Gráfico de quantidade total de trabalhos em eventos" icon={<ChartBar size={24} className="text-gray-400" />}>
            </HeaderResultTypeHome>

            <AccordionTrigger>

            </AccordionTrigger>
          </div>
          <AccordionContent >
            {loading ? (
              <Skeleton className="w-full rounded-md h-[300px]" />
            ) : (
              <GraficoTrabalhoEvento publicacoes={publicacoes} />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>


      <Accordion defaultValue="item-1" type="single" collapsible >
        <AccordionItem value="item-1" >
          <div className="flex mb-2">
            <div className="flex gap-4 w-full justify-between items-center ">
              <div className="flex gap-4 items-center text-left">
                <Briefcase size={24} className="text-gray-400" />
                <p className="font-medium">Todos os trabalhos em eventos</p>
              </div>

              <div className="flex gap-3 mr-3 items-center h-full">
                <div className="hidden md:flex gap-3">
                  <Button onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                    <Rows size={16} className=" whitespace-nowrap" />
                  </Button>
                  <Button onClick={() => setTypeVisu('block')} variant={typeVisu == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                    <SquaresFour size={16} className=" whitespace-nowrap" />
                  </Button>
                </div>
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
                      <div className="w-full" key={index}>{item}</div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
              ) : (
                publicacoes.length == 0 ? (
                  <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                ) : (
                  <BookBlockPopUp
                    articles={publicacoes}
                    distinct={distinct}
                    type={'work-event'}
                  />
                )
              )
            ) : (
              loading ? (

                <Skeleton className="w-full rounded-md h-[400px]" />
              ) : (
                <TableTrabalhoEventos trabalho_evento={publicacoes} />
              )
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}