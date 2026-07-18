import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../../components/ui/chart";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { Info } from "lucide-react";
import { Alert } from "../../ui/alert";
import { GraduateProgram } from "../graduate-program";

type ResearchData = {
  group: GraduateProgram[];
};

const chartConfig = {
  institution: {
    label: "Instituição",
    color: "#004A75",
  },
} satisfies ChartConfig;

export function GraficoRatingProgramas(props: ResearchData) {
  const [chartData, setChartData] = useState<
    { institution: string; count: number }[]
  >([]);

  useEffect(() => {
    if (props.group) {
      const counts: { [rating: string]: number } = {};

      props.group.forEach((group) => {
        const rating = String(group.rating).toUpperCase();

        if (!counts[rating]) {
          counts[rating] = 0;
        }

        counts[rating] += 1;
      });

      const customOrder = ["A", "3", "4", "5", "6", "7"];

      const data = Object.entries(counts)
        .map(([institution, count]) => ({
          institution,
          count,
        }))
        .sort((a, b) => {
          const indexA = customOrder.indexOf(a.institution);
          const indexB = customOrder.indexOf(b.institution);

          const hasIndexA = indexA !== -1;
          const hasIndexB = indexB !== -1;

          if (hasIndexA && hasIndexB) {
            return indexA - indexB;
          } else if (hasIndexA) {
            return -1;
          } else if (hasIndexB) {
            return 1;
          } else {
            return a.institution.localeCompare(b.institution, "pt-BR", {
              numeric: true,
            });
          }
        });

      setChartData(data);
    }
  }, [props.group]);

  return (
    <Alert>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Quantidade de programas de pós-graduação por nota
          </CardTitle>
          <CardDescription>
            Total de programas de pós-graduação associados a cada nota
          </CardDescription>
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
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="count" radius={4}>
                {chartData.map((entry, index) => {
                  const rating = entry.institution;
                  let fill = "#60A5FA"; // azul padrão

                  const numericRating = Number(rating);

                  if (!isNaN(numericRating)) {
                    if (numericRating <= 2) {
                      fill = "#6B7280"; // cinza
                    } else if (numericRating <= 4) {
                      fill = "#F59E0B"; // amarelo
                    } else {
                      fill = "#10B981"; // verde
                    }
                  } else if (rating === "A") {
                    fill = "#6366F1"; // roxo para "A"
                  }

                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
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
