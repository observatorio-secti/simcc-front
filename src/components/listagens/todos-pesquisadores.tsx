import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { UserContext } from "../../context/context";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { Button } from "../ui/button";
import { ChartLine, ChartLineUp, MagnifyingGlass, Quotes, Rows, SquaresFour, StripeLogo, Student, UserList } from "phosphor-react";
import { ResearchersBloco } from "../homepage/categorias/researchers-home/researchers-bloco";
import { TableReseracherhome } from "../homepage/categorias/researchers-home/table-reseracher-home";
import { ArrowRight, BookOpen, BookOpenText, Briefcase, ChevronDown, ChevronUp, Code, Copyright, Download, File, Files, FolderKanban, Info, MoreHorizontal, Ticket, UserCog, Users, UserSearch } from "lucide-react";
import { InfiniteMovingResearchers } from "../ui/infinite-moving-researcher";
import { Tabs, TabsContent, TabsList } from "../ui/tabs";
import { Input } from "../ui/input";
import { Alert } from "../ui/alert";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { ArticlesResearcherPopUp } from "../popup/articles-researcher";
import { ResearchersHome } from "../homepage/categorias/researchers-home";
import { ArticlesHome } from "../homepage/categorias/articles-home";
import { Helmet } from "react-helmet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { BookHome } from "../homepage/categorias/book-home";
import { PatentHome } from "../homepage/categorias/patent-home";
import { SoftwareHome } from "./software-home";
import { BrandHome } from "./brand-home";
import { MagazineHome } from "./magazine-home";
import { WorkEventHome } from "./work-event-home";
import { TextoRevistaHome } from "./texto-revista";
import { ResearchersHomeListagens } from "./researchers-home";
import { BolsistasHome } from "./bolsistas-home";
import { RelatorioTecnicoHome } from "./relatorio-tecnico-home";
import { SpeakerHome } from "../homepage/categorias/speaker-home";
import { ProjetoPesquisaHome } from "./projeto-pesquisa-home";
import { OrientacoesHome } from "./orientacoes-home";
import { TechnicianHome } from "./technician-home";
import { InfiniteMovingResearchersLoading } from "../ui/infinite-moving-researcher-loading";

type Research = {
    among: number,
    articles: number,
    book: number,
    book_chapters: number,
    id: string,
    name: string,
    university: string,
    lattes_id: string,
    area: string,
    lattes_10_id: string,
    abstract: string,
    city: string,
    orcid: string,
    image: string
    graduation: string,
    patent: string,
    software: string,
    brand: string,
    lattes_update: Date,
    h_index: string,
    relevance_score: string,
    works_count: string,
    cited_by_count: string,
    i10_index: string,
    scopus: string,
    openalex: string,
    subsidy: Bolsistas[]
    graduate_programs: GraduatePrograms[]
}

interface Bolsistas {
    aid_quantity: string
    call_title: string
    funding_program_name: string
    modality_code: string
    category_level_code: string
    institute_name: string
    modality_name: string
    scholarship_quantity: string
}

interface GraduatePrograms {
    graduate_program_id: string
    name: string
}

