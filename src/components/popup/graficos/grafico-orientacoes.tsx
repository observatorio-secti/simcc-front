import { useEffect, useState } from 'react';
import { Alert } from '../../ui/alert';
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
  ChartLegend,
  ChartLegendContent,
} from '../../../components/ui/chart';

export type ChartMetricGuidance = {
  year: number;
  m_completed: number;
  m_in_progress: number;
  ic_completed: number;
  ic_in_progress: number;
  d_completed: number;
  d_in_progress: number;
  g_completed: number;
  g_in_progress: number;
  e_completed: number;
  e_in_progress: number;
  sd_completed: number;
  sd_in_progress: number;
};

const normalizedChartConfig: ChartConfig = {
  'iniciacao cientifica': {
    label: 'Iniciação Científica',
    color: '#8BFBD3',
  },
  'dissertacao de mestrado': {
    label: 'Dissertação De Mestrado',
    color: '#67A896',
  },
  'tese de doutorado': {
    label: 'Tese de Doutorado',
    color: '#425450',
  },
  'trabalho de conclusao de curso graduacao': {
    label: 'Trabalho de Conclusão de Curso Graduação',
    color: '#77D2B6',
  },
  'monografia de conclusao de curso aperfeicoamento e especializacao': {
    label: 'Monografia de Conclusão de Curso Aperfeiçoamento e Especialização',
    color: '#2F7F7C',
  },
  'supervisao de pos-doutorado': {
    label: 'Supervisão de Pós-Doutorado',
    color: '#46724B',
  },
};

export function GraficoOrientacoes(props: {
  chartData: ChartMetricGuidance[];
}) {
  const [chartDataFormatted, setChartDataFormatted] = useState<any[]>([]);

  useEffect(() => {
    if (props.chartData) {
      const formattedData = props.chartData.map((item) => {
        const ic = item.ic_completed + item.ic_in_progress;
        const m = item.m_completed + item.m_in_progress;
        const d = item.d_completed + item.d_in_progress;
        const g = item.g_completed + item.g_in_progress;
        const e = item.e_completed + item.e_in_progress;
        const sd = item.sd_completed + item.sd_in_progress;

        return {
          year: String(item.year),
          'iniciacao cientifica': ic,
          'dissertacao de mestrado': m,
          'tese de doutorado': d,
          'trabalho de conclusao de curso graduacao': g,
          'monografia de conclusao de curso aperfeicoamento e especializacao':
            e,
          'supervisao de pos-doutorado': sd,
          total: ic + m + d + g + e + sd,
        };
      });

      setChartDataFormatted(formattedData);
    }
  }, [props.chartData]);

  return (
    <Alert className="pt-12">
      <ChartContainer
        config={normalizedChartConfig}
        className="w-full h-[250px]"
      >
        <ResponsiveContainer>
          <BarChart
            data={chartDataFormatted}
            margin={{ top: 20, right: 20, left: 20, bottom: 0 }}
          >
            <XAxis
              dataKey="year"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend
              className="flex flex-nowrap whitespace-nowrap mt-2 p-4 rounded-md gap-1 w-full text-[0.6rem] overflow-x-auto overflow-y-hidden md:text-[0.7rem] md:gap-2"
              content={<ChartLegendContent />}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {Object.keys(normalizedChartConfig).map((nature, index) => (
              <Bar
                key={nature}
                dataKey={nature}
                stackId="a"
                fill={normalizedChartConfig[nature].color}
                radius={4}
              >
                {index === Object.keys(normalizedChartConfig).length - 1 && (
                  <LabelList
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
