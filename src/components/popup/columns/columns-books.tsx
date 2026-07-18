

import { ColumnDef } from "@tanstack/react-table"


import { CalendarBlank,  LinkBreak} from "phosphor-react"
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar";
import { useModal } from "../../hooks/use-modal-store";
import { useContext } from "react";
import { UserContext } from "../../../context/context";
import { User } from "lucide-react";





export type Livros = {
    id: string,
    title: string,
    year: string,
    isbn: string,
    publishing_company: string
    name:string
  }



export const columns: ColumnDef<Livros>[] = [



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
        accessorKey: "isbn",
        header: "ISBN",
        cell: ({row}) =>{
            return        <div className="flex items-center gap-4"> {(row.getValue("year")!= undefined) && (
                   <Link to={`https://www.cblservicos.org.br/isbn/pesquisa/?page=1&q=${row.getValue("year")}&filtrar_por%5B0%5D=todos&ord%5B0%5D=relevancia&dir%5B0%5D=asc`} target="_blank"  className="text-sm font-normal flex gap-1 items-center"><LinkBreak size={16} className="" />ISBN {row.getValue("isbn")}</Link>
                )}
            </div>
        }
      },
      {
        accessorKey: "publishing_company",
        header: "Editora",
      },

      {
        accessorKey: "name",
        header: "Nome",
        cell: ({ row }) => {
          const { urlGeral, user, permission } = useContext(UserContext);
          
  const {onOpen:onOpen2, isOpen:isOpen2} = useModal()
          return  <div className="flex whitespace-nowrap gap-2 items-center cursor-pointer" onClick={() => onOpen2('researcher-modal', {name:row.original.name})}>
          <Avatar className="cursor-pointer rounded-md  h-5 w-5">
                        <AvatarImage className={'rounded-md h-5 w-5'} src={`${urlGeral}ResearcherData/Image?name=${row.original.name}`} />
                        <AvatarFallback className="flex items-center justify-center"><User size={10} /></AvatarFallback>
                      </Avatar>
            <p className="text-sm  dark:text-gray-300 font-normal flex gap-1 items-center">{row.original.name}</p>
          </div>
        }
      },
    
   
 
 

]
