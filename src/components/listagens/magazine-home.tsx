import { useContext, useEffect, useMemo, useState } from 'react';
import { UserContext } from '../../context/context';
import { Skeleton } from '../ui/skeleton';
import { HeaderResult } from '../homepage/header-results';
import { Alert } from '../ui/alert';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookOpen, Hash, Plus } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { LinkBreak, MagnifyingGlass, Rows, SquaresFour } from 'phosphor-react';
import { Button } from '../ui/button';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { DataTable } from '../popup/columns/popup-data-table';
import { columnsMagazine } from './columns/colums-magazine';

type Revista = {
  id: string;
  issn: string;
  jcr_link: string;
  jif: string;
  magazine: string;
  qualis: string;
};

export const qualisColor = {
  A1: 'bg-[#006837]',
  A2: 'bg-[#8FC53E]',
  A3: 'bg-[#ACC483]',
  A4: 'bg-[#BDC4B1]',
  B1: 'bg-[#F15A24]',
  B2: 'bg-[#F5831F]',
  B3: 'bg-[#F4AD78]',
  B4: 'bg-[#F4A992]',
  B5: 'bg-[#F2D3BB]',
  C: 'bg-[#EC1C22]',
  None: 'bg-[#560B11]',
  SQ: 'bg-[#560B11]',
};

function MagazineSearchBar({
  pesquisaInput,
  setPesquisaInput,
}: {
  pesquisaInput: string;
  setPesquisaInput: (val: string) => void;
}) {
  return (
    <Alert className="h-14 mt-4 p-2 flex items-center justify-between w-full">
      <div className="flex items-center gap-2 w-full flex-1">
        <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
        <Input
          value={pesquisaInput}
          onChange={(e) => setPesquisaInput(e.target.value)}
          type="text"
          placeholder="Busque por ISSN ou Nome..."
          className="border-0 w-full"
        />
      </div>
    </Alert>
  );
}

function MagazineSummaryCard({ totalMagazines }: { totalMagazines: number }) {
  return (
    <div className="mt-6">
      <Alert className="p-0 bg-cover bg-no-repeat bg-center">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de revistas
          </CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalMagazines.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            encontradas na plataforma
          </p>
        </CardContent>
      </Alert>
    </div>
  );
}

