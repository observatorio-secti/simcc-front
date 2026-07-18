

import { ColumnDef } from "@tanstack/react-table"


import { CalendarBlank, LinkBreak} from "phosphor-react"

import { Hash, User } from "lucide-react"
import { useContext } from "react"
import { Link } from "react-router-dom"
import { qualisColor } from "../magazine-home"






type Livros = {
    id: string,
    issn: string,
    jcr_link: string,
    jif: string,
    magazine: string,
    qualis: string
  }



export const columnsMagazine: ColumnDef<Livros>[] = [



 {
        accessorKey: "magazine",
        header: "Revista",
      },
     
      {
        accessorKey: "jif",
        header: "JCR",
        cell: ({ row }) => {

          return <div>
             {row.original.jif != "None" && (
              <Link to={row.original.jcr_link} className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                <LinkBreak size={16} />JCR
              </Link>
            )}
          </div>
        }
      },

      {
        accessorKey: "qualis",
        header: "Qualis",
        cell: ({ row }) => {

          return   <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
          <div className={`w-4 h-4 rounded-md ${qualisColor[row.original.qualis as keyof typeof qualisColor]}`}></div>Qualis {row.original.qualis}
        </div>
        }
      },

      {
        accessorKey: "issn",
        header: "ISSN",
        cell: ({ row }) => {

          return  <div className="flex items-center gap-2">
          <Hash size={16} className="text-gray-400" />
          <p className="text-[13px]  text-gray-500">ISSN {row.original.issn}</p>
      </div>
        }
      },

     

     
 

]
