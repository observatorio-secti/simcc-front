import { useContext, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../ui/chart";
import { UserContext } from "../../../context/context";

type Orientacao = {
  year: string,
  m_completed: number,
  m_in_progress: number,
  ic_completed: number,
  ic_in_progres: number,
  d_completed: number,
  d_in_progress: number,
  g_completed: number,
};

type PesquisadorID = {
  id_pesquisador: string;
};

const chartConfig = {
  software: { label: "Iniciação científica", color: "#8bfbd3" },
  dissertacao_mestrado: { label: "Dissertação de mestrado", color: "#67a896" },
  tese_doutorado: { label: "Tese de doutorado", color: "#425450" },
} satisfies ChartConfig;

export function GraficoQtdOrientacoes(props: PesquisadorID) {
  const [chartData, setChartData] = useState<{ year: string; software: number; patente_concedida: number; patente_nao_concedida: number; rel_tec: number }[]>([]);

  const { urlGeral } = useContext(UserContext);

  useEffect(() => {
    try {
      const dados = async (id: string) => {
        const resposta = await fetch(urlGeral + `researcher/${id}/guidance_metrics`, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          }
        });


        if (!resposta.ok) {
          throw new Error("Erro na resposta do servidor");
        }

        const dadosProntos = await resposta.json();
        console.log("DATA DATA DATA:", dadosProntos);
        setChartData(dadosProntos);
      }

      console.info("URL: ", urlGeral + `researcher/${props.id_pesquisador}/guidance_metrics`);
      dados(props.id_pesquisador);
    } catch (err) {
      console.log("ERRO AO CARREGAR OS DADOS", err);
    }

  }, [props.id_pesquisador, urlGeral]);

  return (
    <ChartContainer config={chartConfig} className="h-[260px] w-full">
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis tickLine={false} tickMargin={10} axisLine={false} />
          <CartesianGrid vertical={false} horizontal={false} />
          <ChartLegend content={<ChartLegendContent />} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <Bar dataKey="software" radius={4} stackId="a">
            <LabelList
              position="top"
              formatter={(value) => value > 0 ? value.toFixed(2) : '0'}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="patente_concedida" radius={4} stackId="a">
            <LabelList
              position="top"
              formatter={(value) => value > 0 ? value.toFixed(2) : '0'}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="patente_nao_concedida" radius={4} stackId="a">
            <LabelList
              position="top"
              formatter={(value) => value > 0 ? value.toFixed(2) : '0'}
              fontSize={12}
              className="fill-foreground"
            />
          </Bar>
          <Bar dataKey="rel_tec" radius={4} stackId="a">
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
