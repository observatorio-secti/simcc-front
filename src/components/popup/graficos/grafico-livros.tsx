import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

type Livro = {
  id: string,
  title: string,
  year: string,
  isbn: string,
  publishing_company: string
};

const chartConfig = {
  capLivros: {
    label: "Capítulos de Livros",
    color: "#E8ACD2",
  },
  publicacoes: {
    label: "Livros",
    color: "#89274D",
  },
} satisfies ChartConfig;

export function GraficoLivros({ capLivros, publicacoes }: { capLivros: Livro[], publicacoes: Livro[] }) {
  const [chartData, setChartData] = useState<{ year: string; capLivros: number; publicacoes: number }[]>([]);

  useEffect(() => {
    const counts: { [year: string]: { capLivros: number; publicacoes: number } } = {};

    capLivros.forEach((livro) => {
      const year = livro.year;
      if (!counts[year]) {
        counts[year] = { capLivros: 0, publicacoes: 0 };
      }
      counts[year].capLivros += 1;
    });

    publicacoes.forEach((livro) => {
      const year = livro.year;
      if (!counts[year]) {
        counts[year] = { capLivros: 0, publicacoes: 0 };
      }
      counts[year].publicacoes += 1;
    });

    const data = Object.entries(counts).map(([year, { capLivros, publicacoes }]) => ({
      year,
      capLivros,
      publicacoes,
    }));

    setChartData(data);
  }, [capLivros, publicacoes]);

  const filteredChartData = chartData.map(data => ({
    year: data.year,
    capLivros: data.capLivros === 0 ? undefined : data.capLivros,
    publicacoes: data.publicacoes === 0 ? undefined : data.publicacoes
  }));

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <BarChart data={filteredChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />

            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            {Object.keys(chartConfig).map((key, index) => {
              if (key !== "views") {
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={chartConfig[key].color}
                    stackId="a"
                    radius={4}
                  >
                    {index === Object.keys(chartConfig).length - 1 && (
                      <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                    )}
                  </Bar>
                );
              }
              return null;
            })}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}