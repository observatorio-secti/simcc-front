import { useContext, useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useLocation } from 'react-router-dom'
import { useModalResult } from "../../hooks/use-modal-result";
import { UserContext } from "../../../context/context";
import { Switch } from "../../ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Skeleton } from "../../ui/skeleton";
import { HeaderResultTypeHome } from "./header-result-type-home";
import { ChartBar, SquaresFour, Rows } from "phosphor-react";
import { GraficoArticleHome } from "./articles-home/grafico-articles-home";
import { ArticleBlock } from "./articles-home/articles-block";
import { Button } from "../../ui/button";
import { TableReseracherArticleshome } from "./articles-home/table-articles";
import { Alert } from "../../ui/alert";
import { CardContent, CardHeader, CardTitle } from "../../ui/card";
import { GraficoCitationsArticleHome } from "./articles-home/grafico-citacoes";
import { File } from "lucide-react";
import { ResultFiltersSlotContext } from "../result-filters-slot-context";
import { useArticleFilters } from "./articles-home/use-article-filters";
import { getDefaultYearRange, normalizeYearRange, yearRangeToString } from "./articles-home/article-filter-fields";

export type Publicacao = {
    abstract: string,
    article_institution: string,
    authors: string,
    authors_institution: string,
    citations_count: string,
    issn: string,
    keywords: string,
    landing_page_url: string,
    language: string,
    pdf: string,
    id: string,
    doi: string,
    name_periodical: string,
    qualis: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "SQ" | "NP",
    title: string,
    year: string,
    color: string,
    researcher: string,
    lattes_id: string,
    magazine: string,
    lattes_10_id: string,
    jcr_link: string,
    jif: string,
    researcher_id: string
}

export type ChartMetric = {
    year: number
    citations: number
    qualis: {
        A1: number
        A2: number
        A3: number
        A4: number
        B1: number
        B2: number
        B3: number
        B4: number
        C: number
        SQ: number
    }
    jcr: {
        very_low: number
        low: number
        medium: number
        high: number
        not_applicable: number
        without_jcr: number
    }
    among: number
    count_doi: number
}

type Filter = {
    year: number[]
    qualis: string[]
}

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

