import { useMemo, useState } from "react"
import { Dados } from "../sections/grafico";
import { Alert } from "../../../ui/alert";
import { CardContent, CardDescription, CardHeader, CardTitle } from "../../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../ui/tooltip";
import { Info } from "lucide-react";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, PieChart, Pie, LabelList, Cell, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Label as LabelChart } from 'recharts';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "../../../ui/chart"

interface Props {
    dados: Dados[]
    year: number
    setYear: (year: number) => void; // Corrigido o tipo de setYear
}

const chartConfig = {
    views: {
        label: "Page Views",
    },
    producao_bibliografica: {
        label: "Produção bibliográfica",
        color: "hsl(var(--chart-1))",
    },
    producao_tecnica: {
        label: "Produção técnica",
        color: "hsl(var(--chart-2))",
    },
    count_article: {
        label: "Artigos",
        color: "hsl(var(--chart-2))",
    },
    count_book: {
        label: "Livros",
        color: "hsl(var(--chart-2))",
    },
    count_book_chapter: {
        label: "Capítulos de livros",
        color: "hsl(var(--chart-2))",
    },
    count_patent: {
        label: "Patentes",
        color: "hsl(var(--chart-2))",
    },
    count_brand: {
        label: "Marcas",
        color: "hsl(var(--chart-2))",
    },
    count_software: {
        label: "Softwares",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export function GraficoProducaoGeralSection(props: Props) {
    const [activeChart, setActiveChart] = useState<keyof typeof chartConfig>('producao_bibliografica')

    const total = useMemo(
        () => ({
            producao_bibliografica: props.dados.reduce(
                (acc, curr) => acc + curr.count_article + curr.count_book + curr.count_book_chapter,
                0
            ),
            producao_tecnica: props.dados.reduce((acc, curr) => acc + curr.count_patent + curr.count_software + curr.count_brand, 0),
        }),
        [props.dados]
    );



    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let i = currentYear; i > currentYear - 30; i--) {
        years.push(i);
    }


    return (
        <Alert className="lg:col-span-2 h-fit p-0">
            <CardHeader className="flex p-0 flex-col md:flex-wrap lg:flex-nowrap items-stretch space-y-0 border-b dark:border-b-neutral-800 sm:flex-row">
                <div className="w-full flex flex-col justify-center gap-1 px-6 py-5 sm:py-6">
                    <CardHeader className="flex p-0 flex-row items-center justify-between space-y-0 ">
                        <div>
                            <CardTitle className="text-sm font-medium">
                                Produção geral
                            </CardTitle>
                            <CardDescription>Dados desde o ano {props.year}</CardDescription>
                        </div>

                        <div className="flex items-center gap-3">
                            <Select defaultValue={String(props.year)} value={String(props.year)} onValueChange={(value) => props.setYear(Number(value))}>
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue placeholder="" />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                                    <TooltipContent>
                                        <p>Essas informações não representam a produção total da Escola desde a sua fundação, é um recorte a partir de {props.year}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                    </CardHeader>
                </div>

                <div className="flex w-full border-t dark:border-t-neutral-800 lg:border-none">
                    {["producao_bibliografica", "producao_tecnica"].map((key) => {
                        const chart = key as keyof typeof chartConfig
                        return (
                            <button
                                key={chart}
                                data-active={activeChart === chart}
                                className={`relative flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 dark:border-l-neutral-800 sm:px-8 sm:py-6 ${activeChart === chart && ('bg-neutral-100 dark:bg-neutral-800')} ${activeChart === 'producao_tecnica' && ('rounded-tr-md')}`}
                                onClick={() => setActiveChart(chart)}
                            >
                                <span className="text-xs text-muted-foreground">
                                    {chartConfig[chart].label}
                                </span>
                                <span className="text-lg font-bold leading-none sm:text-3xl">
                                    {total[key as keyof typeof total].toLocaleString()}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[300px] w-full"
                >
                    <BarChart accessibilityLayer data={props.dados} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                        <CartesianGrid vertical={false} horizontal={false} />
                        <ChartLegend content={<ChartLegendContent />} />

                        <XAxis
                            dataKey="year"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}

                        />

                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />

                        {activeChart == 'producao_bibliografica' && (
                            <>
                                <Bar dataKey="count_article" fill="#5F82ED" radius={4} >
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />

                                </Bar>
                                <Bar dataKey="count_book" fill="#792F4C" radius={4} >
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar>
                                <Bar dataKey="count_book_chapter" fill="#DBAFD0" radius={4} >
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar></>
                        )}

                        {activeChart == 'producao_tecnica' && (
                            <>
                                <Bar dataKey="count_patent" fill="#66B4D0" radius={4} >
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar>
                                <Bar dataKey="count_brand" fill="#1B1464" radius={4} >
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar>
                                <Bar dataKey="count_software" fill="#096670" radius={4} >
                                    <LabelList
                                        position="top"
                                        offset={12}
                                        className="fill-foreground"
                                        fontSize={12}
                                    />
                                </Bar></>
                        )}

                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Alert>
    )
}