import { ColumnDef } from "@tanstack/react-table"
import { Maximize2 } from "lucide-react"
import { CalendarBlank } from "phosphor-react"
import { Button } from "../../ui/button"

import { useModalSecundary } from "../../hooks/use-modal-store-secundary"

type ProjetoPesquisa = {

  agency_code: string
  agency_name: string
  nature: string
  description: string
  end_year: string
  id: string
  number_academic_masters: string
  number_phd: string
  number_specialists: string
  number_undergraduates: string
  project_name: string
  start_year: string
  status: string
  researcher_id: string
  production: Production[]
  foment: Forment[]
  components: Components[]
  researcher_name: string
}

interface Components {
  citations: string
  lattes_id: string
  name: string
}

interface Production {

  title: string
  type: string
}

interface Forment {
  agency_code: string
  agency_name: string
  nature: string
}

export const columnsProjetoPesquisa: ColumnDef<ProjetoPesquisa>[] = [
  {
    accessorKey: "project_name",
    header: "Título",
  },
  {
    accessorKey: "nature",
    header: "Tipo",
    cell: ({ row }) => {
      return <div className="flex items-center gap-4"> {(row.getValue("nature") != undefined) && (
        row.getValue("nature")
      )}
      </div>
    }
  },
  {
    accessorKey: "start_year",
    header: "Ano",
    cell: ({ row }) => {

      return <div className="flex gap-1 items-center"><CalendarBlank size={12} /> <div className="whitespace-nowrap">{row.original.start_year} - {row.original.end_year == '' ? ('atual') : (row.original.end_year)}</div></div>
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      return <div className="text-sm text-gray-500 whitespace-nowrap dark:text-gray-300 font-normal flex gap-1 items-center"><div className={`h-4 w-4 rounded-md ${row.original.status == 'EM ANDAMENTO' ? ('bg-yellow-500'): row.original.status == 'DESATIVADO' ? ('bg-red-500'):('bg-green-500')}`}></div>{row.original.status.split('_').join(' ')}</div>
    }
  },
  {

    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      const { onOpen } = useModalSecundary()

      return (
        <div className="flex gap-3">
          <Button
            onClick={() =>
              onOpen('project-modal', {
                agency_code: row.original.agency_code,
                agency_name: row.original.agency_name,
                nature: row.original.nature,
                description: row.original.description,
                end_year: row.original.end_year,
                id: row.original.id,
                number_academic_masters: row.original.number_academic_masters,
                number_phd: row.original.number_phd,
                number_specialists: row.original.number_specialists,
                number_undergraduates: row.original.number_undergraduates,
                project_name: row.original.project_name,
                start_year: row.original.start_year,
                status: row.original.status,
                researcher_id: row.original.researcher_id,
                production: row.original.production,
                foment: row.original.foment,
                components: row.original.components,
                researcher_name: row.original.researcher_name
              })
            }
            variant="outline"
            size={'icon'}
            className="  text-sm h-8 w-8 text-gray-500 dark:text-gray-300"
          >
            <Maximize2 size={16} />
          </Button>

        </div>
      )
    },
  },
]