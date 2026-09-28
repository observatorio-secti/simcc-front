import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { ModalType, useModalResult } from "../hooks/use-modal-result";
import { ResultProvider } from "../provider/result-provider";

import { UserContext } from "../../context/context";

import { Button } from "../ui/button";
import { BookOpen, Building2, ChevronDown, ChevronUp, Copyright, Download, Loader2, Map as MapIconLucide, MoreHorizontal, SlidersHorizontal, Ticket, Users } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { useModal } from "../hooks/use-modal-store";
import { File } from "phosphor-react";
import { Search } from "../search/search";
import { HeaderResult } from "./header-results";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ResultFiltersSlotContext } from "./result-filters-slot-context";
import { useIsMobile } from "../../hooks/use-mobile";

const useQuery = () => new URLSearchParams(useLocation().search);

export function ResultHome() {
    const { isOpen, type } = useModalHomepage();
    const { onOpen, type: typeResult } = useModalResult();
    const { itemsSelecionados, searchType, simcc, urlGeral, valoresSelecionadosExport } = useContext(UserContext);
    const { onOpen: onOpenModal } = useModal();

    const [isOn, setIsOn] = useState(true);
    const [articleDistinct, setArticleDistinct] = useState(false);
    const isMobile = useIsMobile();

    const queryUrl = useQuery();
    const researcher = queryUrl.get('researcher');
    const type_search = queryUrl.get('type_search');
    const terms = queryUrl.get('terms');

    useEffect(() => {
        if (type_search === 'patent' && !terms) {
            onOpen('patent-home');
        } else if (type_search === 'area' && !terms) {
            onOpen('researchers-home');
        } else if (type_search === 'abstract' && !terms) {
            onOpen('researchers-home');
        } else if (type_search === 'speaker' && !terms) {
            onOpen('speaker-home');
        } else if (type_search === 'book' && !terms) {
            onOpen('book-home');
        } else if (type_search === 'article' && !terms) {
            onOpen('articles-home');
        } else if (type_search === 'name' && !terms) {
            onOpen('researchers-home');
        } else if (!typeResult) {
            onOpen('researchers-home');
        }
    }, [typeResult]);

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
        updateFilters("tab", typeResult);
        navigate({
            pathname: '/resultados',
            search: queryUrl.toString(),
        });
    }, [typeResult]);

    useEffect(() => {
        if (tab) {
            const legacyTab = tab === 'mapa-home-v2' ? 'mapa-home' : tab;
            onOpen(legacyTab as ModalType);
        }
    }, []);

    const [jsonData, setJsonData] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const exportPageSize = 100;
    const maxExportPages = 100;

    const encodedTerm = encodeURIComponent(valoresSelecionadosExport || '');

    let urlPublicacoesPorPesquisador = '';

    if (typeResult === 'articles-home') {
        urlPublicacoesPorPesquisador = `${urlGeral}bibliographic_production_researcher?terms=${encodedTerm}&researcher_id=&type=ARTICLE&qualis=&year=1900&distinct=${articleDistinct ? '1' : '0'}`;
    } else if (typeResult === 'researchers-home') {
        if (searchType === 'name') {
            urlPublicacoesPorPesquisador = `${urlGeral}researcherName?name=${encodedTerm}`;
        } else if (searchType === 'article') {
            urlPublicacoesPorPesquisador = `${urlGeral}researcher?terms=${encodedTerm}&university=&type=ARTICLE&graduate_program_id=`;
        } else if (searchType === 'book') {
            urlPublicacoesPorPesquisador = `${urlGeral}researcherBook?term=${encodedTerm}&university=&type=BOOK&graduate_program_id=`;
        } else if (searchType === 'area') {
            urlPublicacoesPorPesquisador = `${urlGeral}researcherArea_specialty?area_specialty=${encodedTerm}&university=&graduate_program_id=`;
        } else if (searchType === 'speaker') {
            urlPublicacoesPorPesquisador = `${urlGeral}researcherParticipationEvent?term=${encodedTerm}&university=&graduate_program_id=`;
        } else if (searchType === 'patent') {
            urlPublicacoesPorPesquisador = `${urlGeral}researcherPatent?term=${encodedTerm}&graduate_program_id=&university=`;
        } else if (searchType === 'abstract') {
            urlPublicacoesPorPesquisador = `${urlGeral}researcher?terms=${encodedTerm}&university=&type=ABSTRACT&graduate_program_id=`;
        }
    } else if (typeResult === 'speaker-home') {
        urlPublicacoesPorPesquisador = `${urlGeral}pevent_researcher?researcher_id=&year=1900&term=${encodedTerm}&nature=`;
    } else if (typeResult === 'institutions-home') {
        if (searchType === 'article') {
            urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${encodedTerm}&university=&type=ARTICLE`;
        } else if (searchType === 'speaker') {
            urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${encodedTerm}&university=&type=SPEAKER`;
        } else if (searchType === 'patent') {
            urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${encodedTerm}&university=&type=PATENT`;
        } else if (searchType === 'book') {
            urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${encodedTerm}&university=&type=BOOK`;
        } else if (searchType === 'abstract') {
            urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${encodedTerm}&university=&type=ABSTRACT`;
        } else if (searchType === 'area') {
            urlPublicacoesPorPesquisador = `${urlGeral}institutionFrequenci?terms=${encodedTerm}&university=&type=AREA`;
        }
    } else if (typeResult === 'patent-home') {
        urlPublicacoesPorPesquisador = `${urlGeral}patent_production_researcher?researcher_id=&year=1900&term=${encodedTerm}&distinct=`;
    } else if (typeResult === 'book-home') {
        urlPublicacoesPorPesquisador = `${urlGeral}book_production_researcher?researcher_id=&year=1900&term=${encodedTerm}&distinct=0`;
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
                        'Content-Type': 'text/plain'
                    }
                });
                if (!response.ok) {
                    await response.text();
                    return;
                }
                const ct = response.headers.get("content-type") || "";
                if (!ct.includes("application/json")) {
                    await response.text();
                    return;
                }
                const data = await response.json();
                if (data) {
                    setJsonData(data);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlPublicacoesPorPesquisador]);

    const convertJsonToCsv = (json: any[]): string => {
        const items = json;
        if (items.length === 0) {
            return '';
        }

        const replacer = (_: string, value: any) => (value === null ? '' : value);
        const header = Object.keys(items[0]);
        const csv = [
            '\uFEFF' + header.join(';'),
            ...items.map((item) =>
                header.map((fieldName) => JSON.stringify(item[fieldName], replacer)).join(';')
            )
        ].join('\r\n');

        return csv;
    };

    const sortExportData = (items: any[]) => {
        const sortField = typeResult === 'articles-home' ? 'title' : typeResult === 'researchers-home' ? 'name' : null;

        if (!sortField || !items?.length) {
            return items;
        }

        return [...items].sort((a, b) => {
            const firstValue = String(a?.[sortField] ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const secondValue = String(b?.[sortField] ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            return firstValue.localeCompare(secondValue, 'pt-BR', { sensitivity: 'base' });
        });
    };

    const handleDownloadJson = async () => {
        if (isExporting) return;
        setIsExporting(true);
        try {
            let dataToDownload = sortExportData(jsonData);

            if (typeResult === 'articles-home' || typeResult === 'researchers-home') {
                const pages: any[] = [];
                let page = 1;
                let pageData: any[];
                const sortBy = typeResult === 'articles-home' ? 'title' : 'name';

                do {
                    const separator = urlPublicacoesPorPesquisador.includes('?') ? '&' : '?';
                    const response = await fetch(
                        `${urlPublicacoesPorPesquisador}${separator}page=${page}&sort_by=${sortBy}&sort_order=asc`,
                        {
                            mode: 'cors',
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'GET',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Access-Control-Max-Age': '3600',
                                'Content-Type': 'text/plain'
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error(`Falha ao buscar a página ${page} dos resultados`);
                    }

                    pageData = await response.json();
                    if (!Array.isArray(pageData)) {
                        throw new Error('A API retornou um formato de dados inválido');
                    }

                    pages.push(...pageData);
                    page += 1;
                } while (pageData.length === exportPageSize && page <= maxExportPages);

                dataToDownload = sortExportData(pages);
            } else {
                dataToDownload = sortExportData(dataToDownload);
            }

            const csvData = convertJsonToCsv(dataToDownload);
            if (!csvData) {
                return;
            }

            const blob = new Blob([csvData], { type: 'text/csv;charset=windows-1252;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `dados.csv`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            toast.success('Arquivo baixado');
        } catch (error) {
            toast.error('Falha ao exportar, tente novamente');
        } finally {
            setIsExporting(false);
        }
    };

    const version = false;
    const rootRef = useRef<HTMLDivElement>(null);
    const stickyHeaderRef = useRef<HTMLDivElement>(null);

    const [filtersSlot, setFiltersSlot] = useState<HTMLDivElement | null>(null);
    const filtersSlotRef = useCallback((el: HTMLDivElement | null) => {
        setFiltersSlot(el);
    }, []);

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
        <ResultFiltersSlotContext.Provider value={{ slot: filtersSlot, articleDistinct, setArticleDistinct }}>
            <div ref={rootRef} className="min-h-full w-full flex flex-col">
                <Helmet>
                    <title>
                        {itemsSelecionados.length === 0
                            ? 'Pesquisa'
                            : `Pesquisa: ${itemsSelecionados.map((item) => item.term).join(' ')}`} | {version ? 'Conectee' : 'Simcc'}
                    </title>
                    <meta name="description" content={`Pesquisa | ${version ? 'Conectee' : 'Simcc'}`} />
                    <meta name="robots" content="index, follow" />
                </Helmet>

                <div className="flex w-full">
                    <div ref={filtersSlotRef} className="hidden lg:block shrink-0" />

                    <div className="flex-1 min-w-0">
                        {(itemsSelecionados.length > 0 || (researcher === 'false')) && (
                            <div ref={stickyHeaderRef} className="top-[68px] h-fit sticky z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
                                <div className="w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800">
                                    {isOn && (
                                        <div className="w-full pt-4 flex justify-between items-center">
                                            <Search />
                                        </div>
                                    )}
                                    {itemsSelecionados.length > 0 && <HeaderResult />}
                                    <div className="flex w-full flex-wrap gap-4 pt-2 justify-between">
                                        <div className="flex flex-1 w-full">
                                            <ScrollArea>
                                                <div className="w-full flex items-center gap-2">
                                                    {!(researcher === 'false' && itemsSelecionados.length === 0) && (
                                                        <div className="transition-all">
                                                            <Button variant="ghost" className={`text-base rounded-md px-4 ${typeResult === 'researchers-home' ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white' : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => onOpen('researchers-home')}>
                                                                <Users className="h-4 w-4" />
                                                                Pesquisadores
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {searchType === 'article' && (
                                                        <div className="transition-all">
                                                            <Button variant="ghost" className={`text-base rounded-md px-4 m-0 ${typeResult === 'articles-home' ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white' : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => onOpen('articles-home')}>
                                                                <File className="h-4 w-4" />
                                                                Artigos
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {searchType === 'book' && (
                                                        <div className="transition-all">
                                                            <Button variant="ghost" className={`text-base rounded-md px-4 m-0 ${typeResult === 'book-home' ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white' : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => onOpen('book-home')}>
                                                                <BookOpen className="h-4 w-4" />
                                                                Livros e capítulos
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {searchType === 'patent' && (
                                                        <div className="transition-all">
                                                            <Button variant="ghost" className={`text-base rounded-md px-4 m-0 ${typeResult === 'patent-home' ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white' : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => onOpen('patent-home')}>
                                                                <Copyright className="h-4 w-4" />
                                                                Patentes
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {searchType === 'speaker' && (
                                                        <div className="transition-all">
                                                            <Button variant="ghost" className={`text-base rounded-md px-4 m-0 ${typeResult === 'speaker-home' ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white' : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => onOpen('speaker-home')}>
                                                                <Ticket className="h-4 w-4" />
                                                                Participação em eventos
                                                            </Button>
                                                        </div>
                                                    )}
                                                    {!(simcc && researcher === 'false' && itemsSelecionados.length === 0) && (
                                                        searchType !== 'name' && (
                                                            <div className="transition-all">
                                                                <Button variant="ghost" className={`text-base rounded-md px-4 ${typeResult === 'institutions-home' ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white' : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => onOpen('institutions-home')}>
                                                                    <Building2 className="h-4 w-4" />
                                                                    Instituições
                                                                </Button>
                                                            </div>
                                                        )
                                                    )}
                                                    {!isMobile && !(simcc && researcher === 'false' && itemsSelecionados.length === 0) && (
                                                        searchType !== 'name' && (
                                                            <div className="transition-all">
                                                                <Button variant="ghost" className={`text-base rounded-md px-4 ${typeResult === 'mapa-home' ? 'bg-eng-blue text-white hover:bg-eng-dark-blue hover:text-white dark:bg-eng-blue dark:text-white dark:hover:bg-eng-dark-blue dark:hover:text-white' : 'bg-[#eeeeee] text-neutral-700 hover:bg-[#e5e5e5] dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'}`} onClick={() => onOpen('mapa-home')}>
                                                                    <MapIconLucide className="h-4 w-4" />
                                                                    Mapa
                                                                </Button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                                <ScrollBar orientation="horizontal" />
                                            </ScrollArea>
                                        </div>

                                        <div className="hidden xl:flex xl:flex-nowrap gap-2">
                                            <div className="md:flex md:flex-nowrap gap-2">
                                                <Button onClick={() => handleDownloadJson()} variant="ghost" disabled={isExporting} aria-busy={isExporting}>
                                                    {isExporting ? (
                                                        <Loader2 size={16} className="animate-spin" />
                                                    ) : (
                                                        <Download size={16} />
                                                    )}
                                                    {isExporting ? 'Gerando arquivo…' : 'Baixar resultado'}
                                                </Button>
                                            </div>

                                            <Button variant="ghost" size="icon" onClick={() => setIsOn(!isOn)}>
                                                {isOn ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </Button>
                                        </div>

                                        <div className="block xl:hidden">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <Button variant="ghost" size="icon" className="p-0 xl:flex">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleDownloadJson()} className="gap-2" disabled={isExporting}>
                                                        {isExporting ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <Download size={16} />
                                                        )}
                                                        {isExporting ? 'Gerando arquivo…' : 'Baixar resultado'}
                                                    </DropdownMenuItem>
                                                    {(typeResult === 'researchers-home' || typeResult === 'articles-home' || typeResult === 'mapa-home') && (
                                                        <DropdownMenuItem onClick={() => onOpenModal('filters')} className="gap-2 lg:hidden">
                                                            <SlidersHorizontal size={16} />
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
                            {(itemsSelecionados.length > 0 || (researcher === 'false')) ? (
                                <div className="px-8 h-full">
                                    <ResultProvider />
                                </div>
                            ) : (
                                <div className="h-[calc(100vh-134px)] flex flex-col md:p-8 p-4 md:pt-4">
                                    <Search />
                                    <div className="w-full flex flex-col items-center justify-center h-full">
                                        <p className="text-9xl text-eng-blue font-bold mb-16 animate-pulse">^_^</p>
                                        <p className="font-medium text-lg">
                                            Experimente pesquisar um tema e veja o que a plataforma pode filtrar para você.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ResultFiltersSlotContext.Provider>
    );
}