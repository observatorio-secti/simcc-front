

import { ColumnDef } from "@tanstack/react-table"

import { Button } from "../../components/ui/button"
import { ArrowUpDown } from "lucide-react"
import { Buildings, MapPin, Plus, X } from "phosphor-react"
import { GraduationCap } from "lucide-react"
import { useContext } from "react"
import { UserContext } from "../../context/context"
//import { UserContext } from "../../../../context/context"


export type Research = {
  id: string,
  name: string,
  university: string,
  lattes_id: string,
  area: string,
  city: string,
  graduation: string,
}



export const columns: ColumnDef<Research>[] = [

  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {

      const lattes_id = row.original.id;
      const { urlGeral } = useContext(UserContext)
      return <div className="flex gap-3 items-center" >  <div className="h-8 w-8  bg-cover bg-top bg-no-repeat rounded-md whitespace-nowrap" style={{ backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${lattes_id}) ` }}></div> <div className="flex-1 flex">{row.getValue("name")}</div></div>
    },
  },


  {
    accessorKey: "university",

    header: () => <div className="text-right flex items-center">Universidade</div>,
    cell: ({ row }) => {


      return <div className="text-xs flex items-center gap-1"><Buildings size={12} /> {row.getValue("university")}</div>
    },
  },
  {
    accessorKey: "graduation",

    header: () => <div className="text-right flex items-center">Titulação</div>,
    cell: ({ row }) => {

      return <div className="flex w-fit gap-1 text-xs p-2 border items-center border-gray-300 dark:border-stone-700 rounded-md "><GraduationCap size={12} />{row.getValue("graduation")}</div>


    },
  },
  {
    accessorKey: "city",

    header: () => <div className="text-right flex items-center">Cidade</div>,
    cell: ({ row }) => {

      return <div className="flex w-fit gap-1 text-xs p-2 border items-center border-gray-300 dark:border-stone-700 rounded-md"><MapPin size={12} />{row.getValue("city")}</div>



    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const { pesquisadoresSelecionados, setPesquisadoresSelecionados } = useContext(UserContext)

      return (
        <Button
          variant={'default'}
          onClick={() => {
            // Verifica se o pesquisador já está selecionado pelo nome
            if (pesquisadoresSelecionados.some(pesquisador => pesquisador.name === row.original.name)) {
              // Remove o pesquisador selecionado com o nome correspondente
              setPesquisadoresSelecionados(prev => prev.filter(pesquisador => pesquisador.name !== row.original.name));
            } else {
              // Adiciona o novo pesquisador selecionado
              setPesquisadoresSelecionados(prev => [
                ...prev,
                {
                  id: row.original.id,
                  name: row.original.name,
                  university: row.original.university,
                  lattes_id: row.original.lattes_id,
                  city: row.original.city,
                  area: row.original.area,
                  graduation: row.original.graduation,
                }
              ]);
            }
          }}
          className={`h-8 w-8 p-0 text-white dark:text-white ${pesquisadoresSelecionados.some(pesquisador => pesquisador.name === row.original.name) && 'bg-red-500 hover:bg-red-600 text-white'
            }`}
        >
          {pesquisadoresSelecionados.some(pesquisador => pesquisador.name === row.original.name) ? (
            <X size={16} className="" />
          ) : (
            <Plus size={16} className="" />
          )}
        </Button>
      )
    },
  },
]
