import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../components/ui/chart";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";
import { Info } from "lucide-react";
import { Alert } from "../../ui/alert";

import { GraduateProgram } from "../graduate-program";

type ResearchData = {
  group: GraduateProgram[];
};

const normalizeArea = (area: string): string => {
  return area.toUpperCase(); // Converte para maiúsculas
};


const qualisColor: { [key: string]: string } = {
   // Ciências Exatas e da Terra
   'MATEMÁTICA / PROBABILIDADE E ESTATÍSTICA': '#fecaca',
   'ASTRONOMIA / FÍSICA': '#fca5a5',
   'QUÍMICA': '#f87171',
   'GEOCIÊNCIAS': '#ef4444',
   'CIÊNCIA DA COMPUTAÇÃO': '#dc2626',
 
   // Ciências Biológicas
   'BIODIVERSIDADE': '#bbf7d0',
   'CIÊNCIAS BIOLÓGICAS I': '#86efac',
   'CIÊNCIAS BIOLÓGICAS II': '#4ade80',
   'CIÊNCIAS BIOLÓGICAS III': '#22c55e',
 
   // Engenharias
   'ENGENHARIA I': '#bfdbfe',
   'ENGENHARIA II': '#93c5fd',
   'ENGENHARIA III': '#60a5fa',
   'ENGENHARIA IV': '#3b82f6',
 
   // Ciências da Saúde
   'MEDICINA I': '#fef08a',
   'MEDICINA II': '#fde047',
   'MEDICINA III': '#facc15',
   'NUTRIÇÃO': '#eab308',
   'ODONTOLOGIA': '#ca8a04',
   'FARMÁCIA': '#a16207',
   'ENFERMAGEM': '#854d0e',
   'SAÚDE COLETIVA': '#713f12',
   'EDUCAÇÃO FÍSICA': '#422006',
   'FISIOTERAPIA, FONOAUDIOLOGIA E TERAPIA OCUPACIONAL': '#fed7aa',
   'EDUCAÇÃO FÍSICA, FISIOTERAPIA, FONOAUDIOLOGIA E TERAPIA OCUPACIONAL': '#422006',
 
   // Ciências Agrárias
   'CIÊNCIAS AGRÁRIAS I': '#16a34a',
   'ZOOTECNIA / RECURSOS PESQUEIROS': '#15803d',
   'MEDICINA VETERINÁRIA': '#166534',
   'CIÊNCIA DE ALIMENTOS': '#14532d',
 
   // Ciências Sociais Aplicadas
   'DIREITO': '#e9d5ff',
   'ADMINISTRAÇÃO PÚBLICA E DE EMPRESAS, CIÊNCIAS CONTÁBEIS E TURISMO': '#d8b4fe',
   'ECONOMIA': '#c084fc',
   'ARQUITETURA, URBANISMO E DESIGN': '#a855f7',
   'PLANEJAMENTO URBANO E REGIONAL / DEMOGRAFIA': '#9333ea',
   'COMUNICAÇÃO, INFORMAÇÃO E MUSEOLOGIA': '#7e22ce',
   'SERVIÇO SOCIAL': '#6b21a8',
 
   // Ciências Humanas
   'FILOSOFIA': '#fbcfe8',
   'CIÊNCIAS DA RELIGIÃO E TEOLOGIA': '#f9a8d4',
   'SOCIOLOGIA': '#f472b6',
   'ANTROPOLOGIA / ARQUEOLOGIA': '#ec4899',
   'HISTÓRIA': '#db2777',
   'GEOGRAFIA': '#be185d',
   'PSICOLOGIA': '#9d174d',
   'EDUCAÇÃO': '#831843',
   'CIÊNCIA POLÍTICA E RELAÇÕES INTERNACIONAIS': '#500724',
 
   // Linguística, Letras e Artes
   'LETRAS / LINGUÍSTICA': '#fb923c',
   'ARTES / MÚSICA': '#f97316',
 
   // Multidisciplinar
   'INTERDISCIPLINAR': '#99f6e4',
   'ENSINO': '#5eead4',
   'MATERIAIS': '#2dd4bf',
   'BIOTECNOLOGIA': '#14b8a6',
   'CIÊNCIAS AMBIENTAIS': '#0d9488',
   'CIÊNCIAS E HUMANIDADES PARA A EDUCAÇÃO BÁSICA': '#0f766e'
};

  


const chartConfig = {
  area: {
    label: "Área",
    color: "#004A75",
  },
} satisfies ChartConfig;

export function GraficoAreaProgramas(props: ResearchData) {
  const [chartData, setChartData] = useState<{ area: string; count: number }[]>([]);

  const normalizeArea = (area: string): string => {
    return area

      .toUpperCase(); // Converte para maiúsculas
  };

  useEffect(() => {
    if (props.group) {
      const counts: { [area: string]: number } = {};

      // Conta a quantidade de grupos por área
      props.group.forEach((group) => {
        const area = normalizeArea(group.area);

        if (!counts[area]) {
          counts[area] = 0;
        }

        counts[area] += 1;
      });

      // Transforma o objeto em um array para o gráfico
      const data = Object.entries(counts).map(([area, count]) => ({
        area,
        count,
      }));

      setChartData(data);
    }
  }, [props.group]);


  return (
    <Alert className="pt-">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">Quantidade de programas de pós-graduação por área</CardTitle>
          <CardDescription>Soma de programas de pós-graduação por área</CardDescription>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Fonte: Plataforma Sucupira</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
            >
              <XAxis dataKey="area" tickLine={false} tickMargin={10} axisLine={false} />
           
              <CartesianGrid vertical={false} horizontal={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="count" radius={4}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={qualisColor[normalizeArea(entry.area)] } />
                ))}
                <LabelList dataKey="count" position="top" offset={12} fill="#8C8C8C" className="fill-foreground" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Alert>
  );
}
