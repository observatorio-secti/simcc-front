import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { GraduationCap, Info, MapPin, User } from 'lucide-react';

import { FilterYearIndicators } from './filter-year-indicators';
import { PuzzlePiece } from 'phosphor-react';
import { Skeleton } from '../ui/skeleton';
import { TabelaQualisQuantidadeResarcher } from './gráficos/tabela-qualis-quantidade-researcher';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { GraficoQtdArtigoAno } from './gráficos/grafico-qtd-artigo-ano';
import { GraficoQtdLivrosCapitulos } from './gráficos/grafico-qtd-livros-ano';
import { GraficoQtdCitacoesAno } from './gráficos/grafico-qtd-citacoes-ano';
import { GraficoQtdOrientacoes } from './gráficos/grafico-qtd-orientacoes';
import { GraficoQtdProducaoTecnica } from './gráficos/grafico-qtd-producao-tecnica';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

type Dados = {
  count_article: number;
  count_book: number;
  count_book_chapter: number;
  count_guidance: number;
  count_patent: number;
  count_report: number;
  count_software: number;
  count_guidance_complete: number;
  count_guidance_in_progress: number;
  count_patent_granted: number;
  count_patent_not_granted: number;
  count_brand: number;
  graduantion: string;
  year: number;

  A1: number;
  A2: number;
  A3: number;
  A4: number;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
  C: number;
  SQ: number;
};

type Research = {
  among: number;
  articles: number;
  book: number;
  book_chapters: number;
  id: string;
  name: string;
  university: string;
  lattes_id: string;
  area: string;
  lattes_10_id: string;
  abstract: string;
  city: string;
  orcid: string;
  image: string;
  graduation: string;
  patent: string;
  software: string;
  brand: string;
  lattes_update: Date;
  entradanaufmg: Date;

  h_index: string;
  relevance_score: string;
  works_count: string;
  cited_by_count: string;
  i10_index: string;
  scopus: string;
  openalex: string;

  subsidy: Bolsistas[];
  graduate_programs: GraduatePrograms[];
  departments: Departments[];
  research_groups: ResearchGroups[];

  cargo: string;
  clas: string;
  classe: string;
  rt: string;
  situacao: string;

  year_filter: string;
};

interface Bolsistas {
  aid_quantity: string;
  call_title: string;
  funding_program_name: string;
  modality_code: string;
  category_level_code: string;
  institute_name: string;
  modality_name: string;
  scholarship_quantity: string;
}

interface GraduatePrograms {
  graduate_program_id: string;
  name: string;
}

interface Departments {
  dep_des: string;
  dep_email: string;
  dep_nom: string;
  dep_id: string;
  dep_sigla: string;
  dep_site: string;
  dep_tel: string;
  img_data: string;
}

interface ResearchGroups {
  area: string;
  group_id: string;
  name: string;
}

