import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";
import { Alert } from "../../ui/alert";

import { GraduateProgram } from "../graduate-program";

type ResearchData = {
  group: GraduateProgram[];
};

const chartConfig = {
  institution: {
    label: "Instituição",
    color: "#559FB8",
  },
} satisfies ChartConfig;

export function GraficoInstituicaoProgramas(props: ResearchData) {
  const [chartData, setChartData] = useState<{ institution: string; count: number }[]>([]);

  useEffect(() => {
    if (props.group) {
      const counts: { [institution: string]: number } = {};

      props.group.forEach((group) => {
        const institution = group.institution.toUpperCase();

        if (!counts[institution]) {
          counts[institution] = 0;
        }

        counts[institution] += 1;
      });

      const data = Object.entries(counts).map(([institution, count]) => ({
        institution,
        count,
      }));

      setChartData(data);
    }
  }, [props.group]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Quantidade de programas de pós-graduação por instituição</CardTitle>
          <CardDescription>Total de programas de pós-graduação associados a cada instituição</CardDescription>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Fonte: Plataforma Sucupira</p>
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
              <XAxis
                dataKey="institution"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
           
               textAnchor="middle"
              
              />
              <CartesianGrid vertical={false} horizontal={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="count" radius={4}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="#559FB8" />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={12}
                  fill="#8C8C8C"
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Alert>
  );
}
