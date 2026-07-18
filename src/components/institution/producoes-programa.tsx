import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { UserContext } from "../../context/context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { Button } from "../ui/button";

import { Books, ChartLine, ChartLineUp, MagnifyingGlass, Quotes, Rows, SquaresFour, StripeLogo, Student, UserList } from "phosphor-react";

import { ResearchersBloco } from "../homepage/categorias/researchers-home/researchers-bloco";
import { TableReseracherhome } from "../homepage/categorias/researchers-home/table-reseracher-home";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Book, BookOpen, BookOpenText, Briefcase, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Code, Copyright, Download, File, Files, FolderKanban, Info, LibraryBig, MoreHorizontal, SlidersHorizontal, Ticket, UserCog, Users, UserSearch } from "lucide-react";
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

import { InfiniteMovingResearchersLoading } from "../ui/infinite-moving-researcher-loading";
// ChapterHome não existe na branch simcc-prod
import { useQuery } from "../dashboard/builder-page/tabelas/tabela-artigos";
import { useModal } from "../hooks/use-modal-store";
import { TextoRevistaHome } from "../listagens/texto-revista";
import { WorkEventHome } from "../listagens/work-event-home";
import { MagazineHome } from "../listagens/magazine-home";
import { BrandHome } from "../listagens/brand-home";
import { SoftwareHome } from "../listagens/software-home";
import { OrientacoesHome } from "../listagens/orientacoes-home";
import { SpeakerHome } from "../homepage/categorias/speaker-home";
import { RelatorioTecnicoHome } from "../listagens/relatorio-tecnico-home";
import { ProjetoPesquisaHome } from "../listagens/projeto-pesquisa-home";

export function ProducoesPrograma() {
    const [isOn, setIsOn] = useState(true);
    const queryUrl = useQuery();
    const tab = queryUrl.get('tab');

    const tabs = [
        { id: "book", label: "Livros", icon: Book },
        { id: "article", label: "Artigos", icon: File },
        { id: "patent", label: "Patentes", icon: Copyright },
        { id: "software", label: "Softwares", icon: Code },
        { id: "brand", label: "Marcas", icon: StripeLogo },
        { id: "relatorio-tecnico", label: "Relatório técnico", icon: Files },
        { id: "orientacoes", label: "Orientações", icon: Student },
        { id: "speaker", label: "Participação em eventos", icon: Ticket },
        { id: "research-project", label: "Projetos de pesquisa", icon: FolderKanban },
        { id: "texto-revista", label: "Texto em revista ou jornal", icon: BookOpenText },
        { id: "work-event", label: "Trabalho em evento", icon: Briefcase },
    ];
    const [value, setValue] = useState(tab || tabs[0].id)

    const navigate = useNavigate();

    const updateFilters = (category: string, values: any) => {
        if (values) {
            queryUrl.set(category, values);
        } else {
            queryUrl.delete(category)
        }
    };
    const location = useLocation();

    useEffect(() => {
        updateFilters("tab", value);
        navigate({
            pathname: location.pathname,
            search: queryUrl.toString(),
        })

    }, [value]);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollability = () => {
        if (scrollAreaRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollAreaRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    const scrollLeft = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollBy({ left: -200, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollBy({ left: 200, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        checkScrollability();
        const handleResize = () => checkScrollability();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <main className="h-full w-full flex flex-col relative">
            <Tabs defaultValue="articles" value={value} className="relative ">
                <div className="sticky top-[68px] z-[2] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur ">
                    <div className={`w-full ${isOn ? 'px-8' : 'px-4'} border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                        <div className={`flex pt-2 gap-8 justify-between ${isOn ? '' : ''} `}>
                            <div className="flex items-center gap-2">
                                <div className="relative grid grid-cols-1">

                                    <Button
                                        variant='outline'
                                        size="sm"
                                        className={`absolute left-0 z-10 h-8 w-8 p-0 ${!canScrollLeft ? 'opacity-30 cursor-not-allowed' : ''
                                            }`}
                                        onClick={scrollLeft}
                                        disabled={!canScrollLeft}
                                    >
                                        <ChevronLeft size={16} />
                                    </Button>

                                    <div className=" mx-10 ">
                                        <div ref={scrollAreaRef} className="overflow-x-auto scrollbar-hide scrollbar-hide" onScroll={checkScrollability}>
                                            <div className="p-0 flex gap-2 h-auto bg-transparent dark:bg-transparent">
                                                {tabs.map(
                                                    ({ id, label, icon: Icon }) =>

                                                        <div
                                                            key={id}
                                                            className={`pb-2 border-b-2 text-black dark:text-white transition-all ${value === id ? "border-b-[#719CB8]" : "border-b-transparent"
                                                                }`}
                                                            onClick={() => {
                                                                setValue(id)
                                                                queryUrl.set("page", '1');

                                                                navigate({
                                                                    pathname: location.pathname,
                                                                    search: queryUrl.toString(),
                                                                });

                                                            }}
                                                        >
                                                            <Button variant="ghost" className="m-0">
                                                                <Icon size={16} />
                                                                {label}
                                                            </Button>
                                                        </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>


                                    <Button
                                        variant='outline'
                                        size="sm"
                                        className={`absolute right-0 z-10 h-8 w-8 p-0 rounded-md ${!canScrollRight ? 'opacity-30 cursor-not-allowed' : ''}`}
                                        onClick={scrollRight}
                                        disabled={!canScrollRight}>
                                        <ChevronRight size={16} />
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
                                        <Link to={`/api-docs`}>
                                            <DropdownMenuItem className="p-0">
                                            </DropdownMenuItem>
                                        </Link>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                        </div>
                    </div>

                </div>

                <ScrollArea className="h-full">
                    <div className="px-8">
                        <TabsContent value="article">
                            <ArticlesHome />
                        </TabsContent>
                        <TabsContent value="research-project">
                            <ProjetoPesquisaHome />
                        </TabsContent>
                        <TabsContent value="book">
                            <BookHome />
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
    )
}