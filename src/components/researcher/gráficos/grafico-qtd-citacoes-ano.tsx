import { useContext, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from "recharts";
import { UserContext } from "../../../context/context";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../ui/chart";

type Dados = {
  id: string;
};

type ChartDataItem = {
  year: string; // Ano
  citations: number; // Número de citações
};

// Configuração mínima para o ChartContainer
const chartConfig = {
  Citacao: {
    label: "Citações por Ano",
    color: "#00bcd4", // Cor da linha
  }
};

export function GraficoQtdCitacoesAno(props: Dados) {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const { urlGeral } = useContext(UserContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resposta = await fetch(urlGeral + `researcher/${props.id}/article_metrics`, {
          mode: "cors",
          headers: {
            "Content-Type": "text/plain",
          },
        });

        if (!resposta.ok) {
          throw new Error("Erro na resposta do servidor");
        }

        const dados = await resposta.json();
        setChartData(dados);
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, [props.id, urlGeral]);

  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(tick) => (tick % 1 === 0 ? tick : "")} />
         
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <Tooltip cursor={false} />
          <Line type="monotone" dataKey="citations" stroke={chartConfig.Citacao.color} strokeWidth={2} dot={{ r: 4 }}>
            <LabelList dataKey="citations" position="top" fontSize={12} className="fill-foreground" formatter={(value) => value.toString()} />
          </Line>
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}