import { Alert } from "../ui/alert"
import bg_popup from '../../assets/bg_popup.png';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useContext, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ChevronLeft, Copy, Maximize2, Plus, Trash, User } from "lucide-react";
import { toast } from "sonner"
import { v4 as uuidv4 } from 'uuid'; // Import the uuid library
import { UserContext } from "../../context/context";
import { FileXls, MagnifyingGlass, Rows, SquaresFour, UserList } from "phosphor-react";
import { PesquisadorProps, columns } from "./columns";
import { useModal } from "../hooks/use-modal-store";
import { useModalDashboard } from "../hooks/use-modal-dashboard";
import { useNavigate } from "react-router-dom";
import { DataTable } from "./data-table";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Helmet } from "react-helmet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { EditResearcherModal } from "../modals/edit-researcher-modal";
import { HeaderInstitution } from "./components/header-institutuion";


export function AddResearcherDashboard() {
    const [nomePesquisador, setNomePesquisador] = useState('');
    const [lattesID, setLattesID] = useState('');
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);

    const [count, setCount] = useState(24)

    const [typeVisu, setTypeVisu] = useState('block');

    const { user, urlGeralAdm, permission } = useContext(UserContext);


    const has_editar_pesquisadores = permission.some(
        (perm) => perm.permission === 'editar_pesquisadores'
    );

    const has_importar_bolsistas_cnpq = permission.some(
        (perm) => perm.permission === 'importar_bolsistas_cnpq'
    );


    const { isOpen, type } = useModalDashboard();

    const isModalOpen = isOpen && type === 'researcher';
    const [researcher, setResearcher] = useState<PesquisadorProps[]>([]);
    const [status, setStatus] = useState('ativo')

    const handleSubmitPesquisador = async () => {

        const docId = uuidv4();

        try {
            const data = [
                {
                    researcher_id: docId,
                    name: nomePesquisador,
                    lattes_id: lattesID,
                    cpf: cpf,
                    institution_id: user?.institution_id,
                    status: (status == 'ativo' ? (true) : (false))
                }
            ]

            console.log(data)

            let urlProgram = urlGeralAdm + '/ResearcherRest/Insert'

            const fetchData = async () => {

                if (nomePesquisador.length != 0 && lattesID.length > 13) {
                    try {
                        const response = await fetch(urlProgram, {
                            mode: 'cors',
                            method: 'POST',
                            headers: {
                                'Access-Control-Allow-Origin': '*',
                                'Access-Control-Allow-Methods': 'POST',
                                'Access-Control-Allow-Headers': 'Content-Type',
                                'Access-Control-Max-Age': '3600',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(data),
                        });

                        if (response.ok) {
                            setLattesID('')

                            setNomePesquisador('')
                            fetchDataTable()
                            toast("Dados enviados com sucesso", {
                                description: "Pesquisador cadastrado na instituição",
                                action: {
                                    label: "Fechar",
                                    onClick: () => { },
                                },
                            })
                        } else {
                            if (response.status === 400) {
                                toast("Pesquisador já existe", {
                                    description: "Tente novamente",
                                    action: {
                                        label: "Fechar",
                                        onClick: () => { },
                                    },
                                });
                            } else {
                                toast("Erro ao enviar os dados ao servidor", {
                                    description: "Tente novamente",
                                    action: {
                                        label: "Fechar",
                                        onClick: () => { },
                                    },
                                });
                            }
                        }

                    } catch (err) {
                        console.log(err);
                    }
                } else {
                    if (nomePesquisador.length == 0 || (lattesID.length == 0 && cpf.length == 0)) {
                        toast("Parece que os campos estão vazios", {
                            description: "Preencha os campos nome do pesquisador e Lattes Id ou CPF",
                            action: {
                                label: "Fechar",
                                onClick: () => { },
                            },
                        })
                    } else if (lattesID.length < 14) {
                        toast("Parece que o Lattes Id está incorreto ou não preenchido", {
                            description: "O Lattes ID teve conter 13 números",
                            action: {
                                label: "Fechar",
                                onClick: () => { },
                            },
                        })
                    } else if (nomePesquisador.length == 0) {
                        toast("Preencha o nome do pesquisador", {
                            description: "Parece que o campo está vazio",
                            action: {
                                label: "Fechar",
                                onClick: () => { },
                            },
                        })
                    }
                }
            };
            fetchData();


        } catch (error) {
            console.error('Erro ao processar a requisição:', error);
        }
    };


    // upload

    const urlGetResearcher = urlGeralAdm + `ResearcherRest/Query?institution_id=${user?.institution_id}`;
    console.log(urlGetResearcher)

    const fetchDataTable = async () => {
        setLoading(true)
        try {
            const response = await fetch(urlGetResearcher, {
                mode: 'cors',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '3600',
                    'Content-Type': 'text/plain',
                },
            });
            const data = await response.json();
            if (data) {
                setResearcher(data);
                setLoading(false)
                console.log('dataaaaaa', data)

            }
        } catch (err) {
            console.log(err);
            setLoading(false)
        }
    };



    const { onOpen, isOpen: isOpenModal, type: typeModal } = useModal()

    const [carregado, setcarregado] = useState(true)
    useEffect(() => {
        if (carregado) {
            fetchDataTable();
        }
        setcarregado(false)

    }, [carregado]);

    useEffect(() => {
        if (typeModal === 'confirm-delete-researcher' && !isOpenModal) {
            fetchDataTable();
        }


    }, [isOpenModal, type]);

    const history = useNavigate();

    const handleVoltar = () => {
        history(-1);
    }

    const [onOpenAdd, setIsOpenAdd] = useState(false)
    const { version, urlGeral } = useContext(UserContext)


    const items = Array.from({ length: 12 }, (_, index) => (
        <Skeleton key={index} className="w-full rounded-md h-[200px]" />
    ));

    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, "") // Remove tudo que não for número
            .slice(0, 11) // Garante que tenha no máximo 11 dígitos
            .replace(/(\d{3})(\d)/, "$1.$2") // Coloca o primeiro ponto
            .replace(/(\d{3})(\d)/, "$1.$2") // Coloca o segundo ponto
            .replace(/(\d{3})(\d{1,2})$/, "$1-$2"); // Coloca o traço
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCPF(e.target.value));
    };


    const [search, setSearch] = useState('')
    const filteredTotal = Array.isArray(researcher) ? researcher.filter(item => {
        const normalizeString = (str) => str
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase();

        const searchString = normalizeString(item.name);
        const normalizedSearch = normalizeString(search);

        return (
            searchString.includes(normalizedSearch)

        );
    }) : [];
    /////


    return (
        <>

            <Helmet>
                <title>Pesquisadores | Módulo administrativo | {version ? ('Conectee') : ('Simcc')} </title>
                <meta name="description" content={`Pesquisadores | Módulo administrativo | ${version ? ('Conectee') : ('Simcc')}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>
            {isModalOpen && (
                <main className="flex flex-1 flex-col p-4 md:p-8">

                    <div className="w-full mb-4  gap-4">
                        <div className="flex items-center gap-4 mb-4">

                            <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Voltar</span>
                            </Button>

                            <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                                Pesquisadores
                            </h1>




                            <div className="hidden items-center h-10 gap-2 md:ml-auto md:flex">


                                {version && (
                                    <Button size={'sm'}
                                        onClick={() => onOpen('import-docentes')}><FileXls size={16} />Importar dados dos docentes</Button>
                                )}
                            </div>
                        </div>

                    </div>

                    <HeaderInstitution />

                    <div className="gap-4 md:gap-8 flex flex-col ">
                        <Alert className="h-14  p-2 flex items-center justify-between  w-full">
                            <div className="flex items-center gap-2 w-full flex-1">
                                <MagnifyingGlass size={16} className=" whitespace-nowrap w-10" />
                                <Input onChange={(e) => setSearch(e.target.value)} value={search} type="text" className="border-0 w-full " />

                            </div>


                        </Alert>


                        {has_editar_pesquisadores ? (
                            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                                <Alert className="p-0 bg-cover bg-no-repeat bg-center lg:col-span-3" style={{ backgroundImage: `url(${bg_popup})` }}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total de pesquisadores
                                        </CardTitle>
                                        <User className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{filteredTotal.length}</div>
                                        <p className="text-xs text-muted-foreground">
                                            registrados
                                        </p>
                                    </CardContent>
                                </Alert>

                                <Alert onClick={() => setIsOpenAdd(!onOpenAdd)} className="p-0 hover:bg-eng-dark-blue bg-eng-blue dark:hover:bg-eng-dark-blue dark:bg-eng-blue text-white transition-all cursor-pointer "  >
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">

                                        </CardTitle>
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>

                                    <CardContent>
                                        <h2 className="font-medium text-xl">Adicionar <br /> pesquisador(a)</h2>
                                    </CardContent>
                                </Alert>
                            </div>
                        ) : (
                            <Alert className="p-0 bg-cover bg-no-repeat bg-center lg:col-span-3" style={{ backgroundImage: `url(${bg_popup})` }}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Total de pesquisadores
                                    </CardTitle>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{filteredTotal.length}</div>
                                    <p className="text-xs text-muted-foreground">
                                        registrados
                                    </p>
                                </CardContent>
                            </Alert>
                        )}



                        {onOpenAdd && (
                            <fieldset className="grid gap-6 rounded-lg  p-4 bg-white dark:border-neutral-800 border border-neutral-200 dark:bg-neutral-950 bg-cover  bg-center bg-no-repeat "  >
                                <legend className="-ml-1 px-1 text-sm font-medium">
                                    Adicionar pesquisador à instituição
                                </legend>

                                <div className="flex gap-3 items-end">
                                    <div className="flex flex-col space-y-1.5 w-full flex-1">
                                        <Label htmlFor="name">Nome completo</Label>
                                        <Input value={nomePesquisador} onChange={(e) => setNomePesquisador(e.target.value)} type="text" />
                                    </div>

                                    <div className="flex flex-col space-y-1.5 w-full flex-1">
                                        <Label htmlFor="name">Lattes Id</Label>
                                        <Input value={lattesID} onChange={(e) => setLattesID(e.target.value)} type="text" />
                                    </div>

                                    <div className="flex flex-col space-y-1.5 w-full flex-1">
                                        <Label htmlFor="name">CPF</Label>
                                        <Input value={cpf} onChange={handleCpfChange} type="text" />
                                    </div>

                                    <div className="flex flex-col max-w-[250px] space-y-1.5 w-full flex-1">
                                        <Label htmlFor="name">Situação</Label>
                                        <Select value={status} onValueChange={setStatus}>
                                            <SelectTrigger className="">
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ativo">Ativo</SelectItem>
                                                <SelectItem value="inativo">Inativo</SelectItem>

                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <Button onClick={() => handleSubmitPesquisador()} className="text-white dark:text-white"><Plus size={16} className="" /> Adicionar</Button>
                                    <Button size={'icon'} onClick={() => onOpen('add-researcher-csv')} className="text-white dark:text-white"><FileXls size={16} className="" /></Button>

                                </div>
                            </fieldset>
                        )}

                        <div>
                            <Accordion defaultValue="item-1" type="single" collapsible>
                                <AccordionItem value="item-1">
                                    <div className="flex mb-2">
                                        <HeaderResultTypeHome title="Todos os pesquisadores" icon={<UserList size={24} className="text-gray-400" />}>
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
                                                        350: 1,
                                                        750: 1,
                                                        900: 2,
                                                        1200: 3,
                                                        1500: 4,
                                                        1700: 4
                                                    }}
                                                >
                                                    <Masonry gutter="16px">
                                                        {items.map((item, index) => (
                                                            <div key={index}>{item}</div>
                                                        ))}
                                                    </Masonry>
                                                </ResponsiveMasonry>
                                            ) : (
                                                <div>
                                                    <ResponsiveMasonry
                                                        columnsCountBreakPoints={{
                                                            350: 1,
                                                            750: 1,
                                                            900: 2,
                                                            1200: 3,
                                                            1500: 4,
                                                            1700: 4
                                                        }}
                                                    >

                                                        <Masonry gutter="16px">
                                                            {filteredTotal.slice(0, count).map((item: any) => {

                                                                return (
                                                                    <Alert>
                                                                        <div className="flex justify-between items-start gap-3">
                                                                            <div className="flex gap-3">
                                                                                <Avatar className="cursor-pointer rounded-md  h-10 w-10">
                                                                                    <AvatarImage className={'rounded-md h-10 w-10'} src={`${urlGeral}ResearcherData/Image?name=${item.name}`} />
                                                                                    <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                                                                                </Avatar>

                                                                                <div>
                                                                                    <h1>{item.name}</h1>
                                                                                    <p className="text-gray-500 text-xs">{item.lattes_id}</p>
                                                                                </div>
                                                                            </div>

                                                                            <div className="flex gap-2 items-center" >
                                                                                <div className={` rounded-md h-4 w-4 ${item.status ? ('bg-green-500') : ('bg-red-500')}`}></div>
                                                                                <div className="flex-1 flex">{item.status ? ('Ativo') : ('Inativo')}</div></div>
                                                                        </div>

                                                                        <Separator className="my-4" />

                                                                        <div className="items-center flex justify-between gap-3">
                                                                            <div className="text-gray-500 text-xs">{item.create_at}</div>

                                                                            <div className="flex gap-3 justify-end w-full ">
                                                                                <Button onClick={() => onOpen('confirm-delete-researcher', { id_delete: item.researcher_id, name: item.name })} variant={'destructive'} className="h-8 w-8 p-0 text-white  dark:text-white">

                                                                                    <Trash size={8} className="h-4 w-4" />
                                                                                </Button>

                                                                                <EditResearcherModal
                                                                                    researcher_id={item.researcher_id}
                                                                                    name={item.name}
                                                                                    lattes_id={item.lattes_id}
                                                                                    institution_id={item.institution_id}
                                                                                    status={item.status}
                                                                                />


                                                                                <Button onClick={() => onOpen('researcher-modal', { name: item.name })} variant={'outline'} className="h-8 w-8 p-0 ">
                                                                                    <Maximize2 size={8} className="h-4 w-4" />
                                                                                </Button>

                                                                                <Button onClick={() => {
                                                                                    navigator.clipboard.writeText(item.lattes_id)

                                                                                    toast("Operação realizada", {
                                                                                        description: "ID Lattes copiado para área de transferência",
                                                                                        action: {
                                                                                            label: "Fechar",
                                                                                            onClick: () => { },
                                                                                        },
                                                                                    })

                                                                                }} variant={'outline'} className="h-8 w-8 p-0 ">
                                                                                    <Copy size={16} />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    </Alert>
                                                                )
                                                            })}
                                                        </Masonry>
                                                    </ResponsiveMasonry>

                                                    {filteredTotal.length > count && (
                                                        <div className="w-full flex justify-center mt-8"><Button onClick={() => setCount(count + 24)}><Plus size={16} />Mostrar mais</Button></div>
                                                    )}
                                                </div>
                                            )
                                        ) : (
                                            loading ? (
                                                <Skeleton className="w-full rounded-md h-[400px]" />
                                            ) : (
                                                <DataTable columns={columns} data={filteredTotal} />
                                            )
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>

                    </div>


                </main>
            )}
        </>
    )
}