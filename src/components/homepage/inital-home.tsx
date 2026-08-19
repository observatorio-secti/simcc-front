import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/context";


import {
    Book,
    Books,
    Copyright,
} from "phosphor-react";
import { ArrowRight, BarChartBig, Blocks, Building2, Download, File, GraduationCap, Info, InfoIcon, Link2, List } from "lucide-react";
import { Alert } from "../ui/alert";
import { useModalHomepage } from "../hooks/use-modal-homepage";


interface VisaoPrograma {
    article: number;
    book: number;
    book_chapter: number;
    brand: number;
    patent: number;
    researcher: number;
    software: number;
    work_in_event: number;
}

interface Rt {
    teachers: CoutRt[]
    technician: CoutRt[]
}

interface CoutRt {
    count: number
    rt: string
}

interface GrupoPesquisa {
    nome_grupo: string
    nome_lider: string
    institution_id: string
    area: string
    ultimo_envio: string
    situacao: string
}

import { Link, useNavigate } from "react-router-dom";

import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, PieChart, Pie, LabelList, Cell, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Label as LabelChart } from 'recharts';

import { CarrosselInstitution, TotalInstitutions } from "./components/carrossel-institution";

type Count = {
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
}

interface PalavrasChaves {
    term: string;
    among: number;
}

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "../../components/ui/chart"