function MagazineListAccordion({
  loading,
  publicacoes,
  typeVisu,
  setTypeVisu,
  onLoadMore,
  hasMore,
}: {
  loading: boolean;
  publicacoes: Revista[];
  typeVisu: string;
  setTypeVisu: (val: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}) {
  const items = Array.from({ length: 12 }, (_, index) => (
    <Skeleton key={index} className="w-full rounded-md h-[170px]" />
  ));

  return (
    <Accordion defaultValue="item-1" type="single" collapsible>
      <AccordionItem value="item-1">
        <div className="flex">
          <div className="flex gap-4 w-full justify-between items-center">
            <div className="flex gap-4 items-center">
              <BookOpen size={24} className="text-gray-400" />
              <p className="font-medium">Revistas</p>
            </div>
            <div className="flex gap-3 mr-3 items-center h-full">
              <Button
                onClick={() => setTypeVisu('rows')}
                variant={typeVisu === 'block' ? 'ghost' : 'outline'}
                size={'icon'}
              >
                <Rows size={16} className="whitespace-nowrap" />
              </Button>
              <Button
                onClick={() => setTypeVisu('block')}
                variant={typeVisu === 'block' ? 'outline' : 'ghost'}
                size={'icon'}
              >
                <SquaresFour size={16} className="whitespace-nowrap" />
              </Button>
            </div>
          </div>
          <AccordionTrigger />
        </div>
        <AccordionContent>
          {typeVisu === 'block' ? (
            loading && publicacoes.length === 0 ? (
              <ResponsiveMasonry
                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}
              >
                <Masonry gutter="16px">
                  {items.map((item, index) => (
                    <div className="w-full" key={index}>
                      {item}
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>
            ) : publicacoes.length === 0 ? (
              <div className="items-center justify-center w-full flex text-center pt-6">
                Sem resultados para essa pesquisa
              </div>
            ) : (
              <div>
                <ResponsiveMasonry
                  columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}
                >
                  <Masonry gutter="16px">
                    {publicacoes.map((props, index) => (
                      <div className="flex w-full" key={props.id || index}>
                        <div
                          className={`h-full w-2 min-w-[8px] rounded-l-lg border border-r-0 border-neutral-200 dark:border-neutral-800 ${qualisColor[props.qualis as keyof typeof qualisColor] || qualisColor['None']}`}
                        ></div>
                        <Alert className="flex items-center rounded-l-none">
                          <div className="flex items-center flex-1">
                            <div>
                              <div className="flex items-center gap-2">
                                <Hash size={16} className="text-gray-400" />
                                <p className="text-[13px] text-gray-500">
                                  ISSN {props.issn}
                                </p>
                              </div>
                              <h4 className="text-base font-medium">
                                {props.magazine}
                              </h4>
                              <div className="mt-2 flex items-center gap-4">
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                                  <div
                                    className={`w-4 h-4 rounded-md ${qualisColor[props.qualis as keyof typeof qualisColor] || qualisColor['None']}`}
                                  ></div>
                                  Qualis {props.qualis}
                                </div>
                                {props.jif !== 'None' && props.jif && (
                                  <Link
                                    to={props.jcr_link || '#'}
                                    target="_blank"
                                    className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"
                                  >
                                    <LinkBreak size={16} />
                                    JCR
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </Alert>
                      </div>
                    ))}
                  </Masonry>
                </ResponsiveMasonry>
                {hasMore && (
                  <div className="w-full flex justify-center mt-8">
                    <Button onClick={onLoadMore}>
                      <Plus size={16} />
                      Mostrar mais
                    </Button>
                  </div>
                )}
              </div>
            )
          ) : loading && publicacoes.length === 0 ? (
            <Skeleton className="w-full rounded-md h-[400px]" />
          ) : (
            <DataTable columns={columnsMagazine} data={publicacoes} />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export function MagazineHome() {
  const { urlGeral } = useContext(UserContext);

  const [publicacoes, setPublicacoes] = useState<Revista[]>([]);
  const [totalMagazines, setTotalMagazines] = useState<number>(0);
  const [typeVisu, setTypeVisu] = useState('block');
  const [loading, setLoading] = useState(false);

  const [pesquisaInput, setPesquisaInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState(pesquisaInput);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 24;

  useEffect(() => {
    const handler = setTimeout(() => {
      if (debouncedInput !== pesquisaInput) {
        setDebouncedInput(pesquisaInput);
        setPage(1);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [pesquisaInput, debouncedInput]);

  const queryParams = useMemo(() => {
    if (debouncedInput === '') {
      return `initials=&issn=`;
    } else if (/^\d+$/.test(debouncedInput.replace(/-/g, ''))) {
      return `initials=&issn=${debouncedInput}`;
    } else {
      return `initials=${debouncedInput}&issn=`;
    }
  }, [debouncedInput]);

  const urlMagazine = `${urlGeral}magazine?${queryParams}&page=${page}&lenght=${limit}&sort_by=qualis&sort_order=asc`;
  const urlMetrics = `${urlGeral}metrics/magazine/chart?${queryParams}`;

  const fetchOptions = {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '3600',
      'Content-Type': 'text/plain',
    },
  } as RequestInit;

  useEffect(() => {
    const abortController = new AbortController();
    const fetchData = async () => {
      if (page === 1) setLoading(true);
      try {
        const response = await fetch(urlMagazine, {
          ...fetchOptions,
          signal: abortController.signal,
        });
        const data = await response.json();
        if (data && !abortController.signal.aborted) {
          if (page === 1) {
            setPublicacoes(data);
          } else {
            setPublicacoes((prev) => [...prev, ...data]);
          }
          setHasMore(data.length === limit);
        }
      } catch (err) {
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => abortController.abort();
  }, [urlMagazine, page]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchMetrics = async () => {
      try {
        const response = await fetch(urlMetrics, {
          ...fetchOptions,
          signal: abortController.signal,
        });
        const data = await response.json();
        if (data && data.length > 0 && !abortController.signal.aborted) {
          setTotalMagazines(data[0].among);
        } else if (!abortController.signal.aborted) {
          setTotalMagazines(0);
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          setTotalMagazines(0);
        }
      }
    };
    fetchMetrics();
    return () => abortController.abort();
  }, [urlMetrics]);

  return (
    <div className="grid grid-cols-1 gap-4 pb-16">
      <HeaderResult />

      <MagazineSearchBar
        pesquisaInput={pesquisaInput}
        setPesquisaInput={setPesquisaInput}
      />

      <MagazineSummaryCard totalMagazines={totalMagazines} />

      <MagazineListAccordion
        loading={loading}
        publicacoes={publicacoes}
        typeVisu={typeVisu}
        setTypeVisu={setTypeVisu}
        onLoadMore={() => setPage((prev) => prev + 1)}
        hasMore={hasMore}
      />
    </div>
  );
}
