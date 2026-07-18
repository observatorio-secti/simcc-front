
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"

import { ArrowUpDown } from "lucide-react"



interface Patrimonio {
  id: string
  id_lattes: string
  nome_beneficiario: string
  cpf_beneficiario: string
  nome_pais: string
  nome_regiao: string
  nome_uf: string
  nome_cidade: string
  nome_grande_area: string
  nome_area: string
  nome_sub_area: string
  cod_modalidade: string
  nome_modalidade: string
  titulo_chamada: string
  cod_categoria_nivel: string
  nome_programa_fomento: string
  nome_instituto: string
  quant_auxilio: string
  quant_bolsa: string
}



export const columnsBolsistas: ColumnDef<Patrimonio>[] = [
  {
    accessorKey: "nome_beneficiario",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome do pesquisador
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      
      
     
      return <div className="flex gap-3 items-center" > {row.getValue("nome_beneficiario")}</div>
    },
  },
  {
    accessorKey: "nome_modalidade",
    header: () => <div className="text-right flex items-center">Modalidade</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1 text-xs  ">{row.getValue("nome_modalidade")}</div>
      
    },
  },

 




 
]
