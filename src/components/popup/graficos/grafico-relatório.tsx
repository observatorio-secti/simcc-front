import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

type Livro = {
  id: string,
  grant_date: string,
  title: string,
  year: string,
  financing: string,
  project_name: string
};

const chartConfig = {
  'publicacoes': {
    label: "Relatórios técnicos",
    color: "#662D91",
  },
} satisfies ChartConfig;

export function GraficoRelatorio({ publicacoes }: { publicacoes: Livro[] }) {
  const [chartData, setChartData] = useState<{ year: string; count: number }[]>([]);

  useEffect(() => {
    const counts: { [key: string]: number } = {};

    publicacoes.forEach(publicacao => {
      const year = publicacao.year;
      counts[year] = (counts[year] || 0) + 1;
    });

    const data = Object.entries(counts)
      .map(([year, count]) => ({
        year,
        count,
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    setChartData(data);
  }, [publicacoes]);

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: -10, left: -10, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
            <CartesianGrid horizontal={false} vertical={false} />
            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill={chartConfig.publicacoes.color} radius={4}>
              <LabelList dataKey="count" position="top" offset={12} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}
