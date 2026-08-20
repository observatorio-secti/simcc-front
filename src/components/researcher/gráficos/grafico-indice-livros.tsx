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
  ChartLegend,
  ChartLegendContent,
} from '../../../components/ui/chart';

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

type BooksAndChaptersProps = {
  articles: Dados[];
  pesosProducao: PesosProducao;
};

const chartConfig = {
  livro: { label: 'Livro', color: '#792F4C' },
  cap_livro: { label: 'Capítulo de livro', color: '#DBAFD0' },
} satisfies ChartConfig;

export function GraficoIndiceBooksAndChapters(props: BooksAndChaptersProps) {
  const [chartData, setChartData] = useState<
    { year: string; livro: number; cap_livro: number }[]
  >([]);
  console.log(props.pesosProducao);
  useEffect(() => {
    if (props.articles && props.pesosProducao) {
      const pesos: PesosProducao = props.pesosProducao;

      // Convert weights to numbers, handle the format of the string values
      const pesosNumericos = {
        livro: isNaN(parseFloat(pesos.book)) ? 0 : parseFloat(pesos.book),
        cap_livro: isNaN(parseFloat(pesos.book_chapter))
          ? 0
          : parseFloat(pesos.book_chapter),
      };

      // Compute weighted sums
      const counts: { [year: string]: { livro: number; cap_livro: number } } =
        {};

      props.articles.forEach((publicacao) => {
        const year = publicacao.year.toString();
        const { count_book, count_book_chapter } = publicacao;

        // Only include years where count_book or count_book_chapter are greater than 0
        if (count_book > 0 || count_book_chapter > 0) {
          if (!counts[year]) {
            counts[year] = { livro: 0, cap_livro: 0 };
          }

          // Update weighted values
          counts[year].livro += count_book * pesosNumericos.livro;
          counts[year].cap_livro +=
            count_book_chapter * pesosNumericos.cap_livro;
        }
      });

      // Prepare data for chart
      const data = Object.entries(counts).map(([year, values]) => ({
        year,
        livro: values.livro,
        cap_livro: values.cap_livro,
      }));

      setChartData(data);
    }
  }, [props.articles, props.pesosProducao]);

  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
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
          <ChartLegend content={<ChartLegendContent />} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />
          <Bar
            dataKey="livro"
            radius={4}
            fill={chartConfig['livro'].color}
            stackId="a"
          >
            <LabelList
              position="top"
              formatter={(value) => (value ? value.toFixed(2) : '0')}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar
            dataKey="cap_livro"
            radius={4}
            fill={chartConfig['cap_livro'].color}
            stackId="a"
          >
            <LabelList
              position="top"
              formatter={(value) => (value ? value.toFixed(2) : '0')}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
