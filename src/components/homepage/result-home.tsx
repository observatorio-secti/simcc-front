import { useContext, useEffect, useRef, useState } from 'react';
import { useModalHomepage } from '../hooks/use-modal-homepage';
import { ModalType, useModalResult } from '../hooks/use-modal-result';
import { ResultProvider } from '../provider/result-provider';

import { UserContext } from '../../context/context';

import { Button } from '../ui/button';
import {
  BookOpen,
  Building2,
  ChevronDown,
  ChevronUp,
  Copyright,
  Download,
  MoreHorizontal,
  SlidersHorizontal,
  Ticket,
  Users,
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { useModal } from '../hooks/use-modal-store';
import { File } from 'phosphor-react';
import { Search } from '../search/search';
import { HeaderResult } from './header-results';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

export function ResultHome() {
  const { isOpen, type } = useModalHomepage();
  const { onOpen, type: typeResult } = useModalResult();
  const {
    itemsSelecionados,
    searchType,
    simcc,
    urlGeral,
    valoresSelecionadosExport,
  } = useContext(UserContext);
  const { onOpen: onOpenModal } = useModal();

  const [isOn, setIsOn] = useState(true);

  const queryUrl = useQuery();

  const researcher = queryUrl.get('researcher');

  const type_search = queryUrl.get('type_search');
  const terms = queryUrl.get('terms');
  const [previousTypeSearch, setPreviousTypeSearch] = useState(type_search);
  const isModalOpen = isOpen && type === 'result-home';

  useEffect(() => {
    if (type_search == 'patent' && terms == '') {
      onOpen('patent-home');
    } else if (type_search == 'area' && terms == '') {
      onOpen('researchers-home');
    } else if (type_search == 'abstract' && terms == '') {
      onOpen('researchers-home');
    } else if (type_search == 'speaker' && terms == '') {
      onOpen('speaker-home');
    } else if (type_search == 'book' && terms == '') {
      onOpen('book-home');
    } else if (type_search == 'article' && terms == '') {
      onOpen('articles-home');
    } else if (type_search == 'name' && terms == '') {
      onOpen('researchers-home');
    } else if (typeResult == null || typeResult == undefined) {
      onOpen('researchers-home');
    }
  }, [typeResult]);

  ////
  const tab = queryUrl.get('tab');
  const navigate = useNavigate();

  const updateFilters = (category: string, values: any) => {
    if (values) {
      queryUrl.set(category, values);
    } else {
      queryUrl.delete(category);
    }
  };

  useEffect(() => {
    console.log('typeResult mudou para:', typeResult);
    updateFilters('tab', typeResult);

    navigate({
      pathname: '/resultados',
      search: queryUrl.toString(),
    });
  }, [typeResult]);

  useEffect(() => {
    if (tab != null && tab != undefined) {
      onOpen(tab as ModalType);
    }
  }, []);

  //csv
  const [jsonData, setJsonData] = useState<any[]>([]);

  let urlPublicacoesPorPesquisador = '';
  if (typeResult == 'articles-home') {
    urlPublicacoesPorPesquisador = `${urlGeral}bibliographic_production_researcher?terms=${valoresSelecionadosExport}&researcher_id=&type=ARTICLE&qualis=&qualis=&year=1900`;
  } else if (typeResult == 'researchers-home') {
    if (searchType === 'name') {
      urlPublicacoesPorPesquisador = `${urlGeral}researcherName?name=${valoresSelecionadosExport?.replace(/[;|()]/g, '')}`;
    } else if (searchType === 'article') {
      urlPublicacoesPorPesquisador = `${urlGeral}researcher?terms=${valoresSelecionadosExport}&university=&type=ARTICLE&graduate_program_id=`;
    } else if (searchType === 'book') {
      urlPublicacoesPorPesquisador = `${urlGeral}researcherBook?term=${valoresSelecionadosExport}&university=&type=BOOK&graduate_program_id=`; //
    } else if (searchType === 'area') {
      urlPublicacoesPorPesquisador = `${urlGeral}researcherArea_specialty?area_specialty=${valoresSelecionadosExport}&university=&graduate_program_id=`;
    } else if (searchType === 'speaker') {
      urlPublicacoesPorPesquisador = `${urlGeral}researcherParticipationEvent?term=${valoresSelecionadosExport}&university=&graduate_program_id=`; //
    } else if (searchType === 'patent') {
      urlPublicacoesPorPesquisador = `${urlGeral}researcherPatent?term=${valoresSelecionadosExport}&graduate_program_id=&university=`;
    } else if (searchType === 'abstract') {
      urlPublicacoesPorPesquisador = `${urlGeral}researcher?terms=${valoresSelecionadosExport}&university=&type=ABSTRACT&graduate_program_id=`;
    }
  } else if (typeResult == 'speaker-home') {
    urlPublicacoesPorPesquisador = `${urlGeral}pevent_researcher?researcher_id=&year=1900&term=${valoresSelecionadosExport}&nature=`;
  } else if (typeResult == 'institutions-home') {
    if (searchType == 'article') {
      urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=ARTICLE`;
    } else if (searchType == 'speaker') {
      urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=SPEAKER`;
    } else if (searchType == 'patent') {
      urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=PATENT`;
    } else if (searchType == 'book') {
      urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=BOOK`;
    } else if (searchType == 'abstract') {
      urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=ABSTRACT`;
    } else if (searchType == 'area') {
      urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${valoresSelecionadosExport}&university=&type=AREA`;
    }
  } else if (typeResult == 'patent-home') {
    urlPublicacoesPorPesquisador = `${urlGeral}patent_production_researcher?researcher_id=&year=1900&term=${valoresSelecionadosExport}&distinct=`;
  } else if (typeResult == 'book-home') {
    urlPublicacoesPorPesquisador = `${urlGeral}book_production_researcher?researcher_id=&year=1900&term=${valoresSelecionadosExport}&distinct=0`;

    urlPublicacoesPorPesquisador = `${urlGeral}book_chapter_production_researcher?researcher_id=&year=1900&term=${valoresSelecionadosExport}&distinct=0`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlPublicacoesPorPesquisador, {
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
          setJsonData(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    fetchData();
  }, [urlPublicacoesPorPesquisador]);

  const convertJsonToCsv = (json: any[]): string => {
    const items = json;
    const replacer = (_: string, value: any) => (value === null ? '' : value); // Handle null values
    const header = Object.keys(items[0]);
    const csv = [
      '\uFEFF' + header.join(';'), // Add BOM and CSV header
      ...items.map((item) =>
        header
          .map((fieldName) => JSON.stringify(item[fieldName], replacer))
          .join(';'),
      ), // CSV data
    ].join('\r\n');

    return csv;
  };

  const handleDownloadJson = async () => {
    try {
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=windows-1252;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `dados.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const stickyHeaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = stickyHeaderRef.current;
    const root = rootRef.current;
    if (!header || !root) return;

    const update = () => {
      root.style.setProperty('--sticky-header-h', `${header.offsetHeight}px`);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, [itemsSelecionados]);

  return (
    <div ref={rootRef} className="min-h-full w-full flex flex-col">
      <Helmet>
        <title>
          {itemsSelecionados.length === 0
            ? 'Pesquisa'
            : 'Pesquisa: ' +
              itemsSelecionados

                .map((item, index) => {
                  const term = item.term.replace(/[|;]/g, ''); // Remove o conector para obter apenas o termo
                  const connector = item.term.endsWith('|') ? 'ou' : 'e'; // Determina o conector
                  return index < itemsSelecionados.length - 1
                    ? `${term} ${connector}`
                    : term; // Adiciona o conector apenas se não for o último
                })
                .join(' ')}{' '}
          | {'Simcc'}
        </title>
        <meta name="description" content={`Pesquisa | ${'Simcc'}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      {(itemsSelecionados.length > 0 || researcher == 'false') && (
        <div
          ref={stickyHeaderRef}
          className="top-[68px] h-fit sticky z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur"
        >
          <div
            className={`w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800`}
          >
            {isOn && (
              <div className="w-full pt-4  flex justify-between items-center">
                <Search />
              </div>
            )}
            {itemsSelecionados.length > 0 && <HeaderResult />}
            <div
              className={`flex w-full flex-wrap gap-4 pt-2 justify-between ${isOn ? '' : ''} `}
            >
              <div className="flex flex-1 w-full">
                <ScrollArea>
                  <div className="w-full flex  items-center gap-2">
                    {!(
                      researcher == 'false' &&
                      itemsSelecionados.length == 0 &&
                      itemsSelecionados.length == 0
                    ) && (
                      <div
                        className={`pb-2 border-b-2 transition-all ${typeResult == 'researchers-home' ? 'border-b-[#719CB8]' : ' border-b-transparent '}`}
                      >
                        <Button
                          variant={
                            typeResult == 'researchers-home' ? 'ghost' : 'ghost'
                          }
                          className={`${typeResult}`}
                          onClick={() => onOpen('researchers-home')}
                        >
                          <Users className="h-4 w-4" />
                          Pesquisadores
                        </Button>
                      </div>
                    )}
                    {searchType === 'article' && (
                      <div
                        className={`pb-2 border-b-2  transition-all ${typeResult == 'articles-home' ? 'border-b-[#719CB8]' : ' border-b-transparent '}`}
                      >
                        <Button
                          variant={
                            typeResult == 'articles-home' ? 'ghost' : 'ghost'
                          }
                          className="m-0"
                          onClick={() => onOpen('articles-home')}
                        >
                          <File className="h-4 w-4" />
                          Artigos
                        </Button>
                      </div>
                    )}
                    {searchType === 'book' && (
                      <div
                        className={`pb-2 border-b-2  transition-all ${typeResult == 'book-home' ? 'border-b-[#719CB8]' : ' border-b-transparent '}`}
                      >
                        <Button
                          variant={
                            typeResult == 'book-home' ? 'ghost' : 'ghost'
                          }
                          className="m-0"
                          onClick={() => onOpen('book-home')}
                        >
                          <BookOpen className="h-4 w-4" />
                          Livros e capítulos
                        </Button>
                      </div>
                    )}
                    {searchType === 'patent' && (
                      <div
                        className={`pb-2 border-b-2  transition-all ${typeResult == 'patent-home' ? 'border-b-[#719CB8]' : ' border-b-transparent '}`}
                      >
                        <Button
                          variant={
                            typeResult == 'patent-home' ? 'ghost' : 'ghost'
                          }
                          className="m-0"
                          onClick={() => onOpen('patent-home')}
                        >
                          <Copyright className="h-4 w-4" />
                          Patentes
                        </Button>
                      </div>
                    )}
                    {searchType === 'speaker' && (
                      <div
                        className={`pb-2 border-b-2  transition-all ${typeResult == 'speaker-home' ? 'border-b-[#719CB8]' : ' border-b-transparent '}`}
                      >
                        <Button
                          variant={
                            typeResult == 'speaker-home' ? 'ghost' : 'ghost'
                          }
                          className="m-0"
                          onClick={() => onOpen('speaker-home')}
                        >
                          <Ticket className="h-4 w-4" />
                          Participação em eventos
                        </Button>
                      </div>
                    )}
                    {!(
                      simcc &&
                      researcher == 'false' &&
                      itemsSelecionados.length == 0 &&
                      itemsSelecionados.length == 0
                    ) &&
                      searchType != 'name' && (
                        <div
                          className={`pb-2 border-b-2 transition-all ${typeResult == 'institutions-home' ? 'border-b-[#719CB8]' : ' border-b-transparent '}`}
                        >
                          <Button
                            variant={
                              typeResult == 'institutions-home'
                                ? 'ghost'
                                : 'ghost'
                            }
                            className={`${typeResult}`}
                            onClick={() => onOpen('institutions-home')}
                          >
                            <Building2 className="h-4 w-4" />
                            Instituições
                          </Button>
                        </div>
                      )}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              <div className="hidden xl:flex xl:flex-nowrap gap-2">
                <div className="md:flex md:flex-nowrap gap-2">
                  <Link to={`${urlGeral}dictionary.pdf`} target="_blank">
                    <Button variant="ghost" className="">
                      <File size={16} className="" />
                      Dicionário de dados
                    </Button>
                  </Link>
                  <Button
                    onClick={() => handleDownloadJson()}
                    variant="ghost"
                    className=""
                  >
                    <Download size={16} className="" />
                    Baixar resultado
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOn(!isOn)}
                >
                  {isOn ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <div className="block xl:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="ghost"
                      size={'icon'}
                      className=" p-0 xl:flex"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <Link to={`${urlGeral}dictionary.pdf`} target="_blank">
                      <DropdownMenuItem className="gap-2">
                        <File size={16} className="" />
                        Dicionário de dados
                      </DropdownMenuItem>
                    </Link>

                    <DropdownMenuItem
                      onClick={() => handleDownloadJson()}
                      className="gap-2"
                    >
                      <Download size={16} className="" />
                      Baixar resultado
                    </DropdownMenuItem>

                    {typeResult == 'researchers-home' && (
                      <DropdownMenuItem
                        onClick={() => onOpenModal('filters')}
                        className="gap-2 lg:hidden"
                      >
                        <SlidersHorizontal size={16} className="" />
                        Filtros
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        {itemsSelecionados.length > 0 || researcher == 'false' ? (
          <div className="px-8 h-full">
            <ResultProvider />
          </div>
        ) : (
          <div className="h-[calc(100vh-134px)] flex flex-col md:p-8 p-4 md:pt-4">
            <Search />

            <div className="w-full flex flex-col items-center justify-center h-full">
              <p className="text-9xl text-eng-blue font-bold mb-16 animate-pulse">
                ^_^
              </p>
              <p className="font-medium text-lg">
                Experimente pesquisar um tema e veja o que a plataforma pode
                filtrar para você.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
