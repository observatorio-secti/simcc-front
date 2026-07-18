

import { ColumnDef } from "@tanstack/react-table"

import { Button } from "../../components/ui/button"
import { ArrowUpDown, Eye } from "lucide-react"
import {  Trash } from "phosphor-react"



import { useModal } from "../hooks/use-modal-store"

//import { UserContext } from "../../../../context/context"


export type Research = {
  lattes_id: string
  name: string
  researcher_id: string
  dep_id: string
}



export const columnsDepartament: ColumnDef<Research>[] = [
 
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
    id: "actions",
    cell: ({ row }) => {
      
      const {onOpen } = useModal();
      const name = row.original.name;
    
 
      return (
       <div className="flex gap-3">
           <Button  onClick={() => onOpen('researcher-modal', {name:name})} variant={'ghost'} className="h-8 w-8 p-0 ">
      <Eye size={8} className="h-4 w-4" />
</Button>

         <Button  onClick={() => onOpen('confirm-delete-researcher-departament', {lattes_id:row.original.researcher_id, graduate_program_id:row.original.dep_id, nome:row.original.name})} variant={'destructive'} className="h-8 w-8 p-0 text-white  dark:text-white">
                       <Trash size={8} className="h-4 w-4" />
                     </Button>
       </div>
      )
    },
  },
]
