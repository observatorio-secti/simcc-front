import { Alert } from "../ui/alert";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { UserContext } from "../../context/context";
import { Home } from "lucide-react";
import { useContext, useRef, useState } from "react";
import { getVersion } from "../../gerVersion";
import bg_popup from "../../assets/bg_home.png";
import { Helmet } from "react-helmet";


export function Videos() {
    const { version } = useContext(UserContext);
    const platform = version ? "Conectee" : "Simcc";
    const version2 = getVersion();

    const videoFiles = [
        ...(version
            ? [
                // lista da UFMG
                "power-bi-tutorial", 
                "Índice 10H- correção grafico ‐ Feito com o Clipchamp.mp4",
                "Qualis ‐ Feito com o Clipchamp (1).mp4",
                "ORCID ‐ Feito com o Clipchamp (1).mp4",
                "CadastrarOrcidLattes.mp4",
                "JCR ‐ Feito com o Clipchamp (1).mp4",
                "indiceH ‐ Feito com o Clipchamp.mp4",
                "DOI ‐ Feito com o Clipchamp.mp4",
                "Bolsista de Produtividade_new ‐ Feito com o Clipchamp.mp4"
            ]
            : [
                // lista completa com os vídeos do Simcc
                "power-bi-tutorial",
                "Índice do Pesquisador_mod ‐ Feito com o Clipchamp.mp4",
                "Índice 10H- correção grafico ‐ Feito com o Clipchamp.mp4",
                "Qualis ‐ Feito com o Clipchamp (1).mp4",
                "ORCID ‐ Feito com o Clipchamp (1).mp4",
                "CadastrarOrcidLattes.mp4",
                "JCR ‐ Feito com o Clipchamp (1).mp4",
                "indiceH ‐ Feito com o Clipchamp.mp4",
                "DOI ‐ Feito com o Clipchamp.mp4",
                "Bolsista de Produtividade_new ‐ Feito com o Clipchamp.mp4"
            ])
    ];

    // Função para gerar título e descrição a partir do nome do arquivo
    function parseVideoInfo(filename: string) {
        // Mapeamento manual para títulos amigáveis
        const titleMap: Record<string, string> = {
            "power-bi-tutorial": "Aprenda a Criar Seus Próprios Painéis com Power BI",
            "Índice 10H- correção grafico ‐ Feito com o Clipchamp.mp4": "Índice 10H",
            "Índice do Pesquisador_mod ‐ Feito com o Clipchamp.mp4": "Índice Do Pesquisador",
            "Índice do Pesquisador ‐ Feito com o Clipchamp (1).mp4": "Índice Do Pesquisador",
            "Bolsista de Produtividade_new ‐ Feito com o Clipchamp.mp4": "Bolsista De Produtividade",
            "indiceH ‐ Feito com o Clipchamp.mp4": "Índice H",
            "Qualis ‐ Feito com o Clipchamp (1).mp4": "Qualis",
            "ORCID ‐ Feito com o Clipchamp (1).mp4": "ORCID",
            "CadastrarOrcidLattes.mp4": "Como Cadastrar o ORCID no Lattes",
            "JCR ‐ Feito com o Clipchamp (1).mp4": "JCR",
            "DOI ‐ Feito com o Clipchamp.mp4": "DOI"
        };
        const title = titleMap[filename] || filename.replace(/ ‐ Feito com o Clipchamp.*|\.mp4$/gi, "");
        let description = `Demonstração sobre ${title.toLowerCase()} na plataforma ${platform}. Assista para entender o conceito e como utilizar esse recurso.`;
        if (filename === "power-bi-tutorial") {
            description = `Neste vídeo, você vai aprender a criar painéis personalizados no Power BI utilizando dados do ${platform}. Apresentamos 7 exemplos práticos para te ajudar a construir relatórios sob medida.`;
        } else if (filename === "CadastrarOrcidLattes.mp4") {
            description = `Tutorial rápido mostrando como cadastrar o identificador ORCID no seu Currículo Lattes, passo a passo, para garantir integração e autenticidade dos dados na plataforma ${platform}.`;
        } else {
            if (title.toLowerCase().includes("bolsista")) description = `Saiba como identificar e analisar bolsistas de produtividade na plataforma ${platform}.`;
            if (title.toLowerCase().includes("qualis")) description = `Explicação sobre o Qualis e sua aplicação na avaliação de periódicos e produção acadêmica na plataforma ${platform}.`;
            if (title.toLowerCase().includes("orcid")) description = `Descubra o que é o ORCID, para que serve e como ele pode ser usado para reunir e autenticar sua produção científica na plataforma ${platform}.`;
            if (title.toLowerCase().includes("jcr")) description = `Entenda o Journal Citation Reports (JCR) e como ele é utilizado para avaliar o impacto de periódicos científicos.`;
            if (title.toLowerCase().includes("índice h")) description = `Aprenda a calcular e interpretar o Índice H para medir a produtividade e o impacto de pesquisadores.`;
            if (title.toLowerCase().includes("doi")) description = `O que é DOI, como encontrar e utilizar o identificador digital de objetos em publicações científicas.`;
        }
        return { title, description };
    }

    const videos = videoFiles.map((file, idx) => {
        const { title, description } = parseVideoInfo(file);
        return {
            src: file === "power-bi-tutorial" ? "https://www.youtube.com/embed/8HI3rnNhTNo" : `/vid/${file}`,
            title,
            description,
            id: idx,
            isYoutube: file === "power-bi-tutorial"
        };
    });

    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
    const [activeVideo, setActiveVideo] = useState<number | null>(null);

    function handlePlay(idx: number) {
        videoRefs.current.forEach((ref, i) => {
            if (i !== idx && ref) {
                ref.pause();
            }
        });
        setActiveVideo(idx);
    }

    return (
        <main className="p-4 md:p-8 bg-neutral-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-100">
            <Helmet>
                <title>Vídeos | {platform}</title>
                <meta name="description" content={`Tutoriais em vídeo sobre a plataforma ${platform}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <div className="max-w-[1200px] mx-auto space-y-8">
                {/* Header */}
                <Alert className="p-0">
                    <div className="flex border-0 rounded-b-none justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-4 md:p-6 rounded-md">
                        <span className="text-base font-medium text-gray-600 dark:text-gray-300 font-lexend">
                            Vídeos
                        </span>
                        <Link to="/">
                            <Button variant="outline">
                                <Home size={16} className="mr-2" />
                                Página Inicial
                            </Button>
                        </Link>
                    </div>

                    {/* Banner Hero */}
                    <div
                        className="p-8 rounded-t-none md:p-12 bg-cover bg-center rounded-md"
                        style={{ backgroundImage: `url(${bg_popup})` }}
                    >
                        <h1 className="text-4xl font-bold mb-2 font-lexend">
                            Plataforma {platform}
                        </h1>
                        <p className="text-sm font-light font-lexend">
                            Versão da plataforma: {version2}
                        </p>
                    </div>
                </Alert>

                {/* Cabeçalho explicativo */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Vídeos Tutoriais</h2>
                    <p className="text-base text-justify">
                        Nesta seção você encontra vídeos explicativos sobre os principais recursos, índices e funcionalidades da plataforma {platform}. Assista para aprender a utilizar indicadores, entender conceitos e tirar dúvidas sobre o uso da plataforma.
                    </p>
                </Alert>

                {/* Lista de vídeos em Alerts estilizados */}
                <div className="flex flex-col gap-8">
                    {videos.map((video, idx) => (
                        <Alert key={video.id} className="flex flex-col md:flex-row items-stretch rounded-md overflow-hidden bg-white dark:bg-neutral-900 p-0 border border-gray-200 dark:border-neutral-800">
                            {/* Vídeo à esquerda */}
                            <div className="md:w-1/2 w-full aspect-video md:aspect-auto flex-shrink-0 flex items-stretch justify-stretch bg-black">
                                {video.isYoutube ? (
                                    <iframe
                                        src={video.src}
                                        className="w-full h-full min-h-[220px] md:min-h-[260px] rounded-none md:rounded-l-md"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={video.title}
                                    />
                                ) : (
                                    <video
                                        controls
                                        ref={el => videoRefs.current[idx] = el}
                                        className="w-full h-full min-h-[220px] md:min-h-[260px] rounded-none md:rounded-l-md object-contain"
                                        onPlay={() => handlePlay(idx)}
                                    >
                                        <source src={video.src} type="video/mp4" />
                                        Seu navegador não suporta o elemento de vídeo.
                                    </video>
                                )}
                            </div>
                            {/* Texto à direita */}
                            <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left p-6 md:w-1/2 w-full font-lexend">
                                <h2 className="text-xl md:text-2xl font-bold mb-2">{video.title}</h2>
                                <p className="text-base text-muted-foreground text-justify md:text-left mx-auto md:mx-0 max-w-prose">{video.description}</p>
                            </div>
                        </Alert>
                    ))}
                </div>
            </div>
        </main>
    );
}