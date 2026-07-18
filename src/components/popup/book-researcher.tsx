import { useContext, useEffect, useMemo, useState } from "react";



type Livros = {
  id: string,
  title: string,
  year: string,
  isbn: string,
  publishing_company: string
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

import { ChartBar, SquaresFour, Rows, Book, X, ArrowUDownLeft, Books } from "phosphor-react";

import { Button } from "../ui/button";
import { UserContext } from "../../context/context";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";

import { BookBlockPopUp } from "./book-block-popup";
import { FilterYearPopUp } from "./filters-year-popup";
import { TableReseracherBookPopup } from "./columns/table-books-popup";

import { GraficoLivros } from "./graficos/grafico-livros";


type Filter = {
  year: number[]
  qualis: string[]
}

type Props = {
  name: string
}

interface ItemsSelecionados {
  term: string
}

export function BooksResearcherPopUp(props: Props) {
  const [itemsSelecionadosCap, setItensSelecionadosCap] = useState<ItemsSelecionados[]>([])

  const { urlGeral, searchType, itemsSelecionadosPopUp, setItensSelecionadosPopUp, itemsSelecionados } = useContext(UserContext)


  const [loading, isLoading] = useState(false)
  const [loading2, isLoading2] = useState(false)
  const [distinct] = useState(false)
  const [publicacoes, setPublicacoes] = useState<Livros[]>([]);
  const [typeVisu, setTypeVisu] = useState('block')
  const [typeVisu2, setTypeVisu2] = useState('block')
  const [capLivros, setCapLivros] = useState<Livros[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);

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

  let urlTermPublicacoes = `${urlGeral}book_production_researcher?researcher_id=${props.name}&year=${yearString}&term=`;

  if (searchType == "book") {
    urlTermPublicacoes = `${urlGeral}book_production_researcher?researcher_id=${props.name}&year=${yearString}&term=${resultadoFormatado}`;
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


  let urlTermCap = `${urlGeral}book_chapter_production_researcher?researcher_id=${props.name}&year=${yearString}&term=`

  if (searchType == "book") {
    urlTermCap = `${urlGeral}book_chapter_production_researcher?researcher_id=${props.name}&year=${yearString}&term=${formatTerms(itemsSelecionadosCap)}`
  }

  useMemo(() => {
    const fetchData = async () => {
      try {
        isLoading2(true)
        const response = await fetch(urlTermCap, {
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
          setCapLivros(data);
          isLoading2(false)
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermCap]);

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  useEffect(() => {
    setItensSelecionadosCap(itemsSelecionadosPopUp)
  }, []);


  //conectores 
  const handleConnectorChange = (index: number, connector: string) => {
    // Crie uma cópia do array de itens selecionados
    const updatedItems = [...itemsSelecionadosPopUp];
    // Substitua o último caractere pelo novo conector
    updatedItems[index].term = updatedItems[index].term.slice(0, -1) + connector;
    // Atualize o estado com os itens atualizados
    setItensSelecionadosPopUp(updatedItems);
  };

  const handleConnectorChangeCap = (index: number, connector: string) => {
    // Crie uma cópia do array de itens selecionados
    const updatedItems = [...itemsSelecionadosPopUp];
    // Substitua o último caractere pelo novo conector
    updatedItems[index].term = updatedItems[index].term.slice(0, -1) + connector;
    // Atualize o estado com os itens atualizados
    setItensSelecionadosCap(updatedItems);
  };

  const handleRemoveItem = (indexToRemove: any) => {
    setItensSelecionadosPopUp(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  }

  const handleRemoveItemCap = (indexToRemove: any) => {
    setItensSelecionadosCap(prevItems => prevItems.filter((_, index) => index !== indexToRemove));
  }



  return (
    <>

      <div className="mb-[150px]">
<div className="mb-6">
  
<FilterYearPopUp
          onFilterUpdate={handleResearcherUpdate} />
</div>

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1" className="text-left" >
            <div className="flex mb-2">
              <HeaderResultTypeHome title="Gráfico de quantidade total de livros e capítulos" icon={<ChartBar size={24} className="text-gray-400" />}>
              </HeaderResultTypeHome>
              <AccordionTrigger>

              </AccordionTrigger>
            </div>

            <AccordionContent >
              {loading ? (
                <Skeleton className="w-full rounded-md h-[300px]" />
              ) : (
                <GraficoLivros capLivros={capLivros} publicacoes={publicacoes} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible >
          <AccordionItem value="item-1" >
            <div className="flex mb-2">
              <div className="flex gap-4 w-full justify-between items-center ">
                <div className="flex gap-4 items-center">
                  <Book size={24} className="text-gray-400" />
                  {searchType != 'book' || itemsSelecionadosPopUp.length == 0 ? (
                    <p className="font-medium">Todos os livros</p>
                  ) : (
                    <div className="font-medium flex items-center gap-2">
                      <span className="">{publicacoes.length} </span> ocorrências de

                      <div className='flex gap-2 items-center'>
                        {itemsSelecionadosPopUp.map((valor, index) => {
                          return (
                            <>
                              <div key={index} className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs bg-pink-500 dark:bg-pink-500 text-white border-0 `} >
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

                        em livros
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mr-3 items-center justify-center">
                  {(itemsSelecionadosPopUp != itemsSelecionados && searchType == 'book') && (
                    <div className="flex gap-3 items-center">
                      <Button className="hidden whitespace-nowrap md:flex" onClick={() => setItensSelecionadosPopUp(itemsSelecionados)} variant="ghost" size={'icon'}>
                        <ArrowUDownLeft size={16} />
                      </Button>

                      <div className="w-[0.5px] h-6 dark:bg-neutral-800 bg-neutral-200"></div>
                    </div>
                  )}

                  <Button className="hidden whitespace-nowrap md:flex" onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                    <Rows size={16} />
                  </Button>

                  <Button className="hidden whitespace-nowrap md:flex" onClick={() => setTypeVisu('block')} variant={typeVisu == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                    <SquaresFour size={16} />
                  </Button>
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
                      type={'livro'}
                    />
                  )
                )
              ) : (
                loading ? (

                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableReseracherBookPopup
                    books={publicacoes}
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
                  <Books size={24} className="text-gray-400" />
                  {searchType != 'book' || itemsSelecionadosCap.length == 0 ? (
                    <p className="font-medium">Todos os capítulos de livros</p>
                  ) : (
                    <div className="font-medium flex items-center gap-2">
                      <span className="">{capLivros.length} </span> ocorrências de

                      <div className='flex gap-2 items-center'>
                        {itemsSelecionadosCap.map((valor, index) => {
                          return (
                            <>
                              <div key={index} className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs bg-pink-500 dark:bg-pink-500 text-white border-0 `} >
                                {valor.term.replace(/[|;]/g, '')}
                                <X size={12} onClick={() => handleRemoveItemCap(index)} className="cursor-pointer" />
                                {/* Adicionando a escolha entre "e" ou "ou" */}

                              </div>

                              {index < itemsSelecionadosCap.length - 1 && (
                                <button className="rounded-full cursor-pointer flex items-center justify-center whitespace-nowrap h-8 w-8 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 transition-all text-xs outline-none" onClick={() => {
                                  const connector = itemsSelecionadosPopUp[index].term.endsWith('|') ? ';' : '|'; // Alterna entre "|" e ";" conforme necessário
                                  handleConnectorChangeCap(index, connector);
                                }} >
                                  {itemsSelecionadosPopUp[index].term.endsWith(';') ? "e" : "ou"}
                                </button>
                              )}

                            </>
                          );
                        })}

                        em capítulos de livros
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mr-3 items-center h-full">
                  {(itemsSelecionadosPopUp != itemsSelecionados && searchType == 'book') && (
                    <div className="flex gap-3  items-center">
                      <Button className="hidden md:block" onClick={() => setItensSelecionadosCap(itemsSelecionados)} variant="ghost" size={'icon'}>
                        <ArrowUDownLeft size={16} className=" whitespace-nowrap" />
                      </Button>

                      <div className="w-[0.5px] h-6 dark:bg-neutral-800 bg-neutral-200"></div>
                    </div>
                  )}

                  <Button className="hidden whitespace-nowrap md:flex" onClick={() => setTypeVisu2('rows')} size={'icon'} variant={typeVisu2 == 'block' ? 'ghost' : 'outline'}>
                    <Rows size={16} />
                  </Button>

                  <Button className="hidden whitespace-nowrap md:flex" onClick={() => setTypeVisu2('block')} size={'icon'} variant={typeVisu2 == 'block' ? 'outline' : 'ghost'} >
                    <SquaresFour size={16} />
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
                        <div key={index}>{item}</div>
                      ))}
                    </Masonry>
                  </ResponsiveMasonry>
                ) : (
                  capLivros.length == 0 ? (
                    <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                  ) : (
                    <BookBlockPopUp
                      articles={capLivros}
                      distinct={distinct}
                      type={'capLivro'}
                    />
                  )
                )
              ) : (
                loading2 ? (

                  <Skeleton className="w-full rounded-md h-[400px]" />
                ) : (
                  <TableReseracherBookPopup
                    books={capLivros}
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