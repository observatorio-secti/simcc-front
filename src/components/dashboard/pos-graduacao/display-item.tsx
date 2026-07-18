import { AreaChart, ArrowLeftToLine, ArrowRightToLine, Book, Briefcase, Code, Copyright, File, Globe, GraduationCap, MapPinIcon, PencilLine, Plus, SquareArrowOutUpRight, SquareMenu, Star, User, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { Books, Eye, EyeSlash, Quotes, StripeLogo, Trash } from "phosphor-react";
import { toast } from "sonner"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";
import { useModal } from "../../hooks/use-modal-store";

import { Link } from "react-router-dom";


import { Helmet } from "react-helmet";
import { DocentesGraduate } from "../components/docentes-graduate";
import { Total } from "../../graduate-program/homepage-program";

interface Patrimonio {
    graduate_program_id: string
    menu_state: boolean
    code: string
    name: string
    area: string
    modality: string
    type: string
    rating: string
    institution_id: string
    description?: string
    url_image: string
    city: string
    created_at?: string
    visible: boolean
    updated_at?: string
    qtd_discente: string
    qtd_colaborador: string
    qtd_permanente: string
    site: string
    acronym: string
    menagers: string[]
    onMenuState: (newResearcher: boolean) => void;
}

export interface PesquisadorProps {
    lattes_id: string
    name: string
    type_: string
    graduate_program_id: string
    years: Array<number>
}

export interface PesquisadorProps2 {
    name: string
    lattes_id: string
    researcher_id: string
    institution_id: string
}


export function DisplayItem(props: Patrimonio) {
    const qualisColor = {
        'MESTRADO': 'bg-blue-200',
        'DOUTORADO': 'bg-blue-800',
    };



    const [visibleProgram, setVisibleProgram] = useState(false);
    const { urlGeralAdm, user } = useContext(UserContext);
    const { onOpen, isOpen, type: typeModal } = useModal();

    const [isVisible, setIsVisible] = useState(props.visible)

    useEffect(() => {
        setIsVisible(props.visible);
    }, [urlGeralAdm, props.graduate_program_id, props.visible]);


    const handleVisibleProgram = (id: string) => {

        const urlVisibleProgram = urlGeralAdm + `GraduateProgramRest/Update?graduate_program_id=${id}`
        const fetchData = async () => {

            try {
                const response = await fetch(urlVisibleProgram, {
                    mode: 'cors',
                    method: 'POST',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Max-Age': '3600',
                        'Content-Type': 'text/plain'
                    }
                });
                if (response.ok) {
                    setIsVisible(!isVisible);
                    setVisibleProgram(!visibleProgram)
                    toast("Visibilidade alterada", {
                        description: "Operação realizada com sucesso!",
                        action: {
                            label: "Fechar",
                            onClick: () => { },
                        },
                    })
                }


            } catch (err) {
                toast("Erro ao mudar visibilidade", {
                    description: "Tente novamente",
                    action: {
                        label: "Fechar",
                        onClick: () => { },
                    },
                })
            }
        };
        fetchData();

    };

    const { version, urlGeral } = useContext(UserContext)

    const [totalProducao, setTotalProducao] = useState<Total[]>([]);

    const urlTotalProgram = `${urlGeral}graduate_program_production?graduate_program_id=${props.graduate_program_id}&year=1900`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(urlTotalProgram, {
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
                    setTotalProducao(data);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlTotalProgram]);

    const producoes = [
        {
            name: "Artigos",
            icon: File,
            number: totalProducao.slice(0, 1)[0]?.article,
        },
        {
            name: "Livros",
            icon: Book,
            number: totalProducao.slice(0, 1)[0]?.book,
        },
        {
            name: "Capítulos de livro",
            icon: Books,
            number: totalProducao.slice(0, 1)[0]?.book_chapter,
        },
        {
            name: "Patentes",
            icon: Copyright,
            number: totalProducao.slice(0, 1)[0]?.patent,
        },
        {
            name: "Marcas",
            icon: StripeLogo,
            number: totalProducao.slice(0, 1)[0]?.brand,
        },
        {
            name: "Softwares",
            icon: Code,
            number: totalProducao.slice(0, 1)[0]?.software,
        },
        {
            name: "Trabalhos em eventos",
            icon: Briefcase,
            number: totalProducao.slice(0, 1)[0]?.work_in_event,
        },
        {
            name: "Bolsistas CNPq",
            icon: Copyright,
            number: totalProducao.slice(0, 1)[0]?.subsidy,
        }

    ];

    return (
        <>
            <Helmet>
                <title>{props.name ? `${props.name} | ${version ? 'Conectee' : 'Simcc'}` : `${version ? 'Conectee' : 'Simcc'} | ${version ? 'Escola de Engenharia UFMG' : 'SECTI-BA'}`}</title>
                <meta
                    name="description"
                    content={props.name ? `${props.name} | ${version ? 'Conectee' : 'Simcc'}` : `${version ? 'Conectee' : 'Simcc'} | ${version ? 'Escola de Engenharia UFMG' : 'SECTI-BA'}`}
                />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <div className="flex border dark:border-neutral-800 flex-col sticky top-[68px] z-[3] rounded-lg bg-white dark:bg-black">
                <div className="flex items-center p-2 justify-between">
                    <div className="flex items-center gap-2">

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" onClick={() => onOpen('edit-graduate-program', {
                                    graduate_program_id: props.graduate_program_id,
                                    code: props.code,
                                    name: props.name,
                                    area: props.area,
                                    modality: props.modality,
                                    type: props.type,
                                    rating: props.rating,
                                    institution_id: props.institution_id,
                                    description: props.description,
                                    url_image: props.url_image,
                                    city: props.city,
                                    visible: String(props.visible),
                                    site: props.site,
                                    acronym: props.acronym,
                                    menagers: props.menagers
                                })} >
                                    <PencilLine size={16} />
                                    <span className="sr-only">Arquivar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to={`/pos-graduacao?graduate_program_id=${props.graduate_program_id}`} target="_blank">
                                    <Button variant="ghost" size="icon"   >
                                        <SquareArrowOutUpRight size={16} />
                                        <span className="sr-only">Arquivar</span>
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Visualizar página</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link to={''}>
                                    <Button variant="ghost" size="icon"  >
                                        <AreaChart size={16} />
                                        <span className="sr-only">Arquivar</span>
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Indicadores</TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex items-center gap-2">



                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => onOpen('confirm-delete-pos-graduate-program', { id_delete: props.graduate_program_id, name: props.name })} variant='destructive' size="icon"   >
                                    <Trash size={16} />
                                    <span className="sr-only">Arquivar</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Deletar programa</TooltipContent>
                        </Tooltip>
                    </div>
                </div>


            </div>
            <div className="h-full mt-8 border sticky top-[156px]   rounded-lg   dark:border-neutral-800" >
                <div className="overflow-y-auto ">
                    <DocentesGraduate graduate_program_id={props.graduate_program_id} />
                </div>
            </div>
        </>
    )
}