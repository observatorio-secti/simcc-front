import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Separator } from "../ui/separator";
import { useContext } from "react";
import { getVersion } from "../../gerVersion";
import { UserContext } from "../../context/context";
import { useTheme } from "next-themes";
import { Home, Info, ShieldCheck, AlertTriangle } from "lucide-react";
import bg_popup from "../../assets/bg_home.png";

export function TermosUso() {
    const { theme } = useTheme();
    const { version } = useContext(UserContext);
    const institution = version ? "a Escola de Engenharia da UFMG" : "o SECTI-BA";
    const platform = version ? "Conectee" : "Simcc";
    const version2 = getVersion();

    return (
        <main className="p-4 md:p-8 bg-neutral-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-100">
            <div className="max-w-[1200px] mx-auto space-y-8">

                {/* Header */}
                <Alert className='p-0'>
                    <Alert className="flex border-0 rounded-b-none justify-between items-center bg-neutral-100 dark:bg-neutral-800 border-b-0 p-4 md:p-6 rounded-md">
                        <AlertTitle className="text-base font-medium text-gray-600 dark:text-gray-300">
                            Termos de Uso e Documentação
                        </AlertTitle>
                        <Link to="/">
                            <Button variant="outline">
                                <Home size={16} className="mr-2" />
                                Página Inicial
                            </Button>
                        </Link>


                    </Alert>

                    {/* Banner Hero */}
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


                {/* Introdução */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Introdução</h2>
                    <p>
                        A plataforma <strong>{platform}</strong> é fruto de uma colaboração institucional entre Escola de Engenharia da UFMG, Universidade do Estado da Bahia (UNEB), Universidade do Recôncavo da Bahia (UFRB), Universidade Estadual de Snta Cruz (UESC) e Secretaria de Ciência, Tecnologia e Inovação (SECTI), com o objetivo de transformar a forma como dados acadêmicos e científicos são organizados e utilizados.
                    </p>
                    <p>
                        Este documento apresenta os termos de uso, diretrizes e princípios que regem o funcionamento da plataforma, garantindo transparência, segurança e responsabilidade no acesso e tratamento das informações.
                    </p>

                    <Alert variant="default">
                        <Info className="h-4 w-4 mr-2" />
                        <AlertDescription>
                            Ao continuar utilizando a plataforma, você concorda com os termos aqui estabelecidos. Leia com atenção cada seção para compreender suas responsabilidades e os limites do uso da aplicação.
                        </AlertDescription>
                    </Alert>
                </Alert>



                {/* Seção 1: Objetivo */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">1. Objetivo e Abrangência</h2>
                    <p>
                        A plataforma {platform} visa consolidar, integrar e facilitar o acesso a dados científicos, acadêmicos e institucionais por meio de interfaces intuitivas e recursos inteligentes de análise.
                    </p>
                    <p>
                        Seu foco é proporcionar uma base sólida de informações para gestores, pesquisadores e instituições, contribuindo diretamente com a melhoria da educação superior e da produção científica no Brasil.
                    </p>

                    <Alert>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        <AlertTitle>Fontes confiáveis de dados</AlertTitle>
                        <AlertDescription className="mt-2">
                            As principais integrações são realizadas com bases renomadas:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li><strong>Lattes</strong> - Currículos de pesquisadores</li>
                                <li><strong>Plataforma Sucupira</strong> - Dados da CAPES</li>
                                <li><strong>JCR (Journal Citation Reports)</strong> - Métricas de impacto</li>
                                <li><strong>OpenAlex</strong> - Dados bibliográficos internacionais</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                </Alert>



                {/* Seção 2: Cadastro */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">2. Cadastro e Responsabilidades do Usuário</h2>

                    <h3 className="text-xl font-medium">2.1 Elegibilidade</h3>
                    <p>
                        O uso da plataforma está aberto a pesquisadores, estudantes, gestores e demais interessados. No entanto, o acesso a funcionalidades avançadas requer um cadastro prévio.
                    </p>
                    <p>
                        Durante o cadastro, o usuário deve fornecer:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Nome completo e e-mail institucional válido</li>
                        <li>Identificadores acadêmicos como Lattes ou ORCID</li>
                        <li>Confirmação de vínculo com instituições reconhecidas</li>
                    </ul>

                    <h3 className="text-xl font-medium mt-6">2.2 Uso de Credenciais</h3>
                    <p>
                        O usuário é integralmente responsável por manter suas credenciais seguras. Toda atividade executada sob suas credenciais será atribuída a ele.
                    </p>

                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        <AlertTitle>Importante</AlertTitle>
                        <AlertDescription>
                            Caso detecte atividades suspeitas ou perda de acesso, entre imediatamente em contato com a equipe técnica da plataforma {platform}.
                        </AlertDescription>
                    </Alert>
                </Alert>



                {/* Seção 3: Política de Uso */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">3. Política de Uso</h2>

                    <h3 className="text-xl font-medium">3.1 Finalidade Permitida</h3>
                    <p>
                        A plataforma deve ser utilizada exclusivamente para atividades que envolvam:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Consulta e análise de dados científicos</li>
                        <li>Gestão acadêmica e institucional</li>
                        <li>Elaboração de relatórios, projetos e diagnósticos estratégicos</li>
                    </ul>

                    <h3 className="text-xl font-medium">3.2 Restrições</h3>
                    <p>
                        É vedado utilizar a plataforma para:
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Distribuir informações confidenciais sem autorização</li>
                        <li>Modificar ou distorcer dados e indicadores</li>
                        <li>Realizar engenharia reversa ou explorar vulnerabilidades</li>
                        <li>Comercializar os dados da plataforma</li>
                    </ul>
                </Alert>


                {/* Seção 4: Atualizações */}
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">4. Atualizações e Suporte</h2>
                    <p>
                        A plataforma passa por atualizações constantes para garantir sua estabilidade, segurança e inovação. Algumas funcionalidades podem ficar temporariamente indisponíveis durante os ciclos de manutenção.
                    </p>
                    <p>
                        A equipe técnica está disponível para suporte e esclarecimento de dúvidas por meio dos canais oficiais de atendimento.
                    </p>
                </Alert>

            </div>
        </main>
    );
}
