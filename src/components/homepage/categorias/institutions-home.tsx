import { useModalResult } from "../../hooks/use-modal-result";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../../components/ui/accordion"
import { Skeleton } from "../../ui/skeleton";
import { HeaderResultTypeHome } from "./header-result-type-home";
import { useContext, useMemo, useState } from "react";
import { Buildings, ChartBar, Rows, SquaresFour } from "phosphor-react";
import { UserContext } from "../../../context/context";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { GraficoInstitutionsHome } from "./institutions-home/grafico-institutions-home";
import { InstitutionsBlock } from "./institutions-home/institutions-block";
import { Button } from "../../ui/button";
import { useModalSidebar } from "../../hooks/use-modal-sidebar";
import { TableReseracherInstitutionshome } from "./institutions-home/table-institutions-home";
import { HeaderResult } from "../header-results";
import { Alert } from "../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Building2 } from "lucide-react";

type Instituicoes = {
  among: string,
  id: string,
  image: string,
  institution: string,
}

export function InstitutionsHome() {
  const { isOpen, type } = useModalResult();
  const [loading, isLoading] = useState(false)
  const { urlGeral, searchType, valoresSelecionadosExport, navbar } = useContext(UserContext)
  const [instituicoes, setInstituicoes] = useState<Instituicoes[]>([]);
  const [typeVisu, setTypeVisu] = useState('block')
  const isModalOpen = isOpen && type === "institutions-home";
  const { isOpen: isOpenSidebar } = useModalSidebar()


  let urlTermPublicacoes = ''

  if (searchType == 'article') {
    urlTermPublicacoes = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=ARTICLE`
  } else if (searchType == 'speaker') {
    urlTermPublicacoes = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=SPEAKER`
  } else if (searchType == 'patent') {
    urlTermPublicacoes = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=PATENT`
  } else if (searchType == 'book') {
    urlTermPublicacoes = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=BOOK`
  } else if (searchType == 'abstract') {
    urlTermPublicacoes = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=ABSTRACT`
  } else if (searchType == 'area') {
    urlTermPublicacoes = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=AREA`
  } 


  console.log(urlTermPublicacoes)

  useMemo(() => {
    const fetchData = async () => {
      isLoading(true);
      try {
        const response = await fetch(urlTermPublicacoes, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain'
          }
        });
        const data = await response.json();
        if (data) {
          setInstituicoes(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
        isLoading(false);
      }
    };
    fetchData();
  }, [urlTermPublicacoes]);

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  return (
    <div className="grid grid-cols-1 gap-4">
      <HeaderResult />

      <div className="mt-4 ">
        <Alert className={`p-0 bg-cover bg-no-repeat bg-center `}  >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de instituições
            </CardTitle>
            <Buildings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instituicoes.length}</div>
            <p className="text-xs text-muted-foreground">
              encontradas na busca
            </p>
          </CardContent>
        </Alert>
      </div>

      <div className=" mb-16  ">
        <Accordion defaultValue="item-1" type="single" collapsible >
          <AccordionItem value="item-1" >
            <div className="flex ">
              <HeaderResultTypeHome title="Gráfico de quantidade por instituição" icon={<ChartBar size={24} className="text-gray-400" />}>
              </HeaderResultTypeHome>

              <AccordionTrigger>

              </AccordionTrigger>
            </div>
            <AccordionContent >
              {loading ? (
                <Skeleton className="w-full rounded-md h-[300px]" />
              ) : (
                <div>
                  <GraficoInstitutionsHome
                    institutions={instituicoes}
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible >
          <AccordionItem value="item-1" >
            <div className="flex mb-2">
              <HeaderResultTypeHome title="Pesquisadores por detalhamento" icon={<Building2 size={24} className="text-gray-400" />}>
                <div className="flex gap-3 mr-3">
                  <Button className="hidden md:flex" onClick={() => setTypeVisu('rows')} variant={typeVisu === 'block' ? 'ghost' : 'outline'} size={'icon'}>
                    <Rows size={16} className="whitespace-nowrap" />
                  </Button>
                  <Button onClick={() => setTypeVisu('block')} variant={typeVisu === 'block' ? 'outline' : 'ghost'} size={'icon'}>
                    <SquaresFour size={16} className="whitespace-nowrap" />
                  </Button>
                </div>
              </HeaderResultTypeHome>
              <AccordionTrigger>

              </AccordionTrigger>
            </div>

            <AccordionContent >

              {typeVisu == 'block' ? (
                loading ? (
                  <ResponsiveMasonry
                    columnsCountBreakPoints={{
                      350: 1,
                      750: 2,
                      900: 3,
                      1200: navbar || isOpenSidebar ? 3 : 4
                    }}
                  >
                    <Masonry gutter="16px">
                      {items.map((item, index) => (
                        <div className="w-full" key={index}>{item}</div>
                      ))}
                    </Masonry>
                  </ResponsiveMasonry>
                ) : (
                  <InstitutionsBlock
                    institutions={instituicoes}
                  />
                )
              ) : (
                loading ? (

                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableReseracherInstitutionshome
                    institutions={instituicoes}
                  />
                )
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

    </div>
  )
}