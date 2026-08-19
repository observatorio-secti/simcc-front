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

function ArticlesChartsAccordion({ loading, publicacoes }: { loading: boolean, publicacoes: Publicacao[] }) {
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
                            <GraficoArticleHome researcher_id={null} />
                            <GraficoCitationsArticleHome articles={publicacoes} />
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
    const filtersSlot = useContext(ResultFiltersSlotContext);
    const queryUrl = useQuery();
    const institutionId = queryUrl.get('institution_id');

    const [loading, isLoading] = useState(false);
    const [, setLoadingCharts] = useState(false);
    const [distinct, setDistinct] = useState(false);
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
    const [chartData, setChartData] = useState<ChartMetric[]>([]);
    const [typeVisu, setTypeVisu] = useState('block');
    const [filters, setFilters] = useState<Filter[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 12;
    const idGraduateProgram = '';
    const institutionParam = institutionId ? `&institution_id=${institutionId}` : '';
    const selectedTerms = institutionId ? '' : valoresSelecionadosExport;

    const publicacoesLength = useMemo(() => {
        return chartData.reduce((acc, item) => acc + item.among, 0);
    }, [chartData]);

    const handleResearcherUpdate = (newResearcherData: Filter[]) => {
        setFilters(newResearcherData);
        setPage(1);
    };

    const { sidebar, component } = useArticleFilters({ filteredCount: publicacoesLength, filters, onFilterUpdate: handleResearcherUpdate });

    const percentage = useMemo(() => {
        const totalDoi = chartData.reduce((acc, item) => acc + item.count_doi, 0);
        return publicacoesLength > 0 ? (totalDoi / publicacoesLength) * 100 : 0;
    }, [chartData, publicacoesLength]);

    const urlTermPublicacoes = useMemo(() => {
        const yearString = filters.length > 0 ? filters[0].year.join(';') : [2020];
        const qualisString = filters.length > 0 ? filters[0].qualis.join(';') : '';
        const paginationParams = `&page=${page}&lenght=${limit}&sort_by=year&sort_order=desc`;

        let url = `${urlGeral}bibliographic_production_article?terms=&year=${yearString}&qualis=${qualisString}&university=&distinct=${distinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}${paginationParams}`;

        if (selectedTerms !== '') {
            if (searchType === 'name') {
                url = `${urlGeral}bibliographic_production_researcher?terms=${selectedTerms}&researcher_id=&type=ARTICLE&qualis=${qualisString}&year=${yearString}${institutionParam}${paginationParams}`;
            } else if (searchType === 'article') {
                url = `${urlGeral}bibliographic_production_article?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${distinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}${paginationParams}`;
            } else if (searchType === 'area') {
                url = `${urlGeral}bibliographic_production_article_area?area_specialty=${selectedTerms.replace(/;/g, ' ')}&great_area=&year=${yearString}&qualis=${qualisString}${institutionParam}${paginationParams}`;
            } else if (searchType === 'abstract') {
                url = `${urlGeral}bibliographic_production_article?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${distinct ? '1' : '0'}${institutionParam}${paginationParams}`;
            }
        }
        return url;
    }, [filters, searchType, selectedTerms, distinct, idGraduateProgram, institutionParam, urlGeral, page]);
    const urlTermCharts = useMemo(() => {
        const yearString = filters.length > 0 ? filters[0].year.join(';') : [2020];
        const qualisString = filters.length > 0 ? filters[0].qualis.join(';') : '';

        let url = `${urlGeral}metrics/article/chart?terms=&year=${yearString}&qualis=${qualisString}&university=&distinct=${distinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}`;

        if (selectedTerms !== '') {
            if (searchType === 'name') {
                url = `${urlGeral}metrics/article/chart?terms=${selectedTerms}&researcher_id=&type=ARTICLE&qualis=${qualisString}&year=${yearString}${institutionParam}`;
            } else if (searchType === 'article') {
                url = `${urlGeral}metrics/article/chart?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${distinct ? '1' : '0'}&graduate_program_id=${String(idGraduateProgram) === "0" ? "" : idGraduateProgram}${institutionParam}`;
            } else if (searchType === 'area') {
                url = `${urlGeral}metrics/article/chart?area_specialty=${selectedTerms.replace(/;/g, ' ')}&great_area=&year=${yearString}&qualis=${qualisString}${institutionParam}`;
            } else if (searchType === 'abstract') {
                url = `${urlGeral}metrics/article/chart?terms=${selectedTerms}&year=${yearString}&qualis=${qualisString}&university=&distinct=${distinct ? '1' : '0'}${institutionParam}`;
            }
        }
        return url;
    }, [filters, searchType, selectedTerms, distinct, idGraduateProgram, institutionParam, urlGeral]);
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
                const data = await response.json();
                if (data) {
                    if (page === 1) {
                        setPublicacoes(data);
                    } else {
                        setPublicacoes(prev => [...prev, ...data]);
                    }
                    setHasMore(data.length === limit);
                    isLoading(false);
                }
            } catch (err) {
                isLoading(false);
            }
        };
        fetchData();
    }, [urlTermPublicacoes, page]);

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
                const data = await response.json();
                if (data) {
                    setChartData(data);
                    setLoadingCharts(false);
                }
            } catch (err) {
                setLoadingCharts(false);
            }
        };
        fetchChartData();
    }, [urlTermCharts]);

    return (
        <div className="w-full h-full">
            <div className="w-full flex gap-4 justify-center items-start">
                {filtersSlot && createPortal(sidebar, filtersSlot)}
                <div className="flex-1 gap-4 flex flex-col">
                    <div className="grid grid-cols-1 gap-4 pb-16">
                        <ArticlesSummaryCard
                            publicacoesLength={publicacoesLength}
                            percentage={percentage}
                            distinct={distinct}
                            setDistinct={setDistinct}
                        />

                        <ArticlesChartsAccordion
                            loading={loading}
                            publicacoes={publicacoes}
                        />

                        <ArticlesListAccordion
                            loading={loading}
                            publicacoes={publicacoes}
                            typeVisu={typeVisu}
                            setTypeVisu={setTypeVisu}
                            distinct={distinct}
                            onLoadMore={() => setPage(prev => prev + 1)}
                            hasMore={hasMore}
                        />
                    </div>
                </div>
                {component}
            </div>
        </div>
    )
}