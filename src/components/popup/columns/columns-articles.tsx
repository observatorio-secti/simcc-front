import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu"

import { Maximize2, MoreHorizontal } from "lucide-react"
import { CalendarBlank, Export, LinkBreak } from "phosphor-react"
import { useModalSecundary } from "../../hooks/use-modal-store-secundary"





export type Articles = {
  id: string,
  doi: string,
  name_periodical: string,
  qualis: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "None" | "NP" | "SQ",
  title: string,
  year: string,
  color: string,
  researcher: string,
  lattes_id: string,
  magazine: string,
  lattes_10_id: string,
  jif: string,
  jcr_link: string
  researcher_id: string
  distinct: boolean
  abstract: string,
  article_institution: string,
  authors: string
  authors_institution: string
  citations_count: string
  issn: string
  keywords: string
  landing_page_url: string
  language: string
  pdf: string
  has_image: boolean
  relevance: boolean
}

export const columns: ColumnDef<Articles>[] = [

  {
    accessorKey: "title",
    header: "Título",
  },
  {
    accessorKey: "magazine",
    header: "Revista",
  },
  {
    accessorKey: "year",
    header: "Ano",
    cell: ({ row }) => {
      return <div className="flex gap-1 items-center"><CalendarBlank size={12} /> {row.getValue("year")}</div>
    }
  },
  {
    accessorKey: "qualis",
    header: "Qualis",
    cell: ({ row }) => {
      const qualisColor = {
        'A1': 'bg-[#006837]',
        'A2': 'bg-[#8FC53E]',
        'A3': 'bg-[#ACC483]',
        'A4': 'bg-[#BDC4B1]',
        'B1': 'bg-[#F15A24]',
        'B2': 'bg-[#F5831F]',
        'B3': 'bg-[#F4AD78]',
        'B4': 'bg-[#F4A992]',
        'B5': 'bg-[#F2D3BB]',
        'C': 'bg-[#EC1C22]',
        'None': 'bg-[#560B11]',
        'SQ': 'bg-[#560B11]'
      }

      return <div className="flex gap-1 items-center" ><div className={`w-4 h-4 rounded-md  ${qualisColor[row.getValue("qualis") as keyof typeof qualisColor]}`}></div>  {row.getValue("qualis")}</div>
    },
  },

  {
    accessorKey: "jcr_link",
    header: "JCR",
    cell: ({ row }) => {
      const jif = row.original.jif;
      return <div>
        {(jif != "None" && jif.length != 0) && (
          <a href={row.getValue("jcr_link")} target="_blank" rel="noopener noreferrer" className="border-[1px] cursor-pointer border-gray-300 py-2 flex px-4 text-gray-400 rounded-md text-xs font-medium gap-2 items-center  whitespace-nowrap"><LinkBreak size={16} className="text-gray-400" />JCR {jif}</a>
        )}
      </div>
    }
  },

  {
    accessorKey: "citations_count",
    header: "Citações",
    cell: ({ row }) => {
      const jif = row.original.jif;
      return <div className="flex gap-1 items-center" > {row.getValue("citations_count")}</div>
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
              onOpen('articles-modal', {
                doi: row.original.doi,
                id: row.original.id,
                qualis: row.original.qualis,
                title: row.original.title,
                year: row.original.year,
                jif: row.original.jif,
                lattes_10_id: row.original.lattes_10_id,
                researcher_id: row.original.researcher_id,
                magazine: row.original.name_periodical,
                abstract: row.original.abstract,
                article_institution: row.original.article_institution,
                authors: row.original.authors,
                authors_institution: row.original.authors_institution,
                citations_count: row.original.citations_count,
                issn: row.original.issn,
                keywords: row.original.keywords,
                landing_page_url: row.original.landing_page_url,
                language: row.original.language,
                pdf: row.original.pdf,
                researcher: row.original.researcher,
                has_image: row.original.has_image,
                relevance: row.original.relevance
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
