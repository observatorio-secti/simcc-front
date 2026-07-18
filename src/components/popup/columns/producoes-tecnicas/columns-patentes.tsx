

import { ColumnDef } from "@tanstack/react-table"

import { Button } from "../../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu"
import {  MoreHorizontal, User } from "lucide-react"
import { CalendarBlank, Export, LinkBreak} from "phosphor-react"
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar"
import { useModal } from "../../../hooks/use-modal-store"
import { useContext } from "react"
import { UserContext } from "../../../../context/context"







type Patente = {
  id: string,
  grant_date: string,
  title: string,
  year: string,
  financing: string,
  project_name: string
  name:string
  }



export const columns: ColumnDef<Patente>[] = [



 {
        accessorKey: "title",
        header: "Título",
      },
     
      {
        accessorKey: "year",
        header: "Ano",
        cell: ({ row }) => {

          return <div className="flex gap-1 items-center"><CalendarBlank size={12}/> {row.getValue("year")}</div>
        }
      },
     
      {
        accessorKey: "grant_date",
        header: "Status",
        cell: ({ row }) => {

          return <div className="whitespace-nowrap text-sm  dark:text-gray-300 font-normal flex gap-2 items-center">
          <div className={`w-4 h-4 rounded-md ${(row.original.grant_date == 'NaT' || row.original.grant_date == "None" || row.original.grant_date == "" || row.original.grant_date == null) ? "bg-red-500" : 'bg-green-500'}`}></div>

          {(row.original.grant_date == 'NaT' || row.original.grant_date == "None" || row.original.grant_date == "" || row.original.grant_date == null) ? "Sem concessão" : row.original.grant_date}</div>
        }
      },

      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => {
          const { urlGeral, user, permission } = useContext(UserContext);
          
  const {onOpen:onOpen2, isOpen:isOpen2} = useModal()
          return  <div className="flex gap-2 items-center cursor-pointer" onClick={() => onOpen2('researcher-modal', {name:row.original.name})}>
          <Avatar className="cursor-pointer rounded-md  h-5 w-5">
                        <AvatarImage className={'rounded-md h-5 w-5'} src={`${urlGeral}ResearcherData/Image?name=${row.original.name}`} />
                        <AvatarFallback className="flex items-center justify-center"><User size={10} /></AvatarFallback>
                      </Avatar>
            <p className="text-sm  dark:text-gray-300 font-normal flex gap-1 items-center">{row.original.name}</p>
          </div>
        }
      },
      
  
    
    
   
 
 

]
