import { useContext, useEffect, useMemo, useState } from "react"
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
import { TabelaQualisQuantidadeResarcher } from "../../../researcher/gráficos/tabela-qualis-quantidade-researcher";
import { DataTable } from "../../data-table";
import { ColumnDef } from "@tanstack/react-table";
import { UserContext } from "../../../../context/context";
import { useLocation } from "react-router-dom";

interface Props {
    year:number
    setYear: (year: number) => void; // Corrigido o tipo de setYear
   
}

 export const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  }

  
export function TabelaArtigoSection(props:Props) {
  
  const queryUrl = useQuery();

  const graduate_program_id = queryUrl.get('graduate_program_id');
  const group_id = queryUrl.get('group_id');
  const dep_id = queryUrl.get('dep_id');

  // Definição das colunas para o DataTable
  const columns: ColumnDef<Dados>[] = [
    {
      accessorKey: "name",
      header: "Nome",
    },
    {
      accessorKey: "A1",
      header: "A1",
    },
    {
      accessorKey: "A2",
      header: "A2",
    },
    {
      accessorKey: "A3",
      header: "A3",
    },
    {
      accessorKey: "A4",
      header: "A4",
    },
    {
      accessorKey: "B1",
      header: "B1",
    },
    {
      accessorKey: "B2",
      header: "B2",
    },
    {
      accessorKey: "B3",
      header: "B3",
    },
    {
      accessorKey: "B4",
      header: "B4",
    },
    {
      accessorKey: "C",
      header: "C",
    },
    {
      accessorKey: "SQ",
      header: "SQ",
    },
    {
      accessorKey: "citations",
      header: "Citações",
    },
  ];


   
    const {urlGeral} = useContext(UserContext)

          
          let urlDados= ''
        if(dep_id) {
            urlDados =`${urlGeral}departamentos?dep_id=${dep_id}`;
        } else if (group_id) {
            urlDados =`${urlGeral}research_group?group_id=${group_id}`;
        } else if (graduate_program_id) {
           urlDados =`${urlGeral}graduate_program/${graduate_program_id}/article_production?year=${props.year}`
        }
          const [dados, setDados] = useState<Dados[]>([]);
          const [anos, setAnos] = useState<number[]>([]);
          const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);

   useEffect(() => {
       const fetchData = async () => {
         try {
   
           const response = await fetch(urlDados, {
             mode: "cors",
             headers: {
               "Access-Control-Allow-Origin": "*",
               "Access-Control-Allow-Methods": "GET",
               "Access-Control-Allow-Headers": "Content-Type",
               "Access-Control-Max-Age": "3600",
               "Content-Type": "text/plain",
             },
           });
           const data = await response.json();
           type DataItem = { year: number }; // Define um tipo para os objetos do array

if (data && Array.isArray(data)) {
  setDados(data);

  const uniqueYears = Array.from(new Set(data.map((item: DataItem) => item.year))).sort((a, b) => a - b);
  
  setAnos(uniqueYears);
  setAnoSelecionado(uniqueYears[0]);
}

          
         } catch (err) {
           console.log(err);
         }
       };
       fetchData();
     }, [urlDados]);

    

     return(
         <Alert className="hidden md:block lg:col-span-3 ">
        
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <div>
                            <CardTitle className="text-sm font-medium">
                              Tabela de quantidade de citações e atigos com qualis por ano
                            </CardTitle>
                            <CardDescription>Soma total do pesquisador</CardDescription>
                          </div>
        
                          <Select  value={String(anoSelecionado) ?? ""}  onValueChange={(value) => setAnoSelecionado(Number(value))}>
  <SelectTrigger className="gap-3 w-fit">
    <SelectValue placeholder="Ano" />
  </SelectTrigger>
  <SelectContent>
    {anos.map((ano) => (
              <SelectItem value={String(ano)}>{ano}</SelectItem>
            ))}
  </SelectContent>
</Select>
        
                        </CardHeader>
                        <CardContent className="mt-4">
                        <div className="space-y-4">
        {/* Seletor de anos */}
      
  
        {/* DataTable */}
        <DataTable
          columns={columns}
          data={dados.filter((item) => item.year === anoSelecionado)}
         
        />
      </div>
                        </CardContent>
                      </Alert>
    )
}