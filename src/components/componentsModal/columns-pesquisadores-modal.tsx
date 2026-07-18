
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"

import { ArrowUpDown } from "lucide-react"



interface Patrimonio {
  name:string
  lattes_id:string
}



export const columnsPesquisadoresModal: ColumnDef<Patrimonio>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome do pesquisador
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      
      
     
      return <div className="flex gap-3 items-center" > {row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "lattes_id",
    header: () => <div className="text-right flex items-center">Id Lattes</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1 text-xs  ">{row.getValue("lattes_id")}</div>
      
    },
  },
  {
    accessorKey: "cpf",
    header: () => <div className="text-right flex items-center">CPF</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1 text-xs  ">{row.getValue("lattes_id")}</div>
      
    },
  },
 




 
]
