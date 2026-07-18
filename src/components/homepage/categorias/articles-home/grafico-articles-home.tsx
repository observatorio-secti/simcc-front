import { useEffect, useState } from "react";
import { Alert } from "../../../ui/alert";
import { BarChart, Bar, XAxis, YAxis, LabelList, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "../../../../components/ui/chart";

type Articles = {
  articles: any[];
};

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

export function GraficoArticleHome(props: Articles) {
  type Qualis = "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "SQ" | "NP";

  const [chartData, setChartData] = useState<{ year: number;[qualis: string]: number }[]>([]);

  useEffect(() => {
    if (props.articles) {
      const counts: { [year: number]: { [qualis: string]: number } } = {};

      props.articles.forEach((publicacao) => {
        const year = Number(publicacao.year);
        const qualis = publicacao.qualis;

        if (!counts[year]) {
          counts[year] = {};
        }

        counts[year][qualis] = (counts[year][qualis] || 0) + 1;
      });

      const data = Object.entries(counts).map(([year, qualisCounts]) => ({
        year: Number(year),
        ...qualisCounts,
      }));

      setChartData(data);
    }
  }, [props.articles]);

  function getColorForInstitution(qualis: Qualis) {
    const colors = {
      A1: '#006837',
      A2: '#8FC53E',
      A3: '#ACC483',
      A4: '#BDC4B1',
      B1: '#F15A24',
      B2: '#F5831F',
      B3: '#F4AD78',
      B4: '#F4A992',
      B5: '#F2D3BB',
      C: '#EC1C22',
      SQ: '#560B11',
      NP: '#560B11',
    };
    return colors[qualis] || '#000000';
  }

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
