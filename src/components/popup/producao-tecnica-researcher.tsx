import { useContext, useMemo, useState } from "react";




type Livros = {
  id: string,
  title: string,
  year: string,
  name:string
}

type Patente = {
  id: string,
  grant_date: string,
  title: string,
  year: string,
  financing: string,
  project_name: string
  has_image: boolean
  relevance: boolean
  lattes_id: string
  researcher: string
}

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,

} from "../../components/ui/accordion"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Skeleton } from "../ui/skeleton";

import { ChartBar, SquaresFour, Rows, X, ArrowUDownLeft, Copyright, StripeLogo, Code } from "phosphor-react";

import { Button } from "../ui/button";
import { UserContext } from "../../context/context";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";

import { BookBlockPopUp } from "./book-block-popup";
import { FilterYearPopUp } from "./filters-year-popup";
import { TableReseracherPatentesPopup } from "./columns/producoes-tecnicas/table-patentes-popup";
import { TableReseracherMarcasPopup } from "./columns/producoes-tecnicas/table-marcas-popup";
import { GraficoProducaoTecnica } from "./graficos/grafico-producao-tecnica";


type Filter = {
  year: number[]
  qualis: string[]
}

type Props = {
  name: string
}

export function ProducaoTecnicaResearcherPopUp(props: Props) {
  const { urlGeral, searchType, itemsSelecionadosPopUp, setItensSelecionadosPopUp, itemsSelecionados } = useContext(UserContext)

  const [loading, isLoading] = useState(false)
  const [loading2, isLoading2] = useState(false)
  const [loading3, isLoading3] = useState(false)
  const [distinct] = useState(false)
  const [publicacoes, setPublicacoes] = useState<Patente[]>([]);
  const [typeVisu, setTypeVisu] = useState('block')
  const [typeVisu2, setTypeVisu2] = useState('block')
  const [typeVisu3, setTypeVisu3] = useState('block')

  const [filters, setFilters] = useState<Filter[]>([]);
  const [software, setSoftware] = useState<Livros[]>([]);
  // Função para lidar com a atualização de researcherData
  const handleResearcherUpdate = (newResearcherData: Filter[]) => {
    setFilters(newResearcherData);


  };
  function formatTerms(valores: { term: string }[]): string {
    let result = '';
    let tempTerms: string[] = [];

    valores.forEach(item => {
      let term = item.term.trim();

      if (term.endsWith(';')) {
        tempTerms.push(term.slice(0, -1));
      } else if (term.endsWith('|')) {
        tempTerms.push(term.slice(0, -1));

        if (tempTerms.length > 0) {
          result += '(' + tempTerms.join(';') + ')' + '|';
          tempTerms = [];
        }
      } else {
        if (tempTerms.length > 0) {
          result += '(' + tempTerms.join(';') + ')' + '|';
          tempTerms = [];
        }
        result += term + '|';
      }
    });

    if (tempTerms.length > 0) {
      result += '(' + tempTerms.join(';') + ')';
    } else {
      if (result.endsWith('|')) {
        result = result.slice(0, -1);
      }
    }

    return result;
  }

  const resultadoFormatado = formatTerms(itemsSelecionadosPopUp);
  const yearString = filters.length > 0 ? filters[0].year.join(';') : '';

  let urlTermPublicacoes = `${urlGeral}patent_production_researcher?researcher_id=${props.name}&year=${yearString}&term=`;

  if (searchType == "patent") {
    urlTermPublicacoes = `${urlGeral}patent_production_researcher?researcher_id=${props.name}&year=${yearString}&term=${resultadoFormatado}`;
  }

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


  //softaewra
  const urlTermSoftware = `${urlGeral}software_production_researcher?researcher_id=${props.name}&year=${yearString}`;

  useMemo(() => {
    const fetchData = async () => {
      try {
        isLoading2(true)
        const response = await fetch(urlTermSoftware, {
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
          setSoftware(data);
          isLoading2(false)
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermSoftware]);

  //marca
  let urlTermMarca = `${urlGeral}brand_production_researcher?researcher_id=${props.name}&year=${yearString}`;
  const [marca, setMarca] = useState<Livros[]>([]);

  useMemo(() => {
    const fetchData = async () => {
      try {
        isLoading3(true)
        const response = await fetch(urlTermMarca, {
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
          setMarca(data);
          isLoading3(false)
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermMarca]);

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));



  //conectores 
  const handleConnectorChange = (index: number, connector: string) => {
    // Crie uma cópia do array de itens selecionados
    const updatedItems = [...itemsSelecionadosPopUp];
    // Substitua o último caractere pelo novo conector
    updatedItems[index].term = updatedItems[index].term.slice(0, -1) + connector;
    // Atualize o estado com os itens atualizados
    setItensSelecionadosPopUp(updatedItems);
  };

  const handleRemoveItem = (indexToRemove: any) => {
    setItensSelecionadosPopUp(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  }



  return (
    <>

      <div className="">

       <div className="mb-6">
       <FilterYearPopUp
          onFilterUpdate={handleResearcherUpdate} />
       </div>

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1" className="text-left" >
            <div className="flex mb-2">
              <HeaderResultTypeHome title="Gráfico de quantidade total de produção técnica" icon={<ChartBar size={24} className="text-gray-400" />}>
              </HeaderResultTypeHome>
              <AccordionTrigger>

              </AccordionTrigger>
            </div>
            <AccordionContent >
              {loading ? (
                <Skeleton className="w-full rounded-md h-[300px]" />
              ) : (
                <GraficoProducaoTecnica software={software} publicacoes={publicacoes} marca={marca} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible >
          <AccordionItem value="item-1" >
            <div className="flex mb-2">
              <div className="flex gap-4 w-full justify-between items-center ">
                <div className="flex gap-4 items-center">
                  <Copyright size={24} className="text-gray-400" />
                  {searchType != 'patent' || itemsSelecionadosPopUp.length == 0 ? (
                    <p className="font-medium">Todas as patentes</p>
                  ) : (
                    <div className="font-medium flex items-center gap-2">
                      <span className="">{publicacoes.length} </span> ocorrências de

                      <div className='flex gap-2 items-center'>
                        {itemsSelecionadosPopUp.map((valor, index) => {
                          return (
                            <>
                              <div key={index} className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs bg-cyan-500 dark:bg-cyan-500 text-white border-0 `} >
                                {valor.term.replace(/[|;]/g, '')}
                                <X size={12} onClick={() => handleRemoveItem(index)} className="cursor-pointer" />
                                {/* Adicionando a escolha entre "e" ou "ou" */}

                              </div>

                              {index < itemsSelecionadosPopUp.length - 1 && (
                                <button className="rounded-full cursor-pointer flex items-center justify-center whitespace-nowrap h-8 w-8 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 transition-all text-xs outline-none" onClick={() => {
                                  const connector = itemsSelecionadosPopUp[index].term.endsWith('|') ? ';' : '|'; // Alterna entre "|" e ";" conforme necessário
                                  handleConnectorChange(index, connector);
                                }} >
                                  {itemsSelecionadosPopUp[index].term.endsWith(';') ? "e" : "ou"}
                                </button>
                              )}

                            </>
                          );
                        })}

                        em patentes
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mr-3  items-center h-full">
                  {(itemsSelecionadosPopUp != itemsSelecionados && searchType == 'patent') && (
                    <div className="flex gap-3  items-center">
                      <Button onClick={() => setItensSelecionadosPopUp(itemsSelecionados)} variant="ghost" size={'icon'}>
                        <ArrowUDownLeft size={16} className="hidden whitespace-nowrap" />
                      </Button>

                      <div className="w-[0.5px] h-6 dark:bg-neutral-800 bg-neutral-200"></div>
                    </div>
                  )}

                  <div className="hidden gap-3 md:flex">
                    <Button onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                      <Rows size={16} className="hidden whitespace-nowrap md:flex" />
                    </Button>
                    <Button onClick={() => setTypeVisu('block')} variant={typeVisu == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                      <SquaresFour size={16} className="hidden whitespace-nowrap md:flex" />
                    </Button>
                  </div>
                </div>

              </div>


              <AccordionTrigger>

              </AccordionTrigger>
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
                      type={'patente'}
                    />
                  )
                )
              ) : (
                loading ? (

                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableReseracherPatentesPopup
                    patentes={publicacoes}
                  />
                )
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible >
          <AccordionItem value="item-1" >
            <div className="flex mb-2">
              <div className="flex gap-4 w-full  justify-between items-center ">
                <div className="flex gap-4 items-center">
                  <Code size={24} className="text-gray-400" />
                  <p className="font-medium">Todos os softwares</p>
                </div>

                <div className="hidden md:flex gap-3 mr-3  items-center h-full">
                  <Button onClick={() => setTypeVisu2('rows')} variant={typeVisu2 == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                    <Rows size={16} className="hidden whitespace-nowrap md:flex" />
                  </Button>

                  <Button onClick={() => setTypeVisu2('block')} variant={typeVisu2 == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                    <SquaresFour size={16} className="hidden whitespace-nowrap md:flex" />
                  </Button>
                </div>

              </div>

              <AccordionTrigger>


              </AccordionTrigger>
            </div>
            <AccordionContent >

              {typeVisu2 == 'block' ? (
                loading2 ? (
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
                  software.length == 0 ? (
                    <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                  ) : (
                    <BookBlockPopUp
                      articles={software}
                      distinct={distinct}
                      type={'software'}
                    />
                  )

                )
              ) : (
                loading2 ? (

                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableReseracherMarcasPopup
                    livros={software}
                  />
                )
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible >
          <AccordionItem value="item-1" >
            <div className="flex mb-2">
              <div className="flex gap-4 w-full  justify-between items-center ">
                <div className="flex gap-4 items-center">
                  <StripeLogo size={24} className="text-gray-400" />
                  <p className="font-medium">Todas as marcas</p>
                </div>

                <div className="hidden md:flex gap-3 mr-3 items-center h-full">
                  <Button onClick={() => setTypeVisu3('rows')} variant={typeVisu3 == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                    <Rows size={16} className="hidden whitespace-nowrap md:flex" />
                  </Button>

                  <Button onClick={() => setTypeVisu3('block')} variant={typeVisu3 == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                    <SquaresFour size={16} className="hidden whitespace-nowrap md:flex" />
                  </Button>
                </div>

              </div>
              <AccordionTrigger>


              </AccordionTrigger>
            </div>
            <AccordionContent >

              {typeVisu3 == 'block' ? (
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
                  marca.length == 0 ? (
                    <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                  ) : (
                    <BookBlockPopUp
                      articles={marca}
                      distinct={distinct}
                      type={'marca'}
                    />
                  )
                )
              ) : (
                loading3 ? (

                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableReseracherMarcasPopup
                    livros={marca}
                  />
                )
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}