function ArticlesSummaryCard({ publicacoesLength, percentage, distinct, setDistinct }: { publicacoesLength: number, percentage: number, distinct: boolean, setDistinct: (val: boolean) => void }) {
    return (
        <div className="pt-4">
            <Alert className="p-0 bg-cover bg-no-repeat bg-center">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total de artigos
                    </CardTitle>
                    <File className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex justify-between items-end">
                    <div>
                        <div className="text-2xl font-bold">{publicacoesLength.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex gap-2">
                            encontrados na busca <span className="text-eng-blue">({percentage.toFixed(2)}% com DOI)</span>
                        </p>
                    </div>
                    <div className="gap-2 flex items-center h-fit text-xs text-gray-500 dark:text-gray-300">
                        <p>Artigos:</p>
                        <Switch
                            checked={distinct}
                            onCheckedChange={(value) => setDistinct(value)}
                        />
                        <span>{distinct ? "Sem repetição" : "Com repetição"}</span>
                    </div>
                </CardContent>
            </Alert>
        </div>
    )
}

function ArticlesChartsAccordion({ loading, chartData }: { loading: boolean, chartData: ChartMetric[] }) {
    return (
        <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
                <div className="flex">
                    <HeaderResultTypeHome title="Gráfico de artigos" icon={<ChartBar size={24} className="text-gray-400" />} />
                    <AccordionTrigger />
                </div>
                <AccordionContent className="p-0">
                    {loading ? (
                        <div className="grid gap-8">
                            <Skeleton className="w-full rounded-md h-[300px]" />
                            <Skeleton className="w-full rounded-md h-[300px]" />
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            <GraficoArticleHome researcher_id={null} metrics={chartData} />
                            <GraficoCitationsArticleHome metrics={chartData} />
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
function ArticlesListAccordion({ loading, publicacoes, typeVisu, setTypeVisu, distinct, onLoadMore, hasMore }: { loading: boolean, publicacoes: Publicacao[], typeVisu: string, setTypeVisu: (val: string) => void, distinct: boolean, onLoadMore: () => void, hasMore: boolean }) {
    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[170px]" />
    ));

    return (
        <Accordion defaultValue="item-1" type="single" collapsible>
            <AccordionItem value="item-1">
                <div className="flex mb-2">
                    <HeaderResultTypeHome title="Artigos" icon={<File size={24} className="text-gray-400" />}>
                        <div className="hidden md:flex gap-2 mr-2">
                            <Button onClick={() => setTypeVisu('rows')} variant="outline" className={`bg-transparent border-0 ${typeVisu == 'rows' && ('bg-white dark:bg-neutral-800 border')}`} size={'icon'}>
                                <Rows size={16} className=" whitespace-nowrap" />
                            </Button>
                            <Button onClick={() => setTypeVisu('block')} variant="outline" className={`bg-transparent border-0 ${typeVisu == 'block' && ('bg-white dark:bg-neutral-800 border')} `} size={'icon'}>
                                <SquaresFour size={16} className=" whitespace-nowrap" />
                            </Button>
                        </div>
                    </HeaderResultTypeHome>
                    <AccordionTrigger />
                </div>
                <AccordionContent>
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
                        ) : (
                            <ArticleBlock
                                articles={publicacoes}
                                distinct={distinct}
                                onLoadMore={onLoadMore}
                                hasMore={hasMore}
                            />
                        )
                    ) : (
                        loading ? (
                            <Skeleton className="w-full rounded-md h-[400px]" />
                        ) : (
                            <TableReseracherArticleshome
                                articles={publicacoes}
                            />
                        )
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
export function ArticlesHome() {
    const { urlGeral, searchType, valoresSelecionadosExport } = useContext(UserContext);
    const { slot: filtersSlot, articleDistinct, setArticleDistinct } = useContext(ResultFiltersSlotContext);
    const queryUrl = useQuery();
    const institutionId = queryUrl.get('institution_id');

    const [loading, isLoading] = useState(false);
    const [chartLoading, setLoadingCharts] = useState(false);
    const [rawPublicacoes, setRawPublicacoes] = useState<Publicacao[]>([]);
    const [rawChartData, setRawChartData] = useState<ChartMetric[]>([]);
    const [typeVisu, setTypeVisu] = useState('block');
    const [filters, setFilters] = useState<Filter[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchTrigger, setFetchTrigger] = useState(0);
    const limit = 12;
    const idGraduateProgram = '';
    const institutionParam = institutionId ? `&institution_id=${institutionId}` : '';
    const selectedTerms = institutionId ? '' : valoresSelecionadosExport;

    const yearInterval = useMemo(() => {
        const interval = filters.length > 0 ? normalizeYearRange(filters[0].year) : getDefaultYearRange();
        return interval;
    }, [filters]);

    // Filtragem cliente: backend filtra só piso (year >= min), max aplicado aqui
    const publicacoes = useMemo(() => {
        const [minY, maxY] = yearInterval;
        const filtered = rawPublicacoes.filter((item) => {
            const y = parseInt(String(item.year), 10);
            return !Number.isNaN(y) ? y >= minY && y <= maxY : true;
        });
        return filtered;
    }, [rawPublicacoes, yearInterval]);

    const chartData = useMemo(() => {
        const [minY, maxY] = yearInterval;
        let filtered = rawChartData.filter((item) => item.year >= minY && item.year <= maxY);
        const activeQualis = filters.length > 0 ? filters[0].qualis : [];
        if (activeQualis.length > 0) {
            filtered = filtered.map(item => {
                const newQualis: Record<string, number> = {};
                let sumSelected = 0;
                for (const k of Object.keys(item.qualis)) {
                    const val = (item.qualis as any)[k] as number;
                    const keep = activeQualis.includes(k) ? val : 0;
                    newQualis[k] = keep;
                    if (activeQualis.includes(k)) sumSelected += val;
                }
                const originalAmong = item.among;
                const newAmong = sumSelected;
                const ratio = originalAmong > 0 ? newAmong / originalAmong : 0;
                const newCitations = Math.round(item.citations * ratio);
                const newCountDoi = Math.round(item.count_doi * ratio);
                return { ...item, qualis: newQualis as any, among: newAmong, citations: newCitations, count_doi: newCountDoi } as any;
            });
        }
        filtered = filtered.filter(item => item.among > 0);
        return filtered;
    }, [rawChartData, yearInterval, filters]);

    const chartTotal = useMemo(() => {
        return chartData.reduce((acc, item) => acc + item.among, 0);
    }, [chartData]);

    const hasActiveFilters = useMemo(() => {
        if (filters.length === 0) return false;

        const currentFilter = filters[0];
        const hasQualis = (currentFilter.qualis ?? []).length > 0;
        const [defaultMin, defaultMax] = getDefaultYearRange();
        const year = currentFilter.year ?? [];
        const hasYearFilter = year.length !== 2 || year[0] !== defaultMin || year[1] !== defaultMax;

        return hasQualis || hasYearFilter;
    }, [filters]);

    // Total desacoplado da paginação: usa chartData agregado
    const publicacoesLength = useMemo(() => {
        if (chartLoading) return 0;
        return chartTotal;
    }, [chartTotal, chartLoading, hasActiveFilters, publicacoes.length]);

    const handleResearcherUpdate = (newResearcherData: Filter[]) => {
        const newInterval = newResearcherData[0] ? normalizeYearRange(newResearcherData[0].year) : getDefaultYearRange();
        const prevInterval = filters.length > 0 ? normalizeYearRange(filters[0].year) : getDefaultYearRange();
        const prevMin = prevInterval[0];
        const newMin = newInterval[0];
        const isMinChanged = prevMin !== newMin;
        const prevQualis = filters.length > 0 ? (filters[0].qualis ?? []) : [];
        const newQualis = newResearcherData[0]?.qualis ?? [];
        const isQualisChanged = prevQualis.length !== newQualis.length || prevQualis.some((q,i) => q !== newQualis[i]) || newQualis.some((q,i) => q !== prevQualis[i]);
        setFilters(newResearcherData);
        // Qualis precisa de fetch novo (backend filtra qualis corretamente), max sozinho pode ser só cliente
        if (isMinChanged || isQualisChanged) {
            setRawPublicacoes([]);
            setRawChartData([]);
            setPage(1);
            setHasMore(true);
            setFetchTrigger(t => t + 1);
        } else {
            if (rawPublicacoes.length === 0) {
                setFetchTrigger(t => t + 1);
                setPage(1);
                setHasMore(true);
            } else {
                if (page !== 1) {
                    setPage(1);
                    setHasMore(true);
                }
            }
        }
    };

    const { sidebar, component } = useArticleFilters({ filteredCount: publicacoesLength, filters, onFilterUpdate: handleResearcherUpdate });

    const percentage = useMemo(() => {
        const totalDoi = chartData.reduce((acc, item) => acc + item.count_doi, 0);
        const total = chartData.reduce((acc, item) => acc + item.among, 0);
        return total > 0 ? (totalDoi / total) * 100 : 0;
    }, [chartData]);

    const urlTermPublicacoes = useMemo(() => {
        const yearString = filters.length > 0 ? yearRangeToString(filters[0].year) : yearRangeToString(getDefaultYearRange());
        const qualisString = filters.length > 0 ? filters[0].qualis.join(';') : '';
        const paginationParams = `&page=${page}&lenght=${limit}&sort_by=year&sort_order=desc`;

        let url = `${urlGeral}bibliographic_production_article?terms=&year=${yearString}&qualis=${qualisString}&university=&distinct=${articleDistinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}${paginationParams}`;

        if (selectedTerms !== '') {
            if (searchType === 'name') {
                url = `${urlGeral}bibliographic_production_researcher?terms=${selectedTerms}&researcher_id=&type=ARTICLE&qualis=${qualisString}&year=${yearString}${institutionParam}${paginationParams}`;
            } else if (searchType === 'article') {
                url = `${urlGeral}bibliographic_production_article?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${articleDistinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}${paginationParams}`;
            } else if (searchType === 'area') {
                url = `${urlGeral}bibliographic_production_article_area?area_specialty=${selectedTerms.replace(/;/g, ' ')}&great_area=&year=${yearString}&qualis=${qualisString}${institutionParam}${paginationParams}`;
            } else if (searchType === 'abstract') {
                url = `${urlGeral}bibliographic_production_article?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${articleDistinct ? '1' : '0'}${institutionParam}${paginationParams}`;
            }
        }
        return url;
    }, [filters, searchType, selectedTerms, articleDistinct, idGraduateProgram, institutionParam, urlGeral, page]);
    const urlTermCharts = useMemo(() => {
        const yearString = filters.length > 0 ? yearRangeToString(filters[0].year) : yearRangeToString(getDefaultYearRange());
        const qualisString = filters.length > 0 ? filters[0].qualis.join(';') : '';

        let url = `${urlGeral}metrics/article/chart?terms=&year=${yearString}&qualis=${qualisString}&university=&distinct=${articleDistinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}`;

        if (selectedTerms !== '') {
            if (searchType === 'name') {
                url = `${urlGeral}metrics/article/chart?terms=${selectedTerms}&researcher_id=&type=ARTICLE&qualis=${qualisString}&year=${yearString}${institutionParam}`;
            } else if (searchType === 'article') {
                url = `${urlGeral}metrics/article/chart?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${articleDistinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}`;
            } else if (searchType === 'area') {
                url = `${urlGeral}metrics/article/chart?area_specialty=${selectedTerms.replace(/;/g, ' ')}&great_area=&year=${yearString}&qualis=${qualisString}${institutionParam}`;
            } else if (searchType === 'abstract') {
                url = `${urlGeral}metrics/article/chart?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${articleDistinct ? '1' : '0'}${institutionParam}`;
            }
        }
        return url;
    }, [filters, searchType, selectedTerms, articleDistinct, idGraduateProgram, institutionParam, urlGeral]);
    useEffect(() => {
        const fetchData = async () => {
            if (page === 1) isLoading(true);
            try {
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
                if (!response.ok) {
                    const text = await response.text();
                    isLoading(false);
                    return;
                }
                const contentType = response.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    const text = await response.text();
                    isLoading(false);
                    return;
                }
                const data = await response.json();
                if (data) {
                    if (page === 1) {
                        setRawPublicacoes(data);
                    } else {
                        setRawPublicacoes(prev => [...prev, ...data]);
                    }
                    setHasMore(Array.isArray(data) ? data.length === limit : false);
                    isLoading(false);
                } else {
                    isLoading(false);
                }
            } catch (err) {
                isLoading(false);
            }
        };
        fetchData();
    }, [urlTermPublicacoes, page, fetchTrigger]);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoadingCharts(true)
            try {
                const response = await fetch(urlTermCharts, {
                    mode: "cors",
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Max-Age": "3600",
                        "Content-Type": "text/plain",
                    },
                });
                if (!response.ok) {
                    const text = await response.text();
                    setLoadingCharts(false);
                    return;
                }
                const contentType = response.headers.get("content-type") || "";
                if (!contentType.includes("application/json")) {
                    const text = await response.text();
                    setLoadingCharts(false);
                    return;
                }
                const data = await response.json();
                if (data) {
                    setRawChartData(data);
                }
                setLoadingCharts(false);
            } catch (err) {
                setLoadingCharts(false);
            }
        };
        fetchChartData();
    }, [urlTermCharts, fetchTrigger]);

    // hasMore para botão "Mostrar mais" deve refletir total filtrado, não só raw
    const hasMoreFiltered = useMemo(() => {
        const total = chartTotal;
        const filteredHasMore = total > 0 ? publicacoes.length < total : hasMore;
        // Mantém compatibilidade: se backend diz hasMore true, mantém true
        const combined = hasMore || filteredHasMore;
        return combined;
    }, [hasMore, chartTotal, publicacoes.length, page]);

    // Paginação automática: backend só filtra piso, busca próximas páginas até preencher limite
    useEffect(() => {
        const autoFill = () => {
            if (loading) return;
            if (!hasMore) {
                return;
            }
            if (rawPublicacoes.length === 0) return;
            const shouldFill = publicacoes.length === 0 || (publicacoes.length > 0 && publicacoes.length < limit && rawPublicacoes.length >= limit);
            const shouldFillByTotal = chartTotal > 0 && publicacoes.length < chartTotal && publicacoes.length < limit * 2;
            const finalShouldFill = shouldFill || shouldFillByTotal;
            if (finalShouldFill && page < 50) setPage(p => p + 1);
        };
        const t = setTimeout(autoFill, 500);
        return () => clearTimeout(t);
    }, [publicacoes.length, rawPublicacoes.length, hasMore, loading, page, yearInterval, chartTotal]);

    return (
        <div className="w-full h-full">
            <div className="w-full flex gap-4 justify-center items-start">
                {filtersSlot && createPortal(sidebar, filtersSlot)}
                <div className="flex-1 gap-4 flex flex-col">
                    <div className="grid grid-cols-1 gap-4 pb-16">
                        <ArticlesSummaryCard
                            publicacoesLength={publicacoesLength}
                            percentage={percentage}
                            distinct={articleDistinct}
                            setDistinct={setArticleDistinct}
                        />

                        <ArticlesChartsAccordion
                            loading={chartLoading}
                            chartData={chartData}
                        />

                        <ArticlesListAccordion
                            loading={loading}
                            publicacoes={publicacoes}
                            typeVisu={typeVisu}
                            setTypeVisu={setTypeVisu}
                            distinct={articleDistinct}
                            onLoadMore={() => setPage(prev => prev + 1)}
                            hasMore={hasMoreFiltered}
                        />
                    </div>
                </div>
                {component}
            </div>
        </div>
    )
}