import {
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../../components/ui/card"

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HC_wordcloud from 'highcharts/modules/wordcloud';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../../components/ui/tooltip"

import { useTheme } from "next-themes";
import { ArtigosRecentes } from "./components/artigos-recentes";
import { Newsletter } from "./components/newsletter";
import { Instrucoes } from "./components/instrucoes";
import { Search } from "../search/search";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { GraficoRtTeachers } from "./components/grafico-teachers";
import { FooterHome } from "../footer/footer-home";
import { GraficoRtTechnician } from "./components/grafico-technician";
import { useModalResult } from "../hooks/use-modal-result";
import { useModal } from "../hooks/use-modal-store";

import { BannerHome } from "./components/banner";
import { Helmet } from "react-helmet";
import { InfiniteMovingResearchers } from "../ui/infinite-moving-researcher";
import { Research } from "./categorias/researchers-home";
import { GraficoTitulacaoHome } from "./components/grafico-titulacao";

interface Bolsistas {
    aid_quantity: string
    call_title: string
    funding_program_name: string
    modality_code: string
    category_level_code: string
    institute_name: string
    modality_name: string
    name: string
    researcher_id: string
    scholarship_quantity: string
}


interface ScholarshipMetrics {
    modality_code: string;
    category_level_code: string;
    count: number;
}

HC_wordcloud(Highcharts);

const chartConfig5 = {

    'Produtividade em Pesquisa': {
        label: "Produtividade em Pesquisa",
        color: "#809BB5",
    },
    'Desen. Tec. e Extensão Inovadora': {
        label: "Desen. Tec. e Extensão Inovadora",
        color: "#A6BCCD",
    },
    'Outros docentes': {
        label: "Outros docentes",
        color: "#354A5C",
    },
} satisfies ChartConfig


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


export function InitialHome() {
    const [metrics, setMetrics] = useState<ScholarshipMetrics[]>([]);
    const [VisaoPrograma, setVisaoPrograma] = useState<VisaoPrograma[]>([]);
    const { setItensSelecionados, urlGeral, version } = useContext(UserContext);

    const [year, setYear] = useState(new Date().getFullYear() - 4);

    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i > currentYear - 30; i--) {
        years.push(i);
    }


    const urlRt = `${urlGeral}departament/rt`
    const [rt, setRt] = useState<Rt | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            try {

                const response = await fetch(urlRt, {
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
                    setRt(data)

                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData()


    }, [urlRt]);

    const sumTechnicianCounts = (technician: CoutRt[]): number => {
        return technician.reduce((total, item) => total + item.count, 0);
    };

    const [totalTechnicianCounts, setTotalTechnicianCounts] = useState(0)

    useEffect(() => {
        if (rt) {
            setTotalTechnicianCounts(sumTechnicianCounts(rt.technician))

        }
    }, [rt]);

    const { theme } = useTheme()

    const urlVisaoPrograma = `${urlGeral}graduate_program_production?graduate_program_id=0&year=1900`;

    useMemo(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(urlVisaoPrograma, {
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
                    setVisaoPrograma(data);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlVisaoPrograma]);

    const [dados, setDados] = useState<Count[]>([]);

    let urlDados = `${urlGeral}ResearcherData/DadosGerais?year=${year}`

    useEffect(() => {
        const fetchMetrics = async () => {
            const response = await fetch(`${urlGeral}metrics/researcher/scholarship`);
            const data = await response.json();
            setMetrics(data);
        };
        fetchMetrics();

        const fetchData = async () => {
            const response = await fetch(urlDados);
            const data = await response.json();
            setDados(data);
        };
        fetchData();

    }, [urlDados]);

    const { isOpen, type } = useModalHomepage();

    const [words, setWords] = useState<PalavrasChaves[]>([]);
    let urlPalavrasChaves = `${urlGeral}lists_word_researcher?graduate_program_id=&researcher_id=`

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
                    fontFamily: 'Lexend, sans-serif',
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

    const [visibleChart, setVisibleChart] = useState(0);
    const chartKeys = ['count_article', 'count_patent', 'count_guidance_in_progress'];

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleChart((prev) => (prev + 1) % chartKeys.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [chartKeys.length]);


    const navigate = useNavigate();

    function handlePesquisaChange(term: string) {
        setItensSelecionados([{ term }]);

        navigate(`/resultados?type_search=article&terms=${term}`)

    }

    const [bolsistas, setBolsistas] = useState<Bolsistas[]>([]);

    const urlBolsistas = urlGeral + `foment`

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(urlBolsistas, {
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
                    setBolsistas(data)
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData()

    }, [urlBolsistas]);

    const totalCountR = Number(VisaoPrograma[0]?.researcher || 0);


    const pqCount = metrics
        .filter(item => item.modality_code === 'PQ')
        .reduce((acc, curr) => acc + curr.count, 0);

    const dtCount = metrics
        .filter(item => item.modality_code === 'DT')
        .reduce((acc, curr) => acc + curr.count, 0);

    const totalBolsistas = metrics.reduce((acc, curr) => acc + curr.count, 0);

    const chartData = [
        { name: 'Produtividade em Pesquisa', value: pqCount },
        { name: 'Desen. Tec. e Extensão Inovadora', value: dtCount },
        { name: 'Outros docentes', value: totalCountR - pqCount - dtCount },
    ];

    const { onOpen: onOpenResult } = useModalResult();

    const { onOpen } = useModal()

    const accessLinks = [
        { to: '/indicadores', icon: <BarChartBig size={16} />, label: 'Indicadores' },
        { to: '/pos-graduacao', icon: < GraduationCap size={16} />, label: 'Pós-graduação' },
        { to: '/dicionario', icon: <List size={16} />, label: 'Dicionário' },
        { to: '/grupos-pesquisa', icon: <Blocks size={16} />, label: 'Grupos de pesquisa' },
        { to: '/listagens', icon: <Download size={16} />, label: 'Listagens' },

    ];


    ///
    const [researcher, setResearcher] = useState<Research[]>([]);
    let urlTermPesquisadores = `${urlGeral}outstanding_researchers`
    console.log(urlTermPesquisadores)
    const [isLoad, setLoad] = useState(false)
    useMemo(() => {
        const fetchData = async () => {
            try {
                setLoad(true)
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
                    setLoad(false)
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlTermPesquisadores]);

    const randomResearchers = useMemo(() => {
        return researcher.sort(() => Math.random() - 0.5).slice(0, 40);
    }, [researcher]);

    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" });

    const nomesAleatorios = Array.from({ length: 20 }, (_, i) => ({
        name: `Pesquisador ${i + 1}`,
    }));

    return (
        <div className=" items-center  flex flex-col   ">
            <Helmet>
                <title>{`Página Inicial | ${version ? 'Conectee' : 'Simcc'}`}</title>
                <meta name="description" content={`Página Inicial | ${version ? 'Conectee' : 'Simcc'}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>
            <div className="bg-cover  bg-no-repeat bg-center w-full" >
                <div className="h-[0vh] z-[-1] opacity-30">
                    <ChartContainer config={chartConfig} className="h-[75vh] w-full">
                        <LineChart data={dados}>
                            <defs>
                                <linearGradient id="colorArticle" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82AAC0" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#82AAC0" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPatent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82AAC0" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#82AAC0" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorGuidance" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#82AAC0" stopOpacity={0.6} />
                                    <stop offset="95%" stopColor="#82AAC0" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            {chartKeys.map((key, index) => {
                                const isVisible = visibleChart === index;
                                const strokeColor = theme === 'dark' ? '#404040' : '#A3A3A3';

                                const strokeOpacity = (chartKeys.length - index) / chartKeys.length;

                                return !isVisible && (
                                    <Line
                                        key={key}
                                        dataKey={key}
                                        type="monotone"
                                        stroke={strokeColor}
                                        strokeWidth={6}
                                        strokeOpacity={strokeOpacity}
                                        dot={false}
                                        isAnimationActive={false}
                                    />
                                );
                            })}
                        </LineChart>
                    </ChartContainer>

                    <ChartContainer config={chartConfig} className="h-[75vh] w-full top-[-75vh] relative">
                        {chartKeys.map((key, index) => {
                            if (visibleChart !== index) return null;

                            const fillColor = `url(#color${key.split('_')[1][0].toUpperCase() + key.split('_')[1].slice(1)})`;
                            return (
                                <AreaChart key={key} data={dados} className="absolute top-0">
                                    <Area
                                        dataKey={key}
                                        type="monotone"
                                        stroke={'#559FB8'}
                                        fill={fillColor}
                                        strokeWidth={6}
                                        dot={false}
                                    />
                                </AreaChart>
                            );
                        }).find((chart) => chart !== null) || <div />}
                    </ChartContainer>
                </div>

                <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-4 md:py-6 md:pb-4 lg:py-12 lg:pb-8" >

                    <Link to={'/informacoes'} className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12} /><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como utilizar a plataforma<ArrowRight size={12} /></Link>

                    <h1 className="z-[2] text-center max-w-[980px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
                        Descubra talentos científicos e{" "}
                        <strong className="bg-eng-blue  rounded-md px-3 pb-2 text-white font-medium">
                            {" "}
                            competências
                        </strong>{" "}
                        na Bahia.
                    </h1>
                    <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

                    <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
                        <Search />
                    </div>

                    <div className="hidden md:flex flex-wrap gap-3 z-[2] w-full lg:w-[60vw]">

                        {words.slice(0, 10).map((word, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
                                onClick={() => {
                                    handlePesquisaChange(word.term)
                                    onOpenResult('researchers-home')
                                }}
                            >
                                {word.term}
                            </div>
                        ))}
                    </div>

                    <div className="flex md:hiddeen justify-center md:hidden flex-wrap gap-3 z-[3] w-full lg:hidden">
                        {words.slice(0, 5).map((word, index) => (
                            <div
                                key={index}
                                className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
                                onClick={() => {
                                    handlePesquisaChange(word.term)
                                    onOpenResult('researchers-home')
                                }}
                            >
                                {word.term}
                            </div>
                        ))}
                    </div>
                </div>


            </div>

            <div className=" w-full md:px-8 gap-8 flex flex-col px-4">

                {/* <Alert className="grid lg:grid-cols-4 gap-4">
                    {version ? (
                        <div>
                            <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                                        Total de departamentos
                                    </CardTitle>
                                </div>
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <span className="font-bold leading-none text-3xl">
                                    0
                                </span>
                            </CardContent>
                        </div>
                    ) : (
                        <Link to="/instituicao">
                            <div className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors rounded-md p-2 -m-2">
                                <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                                            Total de instituições
                                        </CardTitle>
                                    </div>
                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <span className="font-bold leading-none text-3xl">
                                        {TotalInstitutions}
                                    </span>
                                </CardContent>
                            </div>
                        </Link>
                    )}
                    <div className="lg:col-span-3 md:col-span-1 flex ">
                        {version ? (
                            <div>Carrossel de Departamentos</div>
                        ) : (
                            <CarrosselInstitution />
                        )}
                    </div>
                </Alert> */}

                {/* <Alert className="flex flex-col md:grid gap-3 lg:grid-cols-4 grid-cols-2">
                    <Link onClick={() => onOpenResult('articles-home')} to={'/resultados?type_search=article&terms=&researcher=false'}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                                    Total de artigos
                                </CardTitle>
                            </div>

                            <File className="h-4 w-4 text-muted-foreground" />

                        </CardHeader>

                        <CardContent>
                            <span className="font-bold leading-none text-3xl">
                                {VisaoPrograma.length != 0 ? VisaoPrograma.map((props) => (<>{props.article.toLocaleString()}</>)) : 0}
                            </span>
                        </CardContent>
                    </Link>

                    <Link onClick={() => onOpenResult('book-home')} to={'/resultados?type_search=book&terms=&researcher=false'}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                                    Total de livros
                                </CardTitle>
                            </div>
                            <Book className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>

                        <CardContent>
                            <span className="font-bold leading-none text-3xl">
                                {VisaoPrograma.length != 0 ? VisaoPrograma.map((props) => (<>{props.book.toLocaleString()}</>)) : 0}
                            </span>
                        </CardContent>
                    </Link>

                    <Link onClick={() => onOpenResult('book-home')} to={'/resultados?type_search=book&terms=&researcher=false'}>
                        <CardHeader className="flex flex-row pb-2 items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-[0.9rem]  md:text-sm font-medium">
                                    Total de capítulos
                                </CardTitle>
                            </div>

                            <Books className="h-4 w-4 text-muted-foreground" />

                        </CardHeader>

                        <CardContent>
                            <span className="font-bold leading-none text-3xl">
                                {VisaoPrograma.length != 0 ? VisaoPrograma.map((props) => (<>{props.book_chapter.toLocaleString()}</>)) : 0}
                            </span>
                        </CardContent>
                    </Link>

                    <Link onClick={() => onOpenResult('patent-home')} to={'/resultados?type_search=patent&terms=&researcher=false'}>
                        <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
                            <div>
                                <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                                    Total de patentes
                                </CardTitle>

                            </div>

                            <Copyright className="h-4 w-4 text-muted-foreground" />

                        </CardHeader>

                        <CardContent>
                            <span className="font-bold leading-none text-3xl">
                                {VisaoPrograma.length != 0 ? VisaoPrograma.map((props) => (<>{props.patent}</>)) : 0}
                            </span>
                        </CardContent>

                    </Link>

                </Alert> */}

                <div
                    className="
            grid gap-8

            md:flex md:flex-wrap
            
            lg:grid lg:grid-cols-3
          "
                >
                    {version ? (
                        <div
                            className="
                h-full gap-8 flex flex-col

                md:w-full md:justify-between

                lg:flex-col
              "
                        >
                            <Link
                                className="
                  w-full

                  md:flex

                  lg:h-1/2
                "
                                to={'/listagens'}
                            >
                                <Alert
                                    className="
                    p-0

                    md:w-full

                    lg:h-full
                  "
                                >
                                    <CardHeader
                                        className="
                      flex p-10 flex-row items-center justify-between space-y-0

                      md:h-28
                    "
                                    >
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Total de  {VisaoPrograma.map((props) => (<>{props.researcher}</>))} pesquisadores ativos
                                            </CardTitle>
                                            <CardDescription>{version ? ('na Escola de Engenharia') : ('no SECTI-BA')}</CardDescription>

                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Fonte: {version ? ('Escola de Engenharia') : ('SECTI-BA')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </CardHeader>

                                    <div className="flex flex-1 px-6">
                                        <GraficoRtTeachers rtData={rt} />
                                    </div>

                                </Alert>
                            </Link>

                            <Link
                                className="
                  w-full

                  sm:w-full

                  md:w-full

                  lg:h-1/2
                "
                                to={'/listagens'}
                            >
                                <Alert
                                    className="
                    p-0
                    
                    md:w-full

                    lg:h-full
                  "
                                >
                                    <CardHeader
                                        className="
                      flex flex-row p-10 items-center justify-between space-y-0

                      md:h-28
                    "
                                    >
                                        <div>
                                            <CardTitle className="text-sm font-medium">
                                                Total de {totalTechnicianCounts} técnicos ativos
                                            </CardTitle>
                                            <CardDescription>{version ? ('na Escola de Engenharia') : ('no SECTI-BA')}</CardDescription>
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Fonte: {version ? ('Escola de Engenharia') : ('SECTI-BA')}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                    </CardHeader>

                                    <div className="flex flex-1 px-6">
                                        <GraficoRtTechnician rtData={rt} />
                                    </div>

                                </Alert></Link>
                        </div>
                    ) : (
                        <Link
                            className="
                  w-full

                  md:flex

                
                "
                            to={'/listagens'}
                        >
                            <Alert
                                className="
                    p-0

                    md:w-full

                    lg:h-full
                  "
                            >
                                <CardHeader
                                    className="
                      flex p-10 flex-row items-center justify-between space-y-0

                      md:h-28
                    "
                                >
                                    <div>
                                        <CardTitle className="text-sm font-medium">
                                            Total de {VisaoPrograma[0]?.researcher ?? 0} pesquisadores ativos
                                        </CardTitle>
                                        <CardDescription>na plataforma</CardDescription>

                                    </div>

                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                            <TooltipContent>
                                                <p>Fonte: {version ? ('Escola de Engenharia') : ('SECTI-BA')}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                </CardHeader>

                                <div className="flex flex-1 p-6 pt-0">
                                    <GraficoTitulacaoHome />
                                </div>

                            </Alert>
                        </Link>
                    )}

                    <Alert className="lg:col-span-2 h-full p-0">
                        <CardHeader className="flex p-0 flex-col md:flex-wrap lg:flex-nowrap items-stretch space-y-0 border-b dark:border-b-neutral-800 sm:flex-row">
                            <div className="w-full flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                                <CardHeader className="flex p-0 flex-row flex-wrap gap-4 items-center justify-between space-y-0 ">
                                    <div className="min-w-fit">
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

                            <div className="flex w-full border-t dark:border-t-neutral-800 lg:border-none">
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
                                className="aspect-auto h-[330px] w-full"
                            >
                                <BarChart accessibilityLayer data={dados} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                    <CartesianGrid vertical={false} horizontal={false} />
                                    <ChartLegend content={<ChartLegendContent />} />

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

                <div
                    className="
            flex flex-wrap gap-8 mt-7
            
            md:grid-cols-2 md:mt-auto

            lg:grid lg:grid-cols-3
          "
                >

                    <Alert className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">
                                    Nuvem de palavras
                                </CardTitle>
                                <CardDescription>Termos mais presentes nos artigos </CardDescription>
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

                    <Alert className="h-full w-full">
                        <CardHeader className="flex flex-row w-full items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-medium">
                                    Gráfico percentual de bolsistas CNPq
                                </CardTitle>
                                <CardDescription>Visão geral do SECTI-BA</CardDescription>
                            </div>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                    <TooltipContent>
                                        <p>Fonte: Painel CNPq</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                        </CardHeader>
                        <CardContent>
                            <ChartContainer
                                config={chartConfig5}
                                className="mx-auto aspect-square max-h-[300px]"
                            >
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} strokeWidth={5}>
                                        {chartData.map((key, index) => (
                                            <Cell key={`cell-${index}`} fill={(chartConfig5[key.name as keyof typeof chartConfig]).color} />
                                        ))}

                                        <LabelChart
                                            content={({ viewBox }) => {
                                                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                                    return (
                                                        <text
                                                            x={viewBox.cx}
                                                            y={viewBox.cy}
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                        >
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={viewBox.cy}
                                                                className=" dark:fill-white text-4xl font-bold"
                                                            >
                                                                {totalBolsistas}
                                                            </tspan>
                                                            <tspan
                                                                x={viewBox.cx}
                                                                y={(viewBox.cy || 0) + 24}
                                                                className="dark:fill-white"
                                                            >
                                                                Bolsistas
                                                            </tspan>
                                                        </text>
                                                    );
                                                }
                                            }}
                                        />
                                    </Pie>
                                </PieChart>
                            </ChartContainer>
                        </CardContent>
                    </Alert>
                </div>
            </div>

            <div
                className=" 
          w-full gap-8
          flex flex-wrap
          md:px-8 flex-col px-4 mt-8
        "
            >


                <h3 className="text-2xl font-medium ">Talvez você goste disto</h3>
                <BannerHome />
                <h3 className="text-2xl font-medium ">Principais categorias</h3>
                <div>


                    <div className="grid lg:grid-cols-3 gap-4 md:grid-cols-2 mgrid-cols-1 2xl:grid-cols-5">
                        {accessLinks.map(({ to, icon, label }) =>
                            <Link to={to} key={to} >
                                <Alert className="h-[80px] bg-blue-100 border-0 hover:bg-blue-200 text-sm dark:bg-blue-100/50 dark:hover:bg-blue-200/50 transition-all cursor-pointer flex items-center lg:p-8">
                                    <div className="flex w-full justify-between items-center gap-3  cursor-pointer">
                                        <div>
                                            {label}
                                        </div>

                                        <div className="h-10 w-10 rounded-md bg-black/10 flex items-center justify-center">
                                            {icon}
                                        </div>
                                    </div>
                                </Alert>
                            </Link>
                        )}
                    </div>
                </div>

                {/* <h3 className="text-2xl font-medium ">Destaques do mês</h3>

                <div className="rounded-md w-full bg-eng-blue p-8 gap-8 md:p-16  grid lg:grid-cols-2">
                    <CardContent
                        className="flex p-0 rounded-t-md lg:rounded-tr-none lg:rounded-l-md h-full items-center   bg-cover bg-center"

                    >

                        <div className="flex z-[2] flex-col gap-3">
                            <h1 className="text-2xl text-white font-medium">
                                Pesquisadores em destaque do mês de {mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)}
                            </h1>

                            <p className="text-white">
                                Conheça os pesquisadores que se destacaram em {mesAtual} com suas contribuições acadêmicas e científicas.
                            </p>
                        </div>


                    </CardContent>

                    <div className="grid grid-cols-1">
                        <div className="flex items-center justify-center">

                            <InfiniteMovingResearchers
                                items={randomResearchers} // Formata cada item como um objeto
                                direction="right"
                                key="loaded"
                                speed='normal'
                                pauseOnHover={true}
                                className="custom-class"
                            />
                        </div>
                    </div>
                </div> */}

                <Newsletter />

                <FooterHome />
            </div>


        </div>

    );
}

