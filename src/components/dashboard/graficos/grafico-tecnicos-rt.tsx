import  { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis,  LabelList, CartesianGrid,  ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartConfig, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../components/ui/chart";

interface Docentes {
  technician_id: string,
  nome: string,
  genero: string,
    name:string
    deno_sit:string
    rt:string 
    classe:string 
    cargo:string
    nivel:string 
    ref:string
    titulacao:string 
    setor:string 
    detalhe_setor:string 
    dting_org:string 
    data_prog:string 
    semester:string 
}

const chartConfig = {
  regime: {
    label: "Cargos",
    color: "#004A75", // Cor única para todas as barras
  },
} satisfies ChartConfig;

export function GraficoTecnicosRt({ docentes }: { docentes: Docentes[] }) {
  const [chartData, setChartData] = useState<{ rt: string; count: number }[]>([]);

  useEffect(() => {
    if (!Array.isArray(docentes)) {
      console.error("The 'docentes' prop is not an array:", docentes);
      return;
    }

    const counts: { [key: string]: number } = {};

    docentes.forEach(docente => {
      const rt = docente.rt;
      counts[rt] = (counts[rt] || 0) + 1;
    });

    const data = Object.entries(counts).map(([rt, count]) => ({
      rt,
      count,
    }));

    setChartData(data);
  }, [docentes]);

  


  return (
    <Alert className="p-0 border-0 h-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="rt" tickLine={false} tickMargin={10} axisLine={false} />
        
            <CartesianGrid vertical={false} horizontal={false} />
         
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
             <Bar dataKey="count" radius={4} fill={chartConfig.regime.color}>
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
