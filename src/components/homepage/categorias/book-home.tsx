import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { UserContext } from "../../../context/context";
import { FilterYearPopUp } from "../../popup/filters-year-popup";
import { Skeleton } from "../../ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { HeaderResultTypeHome } from "./header-result-type-home";
import { Button } from "../../ui/button";
import { Book, Books, ChartBar, Rows, SquaresFour } from "phosphor-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Alert } from "../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { GraficoLivros } from "../../popup/graficos/grafico-livros";
import { TableReseracherBookPopup } from "../../popup/columns/table-books-popup";
import { BlockItemGeral } from "./book-home/block-item-geral";
import { Switch } from "../../ui/switch";
import { useQuery } from "../../dashboard/builder-page/tabelas/tabela-artigos";

type Patente = {
    id: string,
    title: string,
    year: string,
    isbn: string,
    publishing_company: string
    name: string
}

type Filter = {
    year: number[]
    qualis: string[]
}

export type ChartMetric = {
    year: number
    among: number
}

function BookSummaryCards({ totalBooks, totalChapters, distinct, setDistinct, distinct2, setDistinct2 }: { totalBooks: number, totalChapters: number, distinct: boolean, setDistinct: (val: boolean) => void, distinct2: boolean, setDistinct2: (val: boolean) => void }) {
    return (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Alert className={`p-0 bg-cover bg-no-repeat bg-center `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de livros
                    </CardTitle>
                    <Book className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold">{totalBooks.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex gap-2">
                            encontrados na busca
                        </p>
                    </div>

                    <div className="gap-2 flex items-center h-fit text-xs text-gray-500 dark:text-gray-300">
                        <p>Livros:</p>
                        <Switch
                            checked={distinct}
                            onCheckedChange={(value) => setDistinct(value)}
                        />
                        <span>{distinct ? "Sem repetição" : "Com repetição"}</span>
                    </div>
                </CardContent>
            </Alert>

            <Alert className={`p-0 bg-cover bg-no-repeat bg-center `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de capítulos
                    </CardTitle>
                    <Books className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold">{totalChapters.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex gap-2">
                            encontrados na busca
                        </p>
                    </div>

                    <div className="gap-2 flex items-center h-fit text-xs text-gray-500 dark:text-gray-300">
                        <p>Capítulos:</p>
                        <Switch
                            checked={distinct2}
                            onCheckedChange={(value) => setDistinct2(value)}
                        />
                        <span>{distinct2 ? "Sem repetição" : "Com repetição"}</span>
                    </div>
                </CardContent>
            </Alert>
        </div>
    )
}

function BookChartsAccordion({ loading, chartDataBooks, chartDataChapters }: { loading: boolean, chartDataBooks: ChartMetric[], chartDataChapters: ChartMetric[] }) {

    const publicacoesFormatted = useMemo(() => {
        return chartDataBooks.flatMap(item =>
            Array.from({ length: item.among }, () => ({ year: String(item.year) } as Patente))
        );
    }, [chartDataBooks]);

    const capLivrosFormatted = useMemo(() => {
        return chartDataChapters.flatMap(item =>
            Array.from({ length: item.among }, () => ({ year: String(item.year) } as Patente))
        );
    }, [chartDataChapters]);

    return (
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <div className="flex ">
                    <HeaderResultTypeHome title="Gráfico de quantidade total de livros e capítulos" icon={<ChartBar size={24} className="text-gray-400" />} />
                    <AccordionTrigger />
                </div>
                <AccordionContent>
                    {loading ? (
                        <Skeleton className="w-full rounded-md h-[300px]" />
                    ) : (
                        <GraficoLivros capLivros={capLivrosFormatted} publicacoes={publicacoesFormatted} />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

function BookListAccordion({ loading, publicacoes, typeVisu, setTypeVisu, distinct, onLoadMore, hasMore }: { loading: boolean, publicacoes: Patente[], typeVisu: string, setTypeVisu: (val: string) => void, distinct: boolean, onLoadMore: () => void, hasMore: boolean }) {
    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[170px]" />
    ));

    return (
        <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
                <div className="flex ">
                    <div className="flex gap-4 w-full justify-between items-center ">
                        <div className="flex gap-4 items-center">
                            <Book size={24} className="text-gray-400" />
                            <p className=" font-medium">Livros</p>
                        </div>
                        <div className="flex gap-3 mr-3 items-center h-full">
                            <Button onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                                <Rows size={16} className=" whitespace-nowrap" />
                            </Button>
                            <Button onClick={() => setTypeVisu('block')} variant={typeVisu == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                                <SquaresFour size={16} className=" whitespace-nowrap" />
                            </Button>
                        </div>
                    </div>
                    <AccordionTrigger />
                </div>
                <AccordionContent>
                    {typeVisu == 'block' ? (
                        loading && publicacoes.length === 0 ? (
                            <ResponsiveMasonry
                                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}
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
                                <BlockItemGeral
                                    articles={publicacoes}
                                    distinct={distinct}
                                    type={'livro'}
                                    onLoadMore={onLoadMore}
                                    hasMore={hasMore}
                                />
                            )
                        )
                    ) : (
                        loading && publicacoes.length === 0 ? (
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
    )
}

function ChapterListAccordion({ loading, capLivros, typeVisu2, setTypeVisu2, distinct2, onLoadMore, hasMore }: { loading: boolean, capLivros: Patente[], typeVisu2: string, setTypeVisu2: (val: string) => void, distinct2: boolean, onLoadMore: () => void, hasMore: boolean }) {
    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[170px]" />
    ));

    return (
        <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
                <div className="flex ">
                    <div className="flex gap-4 w-full justify-between items-center ">
                        <div className="flex gap-4 items-center">
                            <Books size={24} className="text-gray-400" />
                            <p className=" font-medium">Capítulos de livros</p>
                        </div>
                        <div className="flex gap-3 mr-3 items-center h-full">
                            <Button onClick={() => setTypeVisu2('rows')} variant={typeVisu2 == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                                <Rows size={16} className=" whitespace-nowrap" />
                            </Button>
                            <Button onClick={() => setTypeVisu2('block')} variant={typeVisu2 == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                                <SquaresFour size={16} className=" whitespace-nowrap" />
                            </Button>
                        </div>
                    </div>
                    <AccordionTrigger />
                </div>
                <AccordionContent>
                    {typeVisu2 == 'block' ? (
                        loading && capLivros.length === 0 ? (
                            <ResponsiveMasonry
                                columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}
                            >
                                <Masonry gutter="16px">
                                    {items.map((item, index) => (
                                        <div className="w-full" key={index}>{item}</div>
                                    ))}
                                </Masonry>
                            </ResponsiveMasonry>
                        ) : (
                            capLivros.length == 0 ? (
                                <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                            ) : (
                                <BlockItemGeral
                                    articles={capLivros}
                                    distinct={distinct2}
                                    type={'capLivro'}
                                    onLoadMore={onLoadMore}
                                    hasMore={hasMore}
                                />
                            )
                        )
                    ) : (
                        loading && capLivros.length === 0 ? (
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
    )
}

export function BookHome() {
    const { urlGeral, valoresSelecionadosExport } = useContext(UserContext);
    const queryUrl = useQuery();
    const institutionId = queryUrl.get('institution_id');
    const institutionParam = institutionId ? `&institution_id=${institutionId}` : '';
    const selectedTerms = institutionId ? '' : valoresSelecionadosExport;

    const [publicacoes, setPublicacoes] = useState<Patente[]>([]);
    const [capLivros, setCapLivros] = useState<Patente[]>([]);
    const [chartDataBooks, setChartDataBooks] = useState<ChartMetric[]>([]);
    const [chartDataChapters, setChartDataChapters] = useState<ChartMetric[]>([]);

    const [typeVisu, setTypeVisu] = useState('block');
    const [typeVisu2, setTypeVisu2] = useState('block');

    const [loadingBooks, setLoadingBooks] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [loadingCharts, setLoadingCharts] = useState(false);

    const [pageBook, setPageBook] = useState(1);
    const [hasMoreBook, setHasMoreBook] = useState(true);
    const [pageChapter, setPageChapter] = useState(1);
    const [hasMoreChapter, setHasMoreChapter] = useState(true);
    const limit = 12;

    const [distinct, setDistinct] = useState(false);
    const [distinct2, setDistinct2] = useState(false);

    const [filters, setFilters] = useState<Filter[]>([]);

    const handleResearcherUpdate = useCallback((newResearcherData: Filter[]) => {
        setFilters((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(newResearcherData)) {
                setTimeout(() => {
                    setPageBook(1);
                    setPageChapter(1);
                }, 0);
                return newResearcherData;
            }
            return prev;
        });
    }, []);

    const yearString = filters.length > 0 ? filters[0].year.join(';') : '';

    const totalBooks = useMemo(() => {
        return chartDataBooks.reduce((acc, item) => acc + item.among, 0);
    }, [chartDataBooks]);

    const totalChapters = useMemo(() => {
        return chartDataChapters.reduce((acc, item) => acc + item.among, 0);
    }, [chartDataChapters]);

    const urlTermPublicacoes = useMemo(() => {
        const paginationParams = `&page=${pageBook}&lenght=${limit}&sort_by=year&sort_order=desc`;
        return `${urlGeral}book_production_researcher?researcher_id=&year=${yearString}&term=${selectedTerms}&distinct=${distinct ? '1' : '0'}${institutionParam}${paginationParams}`;
    }, [urlGeral, yearString, selectedTerms, distinct, institutionParam, pageBook]);

    const urlTermCap = useMemo(() => {
        const paginationParams = `&page=${pageChapter}&lenght=${limit}&sort_by=year&sort_order=desc`;
        return `${urlGeral}book_chapter_production_researcher?researcher_id=&year=${yearString}&term=${selectedTerms}&distinct=${distinct2 ? '1' : '0'}${institutionParam}${paginationParams}`;
    }, [urlGeral, yearString, selectedTerms, distinct2, institutionParam, pageChapter]);

    const urlChartBooks = useMemo(() => {
        return `${urlGeral}metrics/book/chart?researcher_id=&year=${yearString}&term=${selectedTerms}&distinct=${distinct ? '1' : '0'}${institutionParam}`;
    }, [urlGeral, yearString, selectedTerms, distinct, institutionParam]);

    const urlChartChapters = useMemo(() => {
        return `${urlGeral}metrics/book-chapter/chart?researcher_id=&year=${yearString}&term=${selectedTerms}&distinct=${distinct2 ? '1' : '0'}${institutionParam}`;
    }, [urlGeral, yearString, selectedTerms, distinct2, institutionParam]);

    const fetchOptions = {
        mode: "cors",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
        },
    } as RequestInit;

    useEffect(() => {
        const abortController = new AbortController();
        const fetchChartData = async () => {
            setLoadingCharts(true);
            try {
                const [booksResponse, chaptersResponse] = await Promise.all([
                    fetch(urlChartBooks, { ...fetchOptions, signal: abortController.signal }),
                    fetch(urlChartChapters, { ...fetchOptions, signal: abortController.signal })
                ]);
                const booksData = await booksResponse.json();
                const chaptersData = await chaptersResponse.json();
                if (!abortController.signal.aborted) {
                    if (booksData) setChartDataBooks(booksData);
                    if (chaptersData) setChartDataChapters(chaptersData);
                }
            } catch (err: any) {
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingCharts(false);
                }
            }
        };
        fetchChartData();
        return () => abortController.abort();
    }, [urlChartBooks, urlChartChapters]);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchBooksData = async () => {
            if (pageBook === 1) setLoadingBooks(true);
            try {
                const response = await fetch(urlTermPublicacoes, { ...fetchOptions, signal: abortController.signal });
                const data = await response.json();
                if (data && !abortController.signal.aborted) {
                    if (pageBook === 1) {
                        setPublicacoes(data);
                    } else {
                        setPublicacoes(prev => [...prev, ...data]);
                    }
                    setHasMoreBook(data.length === limit);
                }
            } catch (err: any) {
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingBooks(false);
                }
            }
        };
        fetchBooksData();
        return () => abortController.abort();
    }, [urlTermPublicacoes, pageBook]);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchChaptersData = async () => {
            if (pageChapter === 1) setLoadingChapters(true);
            try {
                const response = await fetch(urlTermCap, { ...fetchOptions, signal: abortController.signal });
                const data = await response.json();
                if (data && !abortController.signal.aborted) {
                    if (pageChapter === 1) {
                        setCapLivros(data);
                    } else {
                        setCapLivros(prev => [...prev, ...data]);
                    }
                    setHasMoreChapter(data.length === limit);
                }
            } catch (err: any) {
            } finally {
                if (!abortController.signal.aborted) {
                    setLoadingChapters(false);
                }
            }
        };
        fetchChaptersData();
        return () => abortController.abort();
    }, [urlTermCap, pageChapter]);

    return (
        <div className="grid grid-cols-1 gap-4 pb-16">
            <div className="mt-6">
                <FilterYearPopUp onFilterUpdate={handleResearcherUpdate} />
            </div>

            <BookSummaryCards
                totalBooks={totalBooks}
                totalChapters={totalChapters}
                distinct={distinct}
                setDistinct={(val) => { setDistinct(val); setPageBook(1); }}
                distinct2={distinct2}
                setDistinct2={(val) => { setDistinct2(val); setPageChapter(1); }}
            />

            <BookChartsAccordion
                loading={loadingCharts}
                chartDataBooks={chartDataBooks}
                chartDataChapters={chartDataChapters}
            />

            <BookListAccordion
                loading={loadingBooks}
                publicacoes={publicacoes}
                typeVisu={typeVisu}
                setTypeVisu={setTypeVisu}
                distinct={distinct}
                onLoadMore={() => setPageBook(prev => prev + 1)}
                hasMore={hasMoreBook}
            />

            <ChapterListAccordion
                loading={loadingChapters}
                capLivros={capLivros}
                typeVisu2={typeVisu2}
                setTypeVisu2={setTypeVisu2}
                distinct2={distinct2}
                onLoadMore={() => setPageChapter(prev => prev + 1)}
                hasMore={hasMoreChapter}
            />
        </div>
    )
}