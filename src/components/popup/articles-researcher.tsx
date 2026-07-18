import { useCallback, useEffect, useMemo, useState } from "react";
import { useContext } from "react";
import { UserContext } from "../../context/context";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,

} from "../../components/ui/accordion"
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { Skeleton } from "../ui/skeleton";

import { ChartBar, Quotes, SquaresFour, Rows, X, ArrowUDownLeft } from "phosphor-react";

import { Button } from "../ui/button";

import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { GraficoArticleHome } from "../homepage/categorias/articles-home/grafico-articles-home";
import { FilterArticlePopUp } from "./filters-articles-popup";
import { ArticleBlockPopUp } from "./articles-block-popup";
import { TableReseracherArticlesPopup } from "./columns/table-articles-popup";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";

// Cache compartilhado para requisições
const requestCache = new Map();

type Publicacao = {
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
    jif: string
    researcher_id: string
    abstract: string,
    article_institution: string,
    authors: string
    authors_institution: string
    citations_count: string
    issn: string
    keywords: string
    landing_page_url: string
    language: string
    pdf: string
    has_image: boolean
    relevance: boolean

}

type Filter = {
    year: number[]
    qualis: string[]
}

type Props = {
    name: string
}

export function ArticlesResearcherPopUp(props: Props) {
    const { urlGeral, setItensSelecionadosPopUp, itemsSelecionadosPopUp, searchType, itemsSelecionados } = useContext(UserContext)
    const { isOpen, type: typeModal, data: modalData } = useModalSecundary();

    const [loading, isLoading] = useState(false)
    const [distinct] = useState(false)
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
    const [typeVisu, setTypeVisu] = useState('block')

    const [filters, setFilters] = useState<Filter[]>([]);

    const url = useMemo(() =>
        `${urlGeral}bibliographic_production_researcher?researcher_id=${props.name}&type=ARTICLE`,
        [urlGeral, props.name]
    );

    const yearString = useMemo(() =>
        filters.length > 0 ? filters[0].year.join(';') : '',
        [filters]
    );

    const qualisString = useMemo(() =>
        filters.length > 0 ? filters[0].qualis.join(';') : '',
        [filters]
    );

    const resultadoFormatado = useMemo(() =>
        formatTerms(itemsSelecionadosPopUp),
        [itemsSelecionadosPopUp]
    );

    const urlTermPublicacoes = useMemo(() => {
        const baseUrl = `${urlGeral}bibliographic_production_researcher?researcher_id=${props.name}&type=ARTICLE&qualis=${qualisString}&year=${yearString}`;
        return searchType === 'article'
            ? `${baseUrl}&terms=${resultadoFormatado}`
            : baseUrl;
    }, [urlGeral, props.name, searchType, qualisString, yearString, resultadoFormatado]);

    const fetchData = useCallback(async () => {
        isLoading(true);
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
                setPublicacoes(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            isLoading(false);
        }
    }, [urlTermPublicacoes]);

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            fetchData();
        }

        return () => {
            mounted = false;
        };
    }, [fetchData]);

    const handleResearcherUpdate = useCallback((newResearcherData: Filter[]) => {
        setFilters(newResearcherData);
    }, []);

    const handleConnectorChange = useCallback((index: number, connector: string) => {
        setItensSelecionadosPopUp(prev => {
            const updated = [...prev];
            updated[index].term = updated[index].term.slice(0, -1) + connector;
            return updated;
        });
    }, [setItensSelecionadosPopUp]);

    const handleRemoveItem = useCallback((indexToRemove: number) => {
        setItensSelecionadosPopUp(prev =>
            prev.filter((_, index) => index !== indexToRemove)
        );
    }, [setItensSelecionadosPopUp]);

    const items = useMemo(() =>
        Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="w-full rounded-md h-[170px]" />
        )),
        []
    );

    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    const total = publicacoes.length;
    const validDoiCount = publicacoes.filter(pub => pub.doi && pub.doi.trim() !== "").length;
    const percentage = total > 0 ? (validDoiCount / total) * 100 : 0;
    

    return (
        <>
            <div className="">
              <div className="mb-6">
              <FilterArticlePopUp
                    onFilterUpdate={handleResearcherUpdate} />
              </div>

                <Accordion type="single" collapsible defaultValue="item-1">
                    <AccordionItem value="item-1" >
                        <div className="flex mb-2">
                            <HeaderResultTypeHome title="Gráfico de quantidade total por Qualis" icon={<ChartBar size={24} className="text-gray-400" />}>
                            </HeaderResultTypeHome>
                            <AccordionTrigger>

                            </AccordionTrigger>
                        </div>
                        <AccordionContent >
                            {loading ? (
                                <Skeleton className="w-full rounded-md h-[300px]" />
                            ) : (

                                <GraficoArticleHome
                                    articles={publicacoes}
                                />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <Accordion defaultValue="item-1" type="single" collapsible >
                    <AccordionItem value="item-1" >
                        <div className="flex mb-2">
                            <div className="flex gap-4 w-full justify-between items-center">

                                <div className="flex gap-4 items-center">
                                    <Quotes size={24} className="text-gray-400" />
                                    {searchType != 'article' || itemsSelecionadosPopUp.length == 0 ? (
                                        <p className="font-medium flex gap-2  items-center ">Todos os artigos<p className="text-eng-blue text-sm">({percentage.toFixed(2)}% com DOI)</p></p>
                                    ) : (
                                        <div className="font-medium flex items-center gap-2">
                                            <span
                                                className="
                                                  
                                                "
                                            >
                                                {publicacoes.length}
                                            </span>

                                            <span >ocorrências de</span>

                                            <div className='flex gap-2 items-center'>
                                                {itemsSelecionadosPopUp.map((valor, index) => {
                                                    return (
                                                        <>
                                                            <div key={index} className={`flex bg-blue-500 gap-2 items-center h-10 py-2 px-4 capitalize rounded-md text-xs text-white border-0 `} >
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

                                                <span className="flex gap-2  items-center " >em artigos<p className="text-eng-blue text-sm">({percentage.toFixed(2)}% com DOI)</p></span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mr-3 items-center h-full">

                                    {(itemsSelecionadosPopUp != itemsSelecionados && searchType == 'article') && (
                                        <div className="flex gap-3  items-center">
                                            <Button onClick={() => setItensSelecionadosPopUp(itemsSelecionados)} variant="ghost" size={'icon'}>
                                                <ArrowUDownLeft size={16} className=" whitespace-nowrap" />
                                            </Button>

                                            <div className="w-[0.5px] h-6 dark:bg-neutral-800 bg-neutral-200"></div>
                                        </div>
                                    )}

                                    <div className='hidden md:flex gap-3 items-center '>
                                        <Button onClick={() => setTypeVisu('rows')} variant={typeVisu == 'block' ? 'ghost' : 'outline'} size={'icon'}>
                                            <Rows size={16} className=" whitespace-nowrap" />
                                        </Button>

                                        <Button onClick={() => setTypeVisu('block')} variant={typeVisu == 'block' ? 'outline' : 'ghost'} size={'icon'}>
                                            <SquaresFour size={16} className=" whitespace-nowrap" />
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
                                            1200: 3
                                        }}
                                    >
                                        <Masonry gutter="16px">
                                            {items.map((item, index) => (
                                                <div className="w-full" key={index}>{item}</div>
                                            ))}
                                        </Masonry>
                                    </ResponsiveMasonry>
                                ) : (

                                    <ArticleBlockPopUp
                                        articles={publicacoes}
                                        distinct={distinct}
                                        onRefresh={handleRefresh}
                                    />
                                )
                            ) : (

                                loading ? (

                                    <Skeleton className="w-full rounded-md h-[400px]" />
                                ) : (

                                    <TableReseracherArticlesPopup
                                        articles={publicacoes}
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

function formatTerms(terms: any[]) {
    let result = '';
    let tempTerms: string[] = [];

    terms.forEach(item => {
        const term = item.term.trim();

        if (term.endsWith(';')) {
            // Remove the final ';' and add the term to the temporary array
            tempTerms.push(term.slice(0, -1));
        } else if (term.endsWith('|')) {
            // Remove the final '|' and add the term to the temporary array
            tempTerms.push(term.slice(0, -1));

            // Add the temporary array to the result as a group and clear the array
            if (tempTerms.length > 0) {
                result += '(' + tempTerms.join(';') + ')' + '|';
                tempTerms = [];
            }
        } else {
            // Handle terms that don't end with ';' or '|'
            if (tempTerms.length > 0) {
                result += '(' + tempTerms.join(';') + ')' + '|';
                tempTerms = [];
            }
            result += term + '|';
        }
    });

    // Handle any remaining terms in the tempTerms array
    if (tempTerms.length > 0) {
        result += '(' + tempTerms.join(';') + ')';
    } else {
        // Remove the last '|' if it exists
        if (result.endsWith('|')) {
            result = result.slice(0, -1);
        }
    }

    return result;
}