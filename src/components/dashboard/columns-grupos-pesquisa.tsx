import { ColumnDef } from "@tanstack/react-table"

import {  ClockClockwise} from "phosphor-react"

import {GraduationCapIcon } from "lucide-react";




export type  PosGraduationsProps = {
  acronym: null,
    area: string
    institution_id: string
    institution_name: string
    last_date_sent: string
    lattes_id: string
    leader_name: string
    research_group_id: string
    research_group_name: string
    researcher_id: string
    situation: string
}


export const columns: ColumnDef<PosGraduationsProps>[] = [



 {
        accessorKey: "research_group_name",
        header: "Nome do grupo",
        cell: ({ row }) => {
         

          return <div className="flex gap-2 items-center"> {row.getValue("research_group_name")}</div>
        }
      },
      {
        accessorKey: "area",
        header: "Área",
        cell: ({ row }) => {

            return <div className="flex gap-1 items-center"><ClockClockwise size={12}/> {row.getValue("area")}</div>
          }
      },
      {
        accessorKey: "situation",
        header: "Situação",
        cell: ({ row }) => {

          return <div className="flex gap-1 items-center"><GraduationCapIcon size={12}/> {row.getValue("situation")}</div>
        }
      },
      
]