export function ResearcherIndicators(props: Research) {
  type Filter = {
    year: number[];
    qualis: string[];
  };

  const [filters, setFilters] = useState<Filter[]>([]);

  // Função para lidar com a atualização de researcherData
  const handleResearcherUpdate = (newResearcherData: Filter[]) => {
    setFilters(newResearcherData);
  };

  const yearString = filters.length > 0 ? filters[0].year.join(';') : '';

  const { urlGeral } = useContext(UserContext);

  const urlDados = `${urlGeral}researcher/DadosGerais?researcher_id=${props.id}&year=${yearString}`;

  const [loading, isLoading] = useState(false);
  const [dados, setDados] = useState<Dados[]>([]);
  console.log(urlDados);
  useEffect(() => {
    const fetchData = async () => {
      try {
        isLoading(true);
        const response = await fetch(urlDados, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });
        const data = await response.json();

        console.log('DADOS GERAIS: ', data);
        if (data) {
          setDados(data);
          isLoading(false);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlDados]);

  return (
    <div>
      <div className="w-full mt-8 mb-8 flex items-center gap-6 md:gap-8 overflow-x-scroll">
        <Avatar className="cursor-pointer rounded-2xl h-28 w-28">
          <AvatarImage
            className={'rounded-md h-28 w-28'}
            src={`${urlGeral}ResearcherData/Image?name=${props.name}`}
          />
          <AvatarFallback className="flex items-center justify-center">
            <User size={16} />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col w-[60%] md:w-full">
          <h1 className="flex flex-wrap font-medium leading-tight tracking-tighter text-xl md:text-3xl lg:leading-[1.1]  md:block mb-3 ">
            Índices de produção de {props.name}
          </h1>
          <ScrollArea>
            <div
              className="
                flex w-full flex-1 whitespace-nowrap overflow-x-auto items-center gap-3 my-2 pb-1
              "
            >
              {props.area != null &&
                props.area.split(';').map((value, index) => (
                  <li
                    key={index}
                    className={`
                      py-2 whitespace-nowrap px-4 rounded-md text-xs font-bold flex gap-2 text-white items-center
                      ${
                        value.includes('CIENCIAS AGRARIAS')
                          ? 'bg-red-400'
                          : value.includes('CIENCIAS EXATAS E DA TERRA')
                            ? 'bg-green-400'
                            : value.includes('CIENCIAS DA SAUDE')
                              ? 'bg-[#20BDBE]'
                              : value.includes('CIENCIAS HUMANAS')
                                ? 'bg-[#F5831F]'
                                : value.includes('CIENCIAS BIOLOGICAS')
                                  ? 'bg-[#EB008B]'
                                  : value.includes('ENGENHARIAS')
                                    ? 'bg-[#FCB712]'
                                    : value.includes(
                                          'CIENCIAS SOCIAIS APLICADAS',
                                        )
                                      ? 'bg-[#009245]'
                                      : value.includes(
                                            'LINGUISTICA LETRAS E ARTES',
                                          )
                                        ? 'bg-[#A67C52]'
                                        : value.includes('OUTROS')
                                          ? 'bg-[#1B1464]'
                                          : 'bg-[#000]'
                      }
                    `}
                  >
                    <PuzzlePiece size={12} className="text-white" />{' '}
                    {value.trim()}
                  </li>
                ))}
              {props.graduation != '' && (
                <div
                  className={`bg-blue-700 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center`}
                >
                  <GraduationCap size={12} className="textwhite" />{' '}
                  {props.graduation}
                </div>
              )}
              {props.city != 'None' && (
                <div className="bg-blue-700 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center">
                  <MapPin size={12} className="textwhite" /> {props.city}
                </div>
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      <FilterYearIndicators onFilterUpdate={handleResearcherUpdate} />
      {loading ? (
        <div className="grid lg:grid-cols-3 gap-4 md:gap-8">
          <Skeleton className="h-[400px] rounded-md lg:col-span-3"></Skeleton>
          <Skeleton className="h-[500px] rounded-md lg:col-span-3"></Skeleton>
          <Skeleton className="h-[400px] rounded-md "></Skeleton>
          <Skeleton className="h-[400px] rounded-md lg:col-span-2"></Skeleton>
        </div>
      ) : (
        <div>
          <div>
            <h2 className="text-2xl font-medium mb-8">Artigos qualificados</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">

              <Alert className=" h-[400px] ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Quantidade de citações por ano
                    </CardTitle>
                    <CardDescription>
                      Análise de citações por ano
                    </CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {' '}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent>
                  <CardContent className="mt-4 p-0">
                    <GraficoQtdCitacoesAno id={props.id} />
                  </CardContent>
                </CardContent>
              </Alert>

              <Alert className=" h-full lg:col-span-2 ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Quantidade de artigos por ano
                    </CardTitle>
                    <CardDescription>
                      Análise de produção por ano do pesquisador
                    </CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {' '}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="mt-4">
                  <GraficoQtdArtigoAno articles={dados} />
                </CardContent>
              </Alert>

              <Alert className="hidden md:block lg:col-span-3 ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Tabela de quantidade de citações e atigos com qualis por
                      ano
                    </CardTitle>
                    <CardDescription>Soma total do pesquisador</CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {' '}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="mt-4">
                  <TabelaQualisQuantidadeResarcher
                    graduate_program_id={props.id}
                    year={yearString}
                  />
                </CardContent>
              </Alert>
            </div>
          </div>

          <div className="w-full">
            <h2 className="text-2xl font-medium my-8 ">
              Livros e capítulos de livros
            </h2>
            <div className="grid grid-cols-1 gap-4 md:gap-8">
              <Alert className=" h-full ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Quantidade de livros e capítulos de livro por ano
                    </CardTitle>
                    <CardDescription>
                      Análise da quantidade de produção por ano
                    </CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {' '}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>

                <CardContent className="mt-4">
                  <GraficoQtdLivrosCapitulos articles={dados} />
                </CardContent>
              </Alert>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-medium my-8 ">Produção técnica</h2>
            <div className="grid grid-cols-1 gap-4 md:gap-8">
              <Alert className=" h-[400px] ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Quantidade de produções técnicas
                    </CardTitle>
                    <CardDescription>
                      Análise da quantidade de prod. técnicas
                    </CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {' '}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent>
                  <CardContent className="mt-4 p-0">
                    <GraficoQtdProducaoTecnica producoes_tecnicas={dados} />
                  </CardContent>
                </CardContent>
              </Alert>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-medium my-8 ">Orientações</h2>
            <div className="flex  gap-4 md:gap-8">
              <Alert className=" h-full lg:col-span-3 ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Quantidade de orientações de IC, Mestrado e Doutorado por
                      ano
                    </CardTitle>
                    <CardDescription>
                      Finalizados e em andamento
                    </CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {' '}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="mt-4">
                  <GraficoQtdOrientacoes id_pesquisador={props.id} />
                </CardContent>
              </Alert>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-medium my-8 ">Outros gráficos</h2>
            <div className="grid lg:grid-cols-1 gap-4 md:gap-8">
              <Alert className=" h-full  ">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                      Quantidade total de todas produções
                    </CardTitle>
                    <CardDescription>
                      Soma individual de todas as produções individuais do
                      pesquisador
                    </CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        {' '}
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="mt-4"></CardContent>
              </Alert>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
