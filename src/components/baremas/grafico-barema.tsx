import { useContext, useEffect, useMemo, useState } from "react";


type Institutions = {
  pesquisadores: any[]
}

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";


export function GraficoBarema(props: Institutions) {
  // gráfico
  const [chartOptions, setChartOptions] = useState({});

  console.log("info: ", props.pesquisadores)

  type Dados = {
    nome: string;
    total: number;
  }

  useEffect(() => {
  }, [props.pesquisadores])

  const dados = useMemo(() => {
    const tempDados: Dados[] = [];

    if (props.pesquisadores) {
      props.pesquisadores.map((p) => {
        return tempDados.push({
          nome: p.name,
          total: p.total
        });
      })
    }

    console.log("dados: ", tempDados)
    return tempDados;
  }, [props.pesquisadores]);

  const chartConfig = {
    pesquisador: {
      label: "Pesquisador",
    }
  }

  return (
    <ChartContainer className="max-h-[300px] w-full" config={chartConfig}>
      <ResponsiveContainer>
        <BarChart data={dados}>
          <XAxis dataKey="nome" />
          <YAxis domain={['auto', 'auto']} />
          <CartesianGrid vertical={false} horizontal={false} />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
          <Bar dataKey="total" fill="#719CB8" radius={4} />'
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}