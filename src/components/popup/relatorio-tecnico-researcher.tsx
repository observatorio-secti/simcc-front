import { useContext, useMemo, useState } from "react";



type Livros = {

  id: string,
  grant_date: string,
  title: string,
  year: string,
  financing: string,
  project_name: string
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,

} from "../../components/ui/accordion"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Skeleton } from "../ui/skeleton";

import { ChartBar, SquaresFour, Rows, Book, ArrowUDownLeft, Files } from "phosphor-react";

import { Button } from "../ui/button";
import { UserContext } from "../../context/context";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";

import { TableReseracherArticleshome } from "../homepage/categorias/articles-home/table-articles";

import { BookBlockPopUp } from "./book-block-popup";
import { FilterYearPopUp } from "./filters-year-popup";
import { GraficoRelatorio } from "./graficos/grafico-relatório";
import { TableRelatorioTecnico } from "./columns/table-relatorio-tecnico";


type Filter = {
  year: number[]
  qualis: string[]
}

type Props = {
  name: string
}

export function RelatorioTecnicoResearcherPopUp(props: Props) {

  const { urlGeral, itemsSelecionadosPopUp, setItensSelecionadosPopUp, itemsSelecionados } = useContext(UserContext)
  const [loading, isLoading] = useState(false)

  const [distinct] = useState(false)
  const [publicacoes, setPublicacoes] = useState<Livros[]>([]);
  const [typeVisu, setTypeVisu] = useState('block')

  const [filters, setFilters] = useState<Filter[]>([]);

  // Função para lidar com a atualização de researcherData
  const handleResearcherUpdate = (newResearcherData: Filter[]) => {
    setFilters(newResearcherData);
  };

  const yearString = filters.length > 0 ? filters[0].year.join(';') : '';

  const urlTermPublicacoes = `${urlGeral}researcher_report?researcher_id=${props.name}&year=${yearString}`;

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

  return (
    <>
      <div className="mb-[150px]">

       <div className="mb-6">
       <FilterYearPopUp
          onFilterUpdate={handleResearcherUpdate} />
       </div>

        <Accordion type="single" collapsible defaultValue="item-1" >
          <AccordionItem value="item-1" >

            <div className="flex mb-2 text-left">
              <HeaderResultTypeHome title="Gráfico de orientações em andamento e concluídas " icon={<ChartBar size={24} className="text-gray-400" />}>
              </HeaderResultTypeHome>

              <AccordionTrigger>

              </AccordionTrigger>
            </div>

            <AccordionContent >
              {loading ? (
                <Skeleton className="w-full rounded-md h-[300px]" />
              ) : (
                <GraficoRelatorio
                  publicacoes={publicacoes}
                />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible >
          <AccordionItem value="item-1" className="" >
            <div className="flex gap-4 w-full mb-2 justify-between items-center ">
              <div className="flex gap-4 items-center text-left">
                <Files size={24} className="text-gray-400" />
                <p className="font-medium">Todos os relatórios técnicos</p>
              </div>

              <div className="flex gap-3 items-center h-full">

                <div className="hidden gap-3 md:flex">
                  <Button onClick={() => setTypeVisu('rows')} variant="outline" className={`bg-transparent border-0 ${typeVisu == 'rows' && ('bg-white dark:bg-neutral-800 border')}`} size={'icon'}>
                    <Rows size={16} className=" whitespace-nowrap" />
                  </Button>
                  <Button onClick={() => setTypeVisu('block')} variant="outline" className={`bg-transparent border-0 ${typeVisu == 'block' && ('bg-white dark:bg-neutral-800 border')} `} size={'icon'}>
                    <SquaresFour size={16} className=" whitespace-nowrap" />
                  </Button>
                </div>

                <AccordionTrigger>

                </AccordionTrigger>
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
                      1200: 3
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
                      type={'relatorio-tecnico'}
                    />
                  )
                )
              ) : (
                loading ? (

                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableRelatorioTecnico
                    relatorios={publicacoes}
                  />
                )
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div >
    </>
  )
}