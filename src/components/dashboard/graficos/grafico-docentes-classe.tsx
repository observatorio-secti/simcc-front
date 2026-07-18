import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, YAxis, LabelList, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartConfig, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { Research } from "../../listagens/researchers-home";

interface Docentes {
  technician_id: string;
  nome: string;
  genero: string;
  name: string;
  deno_sit: string;
  rt: string;
  classe: string;
  cargo: string;
  nivel: string;
  ref: string;
  titulacao: string;
  setor: string;
  detalhe_setor: string;
  dting_org: string;
  data_prog: string;
  semester: string;
}

// Definição da ordem correta dos cargos
const cargoOrder = [
  "PROF TITULAR",
  "PROFESSOR TITULAR-LIVRE",
  "PROF ASSOCIADO",
  "PROF ADJUNTO",
  "PROF AUXILIAR",
  "PROF ASSISTENTE",

];

const chartConfig = {
  cargo: {
    label: "Cargos",
    color: "#559DB6",
  },
} satisfies ChartConfig;

export function GraficoDocentesCargo({ docentes }: { docentes: Research[] }) {
  const [chartData, setChartData] = useState<{ cargo: string; count: number }[]>([]);

  useEffect(() => {
    const counts: { [key: string]: number } = {};

    docentes.forEach((docente) => {
      const cargo = docente.classe;
      counts[cargo] = (counts[cargo] || 0) + 1;
    });

    // Criando os dados e garantindo que os cargos sigam a ordem predefinida
    const data = cargoOrder
      .map((cargo) => ({
        cargo,
        count: counts[cargo] || 0, // Garante que cargos sem docentes apareçam com count 0
      }))
      .filter((item) => item.count > 0); // Remove cargos sem contagem

    setChartData(data);
  }, [docentes]);

  return (
    <Alert className="p-0 border-0 h-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 0, right: 25, left: 30, bottom: 0 }}
          >
            <YAxis
              dataKey="cargo"
              type="category"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} />

            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

            <Bar dataKey="count" radius={4} fill={chartConfig.cargo.color}>
              <LabelList
                dataKey="count"
                position="right"
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
