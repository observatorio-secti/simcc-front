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
import { GraficoQtdProducaoTecnica } from "../../../researcher/gráficos/grafico-qtd-producao-tecnica";

interface Props {
    dados:Dados[]
    year:number
    setYear: (year: number) => void; // Corrigido o tipo de setYear
}


  
export function GraficoProducaoTecnicaSection(props:Props) {
    
   

     return(
        <Alert className=" h-[400px] ">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div>
                            <CardTitle className="text-sm font-medium">
                              Quantidade de produções técnicas
                            </CardTitle>
                            <CardDescription>Análise da quantidade de prod. técnicas</CardDescription>
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
                        <CardContent>
                          <CardContent className="mt-4 p-0">
                            <GraficoQtdProducaoTecnica producoes_tecnicas={props.dados} />
                          </CardContent>
                        </CardContent>
                      </Alert>
    )
}