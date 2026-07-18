import { useContext, useMemo, useState } from "react"
import { UserContext } from "../../context/context"
import { Skeleton } from "../ui/skeleton"
import { HeaderResult } from "../homepage/header-results"
import { Alert } from "../ui/alert"
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { ArrowDownUp, Asterisk, Clock, Code, Info, MapPin, Plus, UserCog } from "lucide-react"
import { FilterYearPopUp } from "../popup/filters-year-popup"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home"
import { ChartBar, MagnifyingGlass, Rows, SquaresFour, UserGear } from "phosphor-react"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { BlockItemGeral } from "../homepage/categorias/book-home/block-item-geral"
import { TableReseracherMarcasPopup } from "../popup/columns/producoes-tecnicas/table-marcas-popup"
import { GraficoSoftware } from "./graficos/grafico-software"
import { DataTable } from "../popup/columns/popup-data-table"
import { columns } from "../componentsModal/columns-researchers-program"
import { columnsTecnicos } from "./columns/colums-tecnicos"
import { GraficoTecnicosGenero } from "../dashboard/graficos/grafico-tecnicos-genero"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { GraficoTecnicosRt } from "../dashboard/graficos/grafico-tecnicos-rt"
import { GraficoTecnicosCargo } from "../dashboard/graficos/grafico-tecnico-cargo"
import { GraficoProgressaoTecnicos } from "../dashboard/graficos/grafico-progressao-tecnicos"
import { GraficoSetorTecnicos } from "./graficos/grafico-setor-tecnico"
import { Input } from "../ui/input"

type Patente = {
  technician_id: string,
  nome: string,
  genero: string,
    name:string
    deno_sit:string
    rt:string 
    classe:string 
    cargo:string
    nivel:string 
    ref:string
    titulacao:string 
    setor:string 
    detalhe_setor:string 
    dting_org:string 
    data_prog:string 
    semester:string 
    }

    type Filter = {
        year: number[]
        qualis: string[]
      }

