import { useEffect, useState, useContext } from "react";
import { UserContext } from "../../../../context/context";
import { Alert } from "../../../ui/alert";
import { BarChart, Bar, XAxis, LabelList, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../../components/ui/chart";

const chartConfig = {
  views: {
    label: "Page Views",
  },
  A1: {
    label: "Qualis A1",
    color: "#006837",
  },
  A2: {
    label: "Qualis A2",
    color: "#8FC53E",
  },
  A3: {
    label: "Qualis A3",
    color: "#ACC483",
  },
  A4: {
    label: "Qualis A4",
    color: "#BDC4B1",
  },
  B1: {
    label: "Qualis B1",
    color: "#F15A24",
  },
  B2: {
    label: "Qualis B2",
    color: "#F5831F",
  },
  B3: {
    label: "Qualis B3",
    color: "#F4AD78",
  },
  B4: {
    label: "Qualis B4",
    color: "#F4A992",
  },
  C: {
    label: "Qualis C",
    color: "#EC1C22",
  },
  SQ: {
    label: "Sem qualis",
    color: "#560B11",
  },
} satisfies ChartConfig;

export function GraficoArticleHome({ researcher_id }) {
  console.log('ID TA AQUI', researcher_id)
  const { urlGeral } = useContext(UserContext);
  const [chartData, setChartData] = useState<{ year: number;[qualis: string]: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = new URL(`${urlGeral}metrics/article/chart`);
        if (researcher_id != null && researcher_id !== '') {
          url.searchParams.append('researcher_id', researcher_id);
        }
        const response = await fetch(url.toString());
        const data = await response.json();

        const formattedData = data.map((item: any) => ({
          year: item.year,
          ...item.qualis,
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error(error);
      }
    };

    if (urlGeral) {
      fetchData();
    }
  }, [urlGeral]);

  return (
    <Alert className="pt-12">
      <ChartContainer config={chartConfig} className="h-[250px] w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
            <CartesianGrid vertical={false} horizontal={false} />
            <ChartLegend className="flex flex-wrap text-[0.6rem] md:text-[0.8rem]" content={<ChartLegendContent />} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            {Object.keys(chartConfig).map((key, index) => {
              if (key !== "views") {
                const configKey = key as Exclude<keyof typeof chartConfig, "views">;
                return (
                  <Bar
                    key={configKey}
                    dataKey={configKey}
                    fill={chartConfig[configKey].color}
                    stackId="a"
                    radius={4}
                  >
                    {index === Object.keys(chartConfig).length - 1 && (
                      <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
                    )}
                  </Bar>
                );
              }
              return null;
            })}
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Alert>
  );
}