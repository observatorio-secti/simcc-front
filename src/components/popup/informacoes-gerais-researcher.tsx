import { CalendarBlank, ChalkboardSimple, ChartLine, Quotes } from "phosphor-react";
import { InfraestruturaPesquisa } from '../../components/popup/infraestrutura-pesquisa'
import dt from '../../assets/dt.png'
import pq from '../../assets/pq.png'
import { useState, useEffect, useContext } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../components/ui/tooltip"
import { Clock, GraduationCap, Info, Mail, Phone, Shapes, Users, Blocks, Star, Building2 } from "lucide-react";
import { Alert } from "../ui/alert";
import { Link } from "react-router-dom";
import { useModal } from "../hooks/use-modal-store";
import { UserContext } from "../../context/context";

type Research = {
    data_atualizacao_lattes?: string,
    entradanaufmg?: string
    orcid: string
    h_index: string,
    relevance_score: string,
    works_count: string,
    cited_by_count: string,
    i10_index: string,
    scopus: string,
    openalex: string,
    lattes_id: string,
    subsidy: Bolsistas[]
    graduate_programs: GraduatePrograms[]
    departments: Departments[]
    research_groups: ResearchGroups[]
    cargo: string
    clas: string
    classe: string
    rt: string
    situacao: string
    classification: string
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
    area?: string
    type?: string
    rating?: string
    institution_id?: string
}

interface Departments {
    dep_des: string
    dep_email: string
    dep_nom: string
    dep_id: string
    dep_sigla: string
    dep_site: string
    dep_tel: string
    img_data: string
}

interface ResearchGroups {
    area: string
    group_id: string
    name: string
}

interface Institution {
    name: string
    id: string
    acronym: string
}

function GraduateProgramCard({ program }: { program: GraduatePrograms }) {
    const { urlGeral } = useContext(UserContext);
    const [programDetails, setProgramDetails] = useState<GraduatePrograms>(program);
    const [institution, setInstitution] = useState<Institution | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`${urlGeral}graduate_program_profnit?id=${program.graduate_program_id}`, {
                    mode: "cors",
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Content-Type": "text/plain",
                    },
                });

                const data = await response.json();
                if (data && data.length > 0) {
                    const full = data[0];
                    setProgramDetails({
                        ...program,
                        area: full.area || '',
                        type: full.type || '',
                        rating: full.rating || '',
                        institution_id: full.institution_id
                    });

                    if (full.institution_id) {
                        const institutionRes = await fetch(`${urlGeral}institution/${full.institution_id}/`);
                        const institutionData = await institutionRes.json();
                        setInstitution(institutionData);
                    }
                }
            } catch (error) {
                console.error("Erro ao buscar detalhes:", error);
            }
        };

        fetchDetails();
    }, [program.graduate_program_id, urlGeral]);

    return (
        <Link
            key={programDetails.graduate_program_id}
            to={`/pos-graduacao?graduate_program_id=${programDetails.graduate_program_id}`}
            target="_blank"
            className="w-full"
        >
            <Alert className="flex justify-center gap-6">
                <div className="flex flex-col flex-1 justify-center h-full">
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-2 justify-between">
                        PROGRAMA DE PÓS-GRADUAÇÃO
                        <GraduationCap size={14} />
                    </div>

                    <p className="font-medium mb-3">{programDetails.name}</p>

                    <div className="flex flex-wrap gap-2 text-xs">
                        {programDetails.type && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                <Users size={12} />
                                {programDetails.type}
                            </div>
                        )}
                        {programDetails.area && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                <Blocks size={12} />
                                {programDetails.area}
                            </div>
                        )}
                        {programDetails.rating && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                <Star size={12} />
                                Nota: {programDetails.rating}
                            </div>
                        )}
                        {institution && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                                <Building2 size={12} />
                                {institution.acronym} - {institution.name}
                            </div>
                        )}
                    </div>
                </div>
            </Alert>
        </Link>
    );
}

