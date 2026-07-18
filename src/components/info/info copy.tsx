import {   Building2, ChevronLeft, Copy,  Download,  FileJson, InfoIcon, Mail, MapPin } from "lucide-react";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { Duvidas } from "./duvidas";
import { useContext, useMemo, useState } from "react";
import { Alert } from "../ui/alert";
import { BracketsCurly, LinkSimple } from "phosphor-react";
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
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

    const {urlGeral} = useContext(UserContext)

    const handleVoltar = () => {
      history(-1);
    }

    const [log, setLog] = useState<Log[]>([]);

    let urlTermPesquisadores = `${urlGeral}logs`

    useMemo(() => {
      const fetchData = async () => {
          try {
         
            const response = await fetch(  urlTermPesquisadores, {
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

    const Box = (props:any) => {
        const isHexColor = props.color.includes('#');
        return (
          <div
            className={`w-full h-32 rounded-md whitespace-nowrap flex ${
              isHexColor ? '' : props.color
            }`}
            style={isHexColor ? { backgroundColor: props.color } : {}}
          ></div>
        );
      };

      const version = getVersion();


    const colaboradores = ColaboradoresData;

       const urlApi = `${urlGeral}researcherName?name=`
       const urlApi2 = `${urlGeral}bibliographic_production_researcher?terms=&researcher_id=&type=&qualis=&year=`


    return(
        <main className="flex flex-1 flex-col gap-4 md:gap-8 md:p-8 p-4">
           <Helmet>
          <title>Informações | {version ? ('Simcc'):('Simcc')}</title>
          <meta name="description" content={`Informações | ${version ? ('Conectee'):('Simcc')}`} />
          <meta name="robots" content="index, follow" />
        </Helmet>
            <Tabs defaultValue={'all'} className="h-full" >
            <div className="w-full  gap-4  pb-0 md:pb-0">
            <div className="flex items-center gap-4">
          
            <Button onClick={handleVoltar } variant="outline" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Voltar</span>
              </Button>
          
              <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                Informações
              </h1>
             

                
            
              <div className="hidden items-center gap-2 md:ml-auto md:flex">
              <TabsList >
                
              <TabsTrigger value="all" className="text-zinc-600 dark:text-zinc-200">Sobre a plataforma</TabsTrigger>
              <TabsTrigger value="doc" className="text-zinc-600 dark:text-zinc-200">Dicionário de dados </TabsTrigger>


              
                </TabsList>
               
          
             
              </div>
            </div>

            </div>

            <TabsContent value="all" className="flex flex-col gap-4 md:gap-8">

              <Alert className="h-[300px] flex items-center justify-center">
              <h1 className="z-[2] text-center max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
            Saiba as informações sobre
            a plataforma
            </h1>
              </Alert>

                <Duvidas/>



                <h3 className="text-2xl font-medium ">Colaboradores</h3>

                <div className="grid 2xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
                    {colaboradores.map((props) => (
                        <Alert className="flex gap-3 p-8">

                            <div className="flex flex-1 flex-col">
                             <div className="mb-8">
                             <p className="text-lg  font-medium">{props.name}</p>
                             <div className="flex gap-2 items-center text-sm text-gray-500"><Building2 size={12}/>{props.inst}</div>
                             </div>

                                <div className="flex gap-4 flex-wrap">
                                  <Link to={props.lattes} target="_blank">  <div className="flex gap-2 items-center text-xs"><LinkSimple size={12}/>Currículo Lattes</div></Link>
                                    {props.mail != "" && (
                                        <div className="flex gap-2 items-center text-xs"><Mail size={12}/>{props.mail}</div>
                                    )}
                                </div>
                            </div>
                        </Alert>
                    ))}
                </div>

                <h3 className="text-2xl font-medium ">Sobre a plataforma</h3>
                <div className="">
            <div
                    className={`h-3 w-full rounded-t-md dark:border-neutral-800 border border-neutral-200 border-b-0 bg-[#719CB8]  `}
                  ></div>
  
              <Alert
                        className="p-0 rounded-t-none"  x-chunk="dashboard-05-chunk-4"
                      >
                         <CardHeader className="flex flex-row items-start bg-neutral-100 dark:bg-neutral-800">
                         <div className='flex gap-2 items-center text-sm text-gray-500'>
  O Simcc é uma plataforma desenvolvida para centralizar e visualizar de forma abrangente os dados dos pesquisadores da instituição. Integrando informações de diversas fontes, como Lattes, Sucupira, Diretório dos Grupos de Pesquisa (DGP), OpenAlex e Journal Citation Reports (JCR), o Simcc oferece uma visão detalhada e acessível das competências e produções acadêmicas. Todas as informações de produção bibliográfica e técnica apresentadas foram retiradas da Plataforma Lattes com autorização do CNPq e OpenAlex.
</div>

                         </CardHeader>

                         <CardContent className="p-6 text-sm">
                         <div className="flex flex-col gap-3">

               <div className='flex gap-2 items-center text-sm text-gray-500 font-medium'>Mapeamento de Produções Acadêmicas:</div>
               <div className='flex gap-2 items-center text-sm text-gray-500'>
                 <ul>
               <li>Artigos Científicos: Detalhamento com informações como Qualis, JCR, DOI, autores e resumo.</li>
                 <li>Livros e Capítulos: Informações sobre Nome do livro, título,ano</li>
                 <li>Propriedade Intelectual: Patentes, marcas, e softwares desenvolvidos.</li>
                 <li>Participação em eventos: Participações e contribuições e eventos acadêmicos.</li>
                 <li>Relatórios Técnicos Participações e contribuições e eventos acadêmicos.</li>
                 <li>Orientações: Participações e contribuições e eventos acadêmicos.</li>
                 </ul>
                 
                 </div>
                 <div className='flex gap-2 items-center text-sm text-gray-500'>A plataforma possui operadores booleanos de busca (E ou OU) e é capaz de fazer buscas a partir de perguntas com processamento de linguagem natural</div>
             
               <div className='flex gap-2 items-center text-sm text-gray-500'>Versão da plataforma: {version}</div>
               </div>

                         </CardContent>
              </Alert>
            </div>

            <h3 className="text-2xl font-medium ">Atualização dos dados</h3>

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

                
                <h3 className="text-2xl font-medium ">Suporte</h3>


                <div className="flex flex-col gap-3">
                <div className='flex gap-2 items-center text-sm text-gray-500'><MapPin size={16}/> {version ? ('Av. Luís Viana Filho, 5ª Avenida, Plataforma II, B, 1º andar - CAB, Salvador-BA,41745-004'):(' Av. Orlando Gomes, 1845 - Piatã, Salvador - BA, 41650-010')}</div>
                <div className='flex gap-2 items-center text-sm text-gray-500'><Mail size={16}/> {version ? ('observatorio@secti.ba.gov.br'):('o SECTI-BA')}</div>
                </div>
            </TabsContent>

            <TabsContent value="doc" className="flex flex-col gap-4 md:gap-8">
            <h3 className="text-2xl font-medium ">Dicionário de chamadas</h3>

            <Alert className=" bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(${bg_popup})` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Documento
                  </CardTitle>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <div className="flex gap-6 justify-between">

                  <CardContent>
                    <div className="text-2xl font-bold">Tenha acesso a lista de definições e atributos do banco de dados</div>
                    <div className="flex gap-3 mt-3">

                     <Link to={`${urlGeral}dictionary.pdf`}>
                     <Button size={'sm'} ><Download size={16} />Dicionário de dados</Button>
                     </Link>
                    </div>
                  </CardContent>

                  <div></div>
                </div>
              </Alert>

             
<Colors/>
            </TabsContent>
                </Tabs>
        </main>
    )
}