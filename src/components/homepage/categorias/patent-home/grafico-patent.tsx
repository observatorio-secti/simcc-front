import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../../components/ui/chart";
import { Alert } from "../../../ui/alert";

type Patente = {
  id: string;
  grant_date: string;
  title: string;
  year: string;
  financing: string;
  project_name: string;
};

const chartConfig = {
  publicacoes: {
    label: "Patentes",
    color: "#66B4D0",
  },
} satisfies ChartConfig;

export function GraficoPatente({ publicacoes }: { publicacoes: Patente[] }) {
  const [chartData, setChartData] = useState<{ year: string; publicacoes: number }[]>([]);

  useEffect(() => {
    const counts: { [year: string]: number } = {};

    publicacoes.forEach((item) => {
      const year = item.year;
      counts[year] = (counts[year] || 0) + 1;
    });

    const data = Object.entries(counts).map(([year, count]) => ({ year, publicacoes: count }));
    setChartData(data);
  }, [publicacoes]);

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar
              dataKey="publicacoes"
              fill={chartConfig.publicacoes.color}
              stackId="a"
              radius={4}
            >
              <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
              {chartData.map((entry, index) =>
                entry.publicacoes > 0 ? <Cell key={`cell-${index}`} /> : null
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}
