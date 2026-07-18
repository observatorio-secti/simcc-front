import { Link } from "react-router-dom";
import { ArrowRight, Info, Building2, Network } from "lucide-react";
import { CarrosselInstitution } from "../../components/homepage/components/carrossel-institution";
import { Helmet } from "react-helmet";
import bg_popup from "../../assets/bg_graduate.png";
import { Alert } from "../ui/alert";
import { CardHeader, CardTitle, CardContent } from "../ui/card";
import { useTheme } from "next-themes";

import INDICADORES from "../../../assets/observatorio/INDICADORES.png";
import VIP from "../../../assets/observatorio/VIP.png";
import PESQUISA from "../../../assets/observatorio/PESQUISA.webp";
import PATENTE from "../../../assets/observatorio/PATENTE.png";
import GRUPOS from "../../../assets/observatorio/GRUPOS.png";
import INCT from "../../../assets/observatorio/INCT.png";
import BOLSISTA from "../../../assets/observatorio/BOLSISTA.png";
import IA from "../../../assets/observatorio/IA.jpg";
import SIMCC from '../../../assets/observatorio/SIMCC.png'
import ICTITE from '../../../assets/observatorio/ICTITE.png'

import logo_5 from '../../assets/logo_cimatec.svg';
import logo_5_white from '../../assets/logo_cimatec_white.png';

import {
    BarChart,
    Map,
    Beaker,
    GraduationCap,
    Lightbulb,
    Users,
    Landmark,
    Award,
    Sparkles,
} from "lucide-react";
import { Badge } from "../ui/badge";


interface Initiatives {
    id: string;
    title: string;
    description: string;
    link: string;
    icon: React.ElementType;
    imageUrl?: string;
    status: 'active' | 'soon';
}

const initiativesList: Initiatives[] = [
    {
        id: "indicadores-institucionais",
        title: "Indicadores Institucionais e Pós-graduação",
        description: "Visualize métricas e dados consolidados sobre as instituições de ensino, pesquisa e os programas de pós-graduação da Bahia.",
        link: "/indicadores",
        icon: BarChart,
        status: 'active',
        imageUrl: INDICADORES,
    },
    {
        id: "simcc",
        title: "SIMCC - Mapeamento de Competências",
        description: "Navegue pelo Sistema de Mapeamento de Competências Científicas para encontrar pesquisadores e especialidades em todo o estado.",
        link: "/",
        icon: Map,
        status: 'active',
        imageUrl: SIMCC
    },
    {
        id: "vip-infraestrutura",
        title: "VIP - Vitrine de Infraestrutura",
        description: "Conheça a infraestrutura de pesquisa disponível na Bahia, incluindo laboratórios, equipamentos e serviços para a comunidade.",
        link: "https://vip.uesc.br/",
        icon: Beaker,
        status: 'active',
        imageUrl: VIP
    },
    {
        id: "pos-graduacao",
        title: "Programas de Pós-Graduação",
        description: "Explore informações detalhadas sobre os programas de mestrado e doutorado oferecidos pelas instituições de ensino superior da Bahia.",
        link: "/pos-graduacao",
        icon: GraduationCap,
        status: 'active',
        imageUrl: PESQUISA
    },
    {
        id: "producao-tecnica",
        title: "Produção Técnica e Inovação",
        description: "Acesse dados sobre patentes, registros de software e marcas que compõem a produção tecnológica e de inovação do estado.",
        link: "/listagens?tab=patent",
        icon: Lightbulb,
        status: 'active',
        imageUrl: PATENTE
    },
    {
        id: "grupos-pesquisa",
        title: "Grupos de Pesquisa",
        description: "Encontre e analise os grupos de pesquisa certificados da Bahia, suas linhas de atuação, membros e produção científica.",
        link: "/grupos-pesquisa",
        icon: Users,
        status: 'active',
        imageUrl: GRUPOS
    },
    {
        id: "incite",
        title: "INCITE - Institutos de C&T&I",
        description: "Conheça os Institutos de Ciência, Inovação e Tecnologia do Estado, suas áreas de atuação e projetos estratégicos.",
        link: "/incites",
        icon: Landmark,
        status: 'active',
        imageUrl: INCT
    },
    {
        id: "bolsistas-produtividade",
        title: "Bolsistas de Produtividade",
        description: "Visualize dados sobre os pesquisadores com bolsa de produtividade, destacando a excelência científica na Bahia.",
        link: "/listagens?tab=bolsistas",
        icon: Award,
        status: 'active',
        imageUrl: BOLSISTA
    },
    {
        id: "busca-ia",
        title: "Busca por IA",
        description: "Utilize nossa busca inteligente para encontrar informações em toda a plataforma usando linguagem natural.",
        link: "/resultados-ia",
        icon: Sparkles,
        status: 'active',
        imageUrl: IA
    },
    {
        id: "rede-ictite",
        title: "Clube de Ciência",
        description: "Rede interdisciplinar que promove a popularização da ciência e fortalece a educação científica e em saúde nas escolas da Bahia.",
        link: "https://simcc.uesc.br/ictite/v1/web/",
        icon: Network,
        status: 'active',
        imageUrl: ICTITE
    }
];

