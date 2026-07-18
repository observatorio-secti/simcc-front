import { Building2, ChevronLeft, Copy, Download, FileJson, Home, InfoIcon, Mail, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Duvidas } from "./duvidas";
import { useContext, useMemo, useState } from "react";
import { Alert, AlertTitle } from "../ui/alert";
import { BracketsCurly, LinkSimple } from "phosphor-react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { getVersion } from "../../gerVersion";
import { Badge } from "../ui/badge";
import { toast } from "sonner"
import { format } from "date-fns";
import bg_popup from '../../assets/bg_popup.png';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,

} from "../../components/ui/accordion"
import ColaboradoresData from './colaboradores.json';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table"

import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { UserContext } from "../../context/context";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Helmet } from "react-helmet";
import { Colors } from "./colors";

interface Log {
    created_at: string;
    detail: string | null;
    error: boolean;
    routine_type: string;
}


export function Info() {
    const history = useNavigate();

    const { urlGeral, version } = useContext(UserContext)

    const handleVoltar = () => {
        history(-1);
    }

    const [log, setLog] = useState<Log[]>([]);

    let urlTermPesquisadores = `${urlGeral}logs`

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
                    setLog(data);

                }
            } catch (err) {
                console.log(err);
            }
        };
        fetchData();
    }, [urlTermPesquisadores]);

    const colors = [
        { name: 'Qualis A1', color: '#34663C' },
        { name: 'Qualis A2', color: '#9DC356' },
        { name: 'Qualis A3', color: '#B1C38A' },
        { name: 'Qualis A4', color: '#BEC4B3' },
        { name: 'Qualis B1', color: '#D56438' },
        { name: 'Qualis B2', color: '#DD883D' },
        { name: 'Qualis B3', color: '#E3B081' },
        { name: 'Qualis B4', color: '#E3AC96' },
        { name: 'Qualis C', color: '#CE3830' },
        { name: 'Qualis SQ', color: '#4A1314' },
        { name: 'Artigos', color: '#5F82ED' },
        { name: 'Livros e Capítulos', color: '#D15697' },
        { name: 'Livros', color: '#792F4C' },
        { name: 'Capítulos', color: '#DBAFD0' },
        { name: 'Patentes', color: '#66B4D0' },
        { name: 'Softwares', color: '#096670' },
        { name: 'Marcas', color: '#1B1464' },
        { name: 'Área', color: '#6BC26B' },
        { name: 'Nome', color: '#D2524C' },
        { name: 'Participação em evento', color: '#DE7A36' },
        { name: 'Congresso', color: '#FF5800' },
        { name: 'Encontro', color: '#E9A700' },
        { name: 'Outra', color: '#7F400B' },
        { name: 'Seminário', color: '#FFBD7B' },
        { name: 'Simpósio', color: '#D53A2C' },
        { name: 'Oficina', color: '#FCEE21' },
        { name: 'Relatório Técnico', color: '#662D91' },
        { name: 'Concluída', color: '#6BC26B' },
        { name: 'Em andamento', color: '#DBB540' },
        { name: 'Feminino', color: '#D15697' },
        { name: 'Masculino', color: '#5F82ED' },
        { name: 'GET', color: '#DBB540' },
        { name: 'POST', color: '#CE3830' },
        { name: 'PQ', color: '#00D000' },
        { name: 'DT', color: '#183EFF' },
        { name: 'Cor 1', color: '#213E59' },
        { name: 'Cor 2', color: '#354E68' },
        { name: 'Cor 3', color: '#485F78' },
        { name: 'Cor 4', color: '#5C7188' },
        { name: 'Cor 5', color: '#6F8399' },
        { name: 'Cor 6', color: '#98A8BA' },
        { name: 'Iniciação científica', color: '#8BFBD3' },
        { name: 'Dissertação De Mestrado', color: '#67A896' },
        { name: 'Tese de Doutorado', color: '#425450' },
        { name: 'Trabalho de Conclusao de Curso Graduação', color: '#77D2B6' },
        { name: 'Orientacao-De-Outra-Natureza', color: '#577E74' },
        { name: 'Monografia de Conclusao de Curso Aperfeicoamento e Especializacao', color: '#2F7F7C' },
        { name: 'Supervisão de Pós-Doutorado', color: '#46724B' },


        // Adicionando as áreas acadêmicas com suas respectivas cores
        { name: 'ASTRONOMIA', color: 'bg-red-200' },
        { name: 'FÍSICA', color: 'bg-blue-200' },
        { name: 'GEOCIÊNCIAS', color: 'bg-green-200' },
        { name: 'MATEMÁTICA', color: 'bg-yellow-200' },
        { name: 'OCEANOGRAFIA', color: 'bg-teal-200' },
        { name: 'PROBABILIDADE E ESTATÍSTICA', color: 'bg-purple-200' },
        { name: 'QUÍMICA', color: 'bg-orange-200' },
        { name: 'AGRONOMIA', color: 'bg-red-800' },
        { name: 'CIÊNCIA E TECNOLOGIA DE ALIMENTOS', color: 'bg-blue-800' },
        { name: 'ENGENHARIA AGRÍCOLA', color: 'bg-green-800' },
        { name: 'MEDICINA VETERINÁRIA', color: 'bg-yellow-800' },
        { name: 'RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL', color: 'bg-teal-800' },
        { name: 'RECURSOS PESQUEIROS E ENGENHARIA DE PESCA', color: 'bg-purple-800' },
        { name: 'ZOOTECNIA', color: 'bg-orange-800' },
        { name: 'BIOFÍSICA', color: 'bg-red-600' },
        { name: 'BIOLOGIA GERAL', color: 'bg-blue-600' },
        { name: 'BIOQUÍMICA', color: 'bg-green-600' },
        { name: 'BIOTECNOLOGIA', color: 'bg-yellow-600' },
        { name: 'BOTÂNICA', color: 'bg-teal-600' },
        { name: 'ECOLOGIA', color: 'bg-purple-600' },
        { name: 'FARMACOLOGIA', color: 'bg-orange-600' },
        { name: 'FISIOLOGIA', color: 'bg-red-400' },
        { name: 'GENÉTICA', color: 'bg-blue-400' },
        { name: 'IMUNOLOGIA', color: 'bg-green-400' },
        { name: 'MICROBIOLOGIA', color: 'bg-yellow-400' },
        { name: 'MORFOLOGIA', color: 'bg-teal-400' },
        { name: 'PARASITOLOGIA', color: 'bg-purple-400' },
        { name: 'ZOOLOGIA', color: 'bg-orange-400' },
        { name: 'EDUCAÇÃO FÍSICA', color: 'bg-red-300' },
        { name: 'ENFERMAGEM', color: 'bg-blue-300' },
        { name: 'FARMÁCIA', color: 'bg-green-300' },
        { name: 'FISIOTERAPIA E TERAPIA OCUPACIONAL', color: 'bg-yellow-300' },
        { name: 'FONOAUDIOLOGIA', color: 'bg-teal-300' },
        { name: 'MEDICINA', color: 'bg-purple-300' },
        { name: 'NUTRIÇÃO', color: 'bg-orange-300' },
        { name: 'ODONTOLOGIA', color: 'bg-red-100' },
        { name: 'SAÚDE COLETIVA', color: 'bg-blue-100' },
        { name: 'ANTROPOLOGIA', color: 'bg-green-100' },
        { name: 'ARQUEOLOGIA', color: 'bg-yellow-100' },
        { name: 'CIÊNCIA POLÍTICA', color: 'bg-teal-100' },
        { name: 'EDUCAÇÃO', color: 'bg-purple-100' },
        { name: 'FILOSOFIA', color: 'bg-orange-100' },
        { name: 'GEOGRAFIA', color: 'bg-red-900' },
        { name: 'HISTÓRIA', color: 'bg-blue-900' },
        { name: 'PSICOLOGIA', color: 'bg-green-900' },
        { name: 'SOCIOLOGIA', color: 'bg-yellow-900' },
        { name: 'TEOLOGIA', color: 'bg-teal-900' },
        { name: 'CIÊNCIA DA COMPUTAÇÃO', color: 'bg-purple-900' },
        { name: 'DESENHO INDUSTRIAL', color: 'bg-orange-900' },
        { name: 'ENGENHARIA AEROESPACIAL', color: 'bg-red-500' },
        { name: 'ENGENHARIA BIOMÉDICA', color: 'bg-blue-500' },
        { name: 'ENGENHARIA CIVIL', color: 'bg-green-500' },
        { name: 'ENGENHARIA DE ENERGIA', color: 'bg-yellow-500' },
        { name: 'ENGENHARIA DE MATERIAIS E METALÚRGICA', color: 'bg-teal-500' },
        { name: 'ENGENHARIA DE MINAS', color: 'bg-purple-500' },
        { name: 'ENGENHARIA DE PRODUÇÃO', color: 'bg-orange-500' },
        { name: 'ENGENHARIA DE TRANSPORTES', color: 'bg-red-700' },
        { name: 'ENGENHARIA ELÉTRICA', color: 'bg-blue-700' },
        { name: 'ENGENHARIA MECÂNICA', color: 'bg-green-700' },
        { name: 'ENGENHARIA NAVAL E OCEÂNICA', color: 'bg-yellow-700' },
        { name: 'ENGENHARIA NUCLEAR', color: 'bg-teal-700' },
        { name: 'ENGENHARIA QUÍMICA', color: 'bg-purple-700' },
        { name: 'ENGENHARIA SANITÁRIA', color: 'bg-orange-700' },
        { name: 'ARTES', color: 'bg-red-50' },
        { name: 'LETRAS', color: 'bg-blue-50' },
        { name: 'LINGÜÍSTICA', color: 'bg-green-50' },
        { name: 'BIOÉTICA', color: 'bg-yellow-50' },
        { name: 'CIÊNCIAS AMBIENTAIS', color: 'bg-teal-50' },
        { name: 'DEFESA', color: 'bg-purple-50' },
        { name: 'DIVULGAÇÃO CIENTÍFICA', color: 'bg-orange-50' },
        { name: 'MICROELETRÔNICA', color: 'bg-red-700' },
        { name: 'ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO', color: 'bg-blue-700' },
        { name: 'SEGURANÇA CONTRA INCÊNDIO', color: 'bg-green-700' },
        { name: 'ADMINISTRAÇÃO', color: 'bg-yellow-700' },
        { name: 'ARQUITETURA E URBANISMO', color: 'bg-teal-700' },
        { name: 'CIÊNCIA DA INFORMAÇÃO', color: 'bg-purple-700' },
        { name: 'COMUNICAÇÃO', color: 'bg-orange-700' },
        { name: 'DEMOGRAFIA', color: 'bg-red-100' },
        { name: 'DIREITO', color: 'bg-blue-100' },
        { name: 'ECONOMIA', color: 'bg-green-100' },
        { name: 'ECONOMIA DOMÉSTICA', color: 'bg-yellow-100' },
        { name: 'MUSEOLOGIA', color: 'bg-teal-100' },
        { name: 'PLANEJAMENTO URBANO E REGIONAL', color: 'bg-purple-100' },
        { name: 'SERVIÇO SOCIAL', color: 'bg-orange-100' },
        { name: 'TURISMO', color: 'bg-red-200' },
    ];

    const Box = (props: any) => {
        const isHexColor = props.color.includes('#');
        return (
            <div
                className={`w-full h-32 rounded-md whitespace-nowrap flex ${isHexColor ? '' : props.color
                    }`}
                style={isHexColor ? { backgroundColor: props.color } : {}}
            ></div>
        );
    };




    const colaboradores = ColaboradoresData;

    const urlApi = `${urlGeral}researcherName?name=`
    const urlApi2 = `${urlGeral}bibliographic_production_researcher?terms=&researcher_id=&type=&qualis=&year=`
    const platform = version ? "Conectee" : "Simcc";
    const version2 = getVersion();

    return (
        <main className="p-4 md:p-8 bg-neutral-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-100">

            <Helmet>
                <title>Informações | {version ? ('Simcc') : ('Simcc')}</title>
                <meta name="description" content={`Informações | ${version ? ('Conectee') : ('Simcc')}`} />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <div className="max-w-[1200px] mx-auto space-y-8">
                {/* Header */}
                <Alert className="p-0">
                    <Alert className="flex border-0 rounded-b-none justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-4 md:p-6 rounded-md">
                        <AlertTitle className="text-base font-medium text-gray-600 dark:text-gray-300">
                            Informações
                        </AlertTitle>
                        <Link to="/">
                            <Button variant="outline">
                                <Home size={16} className="mr-2" />
                                Página Inicial
                            </Button>
                        </Link>
                    </Alert>

                    <div
                        className="p-8 rounded-t-none md:p-12 bg-cover bg-center rounded-md"
                        style={{ backgroundImage: `url(${bg_popup})` }}
                    >
                        <h1 className="text-4xl font-bold mb-2">
                            Plataforma {platform}
                        </h1>
                        <p className="text-sm font-light">
                            Versão da plataforma: {version2}
                        </p>
                    </div>
                </Alert>

                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Sobre a plataforma</h2>
                    <p>
                        O {platform} é uma plataforma desenvolvida para centralizar e visualizar de forma abrangente os dados dos pesquisadores da instituição. Integrando informações de diversas fontes, como Lattes, Sucupira, Diretório dos Grupos de Pesquisa (DGP), OpenAlex e Journal Citation Reports (JCR), o Simcc oferece uma visão detalhada e acessível das competências e produções acadêmicas. Todas as informações de produção bibliográfica e técnica apresentadas foram retiradas da Plataforma Lattes com autorização do CNPq e OpenAlex.
                    </p>



                </Alert>

                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Mapeamento de Produções Acadêmicas:</h2>



                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Artigos Científicos:</strong> Detalhamento completo com informações como Qualis, Journal Citation Reports (JCR), DOI, autores, ordem de autoria, quantidade de citações, revista, idioma, resumo, link para acesso e validação automática com bases de dados externas.</li>
                        <li><strong>Livros e Capítulos:</strong> Registro de livros e capítulos publicados, com título, autores, editora, ano de publicação e ISBN.</li>
                        <li><strong>Propriedade Intelectual:</strong> Registro de patentes, marcas, softwares. Incluindo, status (concedido, requerido ou publicado), titulares e data de registro.</li>
                        <li><strong>Participação em Eventos:</strong> Apresentações orais, pôsteres, mesas-redondas e participação em congressos, simpósios e seminários, com título do trabalho, evento,  ano e autoria.</li>
                        <li><strong>Relatórios Técnicos:</strong> Produção de relatórios técnicos, pareceres e documentos institucionais com dados do projeto vinculado, órgão financiador ou solicitante, autores e ano de emissão.</li>
                        <li><strong>Orientações:</strong> Registro de orientações e coorientações em nível de graduação, mestrado, doutorado, pós-doutorado e iniciação científica, com dados do orientando, tipo de vínculo, título do trabalho e situação (em andamento ou concluído).</li>
                        <li><strong>Textos em Revista:</strong> Publicações em revistas com título da matéria, nome da revista e ano de publicação.</li>
                        <li><strong>Trabalhos em Eventos:</strong> Registros de trabalhos completos e resumos expandidos publicados em anais de eventos acadêmicos, com título, autoria, evento, ISBN dos anais e ano.</li>
                        <li><strong>Projetos de Pesquisa:</strong> Detalhamento de projetos de pesquisa coordenados ou em que há participação, com título, resumo, instituição de execução, agência financiadora, ano de ínicio, situação atual (em andamento ou concluído), produções associadas.</li>
                        <li><strong>Cargos e Funções:</strong> Registro de atividades administrativas e acadêmicas, incluindo coordenação de cursos, chefias de departamento, direção de unidade, representação em colegiados e outros; com período de atuação e descrição da função.</li>
                        <li><strong>Outras Informações Relevantes:</strong> Dados complementares como índice H, índice i10, total de citações, além de indicadores bibliométricos e métricas de impacto institucional.</li>

                        <li><strong>Atuação em Grupos de Pesquisa:</strong> Vinculação a grupos de pesquisa certificados pelo CNPq, com nome do grupo, líder e vice-líder, linha de pesquisa e instituição.</li>

                    </ul>


                    <p>
                        A plataforma possui operadores booleanos de busca (E ou OU) e é capaz de fazer buscas a partir de perguntas com processamento de linguagem natural
                    </p>


                </Alert>


                {/* Abrangência */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Atualização dos dados</h2>
                    <p>
                        Esta política se aplica a todos os titulares de dados tratados pela plataforma: usuários autenticados, visitantes e dados coletados de fontes públicas ou institucionais.
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo de Rotina</TableHead>
                                <TableHead>Data</TableHead>

                                <TableHead>Erro</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {log.map((log, index) => (
                                <TableRow key={index}>

                                    <TableCell>{log.routine_type}</TableCell>
                                    <TableCell>{format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                                    <TableCell>{log.error ? "Sim" : "Não"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Alert>


                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Colaboradores</h2>
                    <p>
                        Esses são os colaboradores que, com dedicação, conhecimento e espírito de cooperação, tornam possível a construção, evolução e aprimoramento contínuo da plataforma.
                    </p>

                    <div className="grid 2xl:grid-cols-2 lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
                        {colaboradores.map((props) => (
                            <div className="flex">
                                <div className="w-2 rounded-l-md border border-r-0 bg-eng-blue"></div>
                                <Alert className=" rounded-l-none flex gap-3 p-8">

                                    <div className="flex flex-1 flex-col">
                                        <div className="mb-8">
                                            <p className="text-lg  font-medium">{props.name}</p>
                                            <div className="flex gap-2 items-center text-sm text-gray-500"><Building2 size={12} />{props.inst}</div>
                                        </div>

                                        <div className="flex gap-4 flex-wrap">
                                            <Link to={props.lattes} target="_blank">  <div className="flex gap-2 items-center text-xs"><LinkSimple size={12} />Currículo Lattes</div></Link>
                                            {props.mail != "" && (
                                                <div className="flex gap-2 items-center text-xs"><Mail size={12} />{props.mail}</div>
                                            )}
                                        </div>
                                    </div>
                                </Alert>
                            </div>
                        ))}
                    </div>

                </Alert>


                {/* Abrangência */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Suporte</h2>
                    <p className='flex gap-2 items-center '><MapPin size={16} /> {version ? ('Av. Luís Viana Filho, 5ª Avenida, Plataforma II, B, 1º andar - CAB, Salvador-BA,41745-004') : ('Av. Luís Viana Filho, 5ª Avenida, Plataforma II, B, 1º andar - CAB, Salvador-BA,41745-004')}</p>
                    <p className='flex gap-2 items-center '><Mail size={16} /> {version ? ('observatorio@secti.ba.gov.br') : ('observatorio@secti.ba.gov.br')}</p>

                </Alert>
            </div>

        </main>
    )
}