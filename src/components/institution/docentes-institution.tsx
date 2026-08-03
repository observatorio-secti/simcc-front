import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/context";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { ResearchItem } from "../homepage/categorias/researchers-home/researcher-item";
import { Button } from "../ui/button";
import { ChevronDown, ChevronUp, Info, Plus, User } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import { Alert } from "../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { ChartBar, MagnifyingGlass, Rows, SquaresFour, UserList } from "phosphor-react";
import { ResearchersBloco } from "../homepage/categorias/researchers-home/researchers-bloco";
import { TableReseracherhome } from "../homepage/categorias/researchers-home/table-reseracher-home";
import { GraficoAtualizacaoCurriculosBar } from "../listagens/graficos/grafico-atualizacao-lattes-bar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Input } from "../ui/input";

// ... (Interfaces permanecem as mesmas)
interface Pesquisador {
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
    ufmg: Ufmg
    h_index: string,
    relevance_score: string,
    works_count: string,
    cited_by_count: string,
    i10_index: string,
    scopus: string,
    openalex: string,
    departament: string
    subsidy: Bolsistas[]
    graduate_programs: GraduatePrograms[]
    departments: string
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

interface Ufmg {
    id: string;
    full_name: string;
    gender: string | null;
    status_code: string;
    work_regime: string;
    job_class: string;
    job_title: string;
    job_rank: string;
    job_reference_code: string;
    academic_degree: string;
    organization_entry_date: string; // formato ISO: "YYYY-MM-DD"
    last_promotion_date: string;
    employment_status_description: string;
    department_name: string;
    career_category: string;
    academic_unit: string;
    unit_code: string;
    function_code: string
    position_code: string
    leadership_start_date: string
    leadership_end_date: string
    current_function_name: string
    function_location: string
    registration_number: string
    ufmg_registration_number: string
    semester_reference: string
}


interface GraduateProgram {
    area: string;
    code: string;
    graduate_program_id: string;
    modality: string;
    name: string;
    rating: string;
    type: string;
    city: string
    state: string
    instituicao: string
    url_image: string
    region: string
    sigla: string
    latitude: string
    longitude: string
    visible: string
    qtd_discente: string
    qtd_colaborador: string
    qtd_permanente: string
    site: string
    acronym: string
    description?: string
}

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

interface Total {
    researcher_count: number
    orcid_count: number
    scopus_count: number
    among: number
}

export function DocentesInstitution() {
    const { urlGeral } = useContext(UserContext)
    const queryUrl = useQuery();

    const institutionId = queryUrl.get('institution_id');
    // REMOVIDO: Leitura dos parâmetros de paginação da URL
    // const Page = queryUrl.get('page') || '1';
    // const Length = queryUrl.get('length') || '24';

    const [total, setTotal] = useState<Total>();
    const [graduatePrograms, setGraduatePrograms] = useState<Pesquisador[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeVisu, setTypeVisu] = useState('block');
    const [search, setSearch] = useState('');
    const [isOn, setIsOn] = useState(true);

    const urlTotais = useMemo(() => {
        return `${urlGeral}researcher_metrics?type=&term=&area=&graduate_program=&city=&institution=&modality=&graduation=&departament=&year=1900&institution_id=${institutionId}`;
    }, [urlGeral, institutionId]);

    const urlGraduateProgram = useMemo(() => {
        return `${urlGeral}researcherName?name=&institution_id=${institutionId}`;
    }, [urlGeral, institutionId]);

    // Fallback: endpoint paginado que funciona mesmo quando researcherName falha (ex.: 500 no backend)
    const urlResearchersPaginated = useMemo(() => {
        return `${urlGeral}researcher?terms=&university=&institution_id=${institutionId}`;
    }, [urlGeral, institutionId]);

    // Efeito para buscar os totais (sem alterações)
    useEffect(() => {
        const fetchTotals = async () => {
            if (!institutionId) return;
            try {
                const response = await fetch(urlTotais, { mode: 'cors' });
                const data = await response.json();
                if (data) {
                    setTotal(data[0]);
                }
            } catch (err) {
                console.log("Erro ao buscar totais:", err);
            }
        };
        fetchTotals();
    }, [urlTotais, institutionId]);

    // Efeito para buscar a lista de pesquisadores, com fallback paginado
    useEffect(() => {
        const fetchResearchers = async () => {
            if (!institutionId) return;
            setLoading(true);
            try {
                const response = await fetch(urlGraduateProgram, { mode: "cors" });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                // researcherName tem limite fixo de 100 no backend; se vier exatamente 100, assume truncamento
                if (data && data.length < 100) {
                    setGraduatePrograms(data);
                } else {
                    throw new Error("Lista truncada (limite de 100), buscando paginado");
                }
            } catch (err) {
                console.log("researcherName falhou ou truncou, tentando fallback paginado:", err);
                try {
                    const allResearchers: Pesquisador[] = [];
                    let page = 1;
                    let batch: Pesquisador[] = [];
                    do {
                        const response = await fetch(`${urlResearchersPaginated}&page=${page}`, { mode: "cors" });
                        if (!response.ok) throw new Error(`HTTP ${response.status}`);
                        batch = await response.json();
                        allResearchers.push(...batch);
                        page++;
                        if (page > 100) break;
                    } while (batch.length > 0);
                    setGraduatePrograms(allResearchers);
                } catch (fallbackErr) {
                    console.log("Erro ao buscar pesquisadores:", fallbackErr);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchResearchers();
    }, [urlGraduateProgram, urlResearchersPaginated, institutionId]);

    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[300px]" />
    ));

    const currentDate = new Date().toLocaleDateString();

    // Filtrar pesquisadores pela busca
    const filteredResearchers = graduatePrograms.filter(item => {
        const normalizeString = (str: string) => str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const searchString = normalizeString(item.name);
        const normalizedSearch = normalizeString(search);

        return searchString.includes(normalizedSearch);
    });

    return (
        <main className="flex flex-1 flex-col">
            <div className="top-[68px] sticky z-[9] supports-[backdrop-filter]:dark:bg-neutral-900/60 supports-[backdrop-filter]:bg-neutral-50/60 backdrop-blur">
                <div className={`w-full px-8 border-b border-b-neutral-200 dark:border-b-neutral-800`}>
                    {isOn && (
                        <div className="w-full flex justify-between items-center">
                            <div className="w-full pt-4 flex justify-between items-center">
                                <Alert className="h-14 mt-4 mb-2 p-2 flex items-center justify-between w-full">
                                    <div className="flex items-center gap-2 w-full flex-1">
                                        <MagnifyingGlass size={16} className="whitespace-nowrap w-10" />
                                        <Input 
                                            onChange={(e) => setSearch(e.target.value)} 
                                            value={search} 
                                            type="text" 
                                            placeholder="Pesquisar docente..."
                                            className="border-0 w-full" 
                                        />
                                    </div>
                                </Alert>
                            </div>
                        </div>
                    )}

                    <div className={`flex w-full flex-wrap pt-2 pb-3 justify-between`}>
                        <div></div>
                        <div className="hidden xl:flex xl:flex-nowrap gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setIsOn(!isOn)}>
                                {isOn ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 md:px-8">
                <div>
                    <Alert className="p-0 mb-4 md:mb-8">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Docentes
                        </CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredResearchers.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {search ? 'encontrados na busca' : 'registrados'}
                        </p>
                    </CardContent>
                </Alert>
            </div>

            <div>
                <Accordion defaultValue="item-1" type="single" collapsible>
                    <AccordionItem value="item-1">
                        <div className="flex mb-2 mt-4">
                            <HeaderResultTypeHome title="Pesquisadores por detalhamento" icon={<UserList size={24} className="text-gray-400" />}>
                                <div className="hidden md:flex gap-3 mr-3">
                                    <Button onClick={() => setTypeVisu('rows')} variant={typeVisu === 'block' ? 'ghost' : 'outline'} size={'icon'}>
                                        <Rows size={16} className="whitespace-nowrap" />
                                    </Button>
                                    <Button onClick={() => setTypeVisu('block')} variant={typeVisu === 'block' ? 'outline' : 'ghost'} size={'icon'}>
                                        <SquaresFour size={16} className="whitespace-nowrap" />
                                    </Button>
                                </div>
                            </HeaderResultTypeHome>
                            <AccordionTrigger>

                            </AccordionTrigger>
                        </div>
                        <AccordionContent>
                            {typeVisu === 'block' ? (
                                loading ? (
                                    <ResponsiveMasonry
                                        columnsCountBreakPoints={{
                                            350: 2,
                                            750: 3,
                                            900: 4,
                                            1200: 6,
                                            1500: 6,
                                            1700: 7
                                        }}
                                    >
                                        <Masonry gutter="16px">
                                            {items.map((item, index) => (
                                                <div className="w-full" key={index}>{item}</div>
                                            ))}
                                        </Masonry>
                                    </ResponsiveMasonry>
                                ) : (
                                    <ResearchersBloco researcher={filteredResearchers} />
                                )
                            ) : (
                                loading ? (
                                    <Skeleton className="w-full rounded-md h-[400px]" />
                                ) : (
                                    <TableReseracherhome researcher={filteredResearchers} />
                                )
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            </div>
        </main>
    )
}