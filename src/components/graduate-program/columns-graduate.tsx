
import { ColumnDef } from "@tanstack/react-table"
import { GraduateProgram } from "./graduate-program";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { Alert } from "../ui/alert";
import { areasComCores } from "./program-item";

export const columnsGraduate: ColumnDef<GraduateProgram>[] = [
  {
    accessorKey: "acronym",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sigla
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
      accessorKey: "name",
      header: "Nome do programa",
    },
    {
      accessorKey: "type",
      header: "Tipo",
    },
    {
      accessorKey: "modality",
      header: "Modalidade",
    },
    {
      accessorKey: "area",
      header: "Área",
      cell: ({ row }) => {
      
          
  const normalizeArea = (area: string): string =>
    area
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^A-Z0-9 ]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, " ") // Substitui múltiplos espaços por um único espaço
      .trim();
  
      const qualisColor = new Map(areasComCores.map(([area, color]) => [normalizeArea(area), color]));

      const getColorByArea = (area: string): string =>
        qualisColor.get(normalizeArea(area)) || 'bg-gray-500';
      
    
        return  <div className="flex w-fit  whitespace-nowrap items-center gap-2  "> <Alert className={` w-4 rounded-md border-0 h-4 p-0 ${getColorByArea(row.original.area)}`} />{row.getValue("area")}</div>
        
      },
    },
    {
      accessorKey: "city",
      header: "Cidade",
    },
    {
      accessorKey: "institution",
      header: "Instituição",
    },
    {
      accessorKey: "rating",
      header: "Nota",
    }
   
  ];