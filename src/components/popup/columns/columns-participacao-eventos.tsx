import { ColumnDef } from "@tanstack/react-table"
import { CalendarBlank } from "phosphor-react"

type ParticipacaoEvento = {

  id?: string,
  nome_evento: string,
  ano: string,
  tipo_evento: string,
  participou_como: string
}


export const columnsParcicipacaoEvento: ColumnDef<ParticipacaoEvento>[] = [

  {
    accessorKey: "event_name",
    header: "Evento",
  },
  {
    accessorKey: "year",
    header: "Ano",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center"><CalendarBlank size={12} /> {row.getValue("year")}</div>
    }
  },
  {
    accessorKey: "nature",
    header: "Tipo"
  },
  {
    accessorKey: "participation",
    header: "Participou como"
  }

]
