import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../ui/chart';

const COLORS = ['#004A75', '#559FB8', '#99C5D4', '#CCE2E9', '#6692AC'];

const chartConfig = {
  bar: {
    label: 'Distribuição por Cargo',
    color: '#559DB6', // Cor única para todas as barras
  },
} satisfies ChartConfig;

// Definição do tipo para os dados do gráfico
interface ChartData {
  name: string;
  value: number;
  color: string;
}

export function PercentualEventos() {
  // Tipagem explícita do estado para evitar erros
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    fetch('https://simcc.uesc.br/v3/node/api/analytics')
      .then((res) => res.json())
      .then((result) => {
        const eventCounts: Record<string, number> = {};

        result.rows.forEach((row: any) => {
          const eventName = row.dimensionValues[1]?.value;
          if (eventName) {
            eventCounts[eventName] =
              (eventCounts[eventName] || 0) +
              Number(row.metricValues[0]?.value || 0);
          }
        });

        const formattedData: ChartData[] = Object.keys(eventCounts).map(
          (eventName, index) => ({
            name: eventName,
            value: eventCounts[eventName],
            color: COLORS[index % COLORS.length],
          }),
        );

        setData(formattedData);
      })
      .catch((error) => console.error('Erro ao buscar dados', error));
  }, []);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            labelLine={false}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
