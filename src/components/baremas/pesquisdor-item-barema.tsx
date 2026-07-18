import { useContext, useEffect, useState } from "react"
import { UserContext } from "../../context/context"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

type Research = {
    researcher_id: string,
    A1: string,
    A2: string,
    A3: string,
    A4: string,
    B1: string,
    B2: string,
    B3: string,
    B4: string,
    C: string,
    SQ: string,
    book: string,
    book_chapter: string,
    brand: string,
    event_organization: string,
    d_in_progress: string,
    d_completed: string,
    e_in_progress: string,
    e_completed: string,
    g_in_progress: string,
    g_completed: string,
    pgss_in_progress: string;
    pgss_completed: string;
    ic_in_progress: string,
    ic_completed: string,
    m_in_progress: string,
    m_completed: string,
    participation_event: string,
    patent: string,
    researcher: string,
    software: string,
    work_in_event: string,

    name: string,
    university: string,
    lattes_id: string,
    city: string,
    area: string,
    graduation: string,
}

interface Categoria {
    id_criterio: number;
    criterio: string;
    pontos: string,
    pontuacao_max: string,
    id_grupo: string,
    pesquisadores: PesquisadorUpdate[]
}

interface Grupo {
    id: string;
    titulo: string;
    descricao: string;
    categorias: Categoria[];
    quantidade_max_pontos: number;
    // outras propriedades do grupo
}

type PesquisadorUpdate = {
    total: number,
    id: string,
    name: string,
    id_criterio: number
}

type Props = {
    pontos: number,
    pontuacao_max: number,
    id_criterio: number,
    researcherSelecionados: Research[],
    onPesquisadoresUpdate: (newPesquisdor: PesquisadorUpdate) => void,
    grupos: Grupo[]
}

