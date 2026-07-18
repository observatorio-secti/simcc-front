"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart"



interface Props {
    combinedData:any[]
}

const intersticio_tabela = {
  1: { 1: 30, 2: 40 },
  2: { 1: 20, 2: 50 },
  // Preencha conforme necessário
}


export function TempoGrafico(props:Props) {
    
const chartData = props.combinedData.map((item, index) => {
    const inicioDate = new Date(item.inicio)
    const fimDate =
      index === props.combinedData.length - 1 && !item.fim
        ? new Date(inicioDate.getTime() + (intersticio_tabela[item.classe]?.[item.nivel] ?? 0) * 24 * 60 * 60 * 1000)
        : new Date(item.fim)
  
    let fimCorreto: string | null = null
    if (item.tempo_acumulado > 0 && item.tempo_nivel != null) {
      fimCorreto = new Date(inicioDate.getTime() + item.tempo_acumulado * 24 * 60 * 60 * 1000).toISOString()
    }
  
    return {
      nome: item.nome,
      cpf: item.cpf,
      inicio: inicioDate.toISOString(),
      fim: fimCorreto,
      tempo_acumulado: item.tempo_acumulado,
      tempo_nivel: item.tempo_nivel,
    }
  })
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráfico de Tempo Acumulado</CardTitle>
        <CardDescription>Evolução do tempo acumulado dos docentes</CardDescription>
      </CardHeader>
      <CardContent>
        
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              Tempo acumulado em comparação ao tempo de nível
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Mostrando a evolução dos tempos acumulados e de nível dos docentes
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
