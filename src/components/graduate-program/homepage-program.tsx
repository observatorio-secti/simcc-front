import { Book, Blocks, Briefcase, Copyright, File, GraduationCap, Info, MapPinIcon, SquareArrowOutUpRight, Star, Users } from "lucide-react";
import { Alert } from "../ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { InfiniteMovingResearchers } from "../ui/infinite-moving-researcher";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/context";
import { useLocation } from "react-router-dom";
import { Books, Code, Quotes, StripeLogo } from "phosphor-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "../../components/ui/chart"


import { BarChart, Bar, XAxis, LabelList, CartesianGrid, } from 'recharts';
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HC_wordcloud from 'highcharts/modules/wordcloud';
import { GraficoArtigosPorQualis } from "../dashboard/graficos/grafico-qualis";
import { GraficoIndiceProdBibli } from "./grafico-indice-producao-bibliografica";
import { AdminGraficoGraduateProgram } from "./admin-graficos-graduate-program";


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


interface Props {
    program: GraduateProgram
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

export interface PalavrasChaves {
    term: string;
    among: number;
}

type Research = {
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
    h_index: string,
    relevance_score: string,
    works_count: string,
    cited_by_count: string,
    i10_index: string,
    scopus: string,
    openalex: string,
    subsidy: Bolsistas[]
    graduate_programs: GraduatePrograms[]
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


//

type Publicacao = {
    id: string,
    doi: string,
    name_periodical: string,
    qualis: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "None" | "SQ",
    title: string,
    year: string,
    color: string,
    researcher: string,
    lattes_id: string,
    magazine: string,
    lattes_10_id: string,
    jif: string,
    jcr_link: string
    researcher_id: string
    distinct: boolean

    abstract: string,
    article_institution: string,
    authors: string
    authors_institution: string
    citations_count: string
    issn: string
    keywords: string
    landing_page_url: string
    language: string
    pdf: string
    has_image: boolean
    relevance: boolean

}


//

export interface Total {
    article: string
    book: string
    book_chapter: string
    brand: string
    patent: string
    researcher: string
    software: string
    work_in_event: string
    subsidy: string
}


type Dados = {
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
    graduantion: string
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

type PesosProducao = {
    a1: string;
    a2: string;
    a3: string;
    a4: string;
    b1: string;
    b2: string;
    b3: string;
    b4: string;
    c: string;
    sq: string;
    f1: string;
    f2: string;
    f3: string;
    f4: string;
    f5: string;
    livro: string;
    cap_livro: string;
    software: string;
    patent_granted: string;
    patent_not_granted: string;
    report: string;
    book: string;
    book_chapter: string;
};


const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

export function HomepageProgram(props: Props) {

    const [researcher, setResearcher] = useState<Research[]>([]);

    const { urlGeral, version, urlGeralAdm } = useContext(UserContext)

    const queryUrl = useQuery();

    const type_search = queryUrl.get('graduate_program_id');


    let urlTermPesquisadores = `${urlGeral}researcherName?name=&graduate_program_id=${type_search}`

    useMemo(() => {
        const fetchData = async () => {
            try {

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

                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlTermPesquisadores]);

    //


    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);

    const urlTermPublicacoes = urlGeral + `recently_updated?year=2024&university=&graduate_program_id=${type_search}`
    console.log(urlTermPublicacoes)
    useMemo(() => {
        const fetchData = async () => {
            try {

                const response = await fetch(urlTermPublicacoes, {
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
                    setPublicacoes(data);

                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlTermPublicacoes]);


    //

    const [totalProducao, setTotalProducao] = useState<Total[]>([]);

    const urlTotalProgram = `${urlGeral}graduate_program_production?graduate_program_id=${type_search}&year=1900`;

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
            icon: File, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.article, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Livros",
            icon: Book, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.book, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Capítulos de livro",
            icon: Books, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.book_chapter, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Patentes",
            icon: Copyright, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.patent, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Marcas",
            icon: StripeLogo, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.brand, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Softwares",
            icon: Code, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.software, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Trabalhos em eventos",
            icon: Briefcase, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.work_in_event, // Corrigido para acessar o primeiro item e a propriedade `article`
        },
        {
            name: "Bolsistas CNPq",
            icon: Copyright, // Certifique-se de que Quotes é um componente ou valor válido
            number: totalProducao.slice(0, 1)[0]?.subsidy, // Corrigido para acessar o primeiro item e a propriedade `article`
        }

    ];

    //
    const [dados, setDados] = useState<Dados[]>([]);
    const [year, setYear] = useState(new Date().getFullYear() - 4);

    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i > currentYear - 30; i--) {
        years.push(i);
    }


    let urlDados = `${urlGeral}ResearcherData/DadosGerais?year=${year}&graduate_program_id=${type_search}`

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


    //palavars
    const [words, setWords] = useState<PalavrasChaves[]>([]);
    let urlPalavrasChaves = `${urlGeral}lists_word_researcher?graduate_program_id=${type_search}&researcher_id=`

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

    //

    //pesos prod

    const [a1, seta1] = useState('');
    const [a2, seta2] = useState('');
    const [a3, seta3] = useState('');
    const [a4, seta4] = useState('');
    const [b1, setb1] = useState('');
    const [b2, setb2] = useState('');
    const [b3, setb3] = useState('');
    const [b4, setb4] = useState('');
    const [c, setc] = useState('');
    const [sq, setsq] = useState('');

    const [livro, setLivro] = useState('');
    const [capLivro, setCapLivro] = useState('');

    const [t1, setT1] = useState('');
    const [t2, setT2] = useState('');
    const [t3, setT3] = useState('');
    const [t4, setT4] = useState('');
    const [t5, setT5] = useState('');

    const [software, setSoftware] = useState('');
    const [patenteCondecida, setPatenteConcedida] = useState('');
    const [patenteNaoConcedida, setPatenteNaoConcedida] = useState('');
    const [relTec, setRelTec] = useState('');

    const [pesosProducao, setPesosProducao] = useState<PesosProducao>({
        a1: a1,
        a2: a2,
        a3: a3,
        a4: a4,
        b1: b1,
        b2: b2,
        b3: b3,
        b4: b4,
        c: c,
        sq: sq,
        f1: t1,
        f2: t2,
        f3: t3,
        f4: t4,
        f5: t5,
        livro: livro,
        cap_livro: capLivro,
        software: software,
        patent_granted: patenteCondecida,
        patent_not_granted: patenteNaoConcedida,
        report: relTec,
        book: livro,
        book_chapter: capLivro
    })


    const urlGet = urlGeralAdm + `indprod/query?institution_id=083a16f0-cccf-47d2-a676-d10b8931f66b`;

    console.log(urlGet)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(urlGet, {
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
                if (data.length != 0) {
                    const newData = data[0] // Assumindo que data é um array e tem apenas um elemento
                    seta1(newData.a1);
                    seta2(newData.a2);
                    seta3(newData.a3);
                    seta4(newData.a4);
                    setb1(newData.b1);
                    setb2(newData.b2);
                    setb3(newData.b3);
                    setb4(newData.b4);
                    setc(newData.c);
                    setsq(newData.sq);
                    setT1(newData.f1);
                    setT2(newData.f2);
                    setT3(newData.f3);
                    setT4(newData.f4);
                    setT5(newData.f5);
                    setLivro(newData.book);
                    setCapLivro(newData.book_chapter);
                    setSoftware(newData.software);
                    setPatenteConcedida(newData.patent_granted);
                    setPatenteNaoConcedida(newData.patent_not_granted);
                    setRelTec(newData.report);

                    setPesosProducao(newData)

                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, []);


    return (
        <main className="h-full w-full flex flex-col">
            <div className="flex justify-between items-center py-12">
                <div className="flex flex-col items-start md:flex-row gap-6 -mt-4">
                    <Avatar className="cursor-pointer rounded-lg  h-24 w-24">
                        <AvatarImage className={'rounded-md h-24 w-24'} src={``} />
                        <AvatarFallback className="flex items-center justify-center"><GraduationCap size={24} /></AvatarFallback>
                    </Avatar>

                    <div>
                        <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                            <div className="flex flex-wrap gap-4 ">
                                {/* Tipo do Programa */}
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Users size={12} />{props.program.type}</div>
                                {/* Área do Programa */}
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Blocks size={12} />{props.program.area}</div>
                                {/* Cidade */}
                                <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center capitalize"><MapPinIcon size={12} />{props.program.city}</div>
                                {/* Nota do Programa */}
                                {props.program.rating != '' && (
                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Star size={12} />{props.program.rating}</div>
                                )}
                            </div>
                        </p>

                        <h1 className="text-2xl max-w-[800px] font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                            {props.program.name}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div className="lg:col-span-2 mt-5">
                    <div>
                        <div className="pb-4">
                            <HeaderResultTypeHome title="Produção do Programa" icon={<Quotes size={24} className="text-gray-400" />}>
                            </HeaderResultTypeHome>
                        </div>

                        {/* Grid estático para visualização dos números de produção */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
                            {producoes.map((producao, index) => {
                                const IconComponent = producao.icon;
                                return (
                                    <Alert key={index} className="p-4">
                                        <div className="flex flex-col items-center text-center space-y-2">
                                            <div className="p-2 rounded-lg bg-muted">
                                                <IconComponent size={20} className="text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-2xl font-bold">{producao.number || 0}</p>
                                                <p className="text-sm text-muted-foreground font-medium">{producao.name}</p>
                                            </div>
                                        </div>
                                    </Alert>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <div className=" py-4 flex justify-between items-center">
                            <HeaderResultTypeHome title="Pesquisadores" icon={<Users size={24} className="text-gray-400" />}>
                            </HeaderResultTypeHome>

                            <Button className="w-8 h-8" size={'icon'}><SquareArrowOutUpRight size={12} /></Button>
                        </div>

                        <InfiniteMovingResearchers
                            items={researcher} // Formata cada item como um objeto
                            direction="right"
                            speed='normal'
                            pauseOnHover={true}
                            className="custom-class"
                        />
                    </div>
                </div>
            </div>

            <div className="flex flex-col mt-8 md:gap-8 gap-4">
                <div
                    className="
            flex w-full flex-wrap gap-8

            md:flex-col
            
            lg:grid lg:grid-cols-3
          "
                >
                    <Alert className="lg:col-span-2 h-full p-0 w-full">
                        <CardHeader className="flex p-0 flex-col md:flex-wrap items-stretch space-y-0 border-b dark:border-b-neutral-800 sm:flex-row">
                            <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                                <CardHeader className="flex p-0 flex-row items-center justify-between space-y-0">
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

                    <div className="flex h-full gap-8 w-full">
                        <Alert className="p-0 w-full">
                            <CardHeader className="flex p-10 flex-row items-center justify-between space-y-0 pb-2">
                                <div>
                                    <CardTitle className="text-sm font-medium">
                                        Índice de produção de artigos
                                    </CardTitle>
                                    <CardDescription>Multiplicação do peso pela quantidade</CardDescription>

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

                            <CardContent className="p-2 sm:p-6 h-full">
                                <GraficoIndiceProdBibli articles={dados} pesosProducao={pesosProducao} />
                            </CardContent>

                        </Alert>
                    </div>
                </div>

                <div
                    className="
            flex flex-wrap gap-8

            lg:grid lg:grid-cols-3
          "
                >

                    <Alert className="h-full min-w-[40%]">
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
                </div>
            </div>

            <AdminGraficoGraduateProgram graduate_program_id={props.program.graduate_program_id} />

        </main>
    )
}



