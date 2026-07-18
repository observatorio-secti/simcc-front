


import { useModalSidebar } from "../../hooks/use-modal-sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../context/context";

import { Button } from "../../ui/button";
import { ChevronLeft, Copy, GraduationCap, Info, Link2, Pencil, Plus, Trash, User, UserCog } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";

import { Input } from "../../ui/input";
import { toast } from "sonner"
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';

import { CargosFuncoes } from "../components/cargos-funcoes";
import { GraficoAnaliseUsuarios } from "../graficos/grafico-analise-usuarios";
import { Label } from "../../ui/label";
import { ArrowElbowDownRight, ChartBar, MagnifyingGlass, Student } from "phosphor-react";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { useModal } from "../../hooks/use-modal-store";
import { Instituicoes } from "./instituicoes";
import { Helmet } from "react-helmet";
import { Feedbacks } from "./feedbacks";
import { ContagemEventos30Dias } from "./graficos/contagem-eventos-30-dias";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { GraficoContagemEventosDia } from "./graficos/contagem-eventos-dia";
import { PaisesAcessos } from "./graficos/paises-acesso";
import { PercentualEventos } from "./graficos/percentual-eventos";
import { FirestoreView } from "./firestore-view";



interface TotalPatrimonios {
    count_gp: string,
    count_gpr: string,
    institution_id: string,
    count_r: string,
    count_d: string,
    count_gps: string,
    count_t: string
}

type Background = {
    id: string;
    imgURL: string;
    titulo: string
    descricao: string
    botao: string
    link: string
    textColor: string
    color: string
};

