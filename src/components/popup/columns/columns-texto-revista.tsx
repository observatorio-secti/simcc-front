import { ColumnDef } from "@tanstack/react-table"
import { CalendarBlank } from "phosphor-react"
import { useContext } from "react"
import { UserContext } from "../../../context/context"
import { useModal } from "../../hooks/use-modal-store"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { User } from "lucide-react"

type TextoRevista = {

  id?: string,
  title: string,
  year: string,
  language: string
  name:string
  nature:string
}


export const columnsTextoRevista: ColumnDef<TextoRevista>[] = [

  {
    accessorKey: "means_divulgation",
    header: "Status",
  },
  {
    accessorKey: "nature",
    header: "Revista",
    cell: ({ row }) => {
      return <div className="flex items-center gap-4"> {(row.getValue("nature") != undefined) && (
        row.original.nature.split('_').join(' ')
      )}
      </div>
    }
  },
  {
    accessorKey: "year_",
    header: "Ano",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center"><CalendarBlank size={12} /> {row.getValue("year_")}</div>
    }
  },
  {
    accessorKey: "language",
    header: "Idioma",
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
