import { useContext, useEffect, useState } from "react";
import { HeaderBarema } from "./header-barema";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ChartBar, ChartLine, Check, Copy, DotsSix, Download, FileCsv, Gear, PencilLine, PlusCircle, Rows, Trash, Users } from "phosphor-react";
import { Input } from "../ui/input";
import { getFirestore, doc, getDocs, updateDoc, collection, addDoc, } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";

import { toast } from "sonner"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table"

type Research = {
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
    pgss_in_progress: string,
    pgss_completed: string,
    ic_in_progress: string,
    ic_completed: string,
    m_in_progress: string,
    m_completed: string,
    participation_event: string,
    patent: string,
    researcher: string,
    software: string,
    work_in_event: string,

    id: string
    name: string,
    university: string,
    lattes_id: string,
    city: string,
    area: string,
    graduation: string,
    researcher_id: string
}


interface PesquisadoresSelecionados {
    id: string,
    name: string,
    university: string,
    lattes_id: string,
    city: string,
    area: string,
    graduation: string,
}


import { ChevronLeft, ChevronsUpDown, MoreHorizontal, Plus } from "lucide-react";
import { UserContext } from "../../context/context";
import { PesquisadorItemBarema } from "./pesquisdor-item-barema";

interface GroupedCriteria {
    [key: string]: JSX.Element[];
}

interface Firebase {
    id: string
    name: string
    createdAt: string
    userId: string
    pesquisadores: PesquisadoresSelecionados[]
    grupos: Grupo[]

    anoArtigo: string
    anoWorkInEvent: string
    anoLivro: string
    anoCapLivro: string
    anoPatente: string
    anoMarca: string
    anoSoftware: string
    anoResourceProgess: string
    anoResourceCompleted: string
    anoParticipacao: string
    [`Document ID`]: string

}

interface SomaTotalPorGrupoEPesquisador {
    [grupoId: string]: {
        titulo: string;
        pesquisadores: { id: string; name: string; total: number }[];

    } | { [pesquisadorId: string]: string };
}

