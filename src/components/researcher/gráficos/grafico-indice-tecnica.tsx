import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

type Dados = {
  count_software: number;
  count_patent_granted: number;
  count_patent_not_granted: number;
  count_report: number;
  year: number;
};

type PesosProducao = {
  a1: string;
  a2: string;
  a3: string;
  a4: string;
  b1: string;
  b2: string;
  b3: string;
  b4: string;
  c: string;
  sq: string;
  f1: string;
  f2: string;
  f3: string;
  f4: string;
  f5: string;
  livro: string;
  cap_livro: string;
  software: string;
  patent_granted: string;
  patent_not_granted: string;
  report: string;

};

type ProdTecProps = {
  articles: Dados[];
  pesosProducao: PesosProducao;
};

const chartConfig = {
  software: { label: "Software", color: "#096670" },
  patente_concedida: { label: "Patente Conc", color: "#6BC26B" },
  patente_nao_concedida: { label: "Patente Não Conc", color: "#CE3830" },
  rel_tec: { label: "Rel Técnico", color: "#662D91" },
} satisfies ChartConfig;

export function GraficoIndiceProdTec(props: ProdTecProps) {
  const [chartData, setChartData] = useState<{ year: string; software: number; patente_concedida: number; patente_nao_concedida: number; rel_tec: number }[]>([]);

  // Mapeamento dos valores de peso de produção
  const pesosMap: { [key: string]: number } = {
    t1: parseFloat(props.pesosProducao.f1),
    t2: parseFloat(props.pesosProducao.f2),
    t3: parseFloat(props.pesosProducao.f3),
    t4: parseFloat(props.pesosProducao.f4),
    t5: parseFloat(props.pesosProducao.f5),
  };

  function getPesoValue(peso: string | undefined): number {
    if (!peso) {
      return 0; // Retorne 0 ou outro valor padrão se o peso estiver indefinido
    }
    return pesosMap[peso.toLowerCase()] || 0;
  }

  useEffect(() => {
    if (props.articles && props.pesosProducao) {
      const pesos = props.pesosProducao;

      // Converter os pesos usando a lógica de mapeamento
      const pesosNumericos = {
        software: getPesoValue(pesos.software),
        patent_granted: getPesoValue(pesos.patent_granted),
        patent_not_granted: getPesoValue(pesos.patent_not_granted),
        report: getPesoValue(pesos.report),
      };

      // Calcular somas ponderadas
      const counts: { [year: string]: { software: number; patente_concedida: number; patente_nao_concedida: number; rel_tec: number } } = {};

      props.articles.forEach((publicacao) => {
        const year = publicacao.year.toString();
        const { count_software, count_patent_granted, count_patent_not_granted, count_report } = publicacao;

        if (count_software > 0 || count_patent_granted > 0 || count_patent_not_granted > 0 || count_report > 0) {
          if (!counts[year]) {
            counts[year] = { software: 0, patente_concedida: 0, patente_nao_concedida: 0, rel_tec: 0 };
          }

          // Atualizar valores ponderados
          counts[year].software += count_software * pesosNumericos.software;
          counts[year].patente_concedida += count_patent_granted * pesosNumericos.patent_granted;
          counts[year].patente_nao_concedida += count_patent_not_granted * pesosNumericos.patent_not_granted;
          counts[year].rel_tec += count_report * pesosNumericos.report;
        }
      });

      // Preparar dados para o gráfico
      const data = Object.entries(counts).map(([year, values]) => ({
        year,
        software: values.software,
        patente_concedida: values.patente_concedida,
        patente_nao_concedida: values.patente_nao_concedida,
        rel_tec: values.rel_tec,
      }));

      setChartData(data);
    }
  }, [props.articles, props.pesosProducao]);

  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <CartesianGrid vertical={false} horizontal={false} />
          <ChartLegend className="flex flex-wrap" content={<ChartLegendContent />} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <Bar dataKey="software" radius={4} fill={chartConfig['software'].color} stackId="a">
            <LabelList
              position="top"
              formatter={(value) => value > 0 ? value.toFixed(2) : '0'}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="patente_concedida" radius={4} fill={chartConfig['patente_concedida'].color} stackId="a">
            <LabelList
              position="top"
              formatter={(value) => value > 0 ? value.toFixed(2) : '0'}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="patente_nao_concedida" radius={4} fill={chartConfig['patente_nao_concedida'].color} stackId="a">
            <LabelList
              position="top"
              formatter={(value) => value > 0 ? value.toFixed(2) : '0'}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="rel_tec" radius={4} fill={chartConfig['rel_tec'].color} stackId="a">
            <LabelList
              position="top"
              formatter={(value) => value > 0 ? value.toFixed(2) : '0'}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