export function TodosPesquisadores() {
    const location = useLocation();
    const { urlGeral, version, searchType } = useContext(UserContext);

    const [search, setSearch] = useState('');
    const [researcher, setResearcher] = useState<Research[]>([]);
    const [loading, setLoading] = useState(false);
    let urlTermPesquisadores = `${urlGeral}researcherName?name=`;
    const [typeVisu, setTypeVisu] = useState('block');

    useMemo(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(urlTermPesquisadores, {
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
                    setResearcher(data);
                    setLoading(false);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlTermPesquisadores]);

    const [isOn, setIsOn] = useState(true);
    const [value, setValue] = useState('bolsistas');
    const randomResearchers = useMemo(() => {
        return researcher.sort(() => Math.random() - 0.5).slice(0, 40);
    }, [researcher]);

    const [jsonData, setJsonData] = useState<any[]>([]);
    let urlPublicacoesPorPesquisador = '';
    if (value == 'article') {
        urlPublicacoesPorPesquisador = `${urlGeral}bibliographic_production_researcher?terms=&researcher_id=&type=ARTICLE&qualis=&qualis=&year=1900`;
    } else if (value == 'pesquisadores') {
        urlPublicacoesPorPesquisador = `${urlGeral}researcherName?name=`;
    } else if (value == 'speaker') {
        urlPublicacoesPorPesquisador = `${urlGeral}pevent_researcher?researcher_id=&year=1900&term=&nature=`;
    } else if (value == 'patent') {
        urlPublicacoesPorPesquisador = `${urlGeral}patent_production_researcher?researcher_id=&year=1900&term=&distinct=`;
    } else if (value == 'book') {
        urlPublicacoesPorPesquisador = `${urlGeral}book_production_researcher?researcher_id=&year=1900&term=&distinct=0`;
        urlPublicacoesPorPesquisador = `${urlGeral}book_chapter_production_researcher?researcher_id=&year=1900&term=&distinct=0`;
    } else if (value == 'bolsistas') {
        urlPublicacoesPorPesquisador = `${urlGeral}researcher/foment`;
    } else if (value == 'software') {
        urlPublicacoesPorPesquisador = `${urlGeral}software_production_researcher?researcher_id=&year=1900&distinct=0`;
    } else if (value == 'brand') {
        urlPublicacoesPorPesquisador = `${urlGeral}brand_production_researcher?researcher_id=&year=1900&distinct=0`;
    } else if (value == 'relatorio-tecnico') {
        urlPublicacoesPorPesquisador = `${urlGeral}researcher_report?researcher_id=&year=1900&distinct=0`;
    } else if (value == 'orientacoes') {
        urlPublicacoesPorPesquisador = `${urlGeral}guidance_researcher?researcher_id=&year=1990&distinct=0`;
    } else if (value == 'speaker') {
        urlPublicacoesPorPesquisador = `${urlGeral}pevent_researcher?researcher_id=&year=1990&term=&nature=&distinct=0`;
    } else if (value == 'research-project') {
        urlPublicacoesPorPesquisador = `${urlGeral}researcher_research_project?researcher_id=&term=&year=&distinct=0`;
    } else if (value == 'texto-revista') {
        urlPublicacoesPorPesquisador = `${urlGeral}papers_magazine?researcher_id=&year=1990&distinct=0`;
    } else if (value == 'work-event') {
        urlPublicacoesPorPesquisador = `${urlGeral}researcher_production/events?researcher_id=&year=1990&distinct=0`;
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

    const tabs = [
        { id: "bolsistas", label: "Bolsistas CNPq", icon: UserSearch },
        { id: "pesquisadores", label: "Pesquisadores", icon: Users },
        { id: "tecnicos", label: "Técnicos", icon: UserCog, condition: version },
        { id: "article", label: "Artigos", icon: File },
        { id: "book", label: "Livros e capítulos", icon: BookOpen },
        { id: "patent", label: "Patentes", icon: Copyright },
        { id: "software", label: "Softwares", icon: Code },
        { id: "brand", label: "Marcas", icon: StripeLogo },
        { id: "relatorio-tecnico", label: "Relatório técnico", icon: Files },
        { id: "orientacoes", label: "Orientações", icon: Student },
        { id: "speaker", label: "Participação em eventos", icon: Ticket },
        { id: "research-project", label: "Projetos de pesquisa", icon: FolderKanban },
        { id: "texto-revista", label: "Texto em revista", icon: BookOpenText },
        { id: "work-event", label: "Trabalho em evento", icon: Briefcase },
        { id: "magazine", label: "Revistas", icon: BookOpen }
    ];

    // Efeito para ler o parâmetro 'tab' da URL e definir a aba ativa
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tabFromUrl = params.get('tab');

        // ✅ CORREÇÃO: Verifica se 'tabFromUrl' não é nulo antes de continuar
        if (tabFromUrl) {
            const isValidTab = tabs.some(tab => {
                const isConditionMet = tab.condition === undefined ? true : !!tab.condition;
                return tab.id === tabFromUrl && isConditionMet;
            });

            if (isValidTab) {
                // Agora é seguro, pois 'tabFromUrl' é uma string
                setValue(tabFromUrl);
            }
        }
    }, [location.search, version]);

    const convertJsonToCsv = (json: any[]): string => {
        const items = json;
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

    const handleDownloadJson = async () => {
        try {
            const csvData = convertJsonToCsv(jsonData);
            const blob = new Blob([csvData], { type: 'text/csv;charset=windows-1252;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `dados.csv`;
            link.href = url;
            link.click();
        } catch (error) {
            console.error(error);
        }
    };

    const nomesAleatorios = Array.from({ length: 20 }, (_, i) => ({
        name: `Pesquisador ${i + 1}`,
    }));

    return (
        <main className=" w-full grid grid-cols-1 ">
            <Helmet>
                <title>Listagens | {version ? ('Conectee') : ('Simcc')}</title>
                <meta name="description" content={`Listagens | ${version ? ('Conectee') : ('Simcc')}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>
            <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20" >
                <Link to={'/informacoes'} className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12} /><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12} /></Link>
                <h1 className="z-[2] text-center max-w-[800px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
                    Todas as {" "}
                    <strong className="bg-eng-blue  rounded-md px-3 pb-2 text-white font-medium">
                        {" "}
                        listagens
                    </strong>{" "}
                    que a plataforma pode filtrar para você.
                </h1>
                <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>
            </div>
            <main className="h-full w-full flex flex-col">
                <Tabs defaultValue="articles" value={value} className="">
                    <div>
                        <div className={`w-full ${isOn ? 'px-8' : 'px-4'} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                            {isOn && (
                                <div className="w-full pt-4  flex justify-between items-center">
                                </div>
                            )}
                            <div className={`flex pt-2 gap-8 justify-between  ${isOn ? '' : ''} `}>
                                <div className="flex items-center gap-2">
                                    <div className="relative grid grid-cols-1">
                                        <ScrollArea className="relative overflow-x-auto">
                                            <TabsList className="p-0 flex h-auto bg-transparent dark:bg-transparent">
                                                {tabs.map(
                                                    ({ id, label, icon: Icon, condition = true }) =>
                                                        condition && (
                                                            <div
                                                                key={id}
                                                                className={`pb-2 border-b-2 text-black dark:text-white transition-all ${value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                                                                    }`}
                                                                onClick={() => setValue(id)}
                                                            >
                                                                <Button variant="ghost" className="m-0">
                                                                    <Icon size={16} />
                                                                    {label}
                                                                </Button>
                                                            </div>
                                                        )
                                                )}
                                            </TabsList>
                                            <ScrollBar orientation="horizontal" />
                                        </ScrollArea>
                                    </div>
                                </div>
                                <div className="hidden xl:flex xl:flex-nowrap gap-2">
                                    <div className="md:flex md:flex-nowrap gap-2">
                                        <Link to={`${urlGeral}dictionary.pdf`} target="_blank">
                                            <Button variant="ghost" className="">
                                                <File size={16} className="" />
                                                Dicionário de dados
                                            </Button>
                                        </Link>
                                        <Button onClick={() => handleDownloadJson()} variant="ghost" className="">
                                            <Download size={16} className="" />
                                            Baixar resultado
                                        </Button>
                                    </div>
                                </div>
                                <div className="block xl:hidden">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <Button variant="ghost" className="h-8 w-8 p-0 xl:block">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuLabel>Mais opções</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <Link to={`${urlGeral}dictionary.pdf`} target="_blank">
                                                <DropdownMenuItem className="p-0">
                                                    <Button variant="ghost" className="">
                                                        <File size={16} className="" />
                                                        Dicionário de dados
                                                    </Button>
                                                </DropdownMenuItem>
                                            </Link>
                                            <DropdownMenuItem className="p-0">
                                                <Button onClick={() => handleDownloadJson()} variant="ghost" className="">
                                                    <Download size={16} className="" />
                                                    Baixar resultado
                                                </Button>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ScrollArea className="h-full">
                        <div className="px-8">
                            <TabsContent value="pesquisadores">
                                <ResearchersHomeListagens />
                            </TabsContent>
                            <TabsContent value="bolsistas">
                                <BolsistasHome />
                            </TabsContent>
                            <TabsContent value="article">
                                <ArticlesHome />
                            </TabsContent>
                            <TabsContent value="research-project">
                                <ProjetoPesquisaHome />
                            </TabsContent>
                            <TabsContent value="book">
                                <BookHome />
                            </TabsContent>
                            <TabsContent value="tecnicos">
                                <TechnicianHome />
                            </TabsContent>
                            <TabsContent value="relatorio-tecnico">
                                <RelatorioTecnicoHome />
                            </TabsContent>
                            <TabsContent value="speaker">
                                <SpeakerHome />
                            </TabsContent>
                            <TabsContent value="orientacoes">
                                <OrientacoesHome />
                            </TabsContent>
                            <TabsContent value="patent">
                                <PatentHome />
                            </TabsContent>
                            <TabsContent value="software">
                                <SoftwareHome />
                            </TabsContent>
                            <TabsContent value="brand">
                                <BrandHome />
                            </TabsContent>
                            <TabsContent value="magazine">
                                <MagazineHome />
                            </TabsContent>
                            <TabsContent value="work-event">
                                <WorkEventHome />
                            </TabsContent>
                            <TabsContent value="texto-revista">
                                <TextoRevistaHome />
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </main>
        </main>
    )
}