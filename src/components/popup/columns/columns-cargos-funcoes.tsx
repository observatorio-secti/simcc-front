import { ColumnDef } from "@tanstack/react-table"
import { Check, Clock, TextSelectionIcon, X } from "lucide-react"
import { CalendarBlank } from "phosphor-react"

type ProjetoPesquisa = {
  id:string
  researcher_id:string
  enterprise:string
  start_year:string
  end_year:string
  employment_type:string
  other_employment_type:string
  functional_classification:string
  other_functional_classification:string
  workload_hours_weekly:string
  exclusive_dedication:boolean
  additional_info:string
}


export const columnsCargosFuncoes: ColumnDef<ProjetoPesquisa>[] = [

  {
    accessorKey: "enterprise",
    header: "Empresa",
  },
  {
    accessorKey: "functional_classification",
    header: "Função",
    cell: ({ row }) => {
      return <div className="flex items-center gap-4"> 
      {row.original.functional_classification} {row.original.other_functional_classification != null && (`- ${row.original.other_functional_classification}`)}
      </div>
    }
  },
  {
    accessorKey: "start_year",
    header: "Ano",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center whitespace-nowrap"><CalendarBlank size={12} /> {row.original.start_year} - {(row.original.end_year == null || row.original.end_year == '') ? 'Atual': (row.original.end_year)}</div>
    }
  },
  {
    accessorKey: "workload_hours_weekly",
    header: "Hora semanal",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center"> <Clock size={12} /> {row.original.workload_hours_weekly} horas</div>
    }
  },

  {
    accessorKey: "employment_type",
    header: "Tipo",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center whitespace-nowrap"> <TextSelectionIcon size={12} /> {row.original.employment_type.split('_').join(' ')} </div>
    }
  },

  {
    accessorKey: "exclusive_dedication",
    header: "D. exclusiva",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center"> {row.original.exclusive_dedication ? (<Check size={12} /> ):(<X size={12} /> )}  {row.original.exclusive_dedication ? ('Sim'):('Não')} </div>
    }
  },

]
