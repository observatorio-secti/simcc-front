import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../../context/context';
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../components/ui/chart';
import { Alert } from '../../ui/alert';
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../ui/tooltip';
import { Info } from 'lucide-react';

const chartConfig = {
  graduation: {
    label: 'Graduation',
    color: '#004A75',
  },
} satisfies ChartConfig;

export function GraficoTitulacao() {
  const { urlGeral } = useContext(UserContext);
  const [chartData, setChartData] = useState<
    { graduation: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${urlGeral}metrics/academic-degree/chart`,
        );
        const data = await response.json();

        const formattedData = data.map(
          (item: { graduation: string; among: number }) => ({
            graduation: item.graduation,
            count: item.among,
          }),
        );

        setChartData(formattedData);
      } catch (error) {
        console.error(error);
      }
    };

    if (urlGeral) {
      fetchData();
    }
  }, [urlGeral]);

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
            <TooltipTrigger>
              {' '}
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
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
              <XAxis
                dataKey="graduation"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />

              <CartesianGrid vertical={false} horizontal={false} />

              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar
                dataKey="count"
                fill={chartConfig.graduation.color}
                radius={4}
              >
                <LabelList
                  dataKey="count"
                  position="top"
                  offset={12}
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
