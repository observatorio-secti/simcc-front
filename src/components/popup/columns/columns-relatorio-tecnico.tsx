import { ColumnDef } from "@tanstack/react-table"
import { CalendarBlank } from "phosphor-react"

type RelatorioTecnico = {

  id?: string,
  title: string,
  description: string,
  year: string,
  institution: string
}


export const columnsRelatorioTecnico: ColumnDef<RelatorioTecnico>[] = [

  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "description",
    header: "Descrição",
    cell: ({ row }) => {
      return <div className="flex items-center gap-4"> {(row.getValue("nature") != undefined) && (
        row.getValue("nature")
      )}
      </div>
    }
  },
  {
    accessorKey: "year",
    header: "Ano",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center"><CalendarBlank size={12} /> {row.getValue("year")}</div>
    }
  },
  {
    accessorKey: "financing",
    header: "Instituição",
  },

]
