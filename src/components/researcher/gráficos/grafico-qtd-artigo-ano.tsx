import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Label } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../ui/chart";

type Dados = {
  count_article?: number;
  count_book?: number;
  count_book_chapter?: number;
  count_guidance?: number;
  count_patent?: number;
  count_report?: number;
  count_software?: number;
  count_guidance_complete?: number;
  count_guidance_in_gress?: number;
  count_patent_granted?: number;
  count_patent_not_granted?: number;
  count_brand?: number;
  graduantion?: string;
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

type ChartDataItem = {
  year: string;
  total: number;
  [qualis: string]: string | number;
};

const chartConfig: ChartConfig = {
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
};

export function GraficoQtdArtigoAno(props: { articles: Dados[] }) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);

  useEffect(() => {
    if (props.articles) {
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

        Object.entries(qualisData).forEach(([key, value]) => {
          counts[year][key] = (counts[year][key] || 0) + value;
        });
      });

      const data = Object.entries(counts).map(([year, qualisCounts]) => ({
        year,
        total: Object.values(qualisCounts).reduce((a, b) => a + b, 0),
        ...qualisCounts,
      }));

      data.sort((a, b) => a.year.localeCompare(b.year));

      setChartData(data);
    }
  }, [props.articles]);

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
          {availableQualis.map((key) => {
            const hasData = chartData.some((d) => typeof d[key] === "number" && d[key] > 0);

            if (!hasData) return null;

            return (
              <Bar key={key} dataKey={key} fill={chartConfig[key].color} stackId="a" radius={[2, 2, 2, 2]} >

                {/* Colocando o total acima de todas as barras empilhadas */}
                <LabelList
                  dataKey="total"
                  position="top" // Posicionando o total no topo de todas as barras empilhadas
                  className="fill-foreground"
                  fontSize={12}
                  formatter={(value) => (value ? value.toFixed(0) : "")}
                />
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
