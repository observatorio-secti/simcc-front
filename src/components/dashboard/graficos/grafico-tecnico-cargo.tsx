import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

interface Docentes {
  technician_id: string,
  nome: string,
  genero: string,
  name: string,
  deno_sit: string,
  rt: string,
  classe: string,
  cargo: string,
  nivel: string,
  ref: string,
  titulacao: string,
  setor: string,
  detalhe_setor: string,
  dting_org: string,
  data_prog: string,
  semester: string,
}

const chartConfig = {
  cargo: {
    label: "Cargos",
    color: "#559DB6", // Cor única para todas as barras
  },
} satisfies ChartConfig;

export function GraficoTecnicosCargo({ docentes }: { docentes: Docentes[] }) {
  const [chartData, setChartData] = useState<{ cargo: string; count: number }[]>([]);

  useEffect(() => {
    const counts: { [key: string]: number } = {};

    docentes.forEach(docente => {
      const cargo = docente.cargo;
      counts[cargo] = (counts[cargo] || 0) + 1;
    });

    const data = Object.entries(counts).map(([cargo, count]) => ({
      cargo,
      count,
    }));

    setChartData(data);
  }, [docentes]);

  return (
    <Alert className="p-0 border-0 h-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full ">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 5, left: 10, bottom: 0 }}>
            <XAxis
              dataKey="cargo"
              tickLine={false}
              axisLine={false}
             
              textAnchor="end"
             
              fontSize={12} // Tamanho da fonte das legendas
            />
           
           
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="count" radius={4} fill={chartConfig.cargo.color}>
              <LabelList
                dataKey="count"
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
                fill="#919191" // Cor fixa para as legendas no topo das barras
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}