import { Book, Briefcase, Code2, Copyright, File, FolderKanban, Globe, GraduationCap, Info, Mail, MapPinIcon, Phone, SquareArrowOutUpRight, Star, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { HeaderResultTypeHome } from "../homepage/categorias/header-result-type-home";
import { InfiniteMovingResearchers } from "../ui/infinite-moving-researcher";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { UserContext } from "../../context/context";
import { Link, useLocation } from "react-router-dom";
import { InfiniteMovingArticle } from "../ui/infinite-moving-article";
import { Books, Code, DotsThree, Quotes, StripeLogo } from "phosphor-react";
import { InfiniteMovingProductions } from "../ui/infinite-moving-productions";
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

import { GraficoTitulacaoHome } from "../homepage/components/grafico-titulacao";
import { PreviewBuilderPage } from "../dashboard/builder-page/preview";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Keepo } from "../dashboard/builder-page/builder-page";
import { TabelaQualisQuantidade } from "./graficos-tabelas/tabela-qualis-quantidade";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Label } from "../ui/label";


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
  keepoData: Keepo
}

interface GraduateProgram {
  area: string;
  code: string;
  graduate_program_id: string;
  name_en: string;
  cooperation_project: string;
  basic_area: string;

  coordinator: string;
  email: string;
  start: string;
  phone: string;
  periodicity: string;

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
  research_project: string
}


