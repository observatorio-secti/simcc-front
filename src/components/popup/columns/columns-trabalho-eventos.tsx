import { ColumnDef } from "@tanstack/react-table"
import { CalendarBlank } from "phosphor-react"

type ProjetoPesquisa = {

  id?: string,
  title: string,
  year: string,
  meio: string
  means_divulgation:string
}


export const columnsTrabalhoEvento: ColumnDef<ProjetoPesquisa>[] = [

  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "means_divulgation",
    header: "Divulgação",
    cell: ({ row }) => {
      return <div className="flex items-center gap-4"> {(row.getValue("means_divulgation") != undefined) && (
        row.original.means_divulgation.split('_').join(' ')
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

]
