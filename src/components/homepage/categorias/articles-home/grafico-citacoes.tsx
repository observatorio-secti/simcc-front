import { useEffect, useState } from "react";
import { Alert } from "../../../ui/alert";
import { LineChart, Line, XAxis, YAxis, CartesianGrid,  ResponsiveContainer, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../../components/ui/chart";

import {  CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Tooltip ,TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import { Info } from "lucide-react";

type Articles = {
  articles: any[];
};

const chartConfig = {
  views: {
    label: "Page Views",
  },
  citations: {
    label: "Citações",
    color: "#2BC8DC",
  },
} satisfies ChartConfig;

export function GraficoCitationsArticleHome(props: Articles) {
  const [chartData, setChartData] = useState<{ year: number; citations: number }[]>([]);

  useEffect(() => {
    if (props.articles) {
      const counts: { [year: number]: number } = {};

      props.articles.forEach((publicacao) => {
        const year = Number(publicacao.year);
        const citations = Number(publicacao.citations_count);

        if (!counts[year]) {
          counts[year] = 0;
        }

        counts[year] += citations;
      });

      const data = Object.entries(counts).map(([year, citations]) => ({
        year: Number(year),
        citations: citations,
      }));

      setChartData(data);
    }
  }, [props.articles]);

  return (
    <Alert className="pt-12">
     
     <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
          
            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend className="flex flex-wrap text-[0.6rem] md:text-[0.8rem]" content={<ChartLegendContent />} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Line
              type="monotone"
              dataKey="citations"
              stroke={chartConfig.citations.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            >
              <LabelList dataKey="citations" position="top" offset={12} className="fill-foreground" fontSize={12} />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
  
    </Alert>
  );
}