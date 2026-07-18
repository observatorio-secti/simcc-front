import { useEffect, useState } from "react";
import { Alert } from "../../ui/alert";
import { BarChart, Bar, XAxis, LabelList, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartTooltip, ChartTooltipContent, ChartConfig, ChartLegendContent, ChartContainer } from "../../../components/ui/chart";

type Research = {
  count_article: number;
  count_book: number;
  count_book_chapter: number;
  count_guidance: number;
  count_patent: number;
  count_report: number;
  count_software: number;
  count_guidance_complete: number;
  count_guidance_in_progress: number;
  count_patent_granted: number;
  count_patent_not_granted: number;
  count_brand: number;
  year: number;
  A1: number;
  A2: number;
  A3: number;
  A4: number;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
  C: number;
  SQ: number;
};

const qualisCategories = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C", "SQ"];

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


export function GraficoArtigosPorQualis({ dados }: { dados: Research[] }) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const processedData = dados.map(item => {
      const data = { year: item.year };
      qualisCategories.forEach(category => {
        data[category] = item[category];
      });
      return data;
    });
    setChartData(processedData);
  }, [dados]);

  return (
    <Alert className="p-0 border-0 h-full">
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <XAxis dataKey="year" tickLine={false} tickMargin={10} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Tooltip cursor={false} content={<ChartTooltipContent />} />
            <Legend className="flex flex-wrap text-[0.5rem] md:text-[0.7rem]" content={<ChartLegendContent />} />
            {Object.keys(chartConfig).map((key, index) => {
              if (key !== "views") {
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={chartConfig[key].color}
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
