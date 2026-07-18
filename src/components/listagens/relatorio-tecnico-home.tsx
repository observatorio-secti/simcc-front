import { useContext, useEffect, useMemo, useState, useCallback } from "react"
import { UserContext } from "../../context/context"
import { Skeleton } from "../ui/skeleton"
import { HeaderResult } from "../homepage/header-results"
import { Alert } from "../ui/alert"
import { CardContent, CardHeader, CardTitle } from "../ui/card"
import { Files } from "lucide-react"
import { FilterYearPopUp } from "../popup/filters-year-popup"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home"
import { ChartBar, Rows, SquaresFour } from "phosphor-react"
import { Switch } from "../ui/switch"
import { Button } from "../ui/button"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { BlockItemGeral } from "../homepage/categorias/book-home/block-item-geral"
import { TableReseracherMarcasPopup } from "../popup/columns/producoes-tecnicas/table-marcas-popup"
import { GraficoRelatorio } from "../popup/graficos/grafico-relatório"
import { useQuery } from "../dashboard/builder-page/tabelas/tabela-artigos"

type Patente = {
    id: string,
    grant_date: string,
    title: string,
    year: string,
    financing: string,
    project_name: string
}

type Filter = {
    year: number[]
    qualis: string[]
}

export type ChartMetricReport = {
    year: number
    among: number
}

function ReportSummaryCard({ totalReports, distinct, setDistinct }: { totalReports: number, distinct: boolean, setDistinct: (val: boolean) => void }) {
    return (
        <div className="mt-4">
            <Alert className={`p-0 bg-cover bg-no-repeat bg-center `}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de relatórios técnicos
                    </CardTitle>
                    <Files className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold">{totalReports.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex gap-2">
                            encontrados na busca
                        </p>
                    </div>

                    <div className="gap-2 flex items-center h-fit text-xs text-gray-500 dark:text-gray-300">
                        <p>Relatórios técnicos:</p>
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

function ReportChartsAccordion({ loading, chartData }: { loading: boolean, chartData: ChartMetricReport[] }) {
    const publicacoesFormatted = useMemo(() => {
        return chartData.flatMap(item =>
            Array.from({ length: item.among }, () => ({ year: String(item.year) } as Patente))
        );
    }, [chartData]);

    return (
        <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
                <div className="flex ">
                    <HeaderResultTypeHome title="Gráfico de quantidade total de relatórios técnicos" icon={<ChartBar size={24} className="text-gray-400" />} />
                    <AccordionTrigger />
                </div>
                <AccordionContent className="p-0">
                    {loading ? (
                        <Skeleton className="w-full rounded-md h-[300px]" />
                    ) : (
                        <GraficoRelatorio publicacoes={publicacoesFormatted} />
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

function ReportListAccordion({ loading, publicacoes, typeVisu, setTypeVisu, distinct, onLoadMore, hasMore }: { loading: boolean, publicacoes: Patente[], typeVisu: string, setTypeVisu: (val: string) => void, distinct: boolean, onLoadMore: () => void, hasMore: boolean }) {
    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[170px]" />
    ));

    return (
        <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
                <div className="flex ">
                    <div className="flex gap-4 w-full justify-between items-center ">
                        <div className="flex gap-4 items-center">
                            <Files size={24} className="text-gray-400" />
                            <p className=" font-medium"> Relatórios técnicos</p>
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
                                    type={'relatorio-tecnico'}
                                    onLoadMore={onLoadMore}
                                    hasMore={hasMore}
                                />
                            )
                        )
                    ) : (
                        loading && publicacoes.length === 0 ? (
                            <Skeleton className="w-full rounded-md h-[400px]" />
                        ) : (
                            <TableReseracherMarcasPopup livros={publicacoes} />
                        )
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}

export function RelatorioTecnicoHome() {
    const { urlGeral, valoresSelecionadosExport } = useContext(UserContext);
    const queryUrl = useQuery();
    const institutionId = queryUrl.get('institution_id');
    const institutionParam = institutionId ? `&institution_id=${institutionId}` : '';

    const [publicacoes, setPublicacoes] = useState<Patente[]>([]);
    const [chartData, setChartData] = useState<ChartMetricReport[]>([]);
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

    const totalReports = useMemo(() => {
        return chartData.reduce((acc, item) => acc + item.among, 0);
    }, [chartData]);

    const urlTermPublicacoes = useMemo(() => {
        const paginationParams = `&page=${page}&lenght=${limit}&sort_by=year&sort_order=desc`;
        return `${urlGeral}researcher_report?researcher_id=&year=${yearString}&distinct=${distinct ? '1' : '0'}${institutionParam}${paginationParams}`;
    }, [urlGeral, yearString, distinct, institutionParam, page]);

    const urlChartReport = useMemo(() => {
        return `${urlGeral}metrics/research-report/chart?researcher_id=&year=${yearString}&distinct=${distinct ? '1' : '0'}${institutionParam}`;
    }, [urlGeral, yearString, distinct, institutionParam]);

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
                const response = await fetch(urlChartReport, { ...fetchOptions, signal: abortController.signal });
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
    }, [urlChartReport]);

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
        <div className="grid grid-cols-1 gap-4 pb-16">
            <HeaderResult />

            <div className="mt-6">
                <FilterYearPopUp onFilterUpdate={handleResearcherUpdate} />
            </div>

            <ReportSummaryCard
                totalReports={totalReports}
                distinct={distinct}
                setDistinct={(val) => { setDistinct(val); setPage(1); }}
            />

            <ReportChartsAccordion
                loading={loadingCharts}
                chartData={chartData}
            />

            <ReportListAccordion
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