export function TechnicianHome() {
    const [publicacoes, setPublicacoes] = useState<Patente[]>([]);
    const [typeVisu, setTypeVisu] = useState('block')
    const [loading, isLoading] = useState(false)

    const [filters, setFilters] = useState<Filter[]>([]);

    const handleResearcherUpdate = (newResearcherData: Filter[]) => {
        setFilters(newResearcherData);
  
    }

    const yearString = filters.length > 0 ? filters[0].year.join(';') : '';

    const {urlGeral, valoresSelecionadosExport} = useContext(UserContext)
    const [distinct, setDistinct] = useState(false)
    const [pesquisaInput, setPesquisaInput] = useState('');
    let urlTermPublicacoes = `${urlGeral}ufmg/technician`;
  
    console.log(urlTermPublicacoes)
    useMemo(() => {
        const fetchData = async () => {
            try {
              isLoading(true)
              const response = await fetch( urlTermPublicacoes, {
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
        }, [ urlTermPublicacoes]);

        const filteredTotal = Array.isArray(publicacoes) ? publicacoes.filter(item => { 
          const normalizeString = (str) => str
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase();
          
          const searchString = normalizeString(item.nome);
          const normalizedSearch = normalizeString(pesquisaInput);
          
          return (
            searchString.includes(normalizedSearch) 
           
          );
        }) : [];

        const items = Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="w-full rounded-md h-[170px]" />
          ));

const [count, setCount] = useState(12)
    return(
        <div className="grid grid-cols-1 gap-4 pb-16 ">
          <HeaderResult/>

          <Alert className="h-14 mt-4 p-2 flex items-center justify-between  w-full ">
                <div className="flex items-center gap-2 w-full flex-1">
                  <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
                  <Input value={pesquisaInput} onChange={(e) => setPesquisaInput(e.target.value)}  type="text" className="border-0 w-full " />
                </div>

                <div className="w-fit">


                </div>
              </Alert>

             <div className="mt-6 ">
             <Alert className={`p-0 bg-cover bg-no-repeat bg-center `}  >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de técnicos administrativos
                    </CardTitle>
                    <UserCog className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredTotal.length}</div>
                    <p className="text-xs text-muted-foreground">
                      encontradas na busca
                    </p>
                  </CardContent>
                  </Alert>
             </div>

<Accordion  type="single" collapsible defaultValue="item-1" className="hidden md:flex w-full">
                <AccordionItem value="item-1" className="w-full" >
                <div className="flex ">
                <HeaderResultTypeHome title="Gráfico dos técnicos administrativos" icon={<ChartBar size={24} className="text-gray-400" />}>
                        </HeaderResultTypeHome>
                    <AccordionTrigger>
                    
                    </AccordionTrigger>
                    </div>
                    <AccordionContent className="p-0 w-full">
                    {loading ? (
                    <div className="w-full">
                        <Skeleton className="w-full  rounded-md h-[300px]"/>
                    </div>
                    ):(
                     <div className="grid gap-8">
                       <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                                      <Alert className="lg:col-span-2 ">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                          <div>
                                            <CardTitle className="text-sm font-medium">
                                              Perfil da carreira
                                            </CardTitle>
                                            <CardDescription>Classe de trabalho</CardDescription>
                                          </div>
                      
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                              <TooltipContent>
                                                <p>Fonte: Instituição</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                      
                                        </CardHeader>
                      
                                        <CardContent className="flex py-0 flex-1  items-center justify-center">
                                          <GraficoTecnicosCargo docentes={filteredTotal} />
                                        </CardContent>
                      
                                      </Alert>
                      
                                      <Alert className="">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                          <div>
                                            <CardTitle className="text-sm font-medium">
                                              Regime de trabalho
                                            </CardTitle>
                                            <CardDescription>Carga horária semanal</CardDescription>
                                          </div>
                      
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                              <TooltipContent>
                                                <p>Fonte: Instituição</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                      
                                        </CardHeader>
                      
                                        <CardContent className="flex py-0 flex-1  items-center justify-center">
                                          <GraficoTecnicosRt docentes={filteredTotal} />
                                        </CardContent>
                                      </Alert>
                                    </div>

                    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                      <Alert className=" h-[400px]">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                          <div>
                                            <CardTitle className="text-sm font-medium">
                                              Divisão por gênero
                                            </CardTitle>
                                            <CardDescription>Distribuição na instituição</CardDescription>
                                          </div>
                      
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                              <TooltipContent>
                                                <p>Fonte: Instituição</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                      
                                        </CardHeader>
                      
                                        <CardContent className="flex py-0 flex-1  items-center justify-center">
                                          <GraficoTecnicosGenero docentes={filteredTotal} />
                                        </CardContent>
                      
                                      </Alert>

                                      <Alert className="">
                                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                          <div>
                                                            <CardTitle className="text-sm font-medium">
                                                              Progressão por ano
                                                            </CardTitle>
                                                            <CardDescription>Quantidade de progressão TAE </CardDescription>
                                                          </div>
                                      
                                                          <TooltipProvider>
                                                            <Tooltip>
                                                              <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                              <TooltipContent>
                                                                <p>Fonte: Instituição</p>
                                                              </TooltipContent>
                                                            </Tooltip>
                                                          </TooltipProvider>
                                      
                                                        </CardHeader>
                                      
                                                        <CardContent className="flex py-0 flex-1  items-center justify-center">
                                                          <GraficoProgressaoTecnicos docentes={filteredTotal} />
                                                        </CardContent>
                                                      </Alert>


                                                      <Alert className="">
                                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                          <div>
                                                            <CardTitle className="text-sm font-medium">
                                                              Quantidade de TAES por setor
                                                            </CardTitle>
                                                            <CardDescription>Setores da instituição </CardDescription>
                                                          </div>
                                      
                                                          <TooltipProvider>
                                                            <Tooltip>
                                                              <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                              <TooltipContent>
                                                                <p>Fonte: Instituição</p>
                                                              </TooltipContent>
                                                            </Tooltip>
                                                          </TooltipProvider>
                                      
                                                        </CardHeader>
                                      
                                                        <CardContent className="flex py-0 flex-1  items-center justify-center">
                                                          <GraficoSetorTecnicos docentes={filteredTotal} />
                                                        </CardContent>
                                                      </Alert>
                    </div>
                     </div>
                    )}
                    </AccordionContent>
                </AccordionItem>
                </Accordion>

              

                <Accordion defaultValue="item-1"  type="single" collapsible >
                <AccordionItem value="item-1" >
                <div className="flex ">
                <div className="flex gap-4 w-full justify-between items-center ">
            <div className="flex gap-4 items-center">
            <UserCog size={24} className="text-gray-400" />
            <p className=" font-medium"> Técnicos administrativos</p>
            </div>

            <div className="flex gap-3 mr-3  items-center h-full">
         

            <Button onClick={() => setTypeVisu('rows')}  variant={typeVisu == 'block' ? 'ghost' : 'outline' } size={'icon'}>
                            <Rows size={16} className=" whitespace-nowrap" />
                        </Button>

                        <Button  onClick={() => setTypeVisu('block')}  variant={typeVisu == 'block' ? 'outline' : 'ghost' }  size={'icon'}>
                            <SquaresFour size={16} className=" whitespace-nowrap" />
                        </Button>
            </div>

          </div>
                   

                    <AccordionTrigger>
                   
                    </AccordionTrigger>
                    </div>
                    <AccordionContent className="w-full" >

{typeVisu == 'block' ? (
                    loading ? (
                        <ResponsiveMasonry
                        columnsCountBreakPoints={{
                            350: 1,
                            750: 2,
                            900: 3,
                            1200: 4
                        }}
                    >
                                     <Masonry gutter="16px">
                        {items.map((item, index) => (
                                <div className="w-full" key={index}>{item}</div>
                              ))}
                        </Masonry>
        </ResponsiveMasonry>
                      ):(
                        filteredTotal.length == 0 ? (
                          <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                         ):(
                         <div>
                           <ResponsiveMasonry
                          columnsCountBreakPoints={{
                              350: 1,
                              750: 2,
                              900: 3,
                              1200: 4
                          }}
                      >
                                       <Masonry gutter="16px">
                      
                       {filteredTotal.slice(0, count).map((props) => (
                          <div className="flex w-full">
                            <Alert className="rounded-r-none min-w-2 whitespace-nowrap w-2 p-0 bg-eng-dark-blue"></Alert>

                            <Alert className="rounded-l-none border-l-0">
                          <div className="flex justify-between items-start gap-4">
                          <div>
  <h1>{props.nome}</h1>
  <p className="text-gray-500 text-xs">{props.cargo}</p>
</div>

<div className="text-gray-500 flex gap-1 items-center">
<Clock size={12}/><p>{props.rt}h</p>
</div>
                          </div>

                          <div className="flex flex-wrap mt-8 gap-3">
                          <div className="text-gray-500 flex gap-1 items-center">
<MapPin size={12}/><p>{props.setor}</p>
</div>

<div className="text-gray-500 flex gap-1 items-center">
<Asterisk size={12}/><p>{props.classe}</p>
</div>

<div className="text-gray-500 flex gap-1 items-center">
<ArrowDownUp size={12}/><p>Nível: {props.nivel}</p>
</div>
                          </div>
                            </Alert>
                          </div>
                         ))}


                       
                          </Masonry>
          </ResponsiveMasonry>

{filteredTotal.length > count && (
  <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 12)}><Plus size={16} />Mostrar mais</Button></div>
)}
                         </div>
                         )
                      )
                    ):(
                      loading ? (
                        
                        <Skeleton className="w-full rounded-md h-[400px]"/>
                      ):(
                     <DataTable
                     columns={columnsTecnicos}
                                         data={filteredTotal}
                                       />
                      )
                    )}
                    </AccordionContent>
                </AccordionItem>
                </Accordion>
        </div>
    )
}