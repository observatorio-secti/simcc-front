import { useContext, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { UserContext } from "../../../context/context";
import { DataTable } from "../../dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Label } from "../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface Props {
  graduate_program_id: string;
}

type Dados = {
  citations: number;
  year: number;
  name: string;
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

export function TabelaQualisQuantidade(props: Props) {
  const [dados, setDados] = useState<Dados[]>([]);
  const [anos, setAnos] = useState<number[]>([]);
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);
  const [year, setYear] = useState(new Date().getFullYear() - 4);

  const { urlGeral } = useContext(UserContext);
  const urlDados = `${urlGeral}graduate_program/${props.graduate_program_id}/article_production?year=${year}`;
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
      const data: Dados[] = await response.json();
      if (data) {
        setDados(data);

        // Extrair os anos únicos
        const uniqueYears = Array.from(new Set(data.map((item) => item.year))).sort((a, b) => a - b);
        setAnos(uniqueYears);
        setAnoSelecionado(uniqueYears[0]); // Definir o primeiro ano como padrão
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [urlDados]);
  console.log(urlDados)
  console.log(dados)

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

  return (
    <div className="space-y-4">
      {/* Seletor de anos */}
      <div className="flex items-center gap-4">
        <Label htmlFor="year" className="text-sm font-medium">
          Selecione o ano:
        </Label>
        <Select value={String(anoSelecionado) ?? ""} onValueChange={(value) => setAnoSelecionado(Number(value))}>
          <SelectTrigger className="gap-3 w-fit">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {anos.map((ano) => (
              <SelectItem value={String(ano)}>{ano}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={dados.filter((item) => item.year === anoSelecionado)}

      />
    </div>
  );
}