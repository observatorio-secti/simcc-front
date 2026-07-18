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
import { ArrowUDownLeft, ChartBar, Rows, SquaresFour } from "phosphor-react"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { BookBlockPopUp } from "./book-block-popup"
import { Button } from "../ui/button"
import { FolderKanban } from "lucide-react"
import { GraficoProjetoPesquisa } from "./graficos/grafico-projeto-pesquisa"
import { TableReseracherProject } from "./columns/table-projetos-pesquisa"

type Filter = {
  year: number[]
  qualis: string[]
}

type Props = {
  name: string
}

type Livros = {
  agency_code: string
  agency_name: string
  nature: string
  description: string
  end_year: string
  id: string
  number_academic_masters: string
  number_phd: string
  number_specialists: string
  number_undergraduates: string
  project_name: string
  start_year: string
  status: string
  researcher_id: string
  production: Production[]
  foment: Forment[]
  components: Components[]
  researcher_name: string
}

interface Components {
  citations: string
  lattes_id: string
  name: string
}

interface Production {

  title: string
  type: string
}

interface Forment {
  agency_code: string
  agency_name: string
  nature: string
}


export function ResearchProject(props: Props) {

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

  const urlTermPublicacoes = `${urlGeral}researcher_research_project?researcher_id=${props.name}&term=&year=${yearString}`;
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

  return (
    <div className="">

      <div className="mb-6">
        <FilterYearPopUp
          onFilterUpdate={handleResearcherUpdate} />
      </div>


      <Accordion type="single" collapsible defaultValue="item-1" >
        <AccordionItem value="item-1" className="text-left" >
          <div className="flex mb-2">
            <HeaderResultTypeHome title="Gráfico de quantidade total de projetos de pesquisa" icon={<ChartBar size={24} className="text-gray-400" />}>
            </HeaderResultTypeHome>

            <AccordionTrigger>

            </AccordionTrigger>
          </div>
          <AccordionContent >
            {loading ? (
              <Skeleton className="w-full rounded-md h-[300px]" />
            ) : (
              <GraficoProjetoPesquisa
                publicacoes={publicacoes}
              />
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>


      <Accordion defaultValue="item-1" type="single" collapsible >
        <AccordionItem value="item-1" >
          <div className="flex mb-2">
            <div className="flex gap-4 w-full justify-between items-center text-left">
              <div className="flex gap-4 items-center">
                <FolderKanban size={24} className="text-gray-400" />
                <p className="font-medium">Todos os projetos de pesquisa</p>
              </div>

              <div className="flex gap-3 mr-3  items-center h-full">
                <div className="hidden md:flex gap-3">
                  <Button onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                    <Rows size={16} className=" whitespace-nowrap" />
                  </Button>
                  <Button onClick={() => setTypeVisu('block')} variant={typeVisu == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                    <SquaresFour size={16} className=" whitespace-nowrap" />
                  </Button>
                </div>

                <AccordionTrigger>

                </AccordionTrigger>
              </div>

            </div>

          </div>
          <AccordionContent >

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
                    type={'research-project'}
                  />
                )
              )
            ) : (
              loading ? (

                <Skeleton className="w-full rounded-md h-[400px]" />
              ) : (
                <TableReseracherProject projetos={publicacoes} />
              )
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}