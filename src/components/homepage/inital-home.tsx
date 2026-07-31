import { useContext, useEffect, useState, useMemo } from "react";
import { UserContext } from "../../context/context";

import {
    Book as BookPhosphor,
    Books,
    Copyright,
} from "phosphor-react";
import { 
    ArrowRight, 
    BarChartBig, 
    Blocks, 
    Building2, 
    Download, 
    File, 
    GraduationCap, 
    Info, 
    InfoIcon, 
    Link2, 
    List, 
    Book, 
    Navigation, 
    Building,
    Map,
    Lightbulb,
    Users,
    Landmark,
    Award,
    Sparkles,
    Network
} from "lucide-react";
import { Alert } from "../ui/alert";
import { useModalHomepage } from "../hooks/use-modal-homepage";

import logo_ufba from '../../assets/logo_ufba.png';
import logo_ebmsp from '../../assets/logo_ebmsp.png';
import logo_ebmsp_dark from '../../assets/logo_ebmsp_dark.png';
import logo_uesb from '../../assets/logo_uesb.png';
import logo_uesb_dark from '../../assets/logo_uesb_dark.png';
import logo_ufob from '../../assets/logo_ufob.png';
import logo_ufob_dark from '../../assets/logo_ufob_dark.png';
import logo_ufsb from '../../assets/logo_ufsb.png';
import logo_ufsb_dark from '../../assets/logo_ufsb_dark.png';
import logo_uefs from '../../assets/logo_uefs.png';
import logo_uefs_dark from '../../assets/logo_uefs_dark.png';
import logo_uesc from '../../assets/logo_uesc.png';
import logo_ufrb20 from '../../assets/logo_ufrb-20.png';
import logo_ufrb20_dark from '../../assets/logo_ufrb-20_dark.png';
import logo_uneb from '../../assets/logo_uneb.png';
import logo_ifba from '../../assets/logo_ifba.png';
import logo_uneb_dark from '../../assets/logo_uneb_dark.png';

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
import { GraficoRtTechnician } from "./components/grafico-technician";
import { useModalResult } from "../hooks/use-modal-result";
import { useModal } from "../hooks/use-modal-store";

