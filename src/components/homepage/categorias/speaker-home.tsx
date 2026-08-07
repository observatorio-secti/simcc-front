import { useContext, useEffect, useMemo, useState, useCallback } from "react";
import { UserContext } from "../../../context/context";
import { FilterYearPopUp } from "../../popup/filters-year-popup";
import { Skeleton } from "../../ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { HeaderResultTypeHome } from "./header-result-type-home";
import { Ticket } from "lucide-react";
import { Button } from "../../ui/button";
import { ChartBar, Rows, SquaresFour } from "phosphor-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { TableReseracherPatentesPopup } from "../../popup/columns/producoes-tecnicas/table-patentes-popup";
import { Alert } from "../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { GraficosEventos, ChartMetricEvent } from "../../popup/graficos/grafico-eventos";
import { BlockItemGeral } from "./book-home/block-item-geral";
import { Switch } from "../../ui/switch";
import { useQuery } from "../../dashboard/builder-page/tabelas/tabela-artigos";

type Patente = {
    event_name: string
    id: string
    nature: string
    participation: string
    year: string
    name: string
}

type Filter = {
    year: number[]
    qualis: string[]
}

function EventSummaryCard({ totalEvents, distinct, setDistinct }: { totalEvents: number, distinct: boolean, setDistinct: (val: boolean) => void }) {
    return (
        <div className="mt-4">
            <Alert className={`p-0 bg-cover bg-no-repeat bg-center `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de participação em eventos
                    </CardTitle>
                    <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold">{totalEvents.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex gap-2">
                            encontrados na busca
                        </p>
                    </div>

                    <div className="gap-2 flex items-center h-fit text-xs text-gray-500 dark:text-gray-300">
                        <p>Participação em eventos:</p>
                        <Switch
                            checked={distinct}
                            onCheckedChange={setDistinct}
                        />
                        <span>{distinct ? "Sem repetição" : "Com repetição"}</span>
                    </div>
                </CardContent>
            </Alert>
        </div>
    )
}

function EventChartsAccordion({ loading, chartData }: { loading: boolean, chartData: ChartMetricEvent[] }) {
    return (
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <div className="flex ">
                    <HeaderResultTypeHome title="Gráfico de quantidade total de participação em eventos" icon={<ChartBar size={24} className="text-gray-400" />} />
                    <AccordionTrigger />
                </div>
                <AccordionContent className="p-0" >
                    {loading ? (
                        <Skeleton className="w-full rounded-md h-[300px]" />
                    ) : (
                        <GraficosEventos chartData={chartData} />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

function EventListAccordion({ loading, publicacoes, typeVisu, setTypeVisu, distinct, onLoadMore, hasMore }: { loading: boolean, publicacoes: Patente[], typeVisu: string, setTypeVisu: (val: string) => void, distinct: boolean, onLoadMore: () => void, hasMore: boolean }) {
    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[170px]" />
    ));

    return (
        <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
                <div className="flex ">
                    <div className="flex gap-4 w-full justify-between items-center ">
                        <div className="flex gap-4 items-center">
                            <Ticket size={24} className="text-gray-400" />
                            <p className=" font-medium"> Participação em eventos</p>
                        </div>
                        <div className="flex gap-3 mr-3 items-center h-full">
                            <Button className="hidden md:flex" onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
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
                            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3, 1200: 4 }}>
                                <Masonry gutter="16px">
                                    {items.map((item, index) => (
                                        <div className="w-full" key={index}>{item}</div>
                                    ))}
                                </Masonry>
                            </ResponsiveMasonry>
                        ) : (
                            publicacoes.length === 0 ? (
                                <div className="items-center justify-center w-full flex text-center pt-6">Sem resultados para essa pesquisa</div>
                            ) : (
                                <BlockItemGeral
                                    articles={publicacoes}
                                    distinct={distinct}
                                    type={'participacao-evento'}
                                    onLoadMore={onLoadMore}
                                    hasMore={hasMore}
                                />
                            )
                        )
                    ) : (
                        loading && publicacoes.length === 0 ? (
                            <Skeleton className="w-full rounded-md h-[400px]" />
                        ) : (
                            <TableReseracherPatentesPopup patentes={publicacoes} />
                        )
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export function SpeakerHome() {
    const { urlGeral, valoresSelecionadosExport } = useContext(UserContext);
    const queryUrl = useQuery();
    const institutionId = queryUrl.get('institution_id');
    const institutionParam = institutionId ? `&institution_id=${institutionId}` : '';
    const selectedTerms = institutionId ? '' : valoresSelecionadosExport;

    const [publicacoes, setPublicacoes] = useState<Patente[]>([]);
    const [chartData, setChartData] = useState<ChartMetricEvent[]>([]);
    const [typeVisu, setTypeVisu] = useState('block');

    const [loading, setLoading] = useState(false);
    const [loadingCharts, setLoadingCharts] = useState(false);

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 12;

    const [distinct, setDistinct] = useState(false);
    const [filters, setFilters] = useState<Filter[]>([]);

    const handleResearcherUpdate = useCallback((newResearcherData: Filter[]) => {
        setFilters((prev) => {
            if (JSON.stringify(prev) !== JSON.stringify(newResearcherData)) {
                setTimeout(() => {
                    setPage(1);
                }, 0);
                return newResearcherData;
            }
            return prev;
        });
    }, []);

    const yearString = filters.length > 0 ? filters[0].year.join(';') : '';

    const totalEvents = useMemo(() => {
        return chartData.reduce((acc, item) => acc + item.congress + item.meeting + item.workshop + item.other + item.seminar + item.symposium, 0);
    }, [chartData]);

    const urlTermPublicacoes = useMemo(() => {
        const paginationParams = `&page=${page}&lenght=${limit}&sort_by=year&sort_order=desc`;
        return `${urlGeral}pevent_researcher?researcher_id=&year=${yearString}&term=${selectedTerms}&nature=&distinct=${distinct ? '1' : '0'}${institutionParam}${paginationParams}`;
    }, [urlGeral, yearString, selectedTerms, distinct, institutionParam, page]);

    const urlChartEvents = useMemo(() => {
        return `${urlGeral}metrics/speaker/chart?researcher_id=&year=${yearString}&term=${selectedTerms}&nature=&distinct=${distinct ? '1' : '0'}${institutionParam}`;
    }, [urlGeral, yearString, selectedTerms, distinct, institutionParam]);

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
                const response = await fetch(urlChartEvents, { ...fetchOptions, signal: abortController.signal });
                const data = await response.json();
                if (data && !abortController.signal.aborted) {
                    setChartData(data);
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
    }, [urlChartEvents]);

    useEffect(() => {
        const abortController = new AbortController();
        const fetchData = async () => {
            if (page === 1) setLoading(true);
            try {
                const response = await fetch(urlTermPublicacoes, { ...fetchOptions, signal: abortController.signal });
                const data = await response.json();
                if (data && !abortController.signal.aborted) {
                    if (page === 1) {
                        setPublicacoes(data);
                    } else {
                        setPublicacoes(prev => [...prev, ...data]);
                    }
                    setHasMore(data.length === limit);
                }
            } catch (err: any) {
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        fetchData();
        return () => abortController.abort();
    }, [urlTermPublicacoes, page]);

    return (
        <div className="grid grid-cols-1 gap-4 mb-16">
            <div className="mt-6">
                <FilterYearPopUp onFilterUpdate={handleResearcherUpdate} />
            </div>

            <EventSummaryCard
                totalEvents={totalEvents}
                distinct={distinct}
                setDistinct={(val) => { setDistinct(val); setPage(1); }}
            />

            <EventChartsAccordion
                loading={loadingCharts}
                chartData={chartData}
            />

            <EventListAccordion
                loading={loading}
                publicacoes={publicacoes}
                typeVisu={typeVisu}
                setTypeVisu={setTypeVisu}
                distinct={distinct}
                onLoadMore={() => setPage(prev => prev + 1)}
                hasMore={hasMore}
            />
        </div>
    )
}