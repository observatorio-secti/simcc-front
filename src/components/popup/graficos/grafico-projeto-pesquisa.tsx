import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

type Livro = {
  agency_code: string
  agency_name: string
  nature: string
  description: string
  end_year: string
  id: string
  number_academic_masters: string
  number_phd: string
  number_specialists: string
  number_undergraduates:string
  project_name:string
  start_year:string
  status:string
  researcher_id:string
  production:Production[]
  foment:Forment[]
  components:Components[]
}

interface Components {
 
  citations:string 
  lattes_id:string 
  name:string
}

interface Production {
  title:string 
  type:string 
}

interface Forment {
  agency_code:string
  agency_name:string
  nature:string
}

const chartConfig = {
  'publicacoes': {
    label: "Projeto de pesquisa",
    color: "#bae6fd",
  },
} satisfies ChartConfig;

export function GraficoProjetoPesquisa({ publicacoes }: { publicacoes: Livro[] }) {
  const [chartData, setChartData] = useState<{ year: string; count: number }[]>([]);

  useEffect(() => {
    const counts: { [key: string]: number } = {};

    publicacoes.forEach(publicacao => {
      const year = publicacao.start_year;
      counts[year] = (counts[year] || 0) + 1;
    });

    const data = Object.entries(counts)
      .map(([year, count]) => ({
        year,
        count,
      }))
      .sort((a, b) => parseInt(a.year) - parseInt(b.year));

    setChartData(data);
  }, [publicacoes]);

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <BarChart data={chartData}  margin={{ top: 20,  right: -5, left: -5, bottom: 0 }}>
          <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />

          
            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend content={<ChartLegendContent />} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill={chartConfig.publicacoes.color} radius={4}>
              <LabelList dataKey="count" position="top" offset={12} className="fill-foreground" fontSize={12} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}
