import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../../context/context";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, ResponsiveContainer, LabelList, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";

const areaColors: Record<string, string> = {
  "CIENCIAS AGRARIAS": "#EF4444",
  "CIENCIAS EXATAS E DA TERRA": "#34D399",
  "CIENCIAS DA SAUDE": "#20BDBE",
  "CIENCIAS HUMANAS": "#F5831F",
  "CIENCIAS BIOLOGICAS": "#EB008B",
  "ENGENHARIAS": "#FCB712",
  "CIENCIAS SOCIAIS APLICADAS": "#009245",
  "LINGUISTICA LETRAS E ARTES": "#A67C52",
  "OUTROS": "#1B1464",
  "DEFAULT": "#000000",
};

const chartConfig = {
  areas: {
    label: "Áreas de Atuação",
  },
} satisfies ChartConfig;

export function GraficoAreaPesquisares() {
  const { urlGeral } = useContext(UserContext);
  const [chartData, setChartData] = useState<{ area: string; count: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${urlGeral}metrics/great-area/chart`);
        const data = await response.json();

        const formattedData = data.map((item: { great_area: string; count: number }) => ({
          area: item.great_area,
          count: item.count,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Erro na busca dos dados do gráfico:", error);
      }
    };

    if (urlGeral) {
      fetchData();
    }
  }, [urlGeral]);

  const getAreaColor = (area: string) => {
    return areaColors[area] || areaColors["DEFAULT"];
  };

  return (
    <Alert className="p">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Quantidade total por área
          </CardTitle>
          <CardDescription>Soma de área cadastrada no Lattes pelos pesquisadores</CardDescription>
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
              <XAxis dataKey="area" tickLine={false} tickMargin={10} axisLine={false} />

              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar
                radius={4}
                dataKey="count"
                fill="#8884d8"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getAreaColor(entry.area)} />
                ))}
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={10}
                  className="fill-foreground"
                  fontSize={12}
                  fill="#919191"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Alert>
  );
}