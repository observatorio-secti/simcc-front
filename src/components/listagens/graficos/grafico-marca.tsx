import { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

type Livros = {
  id: string,
  title: string,
  year: string,
  name:string
};

type Patente = {
  id: string,
  title: string,
  year: string,
  name:string
};

const chartConfig = {

  marca: {
    label: "Marcas",
    color: "#1B1464",
  },
} satisfies ChartConfig;

export function GraficoMarca({  marca }: {  marca: Livros[] }) {
  const [chartData, setChartData] = useState<{ year: number;[key: string]: number }[]>([]);

  useEffect(() => {
    const counts: { [year: string]: { [key: string]: number } } = {};

   

    marca.forEach((item) => {
      const year = item.year;
      if (!counts[year]) counts[year] = {};
      counts[year].marca = (counts[year].marca || 0) + 1;
    });

    const data = Object.entries(counts).map(([year, counts]) => ({
      year: Number(year),
      software: counts.software || 0,
      publicacoes: counts.publicacoes || 0,
      marca: counts.marca || 0,
    }));

    const transformedData = data.map(item => ({
      year: item.year,
      ...Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'year'))
    }));

    setChartData(transformedData);
  }, [ marca]);

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />

            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            {Object.keys(chartConfig).map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={chartConfig[key].color}
                stackId="a"
                radius={4}
              >
                {index === Object.keys(chartConfig).length - 1 && (
                  <LabelList position="top" fill="#8C8C8C" offset={12} className="fill-foreground" fontSize={12} />
                )}
                {chartData.map((entry, index) =>
                  entry[key] > 0 ? <Cell key={`cell-${index}`} fill={chartConfig[key].color} /> : null
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}