export function GeralViewDashboard() {

    const db = getFirestore();
    const { isOpen: isOpenSidebar } = useModalSidebar();

    console.log(isOpenSidebar)
    const { user, urlGeralAdm, permission } = useContext(UserContext);


    const has_editar_cargos_permissoes = permission.some(
        (perm) => perm.permission === 'editar_cargos_permissoes'
    );

    const has_editar_cargos_usuarios = permission.some(
        (perm) => perm.permission === 'editar_cargos_usuarios'
    );

    const has_editar_informacoes_usuarios = permission.some(
        (perm) => perm.permission === 'editar_informacoes_usuarios'
    );

    const has_editar_configuracoes_plataforma = permission.some(
        (perm) => perm.permission === 'editar_configuracoes_plataforma'
    );








    ////

    const [total, setTotal] = useState<TotalPatrimonios[]>([]);

    const urlPatrimonioInsert = `${urlGeralAdm}InstitutionRest/Query/Count?institution_id=`;

    console.log(urlPatrimonioInsert)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(urlPatrimonioInsert, {
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
                    setTotal(data)
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData()


    }, [urlPatrimonioInsert]);

    const history = useNavigate();

    const handleVoltar = () => {
        history(-1);
    }


    //submit apanhe


    const [directoryInput, setDirectoryInput] = useState("/");
    const [directory, setDirectory] = useState('');

    let urlDiretorio = `${urlGeralAdm}s/directory`

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(urlDiretorio, {
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
                    setDirectory(data)
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData()


    }, []);


    const handleSubmitDiretorio = async () => {
        try {
            const response = await fetch(`${urlGeralAdm}s/save-directory`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ directory }),
            });

            if (response.ok) {
                toast("Diretório alterado", {
                    description: "Todos os arquivos necessários serão puxados dessa pasta",
                    action: {
                        label: "Fechar",
                        onClick: () => { },
                    },
                })
            } else {
                toast("Erro ao alterar diretório", {
                    description: "Todos os arquivos necessários serão puxados dessa pasta",
                    action: {
                        label: "Fechar",
                        onClick: () => { },
                    },
                })
            }
        } catch (error) {
            console.error('Error saving directory:', error);
        }
    };


    const [tab, setTab] = useState('all')



    /// DITEORIO JSON

    const [directoryJson, setDirectoryJson] = useState("");

    // Carregar o valor do JSON ao inicializar o componente
    useEffect(() => {
        fetch('public/directory.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setDirectoryJson(data[0].directory);
            })
            .catch(error => {
                console.error('Erro ao carregar JSON:', error);
            });
    }, []);


    console.log(directoryJson)


    useEffect(() => {
        if (!has_editar_cargos_permissoes) {
            setTab('all')
        } else if (!has_editar_configuracoes_plataforma) {
            setTab('all')
        }
    }, [permission]);


    ///delatra bg
    const [background, setBackground] = useState<Background[]>([]);

    const deleteItem = async (id: string) => {
        if (!id) {
            console.error("ID is undefined");
            return;
        }

        try {
            // Cria uma query para buscar o documento com o campo 'id' igual ao id fornecido
            const q = query(collection(db, (version ? ('background') : ('background_iapos'))), where('id', '==', id));
            const querySnapshot = await getDocs(q);

            querySnapshot.forEach(async (docSnapshot) => {
                // Referência do documento no Firestore
                const docRef = doc(db, (version ? ('background') : ('background_iapos')), docSnapshot.id);
                await deleteDoc(docRef);

                // Atualiza o estado para remover o item excluído
                setBackground(prevBackground => prevBackground.filter(item => item.id !== id));

                toast("Background deletado", {
                    description: "Operação realizada com sucesso",
                    action: {
                        label: "Fechar",
                        onClick: () => { },
                    },
                })
            });
        } catch (error) {
            console.error("Erro ao excluir documento: ", error);
        }
    };


    useEffect(() => {
        const fetchEmails = async () => {
            const querySnapshot = await getDocs(collection(db, (version ? ('background') : ('background_iapos'))));
            const emailsData = querySnapshot.docs.map(doc => ({
                id: doc.data().id,
                titulo: doc.data().titulo,
                imgURL: doc.data().imgURL,
                descricao: doc.data().descricao,
                botao: doc.data().botao,
                link: doc.data().link,
                color: doc.data().color,
                textColor: doc.data().textColor
            }));


            setBackground(emailsData);

        };

        fetchEmails();
    }, []);

    const { onOpen } = useModal()

    const { version } = useContext(UserContext)



    return (
        <div className="w-full relative">
            <Helmet>
                <title>Módulo administrativo | {version ? ('Conectee') : ('Simcc')} </title>
                <meta name="description" content={`Módulo administrativo | ${version ? ('Conectee') : ('Simcc')}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>
            <main className="flex flex-1 flex-col gap-4  md:gap-8 ">
                <Tabs defaultValue={tab} value={tab} className="h-full" >
                    <div className="w-full mb-8  gap-4">
                        <div className="flex items-center gap-4 p-4 md:p-8 pb-0 md:pb-0">

                            <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Voltar</span>
                            </Button>

                            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                Módulo administrativo
                            </h1>




                            <div className="hidden items-center gap-2 md:ml-auto md:flex">
                                <TabsList >

                                    <TabsTrigger value="all" onClick={() => setTab('all')} className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>

                                    <TabsTrigger value="cargos" disabled={!has_editar_cargos_permissoes && !has_editar_cargos_usuarios && !has_editar_informacoes_usuarios} onClick={() => setTab('cargos')} className="text-zinc-600 dark:text-zinc-200">Cargos e permissões</TabsTrigger>
                                    <TabsTrigger value="inst" disabled={!has_editar_configuracoes_plataforma} onClick={() => setTab('inst')} className="text-zinc-600 dark:text-zinc-200">Instituições</TabsTrigger>
                                    <TabsTrigger value="unread" disabled={!has_editar_configuracoes_plataforma} onClick={() => setTab('unread')} className="text-zinc-600 dark:text-zinc-200">Configurações</TabsTrigger>
                                </TabsList>



                            </div>
                        </div>

                    </div>

                    <TabsContent value="inst" className=" ">
                        <Instituicoes />
                    </TabsContent>

                    <TabsContent value="all" className=" ">
                        <div className={`p-4 md:p-8 pt-0 md:pt-0 h-auto flex flex-col gap-4 md:gap-8`}>
                            <div className={`grid gap-4 md:grid-cols-2 md:gap-8 ${version ? ('lg:grid-cols-4') : ('lg:grid-cols-3')}`}>
                                <Link to={"/dashboard/pesquisadores"}>
                                    <Alert className="p-0">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Total de docentes
                                            </CardTitle>
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{total.map((props) => props.count_r)}</div>
                                            <p className="text-xs text-muted-foreground">
                                                registrados
                                            </p>
                                        </CardContent>
                                    </Alert>
                                </Link>

                                {version && (
                                    <Link to={'/dashboard/indicadores'}>
                                        <Alert className="p-0">
                                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                                <CardTitle className="text-sm font-medium">
                                                    Total de Técnicos
                                                </CardTitle>
                                                <UserCog className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{total.map((props) => props.count_t)}</div>
                                                <p className="text-xs text-muted-foreground">
                                                    registrados
                                                </p>
                                            </CardContent>
                                        </Alert>
                                    </Link>
                                )}

                                <Alert className="p-0">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total de discentes
                                        </CardTitle>
                                        <Student className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{total.map((props) => props.count_gps)}</div>
                                        <p className="text-xs text-muted-foreground">
                                            cadastrados
                                        </p>
                                    </CardContent>
                                </Alert>

                                <Link to={'/dashboard/programas'}>
                                    <Alert className="p-0">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                Total de pós-graduação
                                            </CardTitle>
                                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{total.map((props) => props.count_gp)}</div>
                                            <p className="text-xs text-muted-foreground">
                                                cadastrados
                                            </p>
                                        </CardContent>
                                    </Alert></Link>
                            </div>


                            <div className="flex flex-col md:grid  h-full gap-8 lg:grid-cols-2 xl:grid-cols-3">
                                <Alert className="xl:col-span-2 p-0" x-chunk="dashboard-01-chunk-4" >
                                    <CardHeader className="flex gap-6 flex-col flex-wrap md:flex-row  justify-between">
                                        <div className="grid gap-2 ">
                                            <CardTitle>Todas as campanhas</CardTitle>
                                            <CardDescription>
                                                Fundos e campanhas exibidos na plataforma
                                            </CardDescription>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button onClick={() => onOpen('add-background')}><Plus size={16} />Adicionar background</Button>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="flex flex-col gap-3 p-8 pt-0">

                                        <ScrollArea className="flex flex-col gap-3 h-full">
                                            <div className="flex flex-col gap-3">
                                                {background.map((props) => {
                                                    return (
                                                        <Alert className="flex justify-between group bg-neutral-100 border-0 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all hover:bg-neutral-200  items-center">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-md whitespace-nowrap bg-cover bg-center bg-no-repeat " style={{ backgroundImage: `url(${props.imgURL})` }} />
                                                                <p className="max-w-[150px] truncate text-sm text-gray-500">{props.titulo}</p>
                                                            </div>


                                                            <div className="flex gap-2 items-center">
                                                                {props.link && (
                                                                    <Link to={props.link} target="_blank"> <Button variant={'ghost'} className="h-8"><Link2 size={16} /> Acessar link</Button></Link>
                                                                )}

                                                                <Button onClick={() => onOpen('edit-background', {
                                                                    id: props.id,
                                                                    titulo: props.titulo,
                                                                    descricao: props.descricao,
                                                                    botao: props.botao,
                                                                    link: props.link,
                                                                    imgURL: props.imgURL,
                                                                    color: props.color,
                                                                    textColor: props.textColor
                                                                })} variant={'ghost'} size={'icon'} className="h-8 w-8 transition-all group-hover:flex"><Pencil size={13} /></Button>
                                                                <Button onClick={() => deleteItem(props.id)} variant={'destructive'} size={'icon'} className="h-8 w-8  transition-all group-hover:flex"><Trash size={13} /></Button>
                                                            </div>
                                                        </Alert>
                                                    )
                                                })}
                                            </div>
                                            <ScrollBar orientation='vertical' />
                                        </ScrollArea>
                                    </CardContent>

                                </Alert>

                                <Alert className=" p-0" x-chunk="dashboard-01-chunk-4" >
                                    <CardHeader className="flex flex-row items-center">
                                        <div className="grid gap-2">
                                            <CardTitle>Feedbacks</CardTitle>
                                            <CardDescription>
                                                Lista de relatório de problemas da plataforma
                                            </CardDescription>
                                        </div>

                                    </CardHeader>
                                    <CardContent>
                                        <Feedbacks />

                                    </CardContent>
                                </Alert>




                            </div>

                            <div className="w-full ">
                                <Alert className="w-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Evolução do número de usuários ativos
                                            </CardTitle>
                                            <CardDescription>Últimos 30 dia</CardDescription>
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Fonte: Google Analytics</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </CardHeader>

                                    <CardContent className="flex py-0 flex-1  items-center justify-center">
                                        <ContagemEventos30Dias />
                                    </CardContent>
                                </Alert>
                            </div>


                            <div className="grid lg:grid-cols-2 gap-8">
                                <Alert className="w-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Distribuição percentual dos eventos
                                            </CardTitle>
                                            <CardDescription>Últimos 30 dia</CardDescription>
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Fonte: Google Analytics</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </CardHeader>

                                    <CardContent className="flex py-0 flex-1  items-center justify-center">
                                        <PercentualEventos />
                                    </CardContent>
                                </Alert>

                                <Alert className="w-full">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Contagem de eventos por dia
                                            </CardTitle>
                                            <CardDescription>Últimos 30 dia</CardDescription>
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Fonte: Google Analytics</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </CardHeader>

                                    <CardContent className="flex py-0 flex-1  items-center justify-center">
                                        <GraficoContagemEventosDia />
                                    </CardContent>
                                </Alert>
                            </div>

                            <Alert className="w-full">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div>
                                        <CardTitle className="text-sm font-medium">
                                            Número de eventos por país
                                        </CardTitle>
                                        <CardDescription>Últimos 30 dia</CardDescription>
                                    </div>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Fonte: Google Analytics</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                </CardHeader>

                                <CardContent className="flex py-0 flex-1  items-center justify-center">
                                    <PaisesAcessos />
                                </CardContent>
                            </Alert>
                        </div>

                    </TabsContent>

                    <TabsContent value="cargos" className="h-auto flex flex-col gap-8 m-0">
                        <CargosFuncoes />
                    </TabsContent>

                    <TabsContent value="unread" className="h-full flex flex-col gap-4 md:gap-8 px-4 md:px-8 m-0  ">
                        <div className="h-full flex flex-col gap-4  gap-8  mb-[50px]  ">
                            <FirestoreView />
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}