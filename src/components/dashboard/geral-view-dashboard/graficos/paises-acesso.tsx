import { useEffect, useState } from 'react';
import { BarChart, Bar, YAxis, ResponsiveContainer, LabelList } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../../ui/chart';

interface CountryData {
  country: string;
  eventCount: number;
}

const chartConfig = {
  bar: {
    label: 'Distribuição por País',
    color: '#559DB6',
  },
} satisfies ChartConfig;

export function PaisesAcessos() {
  const [data, setData] = useState<CountryData[]>([]);

  useEffect(() => {
    fetch('https://simcc.uesc.br/v3/node/api/analytics')
      .then((res) => res.json())
      .then((result) => {
        const countryCounts: { [key: string]: number } = {};
        result.rows.forEach((row: any) => {
          const country = row.dimensionValues[2]?.value || 'Desconhecido';
          const value = Number(row.metricValues[0]?.value || 0);

          // Se o valor for menor que 1, aumentamos a escala para melhor visualização
          countryCounts[country] = (countryCounts[country] || 0) + value;
        });

        // Normalizar valores para evitar barras invisíveis
        const formattedData: CountryData[] = Object.keys(countryCounts).map(
          (country) => ({
            country,
            eventCount: Math.max(countryCounts[country], 1), // Evita valores muito pequenos
          }),
        );

        setData(formattedData);
      })
      .catch((error) => console.error('Erro ao buscar dados', error));
  }, []);

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
        >
          <YAxis
            dataKey="country"
            type="category"
            tick={{ fontSize: 12 }}
            width={100}
            tickLine={false}
            axisLine={false}
          />

          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dashed" />}
          />

          <Bar dataKey="eventCount" fill={chartConfig.bar.color} radius={4}>
            <LabelList
              position="right"
              fill="#8C8C8C"
              offset={12}
              className="fill-foreground"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
