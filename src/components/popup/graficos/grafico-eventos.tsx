import { Alert } from '../../ui/alert';
import {
  BarChart,
  Bar,
  XAxis,
  LabelList,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '../../../components/ui/chart';

export type ChartMetricEvent = {
  year: number;
  congress: number;
  meeting: number;
  workshop: number;
  other: number;
  seminar: number;
  symposium: number;
};

const chartConfig = {
  congress: {
    label: 'Congresso',
    color: '#FF5800',
  },
  workshop: {
    label: 'Oficina',
    color: '#FCEE21',
  },
  other: {
    label: 'Outra',
    color: '#7F400B',
  },
  symposium: {
    label: 'Simpósio',
    color: '#D53A2C',
  },
  meeting: {
    label: 'Encontro',
    color: '#E9A700',
  },
  seminar: {
    label: 'Seminário',
    color: '#FFBD7B',
  },
} satisfies ChartConfig;

export function GraficosEventos({
  chartData,
}: {
  chartData: ChartMetricEvent[];
}) {
  // Apenas formata o array somando os totais para o LabelList
  const formattedData = chartData.map((item) => ({
    ...item,
    year: String(item.year),
    total:
      item.congress +
      item.meeting +
      item.workshop +
      item.other +
      item.seminar +
      item.symposium,
  }));

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={formattedData}
            margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend
              className="flex flex-wrap"
              content={<ChartLegendContent />}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {Object.keys(chartConfig).map((nature, index) => (
              <Bar
                key={nature}
                dataKey={nature}
                stackId="a"
                fill={chartConfig[nature as keyof typeof chartConfig].color}
                radius={4}
              >
                {/* Mostra o total apenas na última barra renderizada */}
                {index === Object.keys(chartConfig).length - 1 && (
                  <LabelList
                    dataKey="total"
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}
