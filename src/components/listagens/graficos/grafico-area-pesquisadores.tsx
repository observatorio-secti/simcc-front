import { useEffect, useState, useContext, useMemo } from 'react';
import { UserContext } from '../../../context/context';
import { Alert } from '../../ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  LabelList,
  Cell,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../components/ui/chart';
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

const areaColors: Record<string, string> = {
  'CIENCIAS AGRARIAS': '#EF4444',
  'CIENCIAS EXATAS E DA TERRA': '#34D399',
  'CIENCIAS DA SAUDE': '#20BDBE',
  'CIENCIAS HUMANAS': '#F5831F',
  'CIENCIAS BIOLOGICAS': '#EB008B',
  ENGENHARIAS: '#FCB712',
  'CIENCIAS SOCIAIS APLICADAS': '#009245',
  'LINGUISTICA LETRAS E ARTES': '#A67C52',
  OUTROS: '#1B1464',
  DEFAULT: '#000000',
};

const chartConfig = {
  areas: {
    label: 'Áreas de Atuação',
  },
} satisfies ChartConfig;

type ResearcherArea = { area: string };
type MetricsItem =
  | { area: string; count: number }
  | { great_area: string; count: number };

interface Props {
  researchers?: ResearcherArea[];
  metrics?: MetricsItem[];
}

function normalizeMetrics(items: MetricsItem[]): { area: string; count: number }[] {
  return items.map((item: any) => ({
    area: item.area ?? item.great_area,
    count: item.count,
  }));
}

function computeFromResearchers(list: ResearcherArea[]): { area: string; count: number }[] {
  const counts: Record<string, number> = {};
  list.forEach((r) => {
    const areas = r.area ? r.area.split(';').map((a) => a.trim()).filter(Boolean) : [];
    areas.forEach((a) => {
      counts[a] = (counts[a] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .map(([area, count]) => ({ area, count }))
    .sort((a, b) => b.count - a.count);
}

export function GraficoAreaPesquisares({ researchers, metrics }: Props) {
  const { urlGeral } = useContext(UserContext);
  const [chartData, setChartData] = useState<{ area: string; count: number }[]>([]);

  const localData = useMemo(() => {
    if (metrics && metrics.length > 0) return normalizeMetrics(metrics);
    if (researchers && researchers.length > 0) return computeFromResearchers(researchers);
    return null;
  }, [metrics, researchers]);

  useEffect(() => {
    if (localData) {
      setChartData(localData);
      return;
    }

    if (!urlGeral) return;

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const response = await fetch(`${urlGeral}metrics/great-area/chart`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
          setChartData([]);
          return;
        }
        const formattedData = data.map(
          (item: { great_area: string; count: number }) => ({
            area: item.great_area,
            count: item.count,
          }),
        );
        setChartData(formattedData);
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        setChartData([]);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [urlGeral, localData]);

  const getAreaColor = (area: string) => {
    return areaColors[area] || areaColors['DEFAULT'];
  };

  return (
    <Alert className="p">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">
            Quantidade total por área
          </CardTitle>
          <CardDescription>
            Soma de área cadastrada no Lattes pelos pesquisadores
          </CardDescription>
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
        {chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">Sem dados para exibir</p>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <XAxis
                  dataKey="area"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />

                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar radius={4} dataKey="count" fill="#8884d8">
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
        )}
      </CardContent>
    </Alert>
  );
}
