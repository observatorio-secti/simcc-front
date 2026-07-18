
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"

import { ArrowUpDown } from "lucide-react"


export interface PesquisadorProps {
    name: string
    lattes_id: string
  }


export const columns: ColumnDef<PesquisadorProps>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "lattes_id",
    header: "ID Lattes",
  },

 
]