export const Observatorio = () => {
    const { theme } = useTheme();

    const renderIniciativeCard = (iniciative: Initiatives) => {
        const isComingSoon = iniciative.status === 'soon';
        const cardContent = (
            <div
                className={`group relative flex flex-col justify-between w-full h-full p-6 rounded-lg border dark:border-neutral-800 shadow-sm transition-all overflow-hidden bg-cover bg-center`}
                style={{ backgroundImage: `url(${iniciative.imageUrl})` }}>
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/70 transition-colors"></div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                        {isComingSoon && (
                            <Badge variant="secondary" className="absolute top-4 right-4 z-20">Em Breve</Badge>
                        )}
                        <div className="mb-4">
                            <iniciative.icon className={`h-8 w-8 ${isComingSoon ? 'text-neutral-400' : 'text-white'}`} />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-white">{iniciative.title}</h3>
                        <p className="mt-2 text-sm text-neutral-300">{iniciative.description}</p>
                    </div>
                    {!isComingSoon && (
                        <div className="mt-6 flex items-center text-sm font-semibold text-white">
                            Acessar painel
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    )}
                </div>
            </div>
        );

        if (isComingSoon) {
            return <div key={iniciative.id} className="opacity-60 cursor-not-allowed">{cardContent}</div>;
        }

        return (
            <Link to={iniciative.link} target="_blank" rel="noopener noreferrer" key={iniciative.id} className="no-underline">
                {cardContent}
            </Link>
        );
    };

    return <main className="relative flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-cover bg-center" style={{ backgroundImage: `url(${bg_popup})` }} >
        <div className="absolute inset-0 bg-white/40 dark:bg-black/60 backdrop-blur-sm z-0"></div>

        <div className="relative z-10 w-full">
            <Helmet>
                <title>Observatório de Dados de C&T da Bahia</title>
                <meta name="description" content="Explore o Observatório de Dados Públicos de Ciência e Tecnologia da Bahia. Acesse painéis interativos sobre pesquisa, inovação, pós-graduação e mais." />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Alert className="grid lg:grid-cols-4 gap-4 mb-8">
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
                                10
                            </span>
                        </CardContent>
                    </div>
                </Link>
                <div className="lg:col-span-3 md:col-span-1 flex ">
                    <CarrosselInstitution />
                </div>
            </Alert>

            <div className="flex flex-col items-center gap-6 mb-8 justify-center">
                <div className="flex-1 text-center">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl text-neutral-900 dark:text-neutral-100">
                        Observatório de dados públicos de ciência e tecnologia da Bahia
                    </h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                        Acesse visualizações de dados sobre pesquisadores, produção científica, infraestrutura e fomento à inovação no estado. Selecione um painel abaixo para começar sua análise.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-base text-neutral-600 dark:text-neutral-400">Realização:</span>
                    <div className="min-w-max">
                        <Link to={"https://www.fapesb.ba.gov.br/"} target="_blank" rel="noopener noreferrer">
                            <img src={(theme == 'dark') ? (logo_5_white) : (logo_5)} alt="Logo do CIMATEC" className="h-[96px]" />
                        </Link>
                    </div>
                </div>
            </div>


            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {initiativesList.map(renderIniciativeCard)}
            </div>

            <div className="mt-12 text-center">
                <Link to={'/informacoes'} className="inline-flex items-center rounded-lg gap-2 px-3 py-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    <Info size={14} />
                    <span>Saiba mais sobre a plataforma e a origem dos dados</span>
                </Link>
            </div>
        </div>
    </main>
};