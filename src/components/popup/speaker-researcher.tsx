import { useContext, useMemo, useState } from 'react';

type Livros = {
  event_name: string;
  id: string;
  nature: string;
  participation: string;
  year: string;
};

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Skeleton } from '../ui/skeleton';

import {
  ChartBar,
  Ticket,
  SquaresFour,
  Rows,
  X,
  ArrowUDownLeft,
} from 'phosphor-react';

import { Button } from '../ui/button';
import { UserContext } from '../../context/context';
import { HeaderResultTypeHome } from '../homepage/categorias/header-result-type-home';

import { TableParticipacoesEventos } from '../homepage/categorias/articles-home/table-partificacoes-eventos';

import { BookBlockPopUp } from './book-block-popup';
import { FilterYearPopUp } from './filters-year-popup';
import { GraficosEventos, ChartMetricEvent } from './graficos/grafico-eventos';

type Filter = {
  year: number[];
  qualis: string[];
};

type Props = {
  name: string;
};

export function SpeakerResearcherPopUp(props: Props) {
  const {
    urlGeral,
    searchType,
    itemsSelecionadosPopUp,
    setItensSelecionadosPopUp,
    itemsSelecionados,
  } = useContext(UserContext);

  const [loading, isLoading] = useState(false);

  const [distinct] = useState(false);
  const [publicacoes, setPublicacoes] = useState<Livros[]>([]);
  const [typeVisu, setTypeVisu] = useState('block');

  const [filters, setFilters] = useState<Filter[]>([]);

  const handleResearcherUpdate = (newResearcherData: Filter[]) => {
    setFilters(newResearcherData);
  };

  function formatTerms(valores: { term: string }[]): string {
    let result = '';
    let tempTerms: string[] = [];

    valores.forEach((item) => {
      const term = item.term.trim();

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

  let urlTermPublicacoes = `${urlGeral}pevent_researcher?researcher_id=${props.name}&term=&year=${yearString}&nature=`;

  if (searchType == 'speaker') {
    urlTermPublicacoes = `${urlGeral}pevent_researcher?researcher_id=${props.name}&term=${resultadoFormatado}&year=${yearString}&nature=`;
  }

  console.log(urlTermPublicacoes);

  useMemo(() => {
    const fetchData = async () => {
      try {
        isLoading(true);
        const response = await fetch(urlTermPublicacoes, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });
        const data = await response.json();
        if (data) {
          setPublicacoes(data);
          isLoading(false);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermPublicacoes]);

  const processChartData = (data: Livros[]): ChartMetricEvent[] => {
    const yearMap = new Map<number, ChartMetricEvent>();

    data.forEach((item) => {
      const year = parseInt(item.year, 10);
      if (isNaN(year)) return;

      if (!yearMap.has(year)) {
        yearMap.set(year, {
          year: year,
          congress: 0,
          meeting: 0,
          workshop: 0,
          other: 0,
          seminar: 0,
          symposium: 0,
        });
      }

      const yearData = yearMap.get(year)!;
      const nature = item.nature?.toLowerCase() || '';

      if (nature.includes('congresso')) {
        yearData.congress += 1;
      } else if (nature.includes('encontro')) {
        yearData.meeting += 1;
      } else if (nature.includes('oficina')) {
        yearData.workshop += 1;
      } else if (nature.includes('seminário') || nature.includes('seminario')) {
        yearData.seminar += 1;
      } else if (nature.includes('simpósio') || nature.includes('simposio')) {
        yearData.symposium += 1;
      } else {
        yearData.other += 1;
      }
    });

    return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
  };

  const chartDataFormatted = processChartData(publicacoes);

  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  const handleConnectorChange = (index: number, connector: string) => {
    const updatedItems = [...itemsSelecionadosPopUp];
    updatedItems[index].term =
      updatedItems[index].term.slice(0, -1) + connector;
    setItensSelecionadosPopUp(updatedItems);
  };

  const handleRemoveItem = (indexToRemove: any) => {
    setItensSelecionadosPopUp((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove),
    );
  };
  return (
    <>
      <div className="">
        <div className="mb-6">
          <FilterYearPopUp onFilterUpdate={handleResearcherUpdate} />
        </div>

        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1" className="text-left">
            <div className="flex mb-2">
              <HeaderResultTypeHome
                title="Gráfico de quantidade total de participações em eventos"
                icon={<ChartBar size={24} className="text-gray-400" />}
              ></HeaderResultTypeHome>
              <AccordionTrigger></AccordionTrigger>
            </div>
            <AccordionContent>
              {loading ? (
                <Skeleton className="w-full rounded-md h-[300px]" />
              ) : (
                <GraficosEventos chartData={chartDataFormatted} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Accordion defaultValue="item-1" type="single" collapsible>
          <AccordionItem value="item-1">
            <div className="flex mb-2">
              <div className="flex gap-4 w-full justify-between items-center ">
                <div className="flex gap-4 items-center text-left">
                  <Ticket size={24} className="text-gray-400" />
                  {searchType != 'speaker' ||
                  itemsSelecionadosPopUp.length == 0 ? (
                    <p className="font-medium">
                      Todas as participações em eventos
                    </p>
                  ) : (
                    <div className="font-medium flex items-center gap-2">
                      <span className="">{publicacoes.length} </span>{' '}
                      ocorrências de
                      <div className="flex gap-2 items-center">
                        {itemsSelecionadosPopUp.map((valor, index) => {
                          return (
                            <>
                              <div
                                key={index}
                                className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs bg-orange-500 dark:bg-orange-500 text-white border-0 `}
                              >
                                {valor.term.replace(/[|;]/g, '')}
                                <X
                                  size={12}
                                  onClick={() => handleRemoveItem(index)}
                                  className="cursor-pointer"
                                />
                              </div>

                              {index < itemsSelecionadosPopUp.length - 1 && (
                                <button
                                  className="rounded-full cursor-pointer flex items-center justify-center whitespace-nowrap h-8 w-8 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 transition-all text-xs outline-none"
                                  onClick={() => {
                                    const connector = itemsSelecionadosPopUp[
                                      index
                                    ].term.endsWith('|')
                                      ? ';'
                                      : '|';
                                    handleConnectorChange(index, connector);
                                  }}
                                >
                                  {itemsSelecionadosPopUp[index].term.endsWith(
                                    ';',
                                  )
                                    ? 'e'
                                    : 'ou'}
                                </button>
                              )}
                            </>
                          );
                        })}
                        em participação em eventos
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mr-3  items-center h-full">
                  <div className="hidden md:flex gap-3">
                    <Button
                      onClick={() => setTypeVisu('rows')}
                      variant={typeVisu == 'block' ? 'ghost' : 'outline'}
                      size={'icon'}
                    >
                      <Rows size={16} className=" whitespace-nowrap" />
                    </Button>
                    <Button
                      onClick={() => setTypeVisu('block')}
                      variant={typeVisu == 'block' ? 'outline' : 'ghost'}
                      size={'icon'}
                    >
                      <SquaresFour size={16} className=" whitespace-nowrap" />
                    </Button>
                  </div>

                  <AccordionTrigger>
                    {itemsSelecionadosPopUp != itemsSelecionados &&
                      searchType == 'speaker' && (
                        <div className="flex gap-3  items-center">
                          <Button
                            onClick={() =>
                              setItensSelecionadosPopUp(itemsSelecionados)
                            }
                            variant="ghost"
                            size={'icon'}
                          >
                            <ArrowUDownLeft
                              size={16}
                              className=" whitespace-nowrap"
                            />
                          </Button>
                          <div className="w-[0.5px] h-6 dark:bg-neutral-800 bg-neutral-200"></div>
                        </div>
                      )}
                  </AccordionTrigger>
                </div>
              </div>
            </div>
            <AccordionContent>
              {typeVisu == 'block' ? (
                loading ? (
                  <ResponsiveMasonry
                    columnsCountBreakPoints={{
                      350: 1,
                      750: 1,
                      900: 2,
                      1200: 2,
                    }}
                  >
                    <Masonry gutter="16px">
                      {items.map((item, index) => (
                        <div className="w-full" key={index}>
                          {item}
                        </div>
                      ))}
                    </Masonry>
                  </ResponsiveMasonry>
                ) : publicacoes.length == 0 ? (
                  <div className="items-center justify-center w-full flex text-center pt-6">
                    Sem resultados para essa pesquisa
                  </div>
                ) : (
                  <BookBlockPopUp
                    articles={publicacoes as any}
                    distinct={distinct}
                    type={'participacao-evento'}
                  />
                )
              ) : loading ? (
                <Skeleton className="w-full rounded-md h-[400px]" />
              ) : (
                <TableParticipacoesEventos p={publicacoes as any} />
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
