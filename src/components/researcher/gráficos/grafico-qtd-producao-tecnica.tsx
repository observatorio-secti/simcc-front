import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../ui/chart";

type Dados = {
  count_software: number;
  count_patent_granted: number;
  count_patent_not_granted: number;
  count_report: number;
  year: number;
};

type ProdTecProps = {
  producoes_tecnicas: Dados[];
};

const chartConfig = {
  software: { label: "Software", color: "#096670" },
  patente_concedida: { label: "Patente Conc", color: "#6BC26B" },
  patente_nao_concedida: { label: "Patente Não Conc", color: "#CE3830" },
  rel_tec: { label: "Rel Técnico", color: "#662D91" },
} satisfies ChartConfig;

export function GraficoQtdProducaoTecnica(props: ProdTecProps) {
  const [chartData, setChartData] = useState<
    { year: string; software: number; patente_concedida: number; patente_nao_concedida: number; rel_tec: number }[]
  >([]);

  useEffect(() => {
    // Processar os dados para criar o formato esperado pelo gráfico
    const data = props.producoes_tecnicas
      .map((item) => ({
        year: item.year.toString(),
        software: item.count_software,
        patente_concedida: item.count_patent_granted,
        patente_nao_concedida: item.count_patent_not_granted,
        rel_tec: item.count_report,
      }))
      .filter(
        (item) =>
          item.software > 0 ||
          item.patente_concedida > 0 ||
          item.patente_nao_concedida > 0 ||
          item.rel_tec > 0
      ); // Remove anos onde todos os valores são 0

    setChartData(data);
  }, [props.producoes_tecnicas]);

  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis hide={true} />
          <ChartLegend className="flex flex-wrap" content={<ChartLegendContent />} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />

          {/* Barras empilhadas */}
          <Bar dataKey="software" stackId="a" fill={chartConfig.software.color}>
            <LabelList
              dataKey="software"
              position="top"
              formatter={(value) => (value > 0 ? value.toString() : "")}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="patente_concedida" stackId="a" fill={chartConfig.patente_concedida.color}>
            <LabelList
              dataKey="patente_concedida"
              position="top"
              formatter={(value) => (value > 0 ? value.toString() : "")}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="patente_nao_concedida" stackId="a" fill={chartConfig.patente_nao_concedida.color}>
            <LabelList
              dataKey="patente_nao_concedida"
              position="top"
              formatter={(value) => (value > 0 ? value.toString() : "")}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="rel_tec" stackId="a" fill={chartConfig.rel_tec.color}>
            <LabelList
              dataKey="rel_tec"
              position="top"
              formatter={(value) => (value > 0 ? value.toString() : "")}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
