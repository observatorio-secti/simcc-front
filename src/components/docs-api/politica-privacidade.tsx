// src/components/PoliticaPrivacidade.tsx
import { Link } from "react-router-dom";
import { Alert, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import { Home } from "lucide-react";
import bg_popup from "../../assets/bg_graduate.png";
import { getVersion } from "../../gerVersion";
import { useContext } from "react";
import { UserContext } from "../../context/context";


export function PoliticaPrivacidade() {
    const { version } = useContext(UserContext);
    const platform = version ? "Conectee" : "Simcc";
    const version2 = getVersion();

    return (<main className="p-4 md:p-8 bg-neutral-50 dark:bg-neutral-900 text-gray-800 dark:text-gray-100">
        <div className="max-w-[1200px] mx-auto space-y-8">
            <Alert className="p-0">
                <Alert className="flex border-0 rounded-b-none justify-between items-center bg-neutral-100 dark:bg-neutral-800 p-4 md:p-6 rounded-md">
                    <AlertTitle className="text-base font-medium text-gray-600 dark:text-gray-300">
                        Política de Privacidade
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

            {/* Apresentação */}
            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">1. Apresentação</h2>

                <p>
                    O {platform} é um sistema desenvolvido em parceria pela Escola de Engenharia da Universidade Federal de Minas Gerais (UFMG), com colaboração da Universidade do Estado da Bahia (UNEB), Universidade Estadual de Santa Cruz (UESC), Universidade Federal do Recôncavo da Bahia (UFRB) e Secretaria de Ciência e Tecnologia do Estado a Bahia (SECTI). A plataforma tem como missão promover a organização, análise e divulgação das produções acadêmicas, técnicas e científicas vinculadas à Escola de Engenharia, a partir da integração de bases públicas de dados como Lattes, Sucupira, OpenAlex, Journal Citation Reports (JCR) e Diretório de Grupos de Pesquisa (DGP).
                </p>
                <Alert>
                    <p>A presente Política de Privacidade tem como objetivo estabelecer, de forma clara, acessível e transparente, as diretrizes adotadas pela Plataforma {platform} em relação ao tratamento de dados pessoais, em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD) — Lei nº 13.709/2018.</p>
                </Alert>

            </Alert>

            {/* Abrangência */}
            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">2. Abrangência</h2>
                <p>
                    Esta política se aplica a todos os titulares de dados tratados pela plataforma: usuários autenticados, visitantes e dados coletados de fontes públicas ou institucionais.
                </p>

                <ul className="list-disc list-inside space-y-1">
                    <li>Usuários autenticados (docentes, servidores, gestores e pesquisadores);</li>
                    <li>Visitantes que acessam as áreas públicas da plataforma;</li>
                    <li>Dados coletados automaticamente ou provenientes de bases públicas e institucionais;</li>
                    <li>Dados pessoais, dados sensíveis, dados institucionais e dados anonimizados.</li>

                </ul>
            </Alert>

            {/* Definições */}
            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">3.	Definições Legais (conforme LGPD) Para os fins desta Política:</h2>

                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Dado pessoal: </strong>informação relacionada a pessoa natural identificada ou identificável.</li>
                    <li><strong>Dado sensível: </strong>dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião política, saúde, vida sexual, dado genético ou biométrico.</li>
                    <li><strong>Tratamento: </strong>toda operação realizada com dados pessoais, como coleta, utilização, compartilhamento, arquivamento e eliminação.</li>
                    <li><strong>Controlador: </strong>entidade que decide sobre o tratamento dos dados.</li>
                    <li><strong>Operador: </strong> pessoa ou organização que realiza o tratamento de dados em nome do controlador. </li>
                    <li><strong>Titular: </strong> pessoa natural a quem se referem os dados. </li>
                    <li><strong>Anonimização: </strong> processo que impede a associação do dado a um titular.</li>
                </ul>
            </Alert>

            {/* Dados Coletados */}
            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">4.	Dados Coletados e Fontes</h2>

                <h3 className="text-xl font-medium">4.1. Dados Fornecidos Diretamente pelo Titular</h3>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Nome completo e nome social (se aplicável);</li>
                    <li>Identificação institucional (UID – Shibboleth) (se aplicável);</li>
                    <li>E-mails institucionais e pessoais;</li>
                    <li>E-mails institucionais e pessoais;</li>
                    <li>Endereço do LinkedIn;</li>
                    <li>Identificador do Currículo Lattes;</li>
                    <li>Fotos de perfil e produções acadêmicas (quando inseridas manualmente).</li>
                </ul>

                <h3 className="text-xl font-medium">4.2. Dados Coletados Automaticamente</h3>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Endereço IP e localização aproximada;</li>
                    <li>Data e hora de acesso;</li>
                    <li>Navegador, sistema operacional e tipo de dispositivo;</li>
                    <li>Sessões de login e logout.</li>
                </ul>


                <h3 className="text-xl font-medium">4.3. Dados coletados de bases externas (com respaldo público/legal)</h3>

                <ul className="list-disc list-inside mt-2 space-y-1">
                    <li><strong>Currículo Lattes (CNPq): </strong>artigos, livros, capítulos de livros, marcas, patentes, softwares, textos em revista, trabalhos em eventos, participações em eventos, orientações, projetos de pesquisa, áreas de atuação, vínculos institucionais, resumo, titulação, área de especialidade, ORCID, cidade, universidade, DOI</li>
                    <li><strong>Plataforma Sucupira (CAPES): </strong>dados dos programas de pós-graduação, linhas de pesquisa, docentes e vinculo</li>
                    <li><strong>Plataforma Sucupira (Qualis): </strong>nome da revista e qualis associado</li>
                    <li><strong>Journal Citation Reports (JCR): </strong>métricas de periódicos científicos, fatores de impacto</li>
                    <li><strong>OpenAlex: </strong>quantidade de citações, índice H, índice i10, resumo do artigo, coautores, idioma da revista, ISSN</li>
                    <li><strong>ORCID (quando informado): : </strong> identificação digital única </li>
                    <li><strong>Diretório de Grupo de Pesquisa: </strong> Nome do grupo, área, líder e vice-líder, linhas de pesquisa</li>
                    <li><strong>Painel Lattes: </strong> Bolsistas de proatividade e desenvolvimento tecnológico</li>
                    <li><strong>Universidade Federal de Minas Gerais (se aplicável): : </strong> Regime de trabalho, nível, classe, gênero, cargo</li>
                </ul>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">5. Finalidades do Tratamento dos Dados</h2>

                <p>
                    O tratamento de dados realizado pela plataforma {platform} tem como base finalidades legítimas, observando sempre o interesse público e a promoção da ciência aberta, em conformidade com a legislação aplicável.
                </p>

                <h3 className="text-xl font-medium">5.1. Gestão Acadêmica e Institucional</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Identificação e visualização das produções acadêmicas dos pesquisadores;</li>
                    <li>Classificação das produções por tipo, área, peso, relevância e demais filtros temáticos e institucionais;</li>
                    <li>Apoio à avaliação institucional, elaboração de relatórios e prestação de contas para agências de fomento, como CAPES e CNPq, entre outras;</li>
                    <li>Subsídio à formulação, acompanhamento e aperfeiçoamento de políticas acadêmicas e científicas;</li>
                    <li>Suporte à tomada de decisões em colegiados e comissões institucionais, especialmente nos programas de pós-graduação.</li>
                </ul>

                <h3 className="text-xl font-medium">5.2. Transparência e Divulgação Científica</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Disponibilização pública das produções dos pesquisadores, respeitando direitos autorais e licenças de uso;</li>
                    <li>Facilitação de buscas por especialistas, considerando áreas de conhecimento, formação acadêmica, produção e atuação;</li>
                    <li>Promoção da ciência aberta e da visibilidade institucional e acadêmica dos pesquisadores vinculados;</li>
                    <li>Ampliação do acesso ao conhecimento científico produzido na Universidade e sua divulgação à sociedade.</li>
                </ul>

                <h3 className="text-xl font-medium">5.3. Análises e Inteligência Institucional</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Geração de painéis interativos com indicadores de desempenho acadêmico (Power BI);</li>
                    <li>Mapeamento de redes de colaboração científica e identificação de potencialidades institucionais;</li>
                    <li>Realização de estudos sobre o impacto das produções científicas e suas contribuições para o avanço do conhecimento.</li>
                </ul>
            </Alert>


            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">6. Bases Legais para o Tratamento</h2>

                <p>
                    O tratamento dos dados realizado pela plataforma {platform} está fundamentado nas bases legais previstas na Lei Geral de Proteção de Dados Pessoais (LGPD):
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Execução de políticas públicas, conforme Art. 7º, III da LGPD;</li>
                    <li>Cumprimento de obrigação legal ou regulatória, conforme Art. 7º, II, incluindo exigências do MEC, CAPES e CNPq;</li>
                    <li>Legítimo interesse público, conforme Art. 7º, IX, respaldado pela elaboração de Relatório de Impacto à Proteção de Dados (RIPD);</li>
                    <li>Consentimento do titular, conforme Art. 7º, I, quando aplicável, especialmente para funcionalidades adicionais ou publicação de dados opcionais.</li>
                </ul>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">7. Compartilhamento de Dados</h2>

                <p>
                    Os dados tratados pela plataforma {platform} poderão ser compartilhados de maneira controlada e transparente, observando sempre os princípios da LGPD e o interesse institucional.
                </p>

                <h3 className="text-xl font-medium">7.1. Compartilhamento Interno — Universidade</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Órgãos da administração central, como Pró-Reitorias e a Diretoria de Tecnologia da Informação (DTI);</li>
                    <li>Coordenações de Programas de Pós-Graduação;</li>
                    <li>Departamentos e comissões avaliadoras vinculadas à instituição.</li>
                </ul>

                <h3 className="text-xl font-medium">7.2. Compartilhamento com Entidades Externas</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Órgãos de fomento e controle: CAPES, CNPq, FAPEMIG, TCU, MEC, FAPESB;</li>
                    <li>Instituições parceiras, mediante acordos de cooperação formalizados, com cláusulas específicas de proteção de dados;</li>
                    <li>Público externo, exclusivamente nos casos em que os dados forem públicos por natureza (ex: produções científicas, currículos Lattes).</li>
                </ul>

                <h3 className="text-xl font-medium">7.3. Dados não são compartilhados com</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Empresas privadas para fins comerciais ou de marketing;</li>
                    <li>Plataformas que descumpram normas éticas, legais ou que coloquem a privacidade dos titulares em risco.</li>
                </ul>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">8. Armazenamento e Segurança dos Dados</h2>

                <p>
                    A plataforma {platform} adota práticas robustas de segurança da informação, alinhadas à LGPD e a normas técnicas reconhecidas no setor.
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Armazenamento em servidores sob gestão da Escola de Engenharia da UFMG e UESC;</li>
                    <li>Autenticação segura via login institucional - aplicável para UFMG - (Shibboleth) e integração com Google;</li>
                    <li>Criptografia de dados sensíveis tanto em trânsito quanto em repouso;</li>
                    <li>Monitoramento contínuo de acessos e tentativas indevidas;</li>
                    <li>Backups periódicos com políticas claras de retenção e recuperação;</li>
                    <li>Controle rigoroso de permissões de acesso, baseado no perfil do usuário.</li>
                </ul>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">9. Direitos dos Titulares dos Dados</h2>

                <p>
                    Conforme estabelece a Lei Geral de Proteção de Dados (LGPD), os titulares dos dados tratados pela plataforma {platform} possuem os seguintes direitos:
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Confirmação da existência de tratamento;</li>
                    <li>Acesso facilitado aos dados tratados;</li>
                    <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
                    <li>Solicitação de anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                    <li>Informação sobre compartilhamento dos dados;</li>
                    <li>Oposição ao tratamento de dados quando houver descumprimento da legislação;</li>
                    <li>Revogação do consentimento, quando essa for a base legal do tratamento.</li>
                </ul>

                <p>
                    As solicitações podem ser realizadas pelos canais institucionais da {version ? ('Escola de Engenharia da UFMG') : ('SECTI')} ou diretamente através do e-mail: {version ? (<a href="mailto:conectee@eng.ufmg.br" className="underline">conectee@eng.ufmg.br</a>) : (<a href="mailto:observatorio@secti.ba.gov.br" className="underline">observatorio@secti.ba.gov.br</a>)}.
                </p>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">10. Retenção e Eliminação dos Dados</h2>

                <p>
                    Os dados tratados pelo {platform} serão armazenados de acordo com critérios legais e institucionais:
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Enquanto perdurar o vínculo do titular com a instituição cadastrada;</li>
                    <li>Pelo tempo necessário para cumprimento de obrigações legais, contratuais e institucionais;</li>
                    <li>Em registros históricos, para fins acadêmicos, científicos e de memória institucional;</li>

                </ul>

                <p>
                    Dados sensíveis ou considerados desnecessários serão eliminados ou anonimizados, sempre em conformidade com os requisitos legais e observando o interesse público.
                </p>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">11. Cookies e Tecnologias de Rastreamento</h2>

                <p>
                    A plataforma {platform} utiliza cookies e tecnologias de rastreamento apenas para:
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Autenticação e manutenção de sessão do usuário;</li>
                    <li>Medição de desempenho e aprimoramento da experiência de navegação;</li>
                    <li>Análises estatísticas agregadas, sem identificação individual de usuários.</li>
                </ul>

                <p>
                    O usuário pode configurar seu navegador para rejeitar cookies. No entanto, algumas funcionalidades da plataforma poderão ser limitadas caso essa opção seja ativada.
                </p>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">12. Atualizações e Mudanças nesta Política</h2>

                <p>
                    Esta Política de Privacidade poderá ser atualizada a qualquer momento, especialmente em situações como:
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Mudanças na legislação aplicável;</li>
                    <li>Atualizações nas funcionalidades da plataforma {platform};</li>
                    <li>Alterações nos sistemas e integrações externas.</li>
                </ul>

                <p>
                    Recomenda-se que os usuários consultem periodicamente a versão mais recente da Política, disponível no rodapé da plataforma.
                </p>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">13. Incidentes de Segurança</h2>

                <p>
                    Em caso de incidente de segurança envolvendo dados pessoais, a {platform} adotará as seguintes providências:
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Notificação aos titulares dos dados e à Autoridade Nacional de Proteção de Dados (ANPD) no prazo máximo de 72 horas, conforme previsto no Art. 48 da LGPD;</li>
                    <li>Implementação imediata de medidas de contenção e mitigação para reduzir eventuais danos.</li>
                </ul>
            </Alert>

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">14. Transferência Internacional de Dados</h2>

                <p>
                    Caso a transferência internacional de dados seja necessária, a plataforma {platform} assegurará que:
                </p>

                <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>O país de destino possua um nível de proteção de dados pessoais considerado adequado pelas autoridades competentes;</li>
                    <li>Haja garantias contratuais firmadas entre as partes, que assegurem o sigilo e a proteção dos dados, conforme estabelece o Art. 33 da LGPD.</li>
                </ul>
            </Alert>


            {version ? (
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Fale Conosco</h2>
                    <p>
                        Tem dúvidas, sugestões ou quer falar sobre seus dados? Estamos sempre por aqui!
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3">

                            <div>
                                <p className="font-semibold">Controlador:</p>
                                <p>Universidade Federal de Minas Gerais (UFMG)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">

                            <div>
                                <p className="font-semibold">Unidade Responsável:</p>
                                <p>Escola de Engenharia – UFMG</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">

                            <div>
                                <p className="font-semibold">Equipe Conectee:</p>
                                <a href="mailto:conectee@eng.ufmg.br" className="underline">conectee@eng.ufmg.br</a>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">

                            <div>
                                <p className="font-semibold">Encarregado (DPO):</p>
                                <a href="mailto:ti@eng.ufmg.br" className="underline">ti@eng.ufmg.br</a>
                            </div>
                        </div>
                    </div>
                </Alert>
            ) : (
                <Alert className="space-y-4 p-8">
                    <h2 className="text-2xl font-semibold">Fale Conosco</h2>
                    <p>
                        Tem dúvidas, sugestões ou quer falar sobre seus dados? Estamos sempre por aqui!
                    </p>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex items-center gap-3">

                            <div>
                                <p className="font-semibold">Controlador:</p>
                                <p>SECTI</p>
                            </div>
                        </div>




                        <div className="flex items-center gap-3">

                            <div>
                                <p className="font-semibold">Encarregado (DPO):</p>
                                <a href="mailto:observatorio@secti.ba.gov.br" className="underline">observatorio@secti.ba.gov.br</a>
                            </div>
                        </div>
                    </div>
                </Alert>
            )}

            <Alert className="space-y-4 p-8">
                <h2 className="text-2xl font-semibold">Disposições Finais</h2>
                <p>
                    Ao utilizar a plataforma {platform} o usuário declara estar ciente dos termos desta Política de Privacidade e autoriza, de forma informada e transparente, o tratamento de seus dados nos moldes aqui descritos.
                </p>
                <p className="font-semibold">Obrigado por confiar na plataforma {platform}! 💙</p>
            </Alert>

        </div>
    </main>
    );
}
