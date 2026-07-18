import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, ResponsiveContainer, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";

export interface CategoryMetric {
  modality_code: string;
  category_level_code: string;
  count: number;
}

const chartConfig = {
  bar: {
    label: "Quantidade por Nível de Categoria (DT)",
    color: "#559DB6",
  },
} satisfies ChartConfig;

export function GraficoBolsistasDT({ metricsData }: { metricsData: CategoryMetric[] }) {
  const [chartData, setChartData] = useState<{ category_level_code: string; count: number }[]>([]);

  useEffect(() => {
    if (!Array.isArray(metricsData)) {
      return;
    }

    const data = metricsData
      .filter(item => item.modality_code === "DT")
      .map(item => ({
        category_level_code: item.category_level_code,
        count: item.count,
      }));

    const sortedData = data.sort((a, b) => {
      const aCode = a.category_level_code.toUpperCase();
      const bCode = b.category_level_code.toUpperCase();

      const aNumber = parseInt(aCode.match(/\d+/)?.[0] || "0", 10);
      const bNumber = parseInt(bCode.match(/\d+/)?.[0] || "0", 10);

      if (aNumber !== bNumber) {
        return aNumber - bNumber;
      }

      const aLetter = aCode.match(/[A-Za-z]+/)?.[0] || "";
      const bLetter = bCode.match(/[A-Za-z]+/)?.[0] || "";
      return aLetter.localeCompare(bLetter);
    });

    setChartData(sortedData);
  }, [metricsData]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Gráfico Desen. Tec. e Extensão Inovadora
          </CardTitle>
          <CardDescription>Total por categoria</CardDescription>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
            <TooltipContent>
              <p>Fonte: Painel Bolsistas CNPq</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>

      <CardContent className="flex py-0 flex-1 items-center justify-center">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
            >
              <XAxis
                dataKey="category_level_code"
                tickLine={false}
                axisLine={false}
                fontSize={12}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar
                dataKey="count"
                fill={chartConfig.bar.color}
                radius={4}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={10}
                  className="fill-foreground"
                  fontSize={12}
                  fill="#000000"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Alert>
  );
}