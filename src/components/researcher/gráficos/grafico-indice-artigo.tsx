import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

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

  livro: string;
  cap_livro: string;
  software: string;
};

type Articles = {
  articles: Dados[];
  pesosProducao: PesosProducao;
};

type ChartDataItem = {
  year: string;
  total: number;
  [qualis: string]: string | number;
};

const chartConfig = {
  A1: { label: "Qualis A1", color: "#006837" },
  A2: { label: "Qualis A2", color: "#8FC53E" },
  A3: { label: "Qualis A3", color: "#ACC483" },
  A4: { label: "Qualis A4", color: "#BDC4B1" },
  B1: { label: "Qualis B1", color: "#F15A24" },
  B2: { label: "Qualis B2", color: "#F5831F" },
  B3: { label: "Qualis B3", color: "#F4AD78" },
  B4: { label: "Qualis B4", color: "#F4A992" },
  C: { label: "Qualis C", color: "#EC1C22" },
  SQ: { label: "Sem qualis", color: "#560B11" },
} satisfies ChartConfig;

export function GraficoIndiceArticle(props: Articles) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

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
      };

      const counts: { [year: string]: { [qualis: string]: number } } = {};

      props.articles.forEach((publicacao) => {
        const year = publicacao.year?.toString() || "Unknown";
        const {
          A1 = 0,
          A2 = 0,
          A3 = 0,
          A4 = 0,
          B1 = 0,
          B2 = 0,
          B3 = 0,
          B4 = 0,
          C = 0,
          SQ = 0,
        } = publicacao;
        const qualisData = { A1, A2, A3, A4, B1, B2, B3, B4, C, SQ };

        if (!counts[year]) {
          counts[year] = {};
        }

        Object.keys(qualisData).forEach((qualisKey) => {
          const weight = pesosNumericos[qualisKey];
          if (!isNaN(weight) && weight > 0) {
            const value = qualisData[qualisKey as keyof typeof qualisData] || 0;
            counts[year][qualisKey] = (counts[year][qualisKey] || 0) + value * weight;
          }
        });
      });

      const data: ChartDataItem[] = Object.entries(counts).map(([year, qualisCounts]) => {
        const total = Object.values(qualisCounts).reduce((sum, val) => sum + val, 0);
        return { year, ...qualisCounts, total };
      });

      setChartData(data.sort((a, b) => a.year.localeCompare(b.year)));
    }
  }, [props.articles, props.pesosProducao]);

  const availableQualis = Object.keys(chartConfig);

  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <CartesianGrid vertical={false} horizontal={false} />
          <ChartLegend className="flex flex-wrap" content={<ChartLegendContent />} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

          {/* Renderiza as barras empilhadas */}
          {availableQualis.map((key) => (
            <Bar key={key} dataKey={key} fill={chartConfig[key].color} stackId="a" radius={4}>
              {/* Renderizar SOMENTE a soma total de cada barra no topo, uma única vez */}
              <LabelList
                dataKey="total"
                position="top"
                fontSize={12}
                formatter={(value) => {
                  const isLastBar = key === availableQualis[availableQualis.length - 1];
                  return isLastBar && value > 0 ? value.toFixed(2) : "";
                }}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
