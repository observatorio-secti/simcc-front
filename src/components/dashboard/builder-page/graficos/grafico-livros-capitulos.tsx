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
import { GraficoQtdLivrosCapitulos } from "../../../researcher/gráficos/grafico-qtd-livros-ano";

interface Props {
    dados:Dados[]
    year:number
    setYear: (year: number) => void; // Corrigido o tipo de setYear
}


  
export function GraficoLivrosCapitulosSection(props:Props) {
    
   

     return(
        <Alert className=" h-full lg:col-span-2 ">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium">
                    Quantidade de livros e capítulos de livro por ano
                    </CardTitle>
                    <CardDescription>Análise da quantidade de produção por ano</CardDescription>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger> <Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                      <TooltipContent>
                        <p>Fonte: Plataforma Lattes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>


                </CardHeader>
                        <CardContent className="mt-4">
                          <GraficoQtdLivrosCapitulos articles={props.dados} />
                        </CardContent>
                      </Alert>
    )
}