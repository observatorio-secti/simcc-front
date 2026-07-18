import { useEffect, useState } from "react";
import { Alert } from "../../../ui/alert";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../../components/ui/chart";

type Instituicoes = {
  among: string;
  id: string;
  image: string;
  institution: string;
};

type InstitutionsProps = {
  institutions: Instituicoes[];
};

const chartConfig = {
  institutions: {
    label: "Instituições",
    color: "#559FB8",
  },
};

export function GraficoInstitutionsHome(props: InstitutionsProps) {
  const [chartData, setChartData] = useState<{ institution: string; among: number }[]>([]);

  useEffect(() => {
    if (props.institutions) {
      const data = props.institutions.map((item) => ({
        institution: item.institution,
        among: parseFloat(item.among), // Convertendo `among` de string para número
      }));
      setChartData(data);
    }
  }, [props.institutions]);

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <XAxis
              dataKey="institution"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
          
     

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="among"
              fill={chartConfig.institutions.color}
              radius={[4, 4, 0, 0]}
            >
              <LabelList
                dataKey="among"
                position="top"
                offset={10}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}
