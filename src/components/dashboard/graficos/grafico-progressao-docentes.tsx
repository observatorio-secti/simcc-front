import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { Research } from "../../listagens/researchers-home";


const chartConfig = {
  line: {
    label: "Progressão",
    color: "#004A75",
  },
};

export function GraficoProgressaoDocentes({ docentes }: { docentes: Research[] }) {
  const [chartData, setChartData] = useState<{ year: string; count: number }[]>([]);

  useEffect(() => {
    if (!Array.isArray(docentes)) {
      console.error("The 'docentes' prop is not an array:", docentes);
      return;
    }

    const counts: { [key: string]: number } = {};

    docentes.forEach(docente => {
      const date = new Date(docente.progressao);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear().toString();
        counts[year] = (counts[year] || 0) + 1;
      }
    });

    const data = Object.entries(counts)
      .map(([year, count]) => ({
        year,
        count,
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    setChartData(data);
  }, [docentes]);

  return (
    <Alert className="p-0 border-0 h-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
            <CartesianGrid vertical={false} horizontal={false} />
            <Tooltip cursor={false} content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="count" stroke={chartConfig.line.color} strokeWidth={2} dot={{ r: 4 }} >
               <LabelList dataKey="count" position="top" offset={12} className="fill-foreground" fontSize={12} />
               </Line>
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}
