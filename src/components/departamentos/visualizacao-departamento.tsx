import { Link, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Book, ChevronLeft, Copyright, File, Globe, Hash, Info, Mail, Phone } from "lucide-react";
import { DisciplinasDepartamentoPage } from "./disciplinas-departamento";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/context";
import { DocentesDepartamento } from "./docentes-departamento";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert } from "../ui/alert";
import { GraficoArtigosPorQualis } from "../dashboard/graficos/grafico-qualis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Books, Quotes } from "phosphor-react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HC_wordcloud from 'highcharts/modules/wordcloud';
import { BarChart, Bar, XAxis, LabelList, CartesianGrid } from 'recharts';

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "../../components/ui/chart"
import { Helmet } from "react-helmet";


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

interface Patrimonio {
    dep_id: string
    org_cod: string
    dep_nom: string
    dep_des: string
    dep_email: string
    dep_site: string
    dep_tel: string
    img_data: string
    dep_sigla: string
}

interface PalavrasChaves {
    term: string;
    among: number;
}


interface Total {
    article: string
    book: string
    book_chapter: string
    brand: string
    patent: string
    researcher: string
    software: string
    work_in_event: string
}

type Research = {
    count_article: number
    count_book: number
    count_book_chapter: number,
    count_guidance: number
    count_patent: number
    count_report: number
    count_software: number
    count_guidance_complete: number
    count_guidance_in_progress: number
    count_patent_granted: number
    count_patent_not_granted: number
    count_brand: number
    year: number
    A1: number
    A2: number
    A3: number
    A4: number
    B1: number
    B2: number
    B3: number
    B4: number
    C: number
    SQ: number
}

HC_wordcloud(Highcharts);






