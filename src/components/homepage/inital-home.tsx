import { useContext, useEffect, useMemo, useState } from 'react';
import { UserContext } from '../../context/context';

import {
  ArrowRight,
  BarChartBig,
  Blocks,
  Download,
  GraduationCap,
  Info,
  List,
} from 'lucide-react';
import { useModalHomepage } from '../hooks/use-modal-homepage';

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
  teachers: CoutRt[];
  technician: CoutRt[];
}

interface CoutRt {
  count: number;
  rt: string;
}

interface GrupoPesquisa {
  nome_grupo: string;
  nome_lider: string;
  institution_id: string;
  area: string;
  ultimo_envio: string;
  situacao: string;
}

import { Link, useNavigate } from 'react-router-dom';

import { AreaChart, Area, LineChart, Line } from 'recharts';


import { ChartConfig, ChartContainer } from '../../components/ui/chart';

import Highcharts from 'highcharts';
import HC_wordcloud from 'highcharts/modules/wordcloud';

import { useTheme } from 'next-themes';
import { Search } from '../search/search';
import { useModalResult } from '../hooks/use-modal-result';

import { Helmet } from 'react-helmet';
import {
  useResearcherDadosGerais,
  useWordsResearcher,
} from './hooks/use-home-queries';




HC_wordcloud(Highcharts);

const chartConfig = {
  views: {
    label: 'Page Views',
  },
  producao_bibliografica: {
    label: 'Produção bibliográfica',
    color: 'hsl(var(--chart-1))',
  },
  producao_tecnica: {
    label: 'Produção técnica',
    color: 'hsl(var(--chart-2))',
  },
  count_article: {
    label: 'Artigos',
    color: 'hsl(var(--chart-2))',
  },
  count_book: {
    label: 'Livros',
    color: 'hsl(var(--chart-2))',
  },
  count_book_chapter: {
    label: 'Capítulos de livros',
    color: 'hsl(var(--chart-2))',
  },
  count_patent: {
    label: 'Patentes',
    color: 'hsl(var(--chart-2))',
  },
  count_brand: {
    label: 'Marcas',
    color: 'hsl(var(--chart-2))',
  },
  count_software: {
    label: 'Softwares',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function InitialHome() {
  const { setItensSelecionados } = useContext(UserContext);

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let i = currentYear; i > currentYear - 30; i--) {
    years.push(i);
  }

  const { data: dadosData = [] } = useResearcherDadosGerais(new Date().getFullYear() - 4);
  const dados = Array.isArray(dadosData) ? dadosData : [];
  const { data: wordsData = [] } = useWordsResearcher();
  const words = Array.isArray(wordsData) ? wordsData : [];

  const { theme } = useTheme();

  const [visibleChart, setVisibleChart] = useState(0);
  const chartKeys = [
    'count_article',
    'count_patent',
    'count_guidance_in_progress',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleChart((prev) => (prev + 1) % chartKeys.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [chartKeys.length]);

  const navigate = useNavigate();

  function handlePesquisaChange(term: string) {
    setItensSelecionados([{ term }]);

    navigate(`/resultados?type_search=article&terms=${term}`);
  }

  const { onOpen: onOpenResult } = useModalResult();

  return (
    <div className=" items-center  flex flex-col   ">
      <Helmet>
        <title>{`Página Inicial | ${'Simcc'}`}</title>
        <meta name="description" content={`Página Inicial | ${'Simcc'}`} />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="bg-cover  bg-no-repeat bg-center w-full">
        <div className="h-[0vh] z-[-1] opacity-30">
          <ChartContainer config={chartConfig} className="h-[75vh] w-full">
            <LineChart data={dados}>
              <defs>
                <linearGradient id="colorArticle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82AAC0" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#82AAC0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPatent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82AAC0" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#82AAC0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorGuidance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82AAC0" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#82AAC0" stopOpacity={0} />
                </linearGradient>
              </defs>

              {chartKeys.map((key, index) => {
                const isVisible = visibleChart === index;
                const strokeColor = theme === 'dark' ? '#404040' : '#A3A3A3';

                const strokeOpacity =
                  (chartKeys.length - index) / chartKeys.length;

                return (
                  !isVisible && (
                    <Line
                      key={key}
                      dataKey={key}
                      type="monotone"
                      stroke={strokeColor}
                      strokeWidth={6}
                      strokeOpacity={strokeOpacity}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )
                );
              })}
            </LineChart>
          </ChartContainer>

          <ChartContainer
            config={chartConfig}
            className="h-[75vh] w-full top-[-75vh] relative"
          >
            {chartKeys
              .map((key, index) => {
                if (visibleChart !== index) return null;

                const fillColor = `url(#color${key.split('_')[1][0].toUpperCase() + key.split('_')[1].slice(1)})`;
                return (
                  <AreaChart key={key} data={dados} className="absolute top-0">
                    <Area
                      dataKey={key}
                      type="monotone"
                      stroke={'#559FB8'}
                      fill={fillColor}
                      strokeWidth={6}
                      dot={false}
                    />
                  </AreaChart>
                );
              })
              .find((chart) => chart !== null) || <div />}
          </ChartContainer>
        </div>

        <div className="justify-center px-4 md:px-8 w-full mx-auto flex max-w-[1200px] flex-col items-center gap-2 py-4 md:py-6 md:pb-4 lg:py-12 lg:pb-8">
          <Link
            to={'/informacoes'}
            className="inline-flex z-[2] items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"
          >
            <Info size={12} />
            <div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>
            Saiba como utilizar a plataforma
            <ArrowRight size={12} />
          </Link>

                    <h1 className="z-[2] text-center max-w-[980px] text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]  md:block mb-4 ">
                        Descubra talentos científicos e{" "}
                        <strong className="bg-eng-blue  rounded-md px-3 pb-2 text-white font-medium">
                            {" "}
                            competências
                        </strong>{" "}
                        na Bahia.
                    </h1>
                    <p className="max-w-[750px] text-center text-lg font-light text-foreground"></p>

          <div className="lg:max-w-[60vw] lg:w-[60vw] w-full">
            <Search />
          </div>

          <div className="hidden md:flex flex-wrap gap-3 z-[2] w-full lg:w-[60vw]">
            {words.slice(0, 10).map((word, index) => (
              <div
                key={index}
                className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
                onClick={() => {
                  handlePesquisaChange(word.term);
                  onOpenResult('researchers-home');
                }}
              >
                {word.term}
              </div>
            ))}
          </div>

          <div className="flex md:hiddeen justify-center md:hidden flex-wrap gap-3 z-[3] w-full lg:hidden">
            {words.slice(0, 5).map((word, index) => (
              <div
                key={index}
                className={`flex gap-2 capitalize h-8 cursor-pointer transition-all bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 items-center p-2 px-3 rounded-md text-xs`}
                onClick={() => {
                  handlePesquisaChange(word.term);
                  onOpenResult('researchers-home');
                }}
              >
                {word.term}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
