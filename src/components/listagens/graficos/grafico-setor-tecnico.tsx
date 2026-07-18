import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

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
  bar: {
    label: "Distribuição por Cargo",
    color: "#559DB6", // Cor única para todas as barras
  },
} satisfies ChartConfig;

export function GraficoSetorTecnicos({ docentes }: { docentes: Docentes[] }) {
  const [chartData, setChartData] = useState<{ cargo: string; count: number }[]>([]);

  useEffect(() => {
    if (!Array.isArray(docentes)) {
      console.error("The 'docentes' prop is not an array:", docentes);
      return;
    }

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
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
          >
           
            <XAxis
              dataKey="cargo"
              tickLine={false}
              axisLine={false}
            
             
              fontSize={12} // Tamanho da fonte das legendas
            />
           
           <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar
              dataKey="count"
              fill={chartConfig.bar.color} // Cor única para todas as barras
              radius={4}
              fillOpacity={1} // Remove o efeito de hover
            >
              <LabelList
                dataKey="count"
                position="top"
                offset={12}
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