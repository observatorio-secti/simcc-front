
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "../../components/ui/button"

import { ArrowUpDown } from "lucide-react"



export interface PesquisadorProps {
  area: string,
  institution: string,
  first_leader: string,
  first_leader_id: string,
  second_leader: string,
  second_leader_id: string,
  name: string,
  id: string
  }


export const columns: ColumnDef<PesquisadorProps>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nome do grupo
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      
      
     
      return <div className="flex gap-3 items-center" > {row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "first_leader",
    header: () => <div className="text-right flex items-center">Líder</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1  ">{row.getValue("first_leader")}</div>
      
    },
  },
  {
    accessorKey: "second_leader",
    header: () => <div className="text-right flex items-center">Vice-líder</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1  ">{row.getValue("second_leader")}</div>
      
    },
  },

  {
    accessorKey: "area",
    header: () => <div className="text-right flex items-center">Área</div>,
    cell: ({ row }) => {
      const qualisColor: { [key: string]: string } = {
        "ASTRONOMIA": "bg-red-200",
        "FÍSICA": "bg-blue-200",
        "GEOCIÊNCIAS": "bg-green-200",
        "MATEMÁTICA": "bg-yellow-200",
        "OCEANOGRAFIA": "bg-teal-200",
        "PROBABILIDADE E ESTATÍSTICA": "bg-purple-200",
        "QUÍMICA": "bg-orange-200",
        "AGRONOMIA": "bg-red-800",
        "CIÊNCIA E TECNOLOGIA DE ALIMENTOS": "bg-blue-800",
        "ENGENHARIA AGRÍCOLA": "bg-green-800",
        "MEDICINA VETERINÁRIA": "bg-yellow-800",
        "RECURSOS FLORESTAIS E ENGENHARIA FLORESTAL": "bg-teal-800",
        "RECURSOS PESQUEIROS E ENGENHARIA DE PESCA": "bg-purple-800",
        "ZOOTECNIA": "bg-orange-800",
        "BIOFÍSICA": "bg-red-600",
        "BIOLOGIA GERAL": "bg-blue-600",
        "BIOQUÍMICA": "bg-green-600",
        "BIOTECNOLOGIA": "bg-yellow-600",
        "BOTÂNICA": "bg-teal-600",
        "ECOLOGIA": "bg-purple-600",
        "FARMACOLOGIA": "bg-orange-600",
        "FISIOLOGIA": "bg-red-400",
        "GENÉTICA": "bg-blue-400",
        "IMUNOLOGIA": "bg-green-400",
        "MICROBIOLOGIA": "bg-yellow-400",
        "MORFOLOGIA": "bg-teal-400",
        "PARASITOLOGIA": "bg-purple-400",
        "ZOOLOGIA": "bg-orange-400",
        "EDUCAÇÃO FÍSICA": "bg-red-300",
        "ENFERMAGEM": "bg-blue-300",
        "FARMÁCIA": "bg-green-300",
        "FISIOTERAPIA E TERAPIA OCUPACIONAL": "bg-yellow-300",
        "FONOAUDIOLOGIA": "bg-teal-300",
        "MEDICINA": "bg-purple-300",
        "NUTRIÇÃO": "bg-orange-300",
        "ODONTOLOGIA": "bg-red-100",
        "SAÚDE COLETIVA": "bg-blue-100",
        "ANTROPOLOGIA": "bg-green-100",
        "ARQUEOLOGIA": "bg-yellow-100",
        "CIÊNCIA POLÍTICA": "bg-teal-100",
        "EDUCAÇÃO": "bg-purple-100",
        "FILOSOFIA": "bg-orange-100",
        "GEOGRAFIA": "bg-red-900",
        "HISTÓRIA": "bg-blue-900",
        "PSICOLOGIA": "bg-green-900",
        "SOCIOLOGIA": "bg-yellow-900",
        "TEOLOGIA": "bg-teal-900",
        "CIÊNCIA DA COMPUTAÇÃO": "bg-purple-900",
        "DESENHO INDUSTRIAL": "bg-orange-900",
        "ENGENHARIA AEROESPACIAL": "bg-red-500",
        "ENGENHARIA BIOMÉDICA": "bg-blue-500",
        "ENGENHARIA CIVIL": "bg-green-500",
        "ENGENHARIA DE ENERGIA": "bg-yellow-500",
        "ENGENHARIA DE MATERIAIS E METALÚRGICA": "bg-teal-500",
        "ENGENHARIA DE MINAS": "bg-purple-500",
        "ENGENHARIA DE PRODUÇÃO": "bg-orange-500",
        "ENGENHARIA DE TRANSPORTES": "bg-red-700",
        "ENGENHARIA ELÉTRICA": "bg-blue-700",
        "ENGENHARIA MECÂNICA": "bg-green-700",
        "ENGENHARIA NAVAL E OCEÂNICA": "bg-yellow-700",
        "ENGENHARIA NUCLEAR": "bg-teal-700",
        "ENGENHARIA QUÍMICA": "bg-purple-700",
        "ENGENHARIA SANITÁRIA": "bg-orange-700",
        "ARTES": "bg-red-50",
        "LETRAS": "bg-blue-50",
        "LINGÜÍSTICA": "bg-green-50",
        "BIOÉTICA": "bg-yellow-50",
        "CIÊNCIAS AMBIENTAIS": "bg-teal-50",
        "DEFESA": "bg-purple-50",
        "DIVULGAÇÃO CIENTÍFICA": "bg-orange-50",
        "MICROELETRÔNICA": "bg-red-700",
        "ROBÓTICA, MECATRÔNICA E AUTOMAÇÃO": "bg-blue-700",
        "SEGURANÇA CONTRA INCÊNDIO": "bg-green-700",
        "ADMINISTRAÇÃO": "bg-yellow-700",
        "ARQUITETURA E URBANISMO": "bg-teal-700",
        "CIÊNCIA DA INFORMAÇÃO": "bg-purple-700",
        "COMUNICAÇÃO": "bg-orange-700",
        "DEMOGRAFIA": "bg-red-100",
        "DIREITO": "bg-blue-100",
        "ECONOMIA": "bg-green-100",
        "ECONOMIA DOMÉSTICA": "bg-yellow-100",
        "MUSEOLOGIA": "bg-teal-100",
        "PLANEJAMENTO URBANO E REGIONAL": "bg-purple-100",
        "SERVIÇO SOCIAL": "bg-orange-100",
        "TURISMO": "bg-red-200",
      };

      const normalizeArea = (area: string): string => {
        return area
    
          .toUpperCase(); // Converte para maiúsculas
      };

      return  <div className="flex w-fit gap-1 items-center  "> <div className={`w-4 min-w-4 h-4 rounded-md dark:border-neutral-800 border  border-neutral-200  ${qualisColor[normalizeArea(row.original.area || '')]} min-h-full relative`}></div>{row.getValue("area")}</div>
      
    },
  },

  {
    accessorKey: "institution",
    header: () => <div className="text-right flex items-center">Instituição</div>,
    cell: ({ row }) => {
    
      return  <div className="flex w-fit gap-1   ">{row.getValue("institution")}</div>
      
    },
  },


 
]
