import { ColumnDef } from "@tanstack/react-table"

import { Button } from "../../components/ui/button"
import { ArrowUpDown } from "lucide-react"
import {  Trash } from "phosphor-react"



import { useModal } from "../hooks/use-modal-store"

//import { UserContext } from "../../../../context/context"


export type Research = {
  lattes_id: string
  name: string
  type_: string
  graduate_program_id: string
}



export const columnsStudent: ColumnDef<Research>[] = [
 
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
    cell: ({ row }) => {
      
      
    
      return <div className="flex gap-3 items-center" > {row.getValue("name")}</div>
    },
  },
  
 
  {
    accessorKey: "lattes_id",

    header: () => <div className="text-right flex items-center">Lattes Id</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1 text-xs  ">{row.getValue("lattes_id")}</div>
      
    },
  },

  {
    accessorKey: "type_",

    header: () => <div className="text-right flex items-center">Tipo</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1 text-xs p-2 border items-center border-gray-300 dark:border-stone-700 rounded-md ">{row.getValue("type_")}</div>
      
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      
      const {onOpen } = useModal();
 
    
 
      return (
        <Button  onClick={() => onOpen('confirm-delete-student-graduate-program', {lattes_id:row.original.lattes_id, graduate_program_id:row.original.graduate_program_id, nome:row.original.name})} variant={'destructive'} className="h-8 w-8 p-0 text-white ml-auto dark:text-white">
                       <Trash size={8} className="h-4 w-4" />
                     </Button>
      )
    },
  },
]
