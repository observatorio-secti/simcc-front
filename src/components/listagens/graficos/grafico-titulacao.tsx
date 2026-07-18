import { useEffect, useState } from "react";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid,  ResponsiveContainer, LabelList, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";
import { Alert } from "../../ui/alert";
import { Research } from "../researchers-home";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Tooltip ,TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";


type ResearchData = {
  researchers: Research[];
};

const chartConfig = {
  graduation: {
    label: "Graduation",
    color: "#004A75",
  },
} satisfies ChartConfig;

export function GraficoTitulacao(props: ResearchData) {
  const [chartData, setChartData] = useState<{ graduation: string; count: number }[]>([]);

  useEffect(() => {
    if (props.researchers) {
      const counts: { [graduation: string]: number } = {};

      // Conta a quantidade de pesquisadores por nível de graduação
      props.researchers.forEach((researcher) => {
        const graduation = researcher.graduation;

        if (!counts[graduation]) {
          counts[graduation] = 0;
        }

        counts[graduation] += 1;
      });

      // Transforma o objeto em um array para o gráfico
      const data = Object.entries(counts).map(([graduation, count]) => ({
        graduation,
        count,
      }));

      setChartData(data);
    }
  }, [props.researchers]);

  return (
    <Alert className="pt-">

<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                          <div>
                                            <CardTitle className="text-sm font-medium">
                                              Quantidade total por titulação
                                            </CardTitle>
                                            <CardDescription>Soma de titulação dos pesquisadores</CardDescription>
                                          </div>
                      
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                              <TooltipContent>
                                                <p>Fonte: Currículo Lattes</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                      
                                        </CardHeader>
    <CardContent>
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis dataKey="graduation" tickLine={false} tickMargin={10} axisLine={false} />
           
            <CartesianGrid vertical={false} horizontal={false} />
          
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar
              dataKey="count"
              fill={chartConfig.graduation.color}
              radius={4}
            >
              <LabelList dataKey="count" position="top" offset={12} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </CardContent>
    </Alert>
  );
}