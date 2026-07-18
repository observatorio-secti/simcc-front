import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "../../../ui/chart";

const chartConfig = {
    bar: {
        label: "Distribuição por Cargo",
        color: "#559DB6", // Cor única para todas as barras
    },
} satisfies ChartConfig;

export function ContagemEventos30Dias() {
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("https://simcc.uesc.br/v3/node/api/analytics")
            .then((res) => res.json())
            .then((result) => {
                const formattedData = result.rows.map((row) => {
                    const rawDate = row.dimensionValues[0].value;
                    const formattedDate = `${rawDate.slice(6, 8)}/${rawDate.slice(4, 6)}/${rawDate.slice(0, 4)}`;

                    return {
                        date: formattedDate,  // Data formatada para DD/MM/YYYY
                        activeUsers: Number(row.metricValues[1].value),
                    };
                });
                setData(formattedData);
            })
            .catch((error) => console.error("Erro ao buscar dados", error));
    }, []);

    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                    <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12} // Tamanho da fonte das legendas
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                    <Line type="monotone" dataKey="activeUsers" stroke="#559DB6" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}