type PesquisadorUpdate = {
    total: number,
    id: string,
    name: string
    id_criterio: number
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

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "../ui/tabs"


import { GraficoBarema } from "./grafico-barema";
import { useNavigate, useParams } from "react-router-dom";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { ProcurarBaremas } from "./procurar-barema-public";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { Helmet } from "react-helmet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { DropdownMenuLabel } from "../ui/dropdown-menu";
import { number, string } from "prop-types";


export function BaremasHome() {
    const { isOpen, type } = useModalDashboard();

    const { pesquisadoresSelecionados, urlGeral, setPesquisadoresSelecionados, user, idDocumentBarema, setIdDocumentBarema } = useContext(UserContext)

    const isModalOpen = isOpen && type === 'baremas';

    const [criterioSelecionado, setCriterioSelecionado] = useState('');

    const { baremaId } = useParams<{
        baremaId: string
    }>();

    const [anoArtigo, setAnoArtigo] = useState(2000);
    const [anoWorkInEvent, setAnoWorkInEvent] = useState(2000);
    const [anoLivro, setAnoLivro] = useState(2000);
    const [anoCapLivro, setAnoCapLivro] = useState(2000);
    const [anoPatente, setAnoPatente] = useState(2000);
    const [anoMarca, setAnoMarca] = useState(2000);
    const [anoSoftware, setAnoSoftware] = useState(2000);
    const [anoResourceProgess, setAnoResourceProgess] = useState(2000);
    const [anoResourceCompleted, setAnoResourceCompleted] = useState(2000);
    const [anoParticipacao, setAnoParticipacao] = useState(2000);

    const [idBarema, setIdBarema] = useState('')

    const [tituloBarema, setTituloBarema] = useState('Barema de avaliação sem título')
    const [editTituloBarema, setEditTituloBarema] = useState(false)

    useEffect(() => {
        if (baremaId) {
            setIdDocumentBarema(baremaId);
        } else {
            // Trate o caso em que baremaId é undefined, se necessário
        }
    }, []);

    const [userData, setUserData] = useState<Firebase[] | null>(null);

    const db = getFirestore();
    useEffect(() => {
        const fetchData = async () => {
            if (idDocumentBarema != '') {
                try {
                    if (user) {
                        console.log('userId:', user.uid);

                        const userDocsRef = collection(db, 'baremas');
                        const userDocSnapshot = await getDocs(userDocsRef);
                        if (userDocSnapshot.size > 0) {
                            const userDataArray: Firebase[] = userDocSnapshot.docs.map((doc) => {
                                // Get the document ID using .id
                                const documentId = doc.id;
                                // Combine document ID with document data
                                const userData = { ...(doc.data() as Firebase), ['Document ID']: documentId };
                                return userData;
                            });
                            setUserData(userDataArray)

                            // Assume que há apenas um documento com esse ID
                            const userData = userDataArray[0];

                            // Definir os valores de grupos e pesquisadores selecionados
                            setGrupos(userData.grupos);
                            setPesquisadoresSelecionados(userData.pesquisadores as Research[]);

                            setAnoArtigo(Number(userData.anoArtigo))
                            setAnoWorkInEvent(Number(userData.anoWorkInEvent))
                            setAnoLivro(Number(userData.anoLivro))
                            setAnoCapLivro(Number(userData.anoCapLivro))
                            setAnoPatente(Number(userData.anoPatente))
                            setAnoMarca(Number(userData.anoMarca))
                            setAnoSoftware(Number(userData.anoSoftware))
                            setAnoResourceCompleted(Number(userData.anoResourceCompleted))
                            setAnoResourceProgess(Number(userData.anoResourceProgess))
                            setAnoParticipacao(Number(userData.anoParticipacao))

                            setTituloBarema(userData.name)
                        }

                        else {
                            console.log('User data not found');
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
        }
        fetchData();
    }, [idDocumentBarema]);

    interface Criterio2 {
        id: number;
        value: string;
        type: string
    }

    const CRITERIOS: Criterio2[] = [
        { id: 1, value: "Pós-doutorado", type: "Titulação" },
        { id: 2, value: "Doutorado", type: "Titulação" },
        { id: 3, value: "Mestrado", type: "Titulação" },
        { id: 4, value: "Especialista", type: "Titulação" },

        { id: 5, value: "Artigo em periódicos qualificados (A a C)", type: "Artigos" },
        { id: 19, value: "Todos os artigos", type: "Artigos" },
        { id: 20, value: "Artigo A1", type: "Artigos" },
        { id: 21, value: "Artigo A2", type: "Artigos" },
        { id: 22, value: "Artigo A3", type: "Artigos" },
        { id: 23, value: "Artigo A4", type: "Artigos" },
        { id: 24, value: "Artigo B1", type: "Artigos" },
        { id: 25, value: "Artigo B2", type: "Artigos" },
        { id: 26, value: "Artigo B3", type: "Artigos" },
        { id: 27, value: "Artigo B4", type: "Artigos" },
        { id: 28, value: "Artigo C", type: "Artigos" },
        { id: 6, value: "Artigos completos em anais de eventos", type: "Artigos" },

        { id: 7, value: "Livro publicado", type: "Produção bibliográfica" },
        { id: 8, value: "Capítulo de livro", type: "Produção bibliográfica" },

        { id: 9, value: "Patente", type: "Produção técnica" },
        { id: 10, value: "Software", type: "Produção técnica" },
        { id: 11, value: "Marca", type: "Produção técnica" },
        { id: 12, value: "Relatório técnico", type: "Produção técnica" },

        { id: 13, value: "Projetos de Pesquisa", type: "" },

        { id: 14, value: "Pós-Graduação Stricto Sensu", type: "Formação de recursos humanos em andamento" },
        { id: 15, value: "Iniciação Científica", type: "Formação de recursos humanos em andamento" },
        { id: 30, value: "Mestrado", type: "Formação de recursos humanos em andamento" },
        { id: 29, value: "Doutorado", type: "Formação de recursos humanos em andamento" },

        { id: 31, value: "Pós-Graduação Stricto Sensu", type: "Formação de recursos humanos concluída" },
        { id: 16, value: "Iniciação Científica", type: "Formação de recursos humanos concluída" },
        { id: 17, value: "Mestrado", type: "Formação de recursos humanos concluída" },
        { id: 18, value: "Doutorado", type: "Formação de recursos humanos concluída" },

        { id: 33, value: "Organização", type: "Participação em eventos" },
        { id: 134, value: "Palestrante/ Mesa Redonda/ Conferencista/ Ministrante de Minicurso", type: "Participação em eventos" }
    ];

    const criteriosAgrupados = CRITERIOS.reduce((acc, criterio) => {
        if (!criterio.type) return acc; // Ignorar itens sem tipo
        if (!acc[criterio.type]) acc[criterio.type] = [];
        acc[criterio.type].push(criterio);
        return acc;
    }, {});

    const [grupos, setGrupos] = useState<Grupo[]>([]);

    const [openPopovers, setOpenPopovers] = useState<boolean[][]>(
        () => grupos.map(group => group.categorias.map(() => false))
    );

    // Update openPopovers if grupos state changes, for instance, when groups are fetched from an API
    useEffect(() => {
        setOpenPopovers(grupos.map(group => group.categorias.map(() => false)));
    }, [grupos]);


    const [header, setHeader] = useState([
        {
            id: uuidv4(),
            titulo: 'Sem título',
            descricao: 'Adicione uma descrição para o grupo',
            anos_orientacaoes: '4',
            anos_producoes: ''

        }
    ]);

    const baixarCSV = (grupos: Grupo[]) => {
        // Criar cabeçalho do CSV
        let csvContent = "Pesquisadores,";
        const categorias = grupos.flatMap(grupo => grupo.categorias.map(categoria => categoria.criterio));
        csvContent += categorias.join(",") + ",Total\n";

        // Criar corpo do CSV
        Object.values(somaTotalPorPesquisador)
            .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
            .forEach(pesquisador => {
                let row = `"${pesquisador.name}",`; // Nome do pesquisador

                const valoresCategorias = grupos.flatMap(grupo =>
                    grupo.categorias.map(categoria => {
                        const pesquisadorData = categoria.pesquisadores.find(p => p.id === pesquisador.id);
                        return pesquisadorData ? parseFloat(pesquisadorData.total.toString()).toFixed(2) : "0.00";
                    })
                );

                row += valoresCategorias.join(",") + ",";

                // Adicionar a coluna do total
                row += `${pesquisador.total >= pesquisador.quantidade_max_pontos
                    ? pesquisador.quantidade_max_pontos
                    : parseFloat(pesquisador.total).toFixed(2)
                    }\n`;

                csvContent += row;
            });

        // Criar um blob para download
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        // Criar um link e disparar o download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "dados.csv");
        document.body.appendChild(link);
        link.click();

        // Limpar memória
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const adicionarGrupo = () => {
        const uuid = uuidv4()
        setGrupos([...grupos, {
            id: uuid,
            titulo: `Sem título ${grupos.length + 1}`,
            descricao: 'Adicione uma descrição para o grupo',
            categorias: [
                {
                    criterio: '',
                    pontos: '0',
                    pontuacao_max: '0',
                    id_grupo: uuid,
                    id_criterio: 0,
                    pesquisadores: []
                }
            ],
            quantidade_max_pontos: 0,
        }]);
    };

    console.log('barema iddddddd', idDocumentBarema)

    const adicionarCriterio = (idGrupo: any) => {
        const novoCriterio = {
            criterio: '',
            pontos: '0',
            pontuacao_max: '0',
            id_grupo: idGrupo,
            id_criterio: 0,
            pesquisadores: []
        };
        const novosGrupos = grupos.map(grupo => {
            if (grupo.id === idGrupo) {
                return {
                    ...grupo,
                    categorias: [...grupo.categorias, novoCriterio],
                };
            }
            return grupo;
        });
        setGrupos(novosGrupos);
    }

    //atualizar campos

    const handleInputChange = (e: any, index: any, idGrupo: any) => {

        console.log("GRUPOS: ", grupos);
        const { name, value } = e.target;
        const novosGrupos = grupos.map(grupo => {
            if (grupo.id === idGrupo) {
                return {
                    ...grupo,
                    categorias: grupo.categorias.map((categoria, i) => {
                        if (i === index) {
                            return {
                                ...categoria,
                                [name]: value,
                            };
                        }
                        return categoria;
                    }),
                };
            }
            return grupo;
        });
        setGrupos(novosGrupos);
    };

    //deletar criterio

    const removerCriterio = (grupoIndex: any, categoriaIndex: any) => {
        const novosGrupos = [...grupos];
        novosGrupos[grupoIndex].categorias.splice(categoriaIndex, 1);
        setGrupos(novosGrupos);
    };

    //deletar grupo

    const deletarGrupo = (grupoIndex: number) => {
        if (grupos.length === 1) {
            // Se houver apenas um grupo, não o exclua
            return;
        }

        const novosGrupos = [...grupos];
        novosGrupos.splice(grupoIndex, 1);
        setGrupos(novosGrupos);

        // Limpar os popovers relacionados ao grupo excluído
        const novosOpenPopovers = [...openPopovers];
        novosOpenPopovers.splice(grupoIndex * novosGrupos[0].categorias.length, novosGrupos[0].categorias.length);
        setOpenPopovers(novosOpenPopovers);
    };

    //dupicar grupo

    const duplicarGrupo = (grupoIndex: any) => {
        const grupoDuplicado = { ...grupos[grupoIndex] };
        const novoId = uuidv4(); // Gerar um novo ID único
        grupoDuplicado.id = novoId;

        // Determinar a posição para adicionar o grupo duplicado
        const posicaoInsercao = grupoIndex + 1;

        // Copiar os grupos atuais
        const novosGrupos = [...grupos];

        // Inserir o grupo duplicado na posição determinada
        novosGrupos.splice(posicaoInsercao, 0, grupoDuplicado);

        // Atualizar o estado dos grupos
        setGrupos(novosGrupos);

        // Inicializar os popovers para o novo grupo duplicado como fechados
        const novosOpenPopovers = [...openPopovers];
        novosOpenPopovers.splice(posicaoInsercao, 0, ...Array(grupoDuplicado.categorias.length).fill(false));
        setOpenPopovers(novosOpenPopovers);
    };

    //editar quantidade max pontos

    const editarQuantidadeMaxPontos = (grupoIndex: any, novaQuantidade: any) => {
        const novosGrupos = [...grupos];
        novosGrupos[grupoIndex].quantidade_max_pontos = novaQuantidade;
        setGrupos(novosGrupos);
    };

    // pesquisadores
    //drag
    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const newGrupos = Array.from(grupos);
        const [reorderedItem] = newGrupos.splice(result.source.index, 1);
        newGrupos.splice(result.destination.index, 0, reorderedItem);

        setGrupos(newGrupos);
    };

    // Função para formatar os dados do pesquisador
    const formatResearcherData = (p: PesquisadoresSelecionados, idCriterio: number) => ({
        total: 0,
        id: p.id,
        name: p.name,
        id_criterio: idCriterio
    });

    //select

    const selecionarCriterio = (grupoIndex: number, categoriaIndex: number, criterioId: number, criterioItem: string, pesquisadores: PesquisadoresSelecionados[]) => {
        console.log("GRUPOS: ", grupos);
        const novosGrupos = grupos.map((grupo, index) => {
            if (index === grupoIndex) {
                const novasCategorias = grupo.categorias.map((categoria, idx) => {

                    const pesquisadoresFiltradosTitulacao = pesquisadores
                        .map(pesquisador => (pesquisador.graduation).toUpperCase() === criterioItem.toUpperCase() ? formatResearcherData(pesquisador, criterioId) : undefined)
                        .filter(pesquisador => pesquisador !== undefined);

                    const pesquisadoresFiltradosOutros = pesquisadores.filter(pesquisador => pesquisador.graduation.toUpperCase() !== criterioItem.toUpperCase()).map(pesquisador => formatResearcherData(pesquisador, criterioId));

                    if (idx === categoriaIndex) {
                        return {
                            ...categoria,
                            id_criterio: criterioId,
                            criterio: criterioItem,
                            pesquisadores: [1, 2, 3, 4].includes(criterioId) ? pesquisadoresFiltradosTitulacao : pesquisadoresFiltradosOutros

                        };
                    }
                    return categoria;
                });

                return {
                    ...grupo,
                    categorias: novasCategorias
                };
            }
            return grupo;
        });

        console.log("GRUPO NOVO:>>> ", novosGrupos)
        // Atualizar os estados
        setGrupos(novosGrupos);
    };


    //mudar titulo

    const [editingGrupoIndex, setEditingGrupoIndex] = useState(null); // Estado para controlar o índice do grupo em modo de edição
    const [, setEditingDescricaoGrupoIndex] = useState(null);
    const toggleEditTitulo = (grupoIndex: any, type: any) => {
        if (type === 'titulo') {
            setEditingGrupoIndex(grupoIndex === editingGrupoIndex ? null : grupoIndex);
            setEditingDescricaoGrupoIndex(null)
        }
    };

    const handleTituloChange = (e: any, grupoIndex: any) => {
        const { value } = e.target;
        const novosGrupos = [...grupos];
        novosGrupos[grupoIndex].titulo = value;
        setGrupos(novosGrupos);
    };

    //const config
    const config = [
        { id: 1, itens: 'Artigos', valueSetter: setAnoArtigo, value: anoArtigo },
        { id: 2, itens: 'Artigos completos em anais de eventos', valueSetter: setAnoWorkInEvent, value: anoWorkInEvent },
        { id: 3, itens: 'Livros', valueSetter: setAnoLivro, value: anoLivro },
        { id: 4, itens: 'Capítulos de livro', valueSetter: setAnoCapLivro, value: anoCapLivro },
        { id: 5, itens: 'Patente', valueSetter: setAnoPatente, value: anoPatente },
        { id: 6, itens: 'Marca', valueSetter: setAnoMarca, value: anoMarca },
        { id: 7, itens: 'Software', valueSetter: setAnoSoftware, value: anoSoftware },
        { id: 8, itens: 'Formação em andamento', valueSetter: setAnoResourceProgess, value: anoResourceProgess },
        { id: 9, itens: 'Formação concluída', valueSetter: setAnoResourceCompleted, value: anoResourceCompleted },
        { id: 8, itens: 'Participação em eventos', valueSetter: setAnoParticipacao, value: anoParticipacao },
    ];

    const Color: { [key: string]: string } = {
        'titulacao': 'bg-blue-200',
        'artigos': 'bg-blue-300',
        'T3': 'bg-blue-400',
        'T4': 'bg-blue-500',
        'T5': 'bg-blue-600',
    }

    //reset config

    const resetConfig = async () => {
        setAnoArtigo(Number(2000));
        setAnoWorkInEvent(Number(2000));
        setAnoLivro(Number(2000));
        setAnoCapLivro(Number(2000));
        setAnoPatente(Number(2000));
        setAnoMarca(Number(2000));
        setAnoSoftware(Number(2000));
        setAnoResourceProgess(Number(2000));
        setAnoResourceCompleted(Number(2000));
        setAnoParticipacao(Number(2000));

        toast("Resetado", {
            description: "Valores de anos alterados para últimos 4 anos de produção",
            action: {
                label: "Fechar",
                onClick: () => { },
            },
        })
    }

    // Função para calcular a soma das pontuações máximas de todas as categorias do grupo
    const calcularSomaPontuacaoMaxima = (grupo: any) => {
        return grupo.categorias.reduce((total, categoria) => total + parseInt(categoria.pontuacao_max), 0);
    };

    // soma de pontos
    const handleResearcherUpdate = (newResearcherData: PesquisadorUpdate) => {
        const updatedGrupos = grupos.map(grupo => {
            const updatedCategorias = grupo.categorias.map(categoria => {
                // Encontrar os novos pesquisadores correspondentes a esta categoria
                const updatedPesquisadores = categoria.pesquisadores.map(pesquisador => {
                    if (pesquisador.id === newResearcherData.id) {
                        return newResearcherData;
                    }
                    return pesquisador;
                });

                return {
                    ...categoria,
                    pesquisadores: updatedPesquisadores,
                };
            });

            return {
                ...grupo,
                categorias: updatedCategorias,
            };
        });

        setGrupos(updatedGrupos);
    };

    const [valueTab, setValueTab] = useState('1')

    //Somar grupos por id
    const calcularSomaTotalPorGrupoEPesquisador = (grupos: any[]): any[] => {
        const somaTotalPorPesquisador: any[] = [];

        grupos.forEach((grupo) => {
            grupo.categorias.forEach((categoria: any) => {
                categoria.pesquisadores.forEach((pesquisador: any) => {
                    const { id, name, total } = pesquisador;
                    const pontuacaoMaxima = parseFloat(grupo.quantidade_max_pontos);

                    let totalAtualizado = total;
                    if (total > pontuacaoMaxima) {
                        totalAtualizado = pontuacaoMaxima;
                    }

                    // Verificar se o pesquisador já existe no array pelo seu 'id'
                    const pesquisadorIndex = somaTotalPorPesquisador.findIndex((p: any) => p.id === id);

                    if (pesquisadorIndex === -1) {
                        // Se o pesquisador não existe, adiciona-se um novo
                        somaTotalPorPesquisador.push({ id, name, total: totalAtualizado, grupos: [{ titulo: grupo.titulo, total: totalAtualizado }] });
                    } else {
                        // Se o pesquisador já existe, verifica-se se o grupo já existe no array de grupos
                        const grupoIndex = somaTotalPorPesquisador[pesquisadorIndex].grupos.findIndex((g: any) => g.titulo === grupo.titulo);
                        if (grupoIndex === -1) {
                            // Se o grupo não existe, adiciona-se um novo
                            somaTotalPorPesquisador[pesquisadorIndex].grupos.push({ titulo: grupo.titulo, total: totalAtualizado });
                        } else {
                            // Se o grupo já existe, soma-se o total
                            somaTotalPorPesquisador[pesquisadorIndex].grupos[grupoIndex].total += totalAtualizado;
                        }

                        // Atualizar o total do pesquisador para incluir o total deste grupo
                        somaTotalPorPesquisador[pesquisadorIndex].total += totalAtualizado;
                    }
                });
            });
        });

        return somaTotalPorPesquisador;
    };

    // Chame a função para calcular as somas totais por pesquisador em cada categoria e em cada grupo
    const somaTotalPorPesquisador = calcularSomaTotalPorGrupoEPesquisador(grupos);
    console.log(somaTotalPorPesquisador);

    //fetch

    const [researcherSelecionados, setResearcherSelecionados] = useState<Research[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Concatenando os nomes dos pesquisadores separados por ;
                const names = pesquisadoresSelecionados.map(pesquisador => pesquisador.name).join(';');

                let url: string = ''

                if (pesquisadoresSelecionados.length != 0) {
                    url = `${urlGeral}resarcher_barema?name=${names}&lattes_id=&yarticle=${anoArtigo}&ywork_event=${anoWorkInEvent}&ybook=${anoLivro}&ychapter_book=${anoCapLivro}&ypatent=${anoPatente}&ysoftware=${anoSoftware}&ybrand=${anoMarca}&yresource_progress=${anoResourceProgess}&yresource_completed=${anoResourceCompleted}&yparticipation_events=${anoParticipacao}`;
                }

                const response = await fetch(url, {
                    mode: 'cors',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Max-Age': '3600',
                        'Content-Type': 'text/plain'
                    }
                });

                console.log("URLLLL: ", url)

                const data = await response.json();

                if (data) {
                    setResearcherSelecionados(data);
                }
            } catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, [pesquisadoresSelecionados, anoArtigo, anoWorkInEvent, anoLivro, anoCapLivro, anoPatente, anoSoftware, anoMarca, anoResourceProgess, anoResourceCompleted, anoParticipacao, urlGeral]);
    //csv

    useEffect(() => {
        setPesquisadoresSelecionados(researcherSelecionados);
    }, [setPesquisadoresSelecionados])

    const convertJsonToCsv = (json: any[]): string => {
        const items = json;
        const replacer = (key: string, value: any) => (value === null ? '' : value); // Handle null values
        const header = Object.keys(items[0]);
        const csv = [
            '\uFEFF' + header.join(';'), // Add BOM and CSV header
            ...items.map((item) =>
                header.map((fieldName) => JSON.stringify(item[fieldName], replacer)).join(';')
            ) // CSV data
        ].join('\r\n');

        return csv;
    };

    const handleDownloadJson = async () => {
        try {
            const csvData = convertJsonToCsv(Object.values(somaTotalPorPesquisador).map((grupo) => grupo).sort((a, b) => parseFloat(b.total) - parseFloat(a.total)));
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `p.csv`;
            link.href = url;
            link.click();
        } catch (error) {
            console.error(error);
        }
    };

    //firebase 
    const handleSunmitBarema = async () => {
        try {
            const createdAt = new Date().toISOString()
            const idBaremaData = idBarema || uuidv4(); // Define um novo ID se não existir

            if (idDocumentBarema == '') {
                const formData = {
                    id: idBaremaData,
                    name: tituloBarema,
                    createdAt: createdAt,
                    userId: user ? user.uid : 'defaultUserId',
                    pesquisadores: pesquisadoresSelecionados,
                    grupos: grupos,

                    anoArtigo: anoArtigo,
                    anoWorkInEvent: anoWorkInEvent,
                    anoLivro: anoLivro,
                    anoCapLivro: anoCapLivro,
                    anoPatente: anoPatente,
                    anoMarca: anoMarca,
                    anoSoftware: anoSoftware,
                    anoResourceProgess: anoResourceProgess,
                    anoResourceCompleted: anoResourceCompleted,
                    anoParticipacao: anoParticipacao
                }

                setIdBarema(idBaremaData)

                const db = getFirestore();
                const programRef = collection(db, 'baremas');
                await addDoc(programRef, formData);

                toast("Barema salvo", {
                    description: "Você pode acessá-lo em meus baremas",
                    action: {
                        label: "Fechar",
                        onClick: () => { },
                    },
                })
            } else {
                const formData = {
                    id: idBarema,
                    name: tituloBarema,
                    createdAt: createdAt,
                    userId: user ? user.uid : 'defaultUserId',
                    pesquisadores: pesquisadoresSelecionados,
                    grupos: grupos,

                    anoArtigo: anoArtigo,
                    anoWorkInEvent: anoWorkInEvent,
                    anoLivro: anoLivro,
                    anoCapLivro: anoCapLivro,
                    anoPatente: anoPatente,
                    anoMarca: anoMarca,
                    anoSoftware: anoSoftware,
                    anoResourceProgess: anoResourceProgess,
                    anoResourceCompleted: anoResourceCompleted,
                    anoParticipacao: anoParticipacao
                }

                const db = getFirestore();
                const programRef = doc(db, 'baremas', idDocumentBarema);
                await updateDoc(programRef, formData);

                toast("Barema atualizado", {
                    description: "Você pode acessá-lo em meus baremas",
                    action: {
                        label: "Fechar",
                        onClick: () => { },
                    },
                })
            }
        } catch (error) {
            console.error('Erro ao enviar os dados:', error);

            toast("Tente novamente", {
                description: "Erro ao salvar barema",
                action: {
                    label: "Fechar",
                    onClick: () => { },
                },
            })
        }
    }
    //firebase submit

    const history = useNavigate();

    const handleVoltar = () => {
        history(-1);
    }

    const [tab, setTab] = useState('all')

    const { version } = useContext(UserContext)


    return (
        <>
            <Helmet>
                <title>Baremas | Módulo administrativo | {version ? ('Conectee') : ('Simcc')} </title>
                <meta name="description" content={`Baremas | Módulo administrativo | ${version ? ('Conectee') : ('Simcc')}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>
            {isModalOpen && (
                <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 min-h-[calc(100vh-56px)]">
                    <Tabs defaultValue={tab} value={tab} className="h-full" >
                        <div className="w-full  gap-4">
                            <div className="flex items-center gap-4">

                                <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="sr-only">Voltar</span>
                                </Button>

                                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                    Baremas de avaliação
                                </h1>

                                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                                    <TabsList >

                                        <TabsTrigger value="all" onClick={() => setTab('all')} className="text-zinc-600 dark:text-zinc-200">Todos os baremas</TabsTrigger>

                                        <TabsTrigger value="unread" onClick={() => setTab('unread')} className="text-zinc-600 dark:text-zinc-200">Pesquisar barema</TabsTrigger>
                                    </TabsList>

                                    <Button size="sm" onClick={() => setTab('new')}><Plus size={16} />Adicionar barema</Button>
                                </div>
                            </div>
                        </div>

                        <TabsContent value="all" className="h-auto flex flex-col gap-4 md:gap-8 ">
                            <div>
                                <h1 className=" max-w-[900px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]  md:block mb-3 ">
                                    Meus baremas de avaliação
                                </h1>
                                <p className="max-w-[750px]  text-lg font-light text-foreground">Atualize os dados importando o arquivo .xls na plataforma </p>
                                <div className="flex gap-3 mt-3">
                                    <Button size={'sm'}
                                    >Importar dados dos docentes</Button>
                                    <Button size={'sm'} variant={'ghost'} >Importar bolsistas CNPq</Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="unread" className=" flex flex-col gap-4 md:gap-8 ">
                            <ProcurarBaremas />
                        </TabsContent>

                        <TabsContent value="new" className="h-auto flex flex-col gap-4 md:gap-8 ">
                            <HeaderBarema />
                            <div className="flex">
                                <Tabs defaultValue="1" value={valueTab} className="w-full">
                                    <div className="flex flex-col gap-8 w-full">
                                        <div className="w-full flex flex-col">
                                            <div className=" dark:border-neutral-800 border border-b-0 border-neutral-200 h-3 rounded-t-md bg-[#719CB8] whitespace-nowrap"></div>

                                            <Alert className="rounded-t-none ">
                                                <div className="flex justify-between  mb-6">
                                                    <div className="flex flex-col ">
                                                        {editTituloBarema ? (
                                                            <div className="flex items-center gap-3 mb-2 ">
                                                                <Input value={tituloBarema} className="flex-1" onChange={(e) => setTituloBarema(e.target.value)} />
                                                                <Button variant={'ghost'} size={'icon'} className=" whitespace-nowrap" onClick={() => setEditTituloBarema(!editTituloBarema)}>
                                                                    <Check size={16} />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-3 mb-2 ">
                                                                <h1 className=" text-xl  font-medium max-w-[380px] bg-red-700 text-white"> {tituloBarema}</h1>
                                                                <Button variant={'ghost'} size={'icon'} className=" whitespace-nowrap" onClick={() => setEditTituloBarema(!editTituloBarema)}>
                                                                    <PencilLine size={16} />
                                                                </Button>
                                                            </div>
                                                        )}
                                                        <p className="mt-2 max-w-[500px] text-gray-500 text-xs dark:text-gray-300">Estas configurações incluem o nome do barema para exportação, o período de ano a ser considerado para a análise e outras definições.</p>
                                                    </div>

                                                    <div className="flex gap-3">
                                                        <Button onClick={() => handleSunmitBarema()} ><Check size={16} />Salvar alterações</Button>
                                                    </div>
                                                </div>

                                                <TabsList className="grid w-full grid-cols-2">
                                                    <TabsTrigger value="1" onClick={() => setValueTab('1')}>Configurações</TabsTrigger>
                                                    <TabsTrigger value="2" onClick={() => { setValueTab('2'); console.log("grupos: ", grupos) }}>Resultados</TabsTrigger>
                                                </TabsList>
                                            </Alert>
                                        </div>

                                        <TabsContent value="1" className="w-full flex gap-8 flex-col m-0 p-0">
                                            <div className="w-full flex">
                                                <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#719CB8] whitespace-nowrap"></div>

                                                <Alert className="rounded-l-none ">
                                                    <Accordion type="single" collapsible>
                                                        <AccordionItem value="item-1">
                                                            <div className="flex  h-12">
                                                                <HeaderResultTypeHome title="Configurações da avaliação" icon={<Gear size={24} className="text-gray-400" />}>
                                                                </HeaderResultTypeHome>
                                                                <AccordionTrigger>

                                                                </AccordionTrigger>
                                                            </div>
                                                            <AccordionContent>
                                                                <div>
                                                                    <div className="gap-4 grid grid-cols-2 ">
                                                                        {config.map((props) => {
                                                                            return (
                                                                                <div className="flex gap-3" key={props.id}>
                                                                                    <div className={` gap-3 transition-all flex items-center  rounded-md text-xs font-medium `}>

                                                                                        <span className=" block min-w-[200px]">{props.itens}</span>

                                                                                    </div>
                                                                                    <Input
                                                                                        className=""
                                                                                        type="number"
                                                                                        onChange={(e) => props.valueSetter(Number(e.target.value))}
                                                                                        value={Number(props.value)}
                                                                                    />
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    </Accordion>
                                                </Alert>
                                            </div>

                                            <div className="flex flex-col gap-8">
                                                {grupos.map((grupo, grupoIndex) => (
                                                    <div className="w-full flex">
                                                        <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#719CB8] whitespace-nowrap"></div>
                                                        <div className="w-full">
                                                            <Alert className="rounded-l-none rounded-b-none">
                                                                <div className="w-full flex items-center justify-center cursor-pointer text-gray-500"><DotsSix size={20} /></div>
                                                                <div className="flex justify-between  mb-6">
                                                                    <div className="flex flex-col w-auto">
                                                                        <div className="flex items-center gap-3 ">
                                                                            {editingGrupoIndex === grupoIndex ? ( // Renderizar input de edição se o grupo estiver em modo de edição
                                                                                <>
                                                                                    <Input value={grupo.titulo} className="flex-1" onChange={(e) => handleTituloChange(e, grupoIndex)} />
                                                                                    <Button variant={'ghost'} size={'icon'} className=" whitespace-nowrap" onClick={() => toggleEditTitulo(grupoIndex, 'titulo')}>
                                                                                        <Check size={16} />
                                                                                    </Button>
                                                                                </>
                                                                            ) : ( // Renderizar título normalmente se o grupo não estiver em modo de edição
                                                                                <>
                                                                                    <Rows size={24} className="text-gray-400" />
                                                                                    <p className="text-sm font-bold">{grupo.titulo}</p>
                                                                                    <Button variant={'ghost'} size={'icon'} onClick={() => toggleEditTitulo(grupoIndex, 'titulo')}>
                                                                                        <PencilLine size={16} />
                                                                                    </Button>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    <div className="">
                                                                        <Button variant={'ghost'} onClick={() => adicionarCriterio(grupo.id)} ><PlusCircle size={16} />Adicionar critério</Button>
                                                                    </div>
                                                                </div>

                                                                <Table>
                                                                    {grupo.categorias.length !== 0 && (
                                                                        <TableHeader>
                                                                            <TableRow>
                                                                                <TableHead className="w-[100px] min-w-[100px] ">Critério</TableHead>
                                                                                <TableHead className="w-[100px] min-w-[100px]">Pontuação</TableHead>
                                                                                <TableHead className="w-[200px] min-w-[200px]">Pontuação máxima</TableHead>
                                                                                <TableHead className="text-right w-ful">Total</TableHead>
                                                                            </TableRow>
                                                                        </TableHeader>
                                                                    )}

                                                                    <TableBody>
                                                                        {grupo.categorias.length !== 0 && (
                                                                            grupo.categorias.map((categoria, index) => (
                                                                                <TableRow className="relative">
                                                                                    <TableCell>
                                                                                        <div className="">
                                                                                            <Dialog
                                                                                                open={openPopovers[grupoIndex]?.[index] || false}
                                                                                                onOpenChange={(isOpen) => {
                                                                                                    // Create a copy of the current state
                                                                                                    const newOpenPopovers = openPopovers.map((groupOpen, gi) =>
                                                                                                        gi === grupoIndex
                                                                                                            ? groupOpen.map((open, ci) => (ci === index ? isOpen : open))
                                                                                                            : groupOpen
                                                                                                    );
                                                                                                    // Update the state
                                                                                                    setOpenPopovers(newOpenPopovers);
                                                                                                }}
                                                                                            >
                                                                                                <DialogTrigger className="w-full">
                                                                                                    <Button
                                                                                                        variant="outline"
                                                                                                        role="combobox"
                                                                                                        className="w-full justify-between"
                                                                                                    >
                                                                                                        {categoria.criterio.length === 0 ? 'Escolha um critério' : categoria.criterio}
                                                                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                                                    </Button>
                                                                                                </DialogTrigger>
                                                                                                <DialogContent className="z-[9999]">
                                                                                                    <DialogHeader>
                                                                                                        <DialogTitle>Escolher critério</DialogTitle>
                                                                                                        <DialogDescription>
                                                                                                            Todos os docentes cadastrado no Módulo Administrativo da instituição
                                                                                                        </DialogDescription>
                                                                                                    </DialogHeader>
                                                                                                    <div className={'max-h-[350px] overflow-y-auto elementBarra'}>
                                                                                                        <div className="flex flex-col gap-1 p-2">
                                                                                                            {Object.entries(criteriosAgrupados).map(([tipo, lista]) => (
                                                                                                                <div className="flex flex-col" key={tipo}>
                                                                                                                    <DropdownMenuLabel>
                                                                                                                        <h2>{tipo}</h2>
                                                                                                                    </DropdownMenuLabel>
                                                                                                                    {(lista as Criterio2[]).map(criterio => (
                                                                                                                        <Button
                                                                                                                            variant={'ghost'}
                                                                                                                            className="text-left justify-start"
                                                                                                                            onClick={() => selecionarCriterio(grupoIndex, index, criterio.id, criterio.value, pesquisadoresSelecionados)}
                                                                                                                            key={criterio.id} value={criterio.value}>
                                                                                                                            {criterio.value}
                                                                                                                        </Button>
                                                                                                                    ))}
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </DialogContent>
                                                                                            </Dialog>
                                                                                        </div>
                                                                                    </TableCell>

                                                                                    <TableCell>
                                                                                        <Input className="w-24" name="pontos" value={categoria.pontos} onChange={(e) => handleInputChange(e, index, grupo.id)} />
                                                                                    </TableCell>

                                                                                    <TableCell>
                                                                                        <Input className={`w-24 ${Number(categoria.pontos) > Number(categoria.pontuacao_max) && 'border-red-500'}`} name="pontuacao_max" value={categoria.pontuacao_max} onChange={(e) => handleInputChange(e, index, grupo.id)} />
                                                                                    </TableCell>

                                                                                    <TableCell className="flex justify-end pr-12 relative">
                                                                                        <div className="flex w-fit justify-between items-center gap-3 bg">
                                                                                            <div className="overflow-x-auto flex-nowrap flex-1">
                                                                                                {
                                                                                                    pesquisadoresSelecionados.length != 0 && (
                                                                                                        <PesquisadorItemBarema
                                                                                                            pontos={Number(categoria.pontos)}
                                                                                                            pontuacao_max={Number(categoria.pontuacao_max)}
                                                                                                            id_criterio={categoria.id_criterio}
                                                                                                            researcherSelecionados={researcherSelecionados}
                                                                                                            onPesquisadoresUpdate={handleResearcherUpdate}
                                                                                                            grupos={grupos}
                                                                                                        />
                                                                                                    )
                                                                                                }
                                                                                            </div>

                                                                                            <TooltipProvider>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger asChild>
                                                                                                        <Button className="group-hover:flex whitespace-nowrap absolute right-0" variant={'ghost'} size={'icon'} onClick={() => removerCriterio(grupoIndex, index)}>
                                                                                                            <Trash size={16} />
                                                                                                        </Button>
                                                                                                    </TooltipTrigger>
                                                                                                    <TooltipContent>
                                                                                                        Remover critério
                                                                                                    </TooltipContent>
                                                                                                </Tooltip>
                                                                                            </TooltipProvider>
                                                                                        </div>
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            ))
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            </Alert>
                                                            <Alert className="rounded-l-none rounded-t-none border-t-0 dark:bg-neutral-800 bg-neutral-100 flex justify-between items-center">
                                                                <div>
                                                                    {grupo.categorias.length !== 0 && (
                                                                        <div className="flex items-center gap-3">
                                                                            <p className="text-xs whitespace-nowrap ">Subtotal (o máximo a ser considerado é</p>
                                                                            <Input className={`w-16 ${calcularSomaPontuacaoMaxima(grupo) > grupo.quantidade_max_pontos && 'border-red-500'}`} value={grupo.quantidade_max_pontos} onChange={(e) => editarQuantidadeMaxPontos(grupoIndex, e.target.value)} />
                                                                            <p className="text-xs whitespace-nowrap ">pontos)</p>

                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex gap-3 items-center">
                                                                    <Button variant={'ghost'} className="hover:bg-neutral-200 dark:hover:bg-neutral-700" size={'icon'} onClick={() => duplicarGrupo(grupoIndex)}><Copy size={16} /> </Button>
                                                                    <Button variant={'ghost'} className="hover:bg-neutral-200 dark:hover:bg-neutral-700" size={'icon'} onClick={() => deletarGrupo(grupoIndex)} ><Trash size={16} /> </Button>
                                                                    <div className="h-8 w-[0.5px] bg-neutral-500 dark:bg-white"></div>
                                                                    <Button variant={'ghost'} className="hover:bg-neutral-200 dark:hover:bg-neutral-700" size={'icon'} ><MoreHorizontal className="h-4 w-4" /> </Button>
                                                                </div>
                                                            </Alert>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="2" className="w-full flex gap-3 flex-col m-0 p-0">
                                            <div className="w-full flex">
                                                <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#559FB8] whitespace-nowrap"></div>

                                                <Alert className="rounded-l-none ">
                                                    <div className="flex justify-between  mb-6">
                                                        <div className="flex flex-col ">
                                                            <div className="flex items-center gap-3 mb-2 mt-4 ">
                                                                <Users size={24} className="text-gray-400" />
                                                                <p className="text-sm font-bold">{pesquisadoresSelecionados.length} {pesquisadoresSelecionados.length != 1 ? ('pesquisadores') : ('pesquisador(a)')}</p>
                                                            </div>
                                                            <p className="mt-2 max-w-[500px] text-gray-500 text-xs dark:text-gray-300">Estas configurações incluem o nome do barema para exportação, o período de ano a ser considerado para a análise e outras definições.</p>
                                                        </div>

                                                    </div>
                                                </Alert>
                                            </div>

                                            <div className="w-full flex">
                                                <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#559FB8] whitespace-nowrap"></div>

                                                <Alert className="rounded-l-none ">
                                                    <div className="flex justify-between  mb-6">
                                                        <div className="flex flex-col ">
                                                            <div className="flex items-center gap-3 mb-2 mt-4 ">
                                                                <ChartBar size={24} className="text-gray-400" />
                                                                <p className="text-sm font-bold">Resultado e classificação dos pesquisadores</p>
                                                            </div>
                                                            <p className="mt-2 max-w-[500px] text-gray-500 text-xs dark:text-gray-300">Soma de todas as pontuações dos pesquisadores por grupo.</p>
                                                        </div>

                                                        <div className="flex gap-3">
                                                            <Button variant={'ghost'} onClick={() => handleDownloadJson()}  ><Download size={16} />Baixar resultado</Button>
                                                        </div>
                                                    </div>

                                                    {grupos.length != 0 && (
                                                        <div>
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className="">Pesquisadores</TableHead>
                                                                        {grupos.map((grupo) => {
                                                                            return (
                                                                                <TableHead>{grupo.titulo}</TableHead>
                                                                            );
                                                                        })}
                                                                        {/*grupos.flatMap((grupo) =>
                                                                            grupo.categorias.map((categoria) => (
                                                                                <TableHead key={categoria.id_criterio} className="">{categoria.criterio}</TableHead>
                                                                            ))
                                                                        )*/}
                                                                        <TableHead className="">Total</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>

                                                                <TableBody className="w-full border border-neutral-200 dark:border-neutral-800 py-3 px-4 rounded-md">
                                                                    {Object.values(somaTotalPorPesquisador)
                                                                        .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
                                                                        .map((grupoOrdenado) => (

                                                                            <TableRow key={grupoOrdenado.id} className="border-b border-neutral-200 dark:border-neutral-800">
                                                                                {/* Coluna com a imagem e nome */}
                                                                                <TableCell className="flex items-center gap-3">
                                                                                    <div
                                                                                        className="rounded-md w-8 h-8 bg-cover bg-center bg-no-repeat"
                                                                                        style={{
                                                                                            backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${grupoOrdenado.id})`,
                                                                                        }}
                                                                                    ></div>
                                                                                    <p className="text-gray-500 text-sm truncate dark:text-white">
                                                                                        {grupoOrdenado.name}
                                                                                    </p>
                                                                                </TableCell>

                                                                                {
                                                                                    grupos.map((grupo) => {
                                                                                        const totalPorColuna = grupo.categorias.reduce((acc, categoria) => {
                                                                                            return (
                                                                                                acc +
                                                                                                categoria.pesquisadores.reduce((subAcc, pesquisador) => {
                                                                                                    if (pesquisador.id === grupoOrdenado.id) {
                                                                                                        return (
                                                                                                            subAcc +
                                                                                                            (pesquisador.total >= Number(categoria.pontuacao_max)
                                                                                                                ? Number(categoria.pontuacao_max)
                                                                                                                : parseFloat(pesquisador.total.toString()))
                                                                                                        );
                                                                                                    }
                                                                                                    return subAcc;
                                                                                                }, 0)
                                                                                            );
                                                                                        }, 0);

                                                                                        return (
                                                                                            <TableCell key={grupo.id} className="text-center">
                                                                                                <div className="rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 h-10 px-4 py-2 text-gray-600 text-sm dark:text-white font-normal">
                                                                                                    {totalPorColuna >= grupo.quantidade_max_pontos ? grupo.quantidade_max_pontos : totalPorColuna.toFixed(2)}
                                                                                                </div>
                                                                                            </TableCell>
                                                                                        );
                                                                                    })
                                                                                }

                                                                                {/* Coluna com o total */}
                                                                                <TableCell className="text-center">
                                                                                    <div className="rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 h-10 px-4 py-2 text-gray-600 text-sm dark:text-white font-normal">
                                                                                        {grupoOrdenado.total >= grupoOrdenado.quantidade_max_pontos ? grupoOrdenado.quantidade_max_pontos : parseFloat(grupoOrdenado.total).toFixed(2)}
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                </TableBody>

                                                            </Table>

                                                        </div>
                                                    )}

                                                </Alert>
                                            </div>

                                            <div className="w-full flex">
                                                <div className=" dark:border-neutral-800 border border-r-0 border-neutral-200 w-2 rounded-l-md bg-[#559FB8] whitespace-nowrap"></div>

                                                <Alert className="rounded-l-none ">
                                                    <div className="flex justify-between  mb-6">
                                                        <div className="flex flex-col ">
                                                            <div className="flex items-center gap-3 mb-2 mt-4 ">
                                                                <ChartLine size={24} className="text-gray-400" />
                                                                <p className="text-sm font-bold">Gráfico de resultados</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <GraficoBarema pesquisadores={Object.values(somaTotalPorPesquisador)
                                                            .map((grupo) => grupo)
                                                            .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))}
                                                        />
                                                    </div>
                                                </Alert>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </Tabs>

                                <div className="w-16 pl-2 whitespace-nowrap">
                                    <div className="bg-white dark:bg-black sticky top-8 flex flex-col gap-2 border dark:border-neutral-800 border-neutral-200 items-center p-2 rounded-md w-full ">
                                        <Button onClick={adicionarGrupo} variant={'ghost'} size={'icon'}><PlusCircle size={20} /> </Button>
                                        <Button onClick={() => baixarCSV(grupos)} variant={'ghost'} size={'icon'}><FileCsv size={20} /> </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                    </Tabs>
                </main>
            )}
        </>
    )
}