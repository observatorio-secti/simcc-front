import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LabelList, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Info } from "lucide-react";
import { Alert } from "../ui/alert";
import { Patrimonio} from "./grupos-pesquisa";

type ResearchData = {
  group: Patrimonio[];
};

const normalizeArea = (area: string): string => {
  return area.toUpperCase(); // Converte para maiúsculas
};


const qualisColor: { [key: string]: string } = {
  "ASTRONOMIA": "#fecaca", // bg-red-200
  "FÍSICA": "#bfdbfe", // bg-blue-200
  "GEOCIÊNCIAS": "#bbf7d0", // bg-green-200
  "MATEMÁTICA": "#fef08a", // bg-yellow-200
  "OCEANOGRAFIA": "#5eead4", // bg-teal-200
  "PROBABILIDADE E ESTATÍSTICA": "#e9d5ff", // bg-purple-200
  "QUÍMICA": "#fed7aa", // bg-orange-200
  "AGRONOMIA": "#7f1d1d", // bg-red-800
  "CIÊNCIA E TECNOLOGIA DE ALIMENTOS": "#1e3a8a", // bg-blue-800
  "ENGENHARIA AGRÍCOLA": "#14532d", // bg-green-800
  "MEDICINA VETERINÁRIA": "#78350f", // bg-yellow-800
  "RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL": "#134e4a", // bg-teal-800
  "RECURSOS PESQUEIROS E ENGENHARIA DE PESCA": "#6b21a8", // bg-purple-800
  "ZOOTECNIA": "#7c2d12", // bg-orange-800
  "BIOFÍSICA": "#dc2626", // bg-red-600
  "BIOLOGIA GERAL": "#2563eb", // bg-blue-600
  "BIOQUÍMICA": "#16a34a", // bg-green-600
  "BIOTECNOLOGIA": "#ca8a04", // bg-yellow-600
  "BOTÂNICA": "#0d9488", // bg-teal-600
  "ECOLOGIA": "#9333ea", // bg-purple-600
  "FARMACOLOGIA": "#ea580c", // bg-orange-600
  "FISIOLOGIA": "#f87171", // bg-red-400
  "GENÉTICA": "#60a5fa", // bg-blue-400
  "IMUNOLOGIA": "#4ade80", // bg-green-400
  "MICROBIOLOGIA": "#fde047", // bg-yellow-400
  "MORFOLOGIA": "#2dd4bf", // bg-teal-400
  "PARASITOLOGIA": "#c084fc", // bg-purple-400
  "ZOOLOGIA": "#fdba74", // bg-orange-400
  "EDUCAÇÃO FÍSICA": "#fca5a5", // bg-red-300
  "ENFERMAGEM": "#93c5fd", // bg-blue-300
  "FARMÁCIA": "#86efac", // bg-green-300
  "FISIOTERAPIA E TERAPIA OCUPACIONAL": "#fde68a", // bg-yellow-300
  "FONOAUDIOLOGIA": "#99f6e4", // bg-teal-300
  "MEDICINA": "#d8b4fe", // bg-purple-300
  "NUTRIÇÃO": "#fdba74", // bg-orange-300
  "ODONTOLOGIA": "#fee2e2", // bg-red-100
  "SAÚDE COLETIVA": "#dbeafe", // bg-blue-100
  "ANTROPOLOGIA": "#dcfce7", // bg-green-100
  "ARQUEOLOGIA": "#fef9c3", // bg-yellow-100
  "CIÊNCIA POLÍTICA": "#ccfbf1", // bg-teal-100
  "EDUCAÇÃO": "#f3e8ff", // bg-purple-100
  "FILOSOFIA": "#ffedd5", // bg-orange-100
  "GEOGRAFIA": "#7f1d1d", // bg-red-900
  "HISTÓRIA": "#1e3a8a", // bg-blue-900
  "PSICOLOGIA": "#052e16", // bg-green-900
  "SOCIOLOGIA": "#422006", // bg-yellow-900
  "TEOLOGIA": "#083344", // bg-teal-900
  "CIÊNCIA DA COMPUTAÇÃO": "#4c1d95", // bg-purple-900
  "DESENHO INDUSTRIAL": "#431407", // bg-orange-900
  "ENGENHARIA AEROESPACIAL": "#ef4444", // bg-red-500
  "ENGENHARIA BIOMÉDICA": "#3b82f6", // bg-blue-500
  "ENGENHARIA CIVIL": "#22c55e", // bg-green-500
  "ENGENHARIA DE ENERGIA": "#eab308", // bg-yellow-500
  "ENGENHARIA DE MATERIAIS E METALÚRGICA": "#14b8a6", // bg-teal-500
  "ENGENHARIA DE MINAS": "#a855f7", // bg-purple-500
  "ENGENHARIA DE PRODUÇÃO": "#f97316", // bg-orange-500
  "ENGENHARIA DE TRANSPORTES": "#b91c1c", // bg-red-700
  "ENGENHARIA ELÉTRICA": "#1d4ed8", // bg-blue-700
  "ENGENHARIA MECÂNICA": "#15803d", // bg-green-700
  "ENGENHARIA NAVAL E OCEÂNICA": "#a16207", // bg-yellow-700
  "ENGENHARIA NUCLEAR": "#0f766e", // bg-teal-700
  "ENGENHARIA QUÍMICA": "#7e22ce", // bg-purple-700
  "ENGENHARIA SANITÁRIA": "#c2410c", // bg-orange-700
  "ARTES": "#fef2f2", // bg-red-50
  "LETRAS": "#eff6ff", // bg-blue-50
  "LINGÜÍSTICA": "#f0fdf4", // bg-green-50
  "BIOÉTICA": "#fefce8", // bg-yellow-50
  "CIÊNCIAS AMBIENTAIS": "#f0fdfa", // bg-teal-50
  "DEFESA": "#faf5ff", // bg-purple-50
  "DIVULGAÇÃO CIENTÍFICA": "#fff7ed", // bg-orange-50
  "MICROELETRÔNICA": "#b91c1c", // bg-red-700 (repetido)
  "ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO": "#1d4ed8", // bg-blue-700 (repetido)
  "SEGURANÇA CONTRA INCÊNDIO": "#15803d", // bg-green-700 (repetido)
  "ADMINISTRAÇÃO": "#a16207", // bg-yellow-700 (repetido)
  "ARQUITETURA E URBANISMO": "#0f766e", // bg-teal-700 (repetido)
  "CIÊNCIA DA INFORMAÇÃO": "#7e22ce", // bg-purple-700 (repetido)
  "COMUNICAÇÃO": "#c2410c", // bg-orange-700 (repetido)
  "DEMOGRAFIA": "#fee2e2", // bg-red-100 (repetido)
  "DIREITO": "#dbeafe", // bg-blue-100 (repetido)
  "ECONOMIA": "#dcfce7", // bg-green-100 (repetido)
  "ECONOMIA DOMÉSTICA": "#fef9c3", // bg-yellow-100 (repetido)
  "MUSEOLOGIA": "#ccfbf1", // bg-teal-100 (repetido)
  "PLANEJAMENTO URBANO E REGIONAL": "#f3e8ff", // bg-purple-100 (repetido)
  "SERVIÇO SOCIAL": "#ffedd5", // bg-orange-100 (repetido)
  "TURISMO": "#fecaca", // bg-red-200 (repetido)
};

  


const chartConfig = {
  area: {
    label: "Área",
    color: "#004A75",
  },
} satisfies ChartConfig;

export function GraficoAreaGrupos(props: ResearchData) {
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
          <CardTitle className="text-sm font-medium">Quantidade de grupos por área</CardTitle>
          <CardDescription>Soma de grupos de pesquisa por área</CardDescription>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Fonte: Plataforma DGP CNPq</p>
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