export function InformacoesGeraisResearcher(props: Research) {
    const { onClose } = useModal()
    const { version } = useContext(UserContext)

    const currentDate = new Date();
    const lattesUpdate = String(props.data_atualizacao_lattes).split('/');
    const lattesMonth = parseInt(lattesUpdate[1]);
    const lattesYear = parseInt(lattesUpdate[2]);
    const monthDifference = (currentDate.getFullYear() - lattesYear) * 12 + (currentDate.getMonth() + 1 - lattesMonth);
    const isOutdated = monthDifference > 3;
    const isOutdated6 = monthDifference > 6;

    const classificationColors = {
        "A+": "bg-green-500",
        A: "bg-green-400",
        "B+": "bg-yellow-400",
        B: "bg-yellow-300",
        "C+": "bg-orange-400",
        C: "bg-orange-300",
        "D+": "bg-red-400",
        D: "bg-red-300",
        "E+": "bg-gray-400",
        E: "bg-gray-300",
    };

    return (
        <div className="h-fit text-left w-full">
            <div className="font-medium text-2xl mb-6 pr-12">Informações gerais</div>

            <div className="flex gap-3 mb-6 items-center flex-wrap">
                {props.h_index?.length != 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="outline-none">
                                <div className="py-2 px-4 border border-neutral-200 bg-white dark:bg-black dark:border-neutral-800 rounded-md text-xs flex gap-2 items-center">
                                    <ChartLine size={12} /> índice H no OpenAlex: {props.h_index}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Dados do OpenAlex</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {props.cited_by_count?.length != 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="outline-none">
                                <div className="border-neutral-200 border dark:border-neutral-800 bg-white dark:bg-black py-2 px-4 rounded-md text-xs flex gap-2 items-center">
                                    <Quotes size={12} /> Citações: {props.cited_by_count}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Dados do OpenAlex</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {props.i10_index?.length != 0 && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="outline-none">
                                <div className="py-2 px-4 border border-neutral-200 bg-white dark:bg-black dark:border-neutral-800 rounded-md text-xs flex gap-2 items-center">
                                    <ChartLine size={12} /> índice i10: {props.i10_index}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Dados do OpenAlex</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                {props.subsidy && props.subsidy.length != 0 && props.subsidy.slice(0, 1).map((item) => (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="outline-none">
                                <div className="py-2 px-4 border border-neutral-200 bg-white dark:bg-black dark:border-neutral-800 rounded-md text-xs flex gap-2 items-center">
                                    <img src={item.modality_code == 'DT' ? (dt) : (pq)} className="w-4 h-4" alt="" />
                                    {item.modality_name}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Bolsista CNPq</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}

                {!version && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger className="outline-none">
                                <Link target="_blank" to={`/indice-pesquisador`} onClick={() => onClose()} className="flex gap-0">
                                    <div className="py-2 px-4 border border-neutral-200 bg-eng-blue text-white dark:bg-eng-blue dark:border-neutral-800 rounded-l-md text-xs flex gap-2 items-center">
                                        <ChartLine size={12} /> índice do pesquisador:
                                    </div>
                                    <div
                                        className={`py-2 px-4 border border-neutral-200 border-l-0 text-white dark:border-neutral-800 rounded-r-md text-xs flex gap-2 items-center ${classificationColors[props.classification] || "bg-neutral-200"}`}
                                    >
                                        {props.classification}
                                    </div>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Saiba mais</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}

                <div
                    className={`py-2 px-4 border border-neutral-200 bg-white dark:bg-black dark:border-neutral-800 rounded-md text-xs flex gap-2 items-center lg:hidden ${isOutdated6 ? 'bg-red-500 text-white border-none' : isOutdated ? 'bg-yellow-600 text-white border-none' : ''}`}
                >
                    <CalendarBlank size={12} /> Atualização do Lattes: {String(props.data_atualizacao_lattes)}
                </div>
            </div>

            {props.graduate_programs && props.graduate_programs.length !== 0 && (
                <div>
                    <div className="font-medium text-2xl mb-6">Programas de pós-graduação</div>
                    <div className="flex flex-col gap-4 mb-6">
                        {props.graduate_programs.map((item) => (
                            <GraduateProgramCard key={item.graduate_program_id} program={item} />
                        ))}
                    </div>
                </div>
            )}

            <InfraestruturaPesquisa lattes_id={props.lattes_id} />
        </div>
    );
}