import { BannerHome } from "./components/banner";
import { Helmet } from "react-helmet";
import { InfiniteMovingResearchers } from "../ui/infinite-moving-researcher";
import { Research } from "./categorias/researchers-home";
import { GraficoTitulacaoHome } from "./components/grafico-titulacao";
import { FooterHome } from "../footer/footer-home";

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
        color: "#1E3A8A", 
    },
    'Desen. Tec. e Extensão Inovadora': {
        label: "Desen. Tec. e Extensão Inovadora",
        color: "#DC2626", 
    },
    'Outros docentes': {
        label: "Outros docentes",
        color: "#9CA3AF",
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

    const [abaAtiva, setAbaAtiva] = useState('Todas');

    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i > currentYear - 30; i--) {
        years.push(i);
    }

    const [grupos, setGrupos] = useState<GrupoPesquisa[]>([]);

    const urlMetrics = urlGeral + `metrics/researcher/scholarship`;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(urlMetrics, {
                    mode: "cors",
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "GET",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Max-Age": "3600",
                    },
                });
                const data = await response.json();
                if (data && data.length > 0) {
                    setMetrics(data);
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlMetrics]);

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

    useEffect(() => {
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

    const [loading, isLoading] = useState(false)
    const [dados, setDados] = useState<Count[]>([]);
    let urlDados = `${urlGeral}ResearcherData/DadosGerais?year=${year}`

    useEffect(() => {
        const fetchData = async () => {
            try {
                isLoading(true)
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
                    isLoading(false)
                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlDados]);

    const { isOpen, type } = useModalHomepage();
    const isModalOpen = isOpen && type === "initial-home";

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
            enabled: false, 
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
                colors: ['#1E3A8A', '#DC2626', '#9CA3AF'], 
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

    // Links de acesso rápido que ficam abaixo da barra de pesquisa
    const quickAccessLinks = [
        { to: '/producao-cientifica', icon: <File size={14} className="text-blue-800" />, title: 'Produção Científica' },
        { to: '/indicadores', icon: <BarChartBig size={14} className="text-blue-800" />, title: 'Indicadores' },
        { to: '/grupos-pesquisa', icon: <Blocks size={14} className="text-blue-800" />, title: 'Grupos de Pesquisa' },
        { to: '/pos-graduacao', icon: <GraduationCap size={14} className="text-blue-800" />, title: 'Pós-graduação' },
        { to: '/listagens', icon: <List size={14} className="text-blue-800" />, title: 'Listagens' },
    ];

    // Os módulos combinados na estética de "cards brancos simples"
    const platformModules = [
        { to: '/producao-cientifica', icon: <File size={28} className="text-blue-800" />, title: 'Produção Científica', label: 'Acesse informações sobre publicações e desenvolvimento científico.', linkText: 'ANALISAR GRÁFICOS' },
        { to: '/indicadores', icon: <BarChartBig size={28} className="text-blue-800" />, title: 'Indicadores Institucionais', label: 'Visualize métricas e dados consolidados sobre as instituições de ensino e pesquisa.', linkText: 'ACESSAR PAINEL' },
        { to: '/simcc', icon: <Map size={28} className="text-blue-800" />, title: 'Mapeamento de Competências', label: 'Navegue pelo Sistema de Mapeamento para encontrar pesquisadores e especialidades.', linkText: 'ACESSAR PAINEL' },
        { to: '/vip', icon: <Building size={28} className="text-blue-800" />, title: 'Vitrine de Infraestrutura', label: 'Conheça a infraestrutura de pesquisa disponível, incluindo laboratórios e equipamentos.', linkText: 'ACESSAR PAINEL' },
        { to: '/pos-graduacao', icon: <GraduationCap size={28} className="text-blue-800" />, title: 'Programas de Pós-Graduação', label: 'Explore informações sobre os programas de mestrado e doutorado oferecidos na Bahia.', linkText: 'ACESSAR PAINEL' },
        { to: '/producao-tecnica', icon: <Lightbulb size={28} className="text-blue-800" />, title: 'Produção Técnica e Inovação', label: 'Acesse dados sobre patentes, registros de software e marcas da Bahia.', linkText: 'ACESSAR PAINEL' },
        { to: '/grupos-pesquisa', icon: <Users size={28} className="text-blue-800" />, title: 'Grupos de Pesquisa', label: 'Encontre e analise os grupos de pesquisa certificados e suas linhas de atuação.', linkText: 'ACESSAR PAINEL' },
        { to: '/incite', icon: <Landmark size={28} className="text-blue-800" />, title: 'Institutos de C&T&I', label: 'Conheça os Institutos de Ciência, Inovação e Tecnologia e seus projetos estratégicos.', linkText: 'ACESSAR PAINEL' },
        { to: '/bolsistas', icon: <Award size={28} className="text-blue-800" />, title: 'Bolsistas de Produtividade', label: 'Visualize dados sobre os pesquisadores com bolsa de produtividade no estado.', linkText: 'ACESSAR PAINEL' },
        { to: '/busca-ia', icon: <Sparkles size={28} className="text-blue-800" />, title: 'Busca por IA', label: 'Utilize nossa busca inteligente para encontrar informações usando linguagem natural.', linkText: 'ACESSAR PAINEL' },
        { to: '/clube-ciencia', icon: <Network size={28} className="text-blue-800" />, title: 'Clube de Ciência', label: 'Rede que promove a popularização da ciência e fortalece a educação científica.', linkText: 'ACESSAR PAINEL' },
        { to: '/dicionario', icon: <Book size={28} className="text-blue-800" />, title: 'Dicionário CTI', label: 'Consulte termos e conceitos de Ciência, Tecnologia e Inovação.', linkText: 'CONSULTAR TERMOS' },
    ];

    const [researcher, setResearcher] = useState<Research[]>([]);
    let urlTermPesquisadores = `${urlGeral}outstanding_researchers`
    
    const [isLoad, setLoad] = useState(false)
    useEffect(() => {
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
                setLoad(false);
            }
        };
        fetchData();
    }, [urlTermPesquisadores]);

    const randomResearchers = useMemo(() => {
        if (!researcher || researcher.length === 0) return [];
        return [...researcher].sort(() => Math.random() - 0.5).slice(0, 40);
    }, [researcher]);

    const mesAtual = new Date().toLocaleString("pt-BR", { month: "long" });

    const instituicoes = [
        { id: 1, sigla: 'UFBA', nome: 'Universidade Federal da Bahia', categoria: 'Federais', img: logo_ufba, imgDark: logo_ufba },
        { id: 2, sigla: 'EBMSP', nome: 'Escola Bahiana de Medicina e Saúde Pública', categoria: 'Privadas', img: logo_ebmsp, imgDark: logo_ebmsp_dark },
        { id: 3, sigla: 'UESB', nome: 'Universidade Estadual do Sudoeste da Bahia', categoria: 'Estaduais', img: logo_uesb, imgDark: logo_uesb_dark },
        { id: 4, sigla: 'UFOB', nome: 'Universidade Federal do Oeste da Bahia', categoria: 'Federais', img: logo_ufob, imgDark: logo_ufob_dark },
        { id: 5, sigla: 'UFSB', nome: 'Universidade Federal do Sul da Bahia', categoria: 'Federais', img: logo_ufsb, imgDark: logo_ufsb_dark },
        { id: 6, sigla: 'UEFS', nome: 'Universidade Estadual de Feira de Santana', categoria: 'Estaduais', img: logo_uefs, imgDark: logo_uefs_dark },
        { id: 7, sigla: 'UESC', nome: 'Universidade Estadual de Santa Cruz', categoria: 'Estaduais', img: logo_uesc, imgDark: logo_uesc },
        { id: 8, sigla: 'UFRB', nome: 'Univ. Federal do Recôncavo da Bahia', categoria: 'Federais', img: logo_ufrb20, imgDark: logo_ufrb20_dark },
        { id: 9, sigla: 'UNEB', nome: 'Universidade do Estado da Bahia', categoria: 'Estaduais', img: logo_uneb, imgDark: logo_uneb_dark },
        { id: 10, sigla: 'IFBA', nome: 'Instituto Federal da Bahia', categoria: 'Institutos', img: logo_ifba, imgDark: logo_ifba },
    ];

    const categoriasAbas = ['Todas', 'Federais', 'Estaduais', 'Institutos', 'Privadas'];

    const instituicoesFiltradas = abaAtiva === 'Todas' 
        ? instituicoes 
        : instituicoes.filter(inst => inst.categoria === abaAtiva);

    return (
        <div className="relative flex flex-col bg-gray-50 min-h-screen overflow-hidden font-sans">
            <Helmet>
                <title>{`Página Inicial | ${version ? 'Conectee' : 'Simcc'}`}</title>
                <meta name="description" content={`Página Inicial | ${version ? 'Conectee' : 'Simcc'}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>

            {/* ========================================= */}
            {/* 🎨 EFEITOS DE FUNDO (BLOBS)               */}
            {/* ========================================= */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="absolute top-[25%] right-[-5%] w-[400px] h-[400px] bg-red-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-15 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-cyan-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 pointer-events-none"></div>

            {/* FAIXA DAS CORES DA BAHIA NO TOPO */}
            <div className="relative z-[1] w-full h-2 flex">
                <div className="flex-1 bg-blue-800"></div>
                <div className="flex-1 bg-white"></div>
                <div className="flex-1 bg-red-600"></div>
            </div>

            {/* CABEÇALHO HERO COM IMAGEM */}
            <div className="relative z-[1] w-full border-b border-gray-200 bg-blue-900 overflow-hidden">
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-30 mix-blend-screen"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')" }}
                ></div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/80 to-transparent"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/50 to-transparent"></div>

                <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-8 py-16 lg:py-20 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex-1 max-w-3xl text-white">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 drop-shadow-sm">
                            Observatório
                        </h1>
                        <p className="text-blue-50 text-lg mb-8 leading-relaxed max-w-2xl opacity-90">
                            O Observatório da Ciência da Bahia integra sistemas e painéis temáticos que 
                            apresentam informações sobre produção científica, laboratórios e equipamentos, 
                            pós-graduação, grupos de pesquisa, INCITEs, inovação tecnológica, clubes de ciência 
                            e iniciativas de popularização científica.
                        </p>
                        
                        <Link to="/sobre" className="inline-flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-900/20">
                            Sobre o Observatório <ArrowRight size={16} className="ml-2" />
                        </Link>
                    </div>
                    
                    <div className="hidden lg:flex flex-col gap-5 w-1/3 items-end">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white w-64 shadow-2xl transform translate-x-4 hover:-translate-y-1 transition-transform cursor-default">
                            <p className="text-blue-200 text-sm font-medium mb-1 flex items-center gap-2">
                                <Building size={16} /> Instituições Integradas
                            </p>
                            <p className="text-4xl font-bold">10</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white w-64 shadow-2xl transform -translate-x-4 hover:-translate-y-1 transition-transform cursor-default">
                            <p className="text-blue-200 text-sm font-medium mb-1 flex items-center gap-2">
                                <File size={16} /> Dados Analisados
                            </p>
                            <p className="text-4xl font-bold">
                                {VisaoPrograma.length !== 0 ? (VisaoPrograma[0].article + VisaoPrograma[0].book).toLocaleString() : <span className="text-blue-200/50 animate-pulse">...</span>}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTEÚDO PRINCIPAL */}
            <div className="relative z-[1] max-w-[1200px] mx-auto px-4 md:px-8 py-8 w-full">
                
                {/* ÁREA DE BUSCA SEGURA */}
                <div className="mb-10 w-full">
                    {/* ENVOLVIMENTO DA BARRA DE PESQUISA */}
                    <div className={`w-full mb-3 rounded-xl shadow-lg border p-2 transition-all duration-300 ${
                        isModalOpen 
                        ? 'relative z-[999] bg-white border-blue-500 scale-[1.02]' 
                        : 'relative z-[2] bg-white/90 backdrop-blur-md border-gray-100'
                    }`}>
                        <Search />
                    </div>

                    {/* LINKS DE ACESSO RÁPIDO ESTÁTICOS */}
                    <div className={`flex flex-wrap items-center gap-2 px-1 transition-opacity duration-300 ${
                        isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}>
                        <span className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1 mr-2">
                            <Navigation size={14} /> Atalhos rápidos:
                        </span>
                        {quickAccessLinks.map((link) => (
                            <Link 
                                key={link.to} 
                                to={link.to} 
                                className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-red-400 text-blue-800 hover:text-red-600 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-sm"
                            >
                                <div className="scale-75 origin-center">{link.icon}</div>
                                {link.title}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* FILTROS SUGERIDOS */}
                <div className={`flex items-center gap-3 mb-12 overflow-x-auto pb-2 transition-opacity duration-300 ${
                    isModalOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}>
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sugestões de filtros:</span>
                    {['Instituição', 'Área do conhecimento', 'Ano', 'Tipo de produção', 'Tema'].map((filtro) => (
                        <button key={filtro} className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-md text-sm hover:border-red-400 hover:text-red-600 transition-colors whitespace-nowrap">
                            <List size={14} /> {filtro}
                        </button>
                    ))}
                    <button className="text-red-600 text-sm font-medium ml-auto whitespace-nowrap hover:underline flex items-center gap-1">
                        <List size={14} /> Limpar filtros
                    </button>
                </div>

                {/* ============================================================== */}
                {/* PLATAFORMA / CATEGORIAS (MÓDULOS - CARDS SIMPLES)              */}
                {/* ============================================================== */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-red-600 pl-3">Módulos da Plataforma</h2>
                            <p className="text-gray-600 mt-1 pl-3">Explore todos os sistemas, portais e painéis disponíveis no observatório.</p>
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {platformModules.map(({ to, icon, title, label, linkText }) => (
                            <Link to={to} key={to}>
                                <div className="bg-white/90 backdrop-blur-sm border border-gray-200 hover:border-red-600 hover:shadow-md transition-all rounded-xl p-6 flex gap-4 h-full cursor-pointer group">
                                    <div className="flex-shrink-0 mt-1 transition-transform group-hover:scale-110">
                                        {icon}
                                    </div>
                                    <div className="flex flex-col justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-blue-900 mb-1 group-hover:text-red-700 transition-colors">{title}</h4>
                                            <p className="text-gray-600 text-sm mb-4">{label}</p>
                                        </div>
                                        <span className="text-red-600 text-xs font-bold flex items-center uppercase tracking-wider">
                                            {linkText} <ArrowRight size={14} className="ml-1" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* INSTITUIÇÕES INTEGRADAS */}
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-900 border-l-4 border-red-600 pl-3">Instituições integradas</h2>
                            <p className="text-gray-600 mt-1 pl-3">Acesse os dados e produções de cada instituição participante.</p>
                        </div>
                        <Link to="/instituicoes" className="text-red-600 font-medium hover:underline text-sm flex items-center">
                            Ver todas <ArrowRight size={14} className="ml-1" />
                        </Link>
                    </div>
                    
                    <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        {version ? (
                            <div className="p-6">Conteúdo para a versão alternativa (Conectee)</div>
                        ) : (
                            <>
                                <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 px-2 pt-2 scrollbar-hide">
                                    {categoriasAbas.map((aba) => (
                                        <button
                                            key={aba}
                                            onClick={() => setAbaAtiva(aba)}
                                            className={`px-5 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                                                abaAtiva === aba 
                                                ? 'border-b-2 border-red-600 text-red-600 bg-white rounded-t-lg' 
                                                : 'text-gray-500 hover:text-blue-900 hover:bg-gray-100 rounded-t-lg'
                                            }`}
                                        >
                                            {aba}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-6 md:p-8 min-h-[220px]">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                        {instituicoesFiltradas.map((inst) => (
                                            <Link 
                                                to={`/instituicao?institution_id=${inst.id}`}
                                                key={inst.id} 
                                                className="flex flex-col items-center justify-center p-4 border border-gray-100 rounded-lg hover:border-blue-300 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group bg-white"
                                            >
                                                <div className="w-16 h-16 bg-blue-50 text-blue-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors overflow-hidden p-2">
                                                    {inst.img ? (
                                                        <img 
                                                            src={theme === "dark" ? inst.imgDark : inst.img} 
                                                            alt={`Logo ${inst.sigla}`} 
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        <Building size={28} />
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-blue-900 text-center">{inst.sigla}</h4>
                                                <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2" title={inst.nome}>
                                                    {inst.nome}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                    
                                    {instituicoesFiltradas.length === 0 && (
                                        <div className="w-full py-12 flex flex-col items-center justify-center text-gray-400">
                                            <Building2 size={48} className="mb-3 opacity-20" />
                                            <p>Nenhuma instituição encontrada para esta categoria.</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* DADOS EM DESTAQUE E VÍDEOS */}
                <div className="grid lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white/90 backdrop-blur-sm p-6 border border-gray-200 rounded-xl shadow-sm flex flex-col justify-between border-t-4 border-t-blue-800">
                        <div>
                            <h3 className="text-xl font-bold text-blue-900 mb-2">Vídeos do SIMCC</h3>
                            <p className="text-gray-600 text-sm mb-6">Tutoriais, apresentações e conteúdos sobre o sistema.</p>
                        </div>
                        <Link to="/videos" className="bg-blue-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-900 w-max inline-flex items-center">
                            Acessar vídeos <ArrowRight size={14} className="ml-2" />
                        </Link>
                    </div>

                    <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 border border-gray-200 rounded-xl shadow-sm border-t-4 border-t-red-600">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-blue-900">Dados em destaque</h3>
                            <Link to="/dados" className="text-red-600 font-medium hover:underline text-sm flex items-center">
                                Ver todos os dados <ArrowRight size={14} className="ml-1" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-gray-100">
                            <div className="text-center px-2 hover:scale-105 transition-transform cursor-pointer">
                                <p className="text-gray-500 text-sm mb-2">Instituições<br/>integradas</p>
                                <p className="text-3xl font-bold text-blue-900">10</p>
                            </div>
                            <div className="text-center px-2 hover:scale-105 transition-transform cursor-pointer">
                                <p className="text-gray-500 text-sm mb-2">Produções<br/>cadastradas</p>
                                <p className="text-3xl font-bold text-blue-900">
                                    {VisaoPrograma.length !== 0 ? (VisaoPrograma[0].article + VisaoPrograma[0].book + VisaoPrograma[0].book_chapter).toLocaleString() : <span className="text-gray-300 animate-pulse text-2xl">...</span>}
                                </p>
                            </div>
                            <div className="text-center px-2 hover:scale-105 transition-transform cursor-pointer">
                                <p className="text-gray-500 text-sm mb-2">Livros<br/>registrados</p>
                                <p className="text-3xl font-bold text-blue-900">
                                    {VisaoPrograma.length !== 0 ? VisaoPrograma[0].book.toLocaleString() : <span className="text-gray-300 animate-pulse text-2xl">...</span>}
                                </p>
                            </div>
                            <div className="text-center px-2 hover:scale-105 transition-transform cursor-pointer">
                                <p className="text-gray-500 text-sm mb-2">Pesquisadores<br/>ativos</p>
                                <p className="text-3xl font-bold text-blue-900">
                                    {VisaoPrograma.length !== 0 ? VisaoPrograma[0].researcher.toLocaleString() : <span className="text-gray-300 animate-pulse text-2xl">...</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PESQUISADORES EM DESTAQUE */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-12 flex flex-col lg:flex-row shadow-sm min-h-[220px]">
                    <div className="relative bg-blue-800 p-8 lg:w-1/3 flex flex-col justify-center text-white">
                        <div className="absolute top-0 right-0 w-2 h-full bg-red-600"></div>
                        <div className="absolute top-0 right-2 w-1 h-full bg-white"></div>
                        
                        <h3 className="text-2xl font-bold mb-3 z-10">
                            Pesquisadores em destaque do mês de {mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)}
                        </h3>
                        <p className="text-blue-100 text-sm z-10">
                            Conheça os pesquisadores que se destacaram em {mesAtual} com suas contribuições acadêmicas e científicas.
                        </p>
                    </div>
                    
                    <div className="lg:w-2/3 p-6 flex items-center justify-center bg-gray-50/50">
                        {randomResearchers && randomResearchers.length > 0 ? (
                            <InfiniteMovingResearchers
                                items={randomResearchers}
                                direction="right"
                                key="loaded"
                                speed="normal"
                                pauseOnHover={true}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                <InfoIcon size={28} className="opacity-40" />
                                <p className="text-xs font-medium">Nenhum pesquisador em destaque retornado pela API no momento.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="relative z-[1]">
                    <Newsletter />
                </div>
            </div>
            
            <div className="relative z-[1]">
                <FooterHome />
            </div>
        </div>
    );
}