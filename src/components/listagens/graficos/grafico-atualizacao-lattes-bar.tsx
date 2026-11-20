import { useEffect, useState, useContext } from 'react';
import { Alert } from '../../ui/alert';
import {
  ResponsiveContainer,
  LabelList,
  XAxis,
  Bar,
  BarChart,
  Cell,
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../components/ui/chart';
import { UserContext } from '../../../context/context';

const barColors = ['#22C55E', '#CA8A04', '#EF4444'];
const chartConfig = {
  pie: {
    label: 'Atualização de Currículos',
  },
} satisfies ChartConfig;

export function GraficoAtualizacaoCurriculosBar() {
  const { urlGeral } = useContext(UserContext);
  const [chartData, setChartData] = useState<
    { category: string; count: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${urlGeral}metrics/lattes-update/chart`);
        const data = await response.json();

        if (data && data.length > 0) {
          const item = data[0];

          const ate3 = item.total - item.over_3_months;
          const de3a6 = item.over_3_months - item.over_6_months;
          const mais6 = item.over_6_months;

          setChartData([
            { category: 'Até 3 meses', count: ate3 },
            { category: '3 a 6 meses', count: de3a6 },
            { category: 'Mais de 6 meses', count: mais6 },
          ]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (urlGeral) {
      fetchData();
    }
  }, [urlGeral]);

  return (
    <Alert className="p-0 border-0 h-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
          >
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="count" radius={4}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColors[index % barColors.length]}
                />
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
    </Alert>
  );
}
