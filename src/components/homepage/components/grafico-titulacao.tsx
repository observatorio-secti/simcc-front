import { useContext, useEffect, useState } from 'react';

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

import { UserContext } from '../../../context/context';

type ResearchData = {
  graduation: string;
  among: number;
};

const chartConfig = {
  graduation: {
    label: 'Graduation',
    color: '#004A75',
  },
} satisfies ChartConfig;

export function GraficoTitulacaoHome() {
  const { urlGeral } = useContext(UserContext);

  const urlTermPesquisadores = `${urlGeral}academic_degree`;
  console.log(urlTermPesquisadores);

  const [researchers, setResearchers] = useState<ResearchData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlTermPesquisadores, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });
        const data = await response.json();
        if (data) {
          setResearchers(data);
          setChartData(
            data.map((item: ResearchData) => ({
              graduation: item.graduation?.trim() || 'Não informado',
              count: item.among, // pega diretamente o valor do servidor
            })),
          );
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [urlTermPesquisadores]);

  const [chartData, setChartData] = useState<
    { graduation: string; count: number }[]
  >([]);

  return (
    <div className="grid grid-cols-1">
      <ChartContainer config={chartConfig} className=" w-full h-[340px]">
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
            <Bar dataKey="count" fill={chartConfig.graduation.color} radius={4}>
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
    </div>
  );
}
