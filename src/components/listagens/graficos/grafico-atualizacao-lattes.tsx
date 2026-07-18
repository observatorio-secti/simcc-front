import React, { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { Research } from "../../listagens/researchers-home";

// Definição das cores para as categorias (fora do chartConfig)
const pieColors = ["#22C55E", "#CA8A04", "#EF4444"];

const chartConfig = {
  pie: {
    label: "Atualização de Currículos",
  },
} satisfies ChartConfig;

export function GraficoAtualizacaoCurriculos({ researchers }: { researchers: Research[] }) {
  const [chartData, setChartData] = useState<{ category: string; count: number }[]>([]);

  useEffect(() => {
    if (!Array.isArray(researchers)) {
      console.error("The 'researchers' prop is not an array:", researchers);
      return;
    }

    const counts = {
      "Até 3 meses": 0,
      "3 a 6 meses": 0,
      "Mais de 6 meses": 0,
    };

    const currentDate = new Date(); // Data atual

    researchers.forEach(researcher => {
      // Converte a data "DD/MM/AAAA" para "AAAA-MM-DD"
      const [day, month, year] = String(researcher.lattes_update).split("/");
      const formattedDate = `${year}-${month}-${day}`;

      const lattesUpdateDate = new Date(formattedDate); // Converte a string para Date
      if (isNaN(lattesUpdateDate.getTime())) {
        console.error("Invalid date format for lattes_update:", researcher.lattes_update);
        return;
      }

      // Calcula a diferença em meses
      const diffInMonths = (currentDate.getFullYear() - lattesUpdateDate.getFullYear()) * 12 +
        (currentDate.getMonth() - lattesUpdateDate.getMonth());

      if (diffInMonths <= 3) {
        counts["Até 3 meses"] += 1;
      } else if (diffInMonths <= 6) {
        counts["3 a 6 meses"] += 1;
      } else {
        counts["Mais de 6 meses"] += 1;
      }
    });

    // Transforma o objeto de contagem em um array para o gráfico
    const data = Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    }));


    setChartData(data);
  }, [researchers]);

  const totalCurriculos = chartData.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Alert className="p-0 border-0 h-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">

        <ResponsiveContainer>
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="visitors" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="category"
              cx="50%"
              cy="50%"

              fill="#8884d8"
              labelLine={false}
              label
            >

              {/* Label centralizado com o total de currículos */}
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={pieColors[index % pieColors.length]}
                />
              ))}
            </Pie>

          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}