const chartConfig = {
    views: {
        label: "Page Views",
    },
    producao_bibliografica: {
        label: "Produção bibliográfica",
        color: "hsl(var(--chart-1))",
    },
    producao_tecnica: {
        label: "Produção técnica",
        color: "hsl(var(--chart-2))",
    },
    count_article: {
        label: "Artigos",
        color: "hsl(var(--chart-2))",
    },
    count_book: {
        label: "Livros",
        color: "hsl(var(--chart-2))",
    },
    count_book_chapter: {
        label: "Capítulos de livros",
        color: "hsl(var(--chart-2))",
    },
    count_patent: {
        label: "Patentes",
        color: "hsl(var(--chart-2))",
    },
    count_brand: {
        label: "Marcas",
        color: "hsl(var(--chart-2))",
    },
    count_software: {
        label: "Softwares",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig



export function VisualizacaoDepartamento() {
    const { urlGeral } = useContext(UserContext)

    const history = useNavigate();

    const handleVoltar = () => {
        history(-1);
    }

    const queryUrl = useQuery();
    const type_search = queryUrl.get('dep_id');

    let DepId = type_search || ''

    const { urlGeralAdm } = useContext(UserContext)

    const [departamento, setDepartamento] = useState<Patrimonio[]>([]);
    const urlPatrimonioInsert = `${urlGeralAdm}departamentos?dep_id=${DepId}`;



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
                setDepartamento(data)

            }
        } catch (err) {
            console.log(err);
        }
    };


    useEffect(() => {
        fetchData()

    }, [urlPatrimonioInsert]);


    const [totalProducao, setTotalProducao] = useState<Total[]>([]);


    const urlTotalProgram = `${urlGeral}graduate_program_production?dep_id=${type_search}&year=1900`;

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




    /////////////////////////


    const [dados, setDados] = useState<Research[]>([]);
    const [year, setYear] = useState(new Date().getFullYear() - 4);

    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i > currentYear - 30; i--) {
        years.push(i);
    }


    let urlDados = `${urlGeral}ResearcherData/DadosGerais?year=${year}&dep_id=${type_search}`

    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await fetch(urlDados, {
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
                    setDados(data);

                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlDados]);




    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>('producao_bibliografica')

    const total = useMemo(
        () => ({
            producao_bibliografica: dados.reduce(
                (acc, curr) => acc + curr.count_article + curr.count_book + curr.count_book_chapter,
                0
            ),
            producao_tecnica: dados.reduce((acc, curr) => acc + curr.count_patent + curr.count_software + curr.count_brand, 0),
        }),
        [dados]
    );

    /////////


    const [, setVisibleChart] = useState(0);
    const chartKeys = ['count_article', 'count_patent', 'count_guidance_in_progress'];

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleChart((prev) => (prev + 1) % chartKeys.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [chartKeys.length]);



    //palavars
    const [words, setWords] = useState<PalavrasChaves[]>([]);
    let urlPalavrasChaves = `${urlGeral}lists_word_researcher?graduate_program_id=&dep_id=${type_search}&researcher_id=`

    useEffect(() => {
        const fetchData = async () => {

            try {
                const response = await fetch(urlPalavrasChaves, {
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
                    setWords(data);
                }
            } catch (err) {
                console.log(err);
            } finally {

            }
        };
        fetchData();
    }, []);

    const options = {
        chart: {
            backgroundColor: 'transparent',
            height: '300px',
            display: 'flex',
            position: 'relative'
        },
        credits: {
            enabled: false
        },
        exporting: {
            enabled: false, // Remove a opção de menu para baixar o gráfico
        },
        series: [
            {
                type: 'wordcloud',
                data: words.map((word) => ({
                    name: word.term,
                    weight: word.among,
                })),

                style: {
                    fontFamily: 'Ubuntu, sans-serif',
                },
            },
        ],
        title: {
            text: '',
        },
        plotOptions: {
            wordcloud: {
                borderRadius: 3,
                borderWidth: "1px",
                borderColor: 'blue',
                BackgroundColor: 'red',
                colors: ['#9CBCCE', '#284B5D', '#709CB6'],

            },
        },
    };


    return (
        <main className="flex flex-1 flex-col gap-4 md:gap-8 ">
            <Helmet>
                <title>{departamento[0]?.dep_nom ? `${departamento[0]?.dep_nom} | Conectee` : 'Conectee | Escola de Engenharia UFMG'}</title>
                <meta
                    name="description"
                    content={departamento[0]?.dep_nom ? `${departamento[0]?.dep_nom} | Conectee` : 'Conectee | Escola de Engenharia UFMG'}
                />
                <meta name="robots" content="index, follow" />
            </Helmet>
            <Tabs defaultValue={'all'} className="h-full" >
                <div className="w-full  gap-4 md:p-8 p-4 pb-0 md:pb-0">
                    <div className="flex items-center gap-4">

                        <Button onClick={handleVoltar} variant="outline" size="icon" className="h-7 w-7">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Voltar</span>
                        </Button>

                        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                            Departamento
                        </h1>




                        <div className="hidden items-center gap-2 md:ml-auto md:flex">
                            <TabsList >

                                <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>
                                <TabsTrigger value="doc" className="text-zinc-600 dark:text-zinc-200">Docentes</TabsTrigger>
                                <TabsTrigger value="unread" className="text-zinc-600 dark:text-zinc-200">Indicadores</TabsTrigger>
                                <TabsTrigger value="dis" className="text-zinc-600 dark:text-zinc-200">Disciplinas</TabsTrigger>

                            </TabsList>


                            <Button size="sm">Button</Button>
                        </div>
                    </div>

                </div>


                <TabsContent value="all" className="h-auto flex flex-col gap-4 md:gap-8  ">
                    <div className="md:p-8 p-4 py-0 md:py-0 mt-2">
                        <h1 className=" max-w-[700px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1]  md:block mb-3 ">
                            {departamento.map((props) => (
                                <>{props.dep_sigla} - {props.dep_nom}</>
                            ))}
                        </h1>
                        {departamento.slice(0, 1).map((props) => (
                            <div className="flex flex-wrap gap-4 mb-4 md:mb-8 ">
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Hash size={12} />CÓDIGO: {props.org_cod}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Hash size={12} />{props.dep_sigla}</div>
                            </div>

                        ))}

                        <div className=" py-0 md:py-0">
                            {departamento.slice(0, 1).map((props) => (
                                <div className="mb-4 md:mb-8">
                                    <div
                                        className={`h-3 w-full rounded-t-md dark:border-neutral-800 border border-neutral-200 border-b-0 bg-[#719CB8]  `}
                                    ></div>

                                    <Alert
                                        className="p-0 rounded-t-none" x-chunk="dashboard-05-chunk-4"
                                    >

                                        <CardHeader className="flex flex-row items-start bg-neutral-100 dark:bg-neutral-800">
                                            <div className="flex items-center justify-between w-full">
                                                <CardTitle className="group flex items-center w-fit gap-2 text-lg">
                                                    <div className="w-fit">Informações</div>

                                                </CardTitle>
                                                <div className="flex gap-4 items-center justify-end flex-wrap ">
                                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Mail size={16} /> {props.dep_email}</div>


                                                    <Link to={props.dep_site} target="_blank"><div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Globe size={16} /> {props.dep_site}</div></Link>
                                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Phone size={16} /> {props.dep_tel}</div>

                                                </div>
                                            </div>
                                            <div className="ml-auto flex items-center gap-1">


                                            </div>

                                        </CardHeader>

                                        <CardContent className="p-6 text-sm">
                                            {props.dep_des}
                                        </CardContent>
                                    </Alert>
                                </div>
                            ))}


                            <Alert className="grid gap-3 lg:grid-cols-4 grid-cols-2 mb-4 md:mb-8">
                                <div>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Total de artigos
                                            </CardTitle>


                                        </div>

                                        <File className="h-4 w-4 text-muted-foreground" />

                                    </CardHeader>

                                    <CardContent>
                                        <span className="text-lg font-bold leading-none sm:text-3xl">
                                            {totalProducao.map((props) => (<>{props.article}</>))}
                                        </span>
                                    </CardContent>
                                </div>
                                <div>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Total de livros
                                            </CardTitle>


                                        </div>

                                        <Book className="h-4 w-4 text-muted-foreground" />

                                    </CardHeader>

                                    <CardContent>
                                        <span className="text-lg font-bold leading-none sm:text-3xl">
                                            {totalProducao.map((props) => (<>{props.book}</>))}
                                        </span>
                                    </CardContent>
                                </div>
                                <div>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Total de capítulos
                                            </CardTitle>


                                        </div>

                                        <Books className="h-4 w-4 text-muted-foreground" />

                                    </CardHeader>

                                    <CardContent>
                                        <span className="text-lg font-bold leading-none sm:text-3xl">
                                            {totalProducao.map((props) => (<>{props.book_chapter}</>))}
                                        </span>
                                    </CardContent>
                                </div>

                                <div>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Total de patentes
                                            </CardTitle>

                                        </div>

                                        <Copyright className="h-4 w-4 text-muted-foreground" />

                                    </CardHeader>

                                    <CardContent>
                                        <span className="text-lg font-bold leading-none sm:text-3xl">
                                            {totalProducao.map((props) => (<>{props.patent.toLocaleString()}</>))}
                                        </span>
                                    </CardContent>

                                </div>




                            </Alert>


                            <div className="flex flex-col md:gap-8 gap-4">
                                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                                    <div className="h-full gap-4 grid">
                                        <Alert className="p-0 ">
                                            <CardHeader className="flex p-10 flex-row items-center justify-between space-y-0 md:pb-2">
                                                <div>
                                                    <CardTitle className="text-sm font-medium">
                                                        Total de   docentes
                                                    </CardTitle>
                                                    <CardDescription>no programa</CardDescription>

                                                </div>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Fonte: Escola de Engenharia</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                            </CardHeader>

                                        </Alert>

                                        <Alert className="p-0 ">
                                            <CardHeader className="flex flex-row p-10 items-center justify-between space-y-0 md:pb-2">
                                                <div>
                                                    <CardTitle className="text-sm font-medium">
                                                        Total de técnicos
                                                    </CardTitle>
                                                    <CardDescription>na Escola de Engenharia</CardDescription>
                                                </div>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Fonte: Escola de Engenharia</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                            </CardHeader>

                                        </Alert>
                                    </div>

                                    <Alert className="flex flex-col lg:col-span-2 h-[450px] p-0">
                                        <CardHeader className="flex md:flex-col lg:flex-row p-0 space-y-0 border-b dark:border-b-neutral-800 sm:flex-row">
                                            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                                                <CardHeader className="flex p-0 flex-row items-center justify-between space-y-0 ">
                                                    <div>
                                                        <CardTitle className="text-sm font-medium">
                                                            Produção geral
                                                        </CardTitle>
                                                        <CardDescription>Dados desde o ano {year}</CardDescription>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Select defaultValue={String(year)} value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                                                            <SelectTrigger className="w-[100px]">
                                                                <SelectValue placeholder="" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {years.map((year) => (
                                                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>

                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Essas informações não representam a produção total da Escola desde a sua fundação, é um recorte a partir de {year}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>

                                                </CardHeader>
                                            </div>

                                            <div className="flex">
                                                {["producao_bibliografica", "producao_tecnica"].map((key) => {
                                                    const chart = key as keyof typeof chartConfig
                                                    return (
                                                        <button
                                                            key={chart}
                                                            data-active={activeChart === chart}
                                                            className={`relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 dark:border-l-neutral-800 sm:px-8 sm:py-6 ${activeChart === chart && ('bg-neutral-100 dark:bg-neutral-800')} ${activeChart === 'producao_tecnica' && ('rounded-tr-md')}`}
                                                            onClick={() => setActiveChart(chart)}
                                                        >
                                                            <span className="text-xs text-muted-foreground">
                                                                {chartConfig[chart].label}
                                                            </span>
                                                            <span className="text-lg font-bold leading-none sm:text-3xl">
                                                                {total[key as keyof typeof total].toLocaleString()}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </CardHeader>

                                        <CardContent className="px-2 sm:p-6">
                                            <ChartContainer
                                                config={chartConfig}
                                                className="aspect-auto h-[300px] w-full"
                                            >
                                                <BarChart accessibilityLayer data={dados} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                                    <CartesianGrid vertical={false} horizontal={false} />
                                                    <ChartLegend className="pb-4" content={<ChartLegendContent />} />

                                                    <XAxis
                                                        dataKey="year"
                                                        tickLine={false}
                                                        tickMargin={10}
                                                        axisLine={false}

                                                    />

                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent indicator="dashed" />}
                                                    />

                                                    {activeChart == 'producao_bibliografica' && (
                                                        <>
                                                            <Bar dataKey="count_article" fill="#5F82ED" radius={4} >
                                                                <LabelList
                                                                    position="top"
                                                                    offset={12}
                                                                    className="fill-foreground"
                                                                    fontSize={12}
                                                                />


                                                            </Bar>
                                                            <Bar dataKey="count_book" fill="#792F4C" radius={4} >
                                                                <LabelList
                                                                    position="top"
                                                                    offset={12}
                                                                    className="fill-foreground"
                                                                    fontSize={12}
                                                                />
                                                            </Bar>
                                                            <Bar dataKey="count_book_chapter" fill="#DBAFD0" radius={4} >
                                                                <LabelList
                                                                    position="top"
                                                                    offset={12}
                                                                    className="fill-foreground"
                                                                    fontSize={12}
                                                                />
                                                            </Bar></>
                                                    )}

                                                    {activeChart == 'producao_tecnica' && (
                                                        <>
                                                            <Bar dataKey="count_patent" fill="#66B4D0" radius={4} >
                                                                <LabelList
                                                                    position="top"
                                                                    offset={12}
                                                                    className="fill-foreground"
                                                                    fontSize={12}
                                                                />
                                                            </Bar>
                                                            <Bar dataKey="count_brand" fill="#1B1464" radius={4} >
                                                                <LabelList
                                                                    position="top"
                                                                    offset={12}
                                                                    className="fill-foreground"
                                                                    fontSize={12}
                                                                />
                                                            </Bar>
                                                            <Bar dataKey="count_software" fill="#096670" radius={4} >
                                                                <LabelList
                                                                    position="top"
                                                                    offset={12}
                                                                    className="fill-foreground"
                                                                    fontSize={12}
                                                                />
                                                            </Bar></>
                                                    )}

                                                </BarChart>
                                            </ChartContainer>
                                        </CardContent>
                                    </Alert>
                                </div>

                                <div className="flex flex-wrap md:grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">

                                    <Alert className="lg:col-span-2">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <div>
                                                <CardTitle className="text-sm font-medium">
                                                    Artigos qualificados
                                                </CardTitle>
                                                <CardDescription>Avaliação Qualis Sucupira </CardDescription>
                                            </div>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Fonte: Plataforma Lattes e Sucupira Qualis</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                        </CardHeader>

                                        <CardContent className="flex py-0 flex-1  items-center justify-center">
                                            <GraficoArtigosPorQualis dados={dados} />
                                        </CardContent>


                                    </Alert>

                                    <Alert className=" h-full ">
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <div>
                                                <CardTitle className="text-sm font-medium">
                                                    Nuvem de palavras
                                                </CardTitle>
                                                <CardDescription>Termos mais presentes nos artigos</CardDescription>
                                            </div>

                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Fonte: Plataforma Lattes</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>

                                        </CardHeader>
                                        <div id="nuveeeem" className="flex w-full justify-center items-center">
                                            <HighchartsReact highcharts={Highcharts} options={options} className={'h-full'} />
                                        </div>
                                    </Alert>
                                </div>
                            </div>

                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="doc" className="h-auto flex flex-col gap-4 md:gap-8  ">
                    <DocentesDepartamento />
                </TabsContent>

                <TabsContent value="dis" className="h-auto flex flex-col gap-4 md:gap-8  ">
                    <DisciplinasDepartamentoPage dep_id={DepId} />
                </TabsContent>
            </Tabs>
        </main>
    )
}