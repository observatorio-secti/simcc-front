
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"

import { ArrowUpDown } from "lucide-react"



interface Patrimonio {
  matric: string;
  inscUFMG: string;
  nome: string;
  genero: string;
  situacao: string;
  rt: string;
  clas: string;
  cargo: string;
  classe: string;
  ref: string;
  titulacao: string;
  entradaNaUFMG: string;
  progressao: string;
  year_charge: string;
  semester: string;
}



export const columnsDocentes: ColumnDef<Patrimonio>[] = [
  {
    accessorKey: "nome",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome do docente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      
      
     
      return <div className="flex gap-3 items-center" > {row.getValue("nome")}</div>
    },
  },
  {
    accessorKey: "classe",
    header: () => <div className="text-right flex items-center">Classe</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1 text-xs  ">{row.getValue("classe")}</div>
      
    },
  },

  {
    accessorKey: "entradaNaUFMG",
    header: () => <div className="text-right flex items-center">Entrada UFMG</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1 text-xs  ">{row.getValue("entradaNaUFMG")}</div>
      
    },
  },

 




 
]