type Dados = {
  count_article: number
  count_book: number
  count_book_chapter: number,
  count_guidance: number
  count_patent: number
  count_research_project: number
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


  //


  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);

  const urlTermPublicacoes = urlGeral + `recently_updated?year=${new Date().getFullYear() - 4}&university=&graduate_program_id=${type_search}`
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

  const [totalProducao, setTotalProducao] = useState<Total>();

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
          setTotalProducao(data[0]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTotalProgram]);



  //
  const [dados, setDados] = useState<Dados[]>([]);
  const [year, setYear] = useState(new Date().getFullYear() - 4);

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear; i > currentYear - 30; i--) {
    years.push(i);
  }


  let urlDados = `${urlGeral}ResearcherData/DadosGerais?year=${year}&graduate_program_id=${type_search}`
  console.log('(urlDados', urlDados)
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
            'Content-Type': 'text/plain',
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
          weight: '200',
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
        colors: ['#559FB8', '#2D7597', '#004B76'],

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

  //////////////////////////////// KEEPO PAGE

  const [anos, setAnos] = useState<number[]>([]);
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);


  return (
    <main className="h-full w-full flex flex-col px-4 md:px-8 pb-4 md:pb-8">
      {(props.program.email || props.program.site || props.program.phone) && (
        <Alert className="mb-8">
          <div className="flex flex-wrap gap-3">
            {props.program.email && (
              <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Mail size={12} />{props.program.email}</div>
            )}

            {props.program.site && (
              <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Globe size={12} />{props.program.site}</div>
            )}

            {props.program.phone && (
              <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Phone size={12} />{props.program.phone}</div>
            )}
          </div>
        </Alert>
      )}

      <div>



        <Alert className="rounded-b-none border-b-0 dark:bg-neutral-700 bg-neutral-100">
          <Info className="h-4 w-4" />
          <AlertTitle>Interpretação dos dados</AlertTitle>
          <AlertDescription className="text-xs">
            Os dados exibidos na plataforma <strong>{version ? ('Conectee') : ('Simcc')}</strong> consideram apenas os <strong>pesquisadores ativos</strong>. Métricas como <strong>"Total de livros"</strong> refletem a produção dos docentes atualmente cadastrados, e não o histórico completo.
          </AlertDescription>
        </Alert>

        <Alert className="flex rounded-t-none flex-col md:grid gap-3 lg:grid-cols-4 grid-cols-2">

          <div>
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
                {totalProducao?.article || 0}
              </span>
            </CardContent>

          </div>


          <div>
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
                {totalProducao?.book || 0}
              </span>
            </CardContent>
          </div>

          <div>
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
                {totalProducao?.book_chapter || 0}
              </span>
            </CardContent>

          </div>


          <div>
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
                {totalProducao?.patent || 0}
              </span>
            </CardContent>
          </div>

          <div>
            <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
              <div>
                <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                  Total de marcas
                </CardTitle>

              </div>

              <StripeLogo className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="font-bold leading-none text-3xl">
                {totalProducao?.brand || 0}
              </span>
            </CardContent>
          </div>


          <div>
            <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
              <div>
                <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                  Total de softwares
                </CardTitle>

              </div>

              <Code2 className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="font-bold leading-none text-3xl">
                {totalProducao?.software || 0}
              </span>
            </CardContent>
          </div>

          <div>
            <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
              <div>
                <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                  Total de trabalhos em evento
                </CardTitle>

              </div>

              <Briefcase className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="font-bold leading-none text-3xl">
                {totalProducao?.work_in_event || 0}
              </span>
            </CardContent>
          </div>

          <div>
            <CardHeader className="flex flex-row items-center pb-2 justify-between space-y-0">
              <div>
                <CardTitle className="text-[0.9rem] md:text-sm font-medium">
                  Total de proj. de pesquisa
                </CardTitle>

              </div>

              <FolderKanban className="h-4 w-4 text-muted-foreground" />

            </CardHeader>

            <CardContent>
              <span className="font-bold leading-none text-3xl">
                {totalProducao?.research_project || 0}
              </span>
            </CardContent>
          </div>



        </Alert>
      </div>

      <div className="flex flex-col mt-8 md:gap-8 gap-4">
        <div
          className="
            flex w-full flex-wrap gap-8
            
            lg:grid lg:grid-cols-3
          "
        >
          <Alert className="lg:col-span-2 h-fitl lg:h-full p-0 w-full">
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

          <div className="flex gap-8 w-full lg:h-full md:h-fit">
            <Alert className="p-0 w-full">
              <CardHeader className="flex p-10 flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">
                    Total de pesquisadores por titulação
                  </CardTitle>
                  <CardDescription>no programa</CardDescription>

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
                <GraficoTitulacaoHome />
              </CardContent>

            </Alert>
          </div>
        </div>

        <div
          className="
            flex flex-wrap gap-8 h-fit

            md:grid md:grid-cols-2

            lg:grid-cols-3
          "
        >

          <Alert className="h-fit min-w-[40%] mt-4 lg:mt-0">
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
                <CardDescription>Avaliação Qualis Sucupira</CardDescription>
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

        <Accordion type="single" collapsible className="hidden md:flex ">
          <AccordionItem value="item-1" className="w-full ">
            <div className="flex mb-2">
              <HeaderResultTypeHome title="Outros indicadores" icon={<DotsThree size={24} className="text-gray-400" />}>
              </HeaderResultTypeHome>

              <AccordionTrigger>

              </AccordionTrigger>
            </div>
            <AccordionContent className="p-0">
              <div>
                <Alert className="lg:col-span-2">
                  <CardHeader className="flex flex-row mb-4 items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-sm font-medium">
                        Quantidade de artigos por Qualis e número de citações por pesquisador
                      </CardTitle>
                      <CardDescription>
                        Distribuição dos artigos por classificação Qualis e total de citações associadas a cada pesquisador.
                      </CardDescription>
                    </div>

                    <div className="flex gap-4 items-center">

                      <div className="flex items-center gap-2">
                        <Label htmlFor="year" className="text-sm font-medium">
                          Selecione o ano:
                        </Label>
                        <Select value={String(anoSelecionado) ?? ""} onValueChange={(value) => setAnoSelecionado(Number(value))}>
                          <SelectTrigger className="gap-3 w-fit">
                            <SelectValue placeholder="Ano" />
                          </SelectTrigger>
                          <SelectContent>
                            {anos.map((ano) => (
                              <SelectItem value={String(ano)}>{ano}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <TooltipProvider>

                        <Tooltip>
                          <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                          <TooltipContent>
                            <p>Fonte: Plataforma Lattes e Sucupira Qualis</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>

                  </CardHeader>

                  <CardContent className="flex py-0 flex-1  items-center justify-center">
                    <TabelaQualisQuantidade
                      anoSelecionado={anoSelecionado}
                      setAnoSelecionado={setAnoSelecionado}
                      setAnos={setAnos}
                    />
                  </CardContent>

                </Alert>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>


      </div>


      {props.keepoData.content.length > 0 && (
        <div className="mt-8">
          <PreviewBuilderPage keepoData={props.keepoData} />
        </div>
      )}


    </main>
  )
}