export function PesquisadorItemBarema(config: Props) {
    const { pesquisadoresSelecionados, urlGeral } = useContext(UserContext)

    const calcularPontuacao = (pesquisador: Research) => {
        switch (config.id_criterio) {
            case 1: // Pós-doutorado
                if (pesquisador.graduation === "Pós-Doutorado") {
                    config.grupos.map(grupo => {
                        grupo.categorias.map(categoria => {
                            categoria.pesquisadores.map(pesquisador => {
                                pesquisador.total = config.pontos >= Number(categoria.pontuacao_max) ? Number(categoria.pontuacao_max) : (config.pontos)
                            })
                        })
                    })
                    return config.pontos >= config.pontuacao_max ? config.pontuacao_max : config.pontos
                }
                return 0;
            case 2: // Doutorado
                if (pesquisador.graduation === "Doutorado") {
                    config.grupos.map(grupo => {
                        grupo.categorias.map(categoria => {
                            categoria.pesquisadores.map(pesquisador => {
                                pesquisador.total = config.pontos >= Number(categoria.pontuacao_max) ? Number(categoria.pontuacao_max) : (config.pontos)
                            })
                        })
                    })
                    return config.pontos >= config.pontuacao_max ? config.pontuacao_max : config.pontos
                }
                return 0;
            case 3: // Mestrado
                if (pesquisador.graduation === "Mestrado") {
                    config.grupos.map(grupo => {
                        grupo.categorias.map(categoria => {
                            categoria.pesquisadores.map(pesquisador => {
                                pesquisador.total = config.pontos >= Number(categoria.pontuacao_max) ? Number(categoria.pontuacao_max) : (config.pontos)
                            })
                        })
                    })
                    return config.pontos >= config.pontuacao_max ? config.pontuacao_max : config.pontos
                }
                return 0;
            case 4: // Especialista
                if (pesquisador.graduation === "Especialista") {
                    config.grupos.map(grupo => {
                        grupo.categorias.map(categoria => {
                            categoria.pesquisadores.map(pesquisador => {
                                pesquisador.total = config.pontos >= Number(categoria.pontuacao_max) ? Number(categoria.pontuacao_max) : (config.pontos)
                            })
                        })
                    })
                    return config.pontos >= config.pontuacao_max ? config.pontuacao_max : config.pontos
                }
                return 0;
            case 5: // Artigo em periódicos qualificados (A a C)
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 5) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.A1 + pRelativo!.A2 + pRelativo?.A3 + pRelativo?.A4 + pRelativo?.B1 + pRelativo?.B2 + pRelativo?.B3 + pRelativo?.B4 + pRelativo?.C)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.A1 + pesquisador.A2 + pesquisador.A3 + pesquisador.A4 + pesquisador.B1 + pesquisador.B2 + pesquisador.B3 + pesquisador.B4 + pesquisador.C) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.A1 + pesquisador.A2 + pesquisador.A3 + pesquisador.A4 + pesquisador.B1 + pesquisador.B2 + pesquisador.B3 + pesquisador.B4 + pesquisador.C)))

            case 19: // Todos os artigos
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 19) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.A1 + pRelativo!.A2 + pRelativo?.A3 + pRelativo?.A4 + pRelativo?.B1 + pRelativo?.B2 + pRelativo?.B3 + pRelativo?.B4 + pRelativo?.C)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.A1 + pesquisador.A2 + pesquisador.A3 + pesquisador.A4 + pesquisador.B1 + pesquisador.B2 + pesquisador.B3 + pesquisador.B4 + pesquisador.C) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.A1 + pesquisador.A2 + pesquisador.A3 + pesquisador.A4 + pesquisador.B1 + pesquisador.B2 + pesquisador.B3 + pesquisador.B4 + pesquisador.C)))
            case 20: //Artigo A1
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 20) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.A1)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.A1) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.A1)))
            case 21: // Artigo A2
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 21) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.A2)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.A2) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.A2)))
            case 22: // Artigo A3
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 22) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.A3)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.A3) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.A3)))
            case 23: // Artigo A4
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 23) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.A4)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.A4) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.A4)))
            case 24: // Artigo B1
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 24) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.B1)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.B1) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.B1)))
            case 25: // Artigo B2
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 25) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.B2)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.B2) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.B2)))
            case 26: // Artigo B3
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 26) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.B3)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.B3) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.B3)))
            case 27: // Artigo B4
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 27) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.B4)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.B4) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.B4)))
            case 28: // Artigo C
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 28) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.C)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.C) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.C)))
            case 6: // Artigos completos em anais de eventos
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 6) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.work_in_event)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.work_in_event) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.work_in_event)))
            case 12:
                // Pós-Graduação Stricto Sensu - andamento | Rever
                return ((config.pontos * (Number(pesquisador.d_in_progress) + Number(pesquisador.pgss_in_progress))) >= config.pontuacao_max ? (config.pontuacao_max) : ((config.pontos * (Number(pesquisador.pgss_in_progress) + Number(pesquisador.pgss_in_progress)))))
            case 13:
                // Iniciação Científica - andamento
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 13) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.ic_in_progress)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.ic_in_progress) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.ic_in_progress)))
            case 30:
                // Mestrado - andamento
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 30) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.m_in_progress)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.m_in_progress) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.m_in_progress)))
            case 29:
                // Doutorado - andamento
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 29) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.d_in_progress)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.d_in_progress) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.d_in_progress)))
            case 31:
                // Pós-Graduação Stricto Sensu - concluido | Rever
                return ((config.pontos * (Number(pesquisador.d_completed) + Number(pesquisador.pgss_completed))) >= config.pontuacao_max ? (config.pontuacao_max) : ((config.pontos * (Number(pesquisador.pgss_completed) + Number(pesquisador.pgss_completed)))))
            case 16:
                // Iniciação Científica - concluido
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 16) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.ic_completed)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.ic_completed) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.ic_completed)))
            case 15:
                // Mestrado - concluido
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 15) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.m_completed)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.m_completed) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.m_completed)))
            case 14:
                // Doutorado - concluido
                config.grupos.map(grupo => {
                    grupo.categorias.map(categoria => {
                        if (categoria.id_criterio === 14) {
                            categoria.pesquisadores.map(pesquisador => {
                                const pRelativo = config.researcherSelecionados.find(p => p.researcher_id === pesquisador.id)
                                pesquisador.total = pesquisador.total >= config.pontuacao_max ? config.pontuacao_max : config.pontos * Number(pRelativo!.d_completed)
                            })
                        }
                    })
                })
                return (config.pontos * Number(pesquisador.d_completed) >= config.pontuacao_max ? (config.pontuacao_max) : (config.pontos * Number(pesquisador.d_completed)))
            default:
                return 0;
        }
    }


    // Função para formatar os dados do pesquisador
    const formatResearcherData = (researcher: Research, teste: any) => ({
        total: teste,
        id: researcher.researcher_id,
        name: researcher.researcher,
        id_criterio: config.id_criterio
    });

    // Função para lidar com a atualização dos pesquisadores
    const handlePesquisadoresUpdate = (updateValue: any) => {
        if (updateValue !== false) {
            const formattedPesquisadores = Array.isArray(config.researcherSelecionados) && config.researcherSelecionados.map(researcher => formatResearcherData(researcher, calcularPontuacao(researcher)));
            if (formattedPesquisadores !== false) {
                if (formattedPesquisadores.length > 0) {
                    config.onPesquisadoresUpdate(formattedPesquisadores[0]);
                }
            } else {
                console.error('Update value is false, cannot update.');
            }
        } else {
            console.error('Update value is false, cannot update.');
        }
    };

    // Chamada da função para atualizar os pesquisadores quando houver mudanças
    useEffect(() => {
        handlePesquisadoresUpdate(config.researcherSelecionados);
    }, [config.researcherSelecionados, config.pontos, config.pontuacao_max, config.id_criterio]);

    return (
        <ScrollArea>
            <div className="flex gap-3 items-center w-full overflow-x-auto flex-nowrap">
                {Array.isArray(config.researcherSelecionados) && config.researcherSelecionados.map((props) => {
                    return (
                        <div key={props.researcher_id} className="group flex transition-all">
                            <div className="flex">
                                <TooltipProvider key={props.researcher_id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center">
                                                {
                                                    [1, 2, 3, 4].includes(config.id_criterio) && calcularPontuacao(props) !== 0 && (
                                                        <div
                                                            className="
                                                                rounded-md w-10 h-10 bg-cover bg-center bg-no-repeat
                                                                rounded-l-lg rounded-r-none border dark:border-neutral-800 border-r-0 bg-white
                                                                dark:bg-neutral-700
                                                            "
                                                            style={{
                                                                backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${props.researcher_id}) `
                                                            }}
                                                        >

                                                        </div>
                                                    )
                                                }

                                                {
                                                    !([1, 2, 3, 4].includes(config.id_criterio)) && Number(calcularPontuacao(props)?.toFixed(2)) >= 0 && (
                                                        <div
                                                            className="
                                                                rounded-md w-10 h-10 bg-cover bg-center bg-no-repeat
                                                                rounded-l-lg rounded-r-none border dark:border-neutral-800 border-r-0 bg-white
                                                                dark:bg-neutral-700
                                                            "
                                                            style={{
                                                                backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${props.researcher_id}) `
                                                            }}
                                                        >

                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {config.researcherSelecionados.filter((pesquisador) => pesquisador.researcher === props.researcher).map((pesquisador) => {
                                                return (
                                                    <div key={pesquisador.researcher_id} className="flex items-center gap-3">
                                                        {
                                                            [1, 2, 3, 4].includes(config.id_criterio) && calcularPontuacao(props) !== 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <p>{pesquisador.researcher}</p>
                                                                </div>
                                                            )
                                                        }

                                                        {
                                                            !([1, 2, 3, 4].includes(config.id_criterio)) && Number(calcularPontuacao(props)?.toFixed(2)) >= 0 && (
                                                                <div className="flex items-center gap-2">
                                                                    <p>{pesquisador.researcher}</p>
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                )
                                            })}
                                        </TooltipContent>
                                    </Tooltip>
                                    {
                                        [1, 2, 3, 4].includes(config.id_criterio) && calcularPontuacao(props) !== 0 && (
                                            <div
                                                className="
                                                    h-10 w-10 text-xs flex items-center justify-center
                                                    transition-all dark:bg-neutral-950 bg-white
                                                    border-neutral-200 dark:border-neutral-800 border text-gray-500 dark:text-white rounded-r-md
                                                "
                                            >
                                                {parseFloat(calcularPontuacao(props)?.toString() || '0').toFixed(2)}
                                            </div>
                                        )
                                    }

                                    {
                                        !([1, 2, 3, 4].includes(config.id_criterio)) && Number(calcularPontuacao(props)?.toFixed(2)) >= 0 && (
                                            <div
                                                className="
                                                    h-10 w-10 text-xs flex items-center justify-center
                                                    transition-all dark:bg-neutral-950 bg-white
                                                    border-neutral-200 dark:border-neutral-800 border text-gray-500 dark:text-white rounded-r-md
                                                "
                                            >
                                                {parseFloat(calcularPontuacao(props)?.toString() || '0').toFixed(2)}
                                            </div>
                                        )
                                    }
                                </TooltipProvider>
                            </div>
                        </div>
                    )
                })}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}