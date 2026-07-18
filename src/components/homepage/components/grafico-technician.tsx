import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartConfig, ChartTooltipContent, ChartLegendContent, ChartLegend, ChartTooltip } from '../../../components/ui/chart';

interface Rt {
  teachers: CoutRt[];
  technician: CoutRt[];
}

interface CoutRt {
  count: number;
  rt: string;
}

const chartConfig = {
  "20H": {
    label: "20 Horas",
    color: "hsl(var(--chart-1))",
  },
  "40H": {
    label: "40 Horas",
    color: "hsl(var(--chart-2))",
  },
  DE: {
    label: "Dedicação Exclusiva",
    color: "hsl(var(--chart-3))",
  },
  "30H": {
    label: "30 Horas",
    color: "hsl(var(--chart-4))",
  },
  "PROJETO 30H": {
    label: "Projeto 30 Horas",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function getColorForRt(rt: string) {
  const colors = {
    "20H": '#FFB74D',
    "40H": '#64B5F6',
    DE: '#81C784',
    "30H": '#FF8A65',
    "PROJETO 30H": '#E57373',
  };
  return colors[rt] || '#000000';
}

export function GraficoRtTechnician({ rtData }: { rtData: Rt | null }) {
  const [chartData, setChartData] = useState<{ rt: string; count: number }[]>([]);

  useEffect(() => {
    if (rtData) {
      const teacherData = rtData.technician;
      setChartData(teacherData);
    }
  }, [rtData]);

  if (!rtData) {
    return <p></p> // Or any other loading or fallback UI
  }

  return (
    <ChartContainer config={chartConfig} className="h-[120px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="rt" tickLine={false} axisLine={false} />
          <ChartLegend content={<ChartLegendContent />} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" radius={4}>
            <LabelList dataKey="count" position="top" offset={10}  fontSize={12} />
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={'#559fb8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
