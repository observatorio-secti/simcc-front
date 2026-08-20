import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LabelList,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../components/ui/chart';

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

  book: string;
  book_chapter: string;
  software: string;
};

type Articles = {
  articles: Dados[];
  pesosProducao: PesosProducao;
};

const chartConfig = {
  totalArticles: { label: 'Total Artigos', color: '#006837' },
  totalBooks: { label: 'Total Livros', color: '#8FC53E' },
  totalChapters: { label: 'Total Capítulos de Livros', color: '#ACC483' },
} satisfies ChartConfig;

export function GraficoIndiceProdBibli(props: Articles) {
  const [chartData, setChartData] = useState<
    {
      year: string;
      totalArticles: number;
      totalBooks: number;
      totalChapters: number;
    }[]
  >([]);

  useEffect(() => {
    if (props.articles && props.pesosProducao) {
      const pesosNumericos: { [key: string]: number } = {
        A1: parseFloat(props.pesosProducao.a1) || 0,
        A2: parseFloat(props.pesosProducao.a2) || 0,
        A3: parseFloat(props.pesosProducao.a3) || 0,
        A4: parseFloat(props.pesosProducao.a4) || 0,
        B1: parseFloat(props.pesosProducao.b1) || 0,
        B2: parseFloat(props.pesosProducao.b2) || 0,
        B3: parseFloat(props.pesosProducao.b3) || 0,
        B4: parseFloat(props.pesosProducao.b4) || 0,
        C: parseFloat(props.pesosProducao.c) || 0,
        SQ: parseFloat(props.pesosProducao.sq) || 0,
        livro: parseFloat(props.pesosProducao.book) || 0,
        cap_livro: parseFloat(props.pesosProducao.book_chapter) || 0,
      };

      const counts: {
        [year: string]: {
          totalArticles: number;
          totalBooks: number;
          totalChapters: number;
        };
      } = {};

      props.articles.forEach((publicacao) => {
        const year = publicacao.year.toString();
        const {
          A1,
          A2,
          A3,
          A4,
          B1,
          B2,
          B3,
          B4,
          C,
          SQ,
          count_book,
          count_book_chapter,
        } = publicacao;
        const qualisData = { A1, A2, A3, A4, B1, B2, B3, B4, C, SQ };

        if (!counts[year]) {
          counts[year] = { totalArticles: 0, totalBooks: 0, totalChapters: 0 };
        }

        // Calcular o  por Qualis
        let totalArticles = 0;

        Object.keys(qualisData).forEach((qualisKey) => {
          const weight =
            pesosNumericos[qualisKey as keyof typeof pesosNumericos];
          if (!isNaN(weight) && weight > 0) {
            const value = qualisData[qualisKey as keyof typeof qualisData];
            if (value !== 0) {
              totalArticles += value * weight;
            }
          }
        });

        // Adicionar valores de livros e capítulos de livros separadamente
        const totalBooks = count_book * pesosNumericos.book;
        const totalChapters = count_book_chapter * pesosNumericos.book_chapter;

        counts[year].totalArticles += totalArticles;
        counts[year].totalBooks += totalBooks;
        counts[year].totalChapters += totalChapters;
      });

      const data = Object.entries(counts).map(
        ([year, { totalArticles, totalBooks, totalChapters }]) => ({
          year,
          totalArticles,
          totalBooks,
          totalChapters,
        }),
      );

      setChartData(data);
    }
  }, [props.articles, props.pesosProducao]);

  return (
    <ChartContainer config={chartConfig} className="mr-4 lg:mt-16">
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="year"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <CartesianGrid vertical={false} horizontal={false} />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />
          {Object.keys(chartConfig).map(
            (key) =>
              chartData.some((d) => d[key] > 0) && (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={chartConfig[key].color}
                  stackId="a"
                  radius={4}
                >
                  <LabelList
                    position="top"
                    formatter={(value) => (value ? value.toFixed(2) : '0')}
                    fontSize={12}
                    className="fill-foreground"
                  />
                </Bar>
              ),
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
