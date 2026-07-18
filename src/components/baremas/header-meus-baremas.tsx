import { useContext, useEffect } from "react"
import { UserContext } from "../../context/context"
import { Trash, X } from "phosphor-react"
import { Button } from "../ui/button"

export function HeaderMeusBarema() {
    const { pesquisadoresSelecionados, urlGeral, setPesquisadoresSelecionados } = useContext(UserContext)
      
    return(
        <div className="my-8">
            <div className="flex  gap-6 w-full flex-col  ">
            <div>
            <h1 className=" text-3xl mb-4  font-medium max-w-[380px] ">
 <strong className="bg-red-700 font-medium text-white">Barema</strong> de avaliação dos pesquisadores
      </h1>
      <p className="mt-2 max-w-[420px] text-gray-500 dark:text-gray-300">O sistema de classificação, é uma estrutura criada para avaliar e classificar pesquisadores com base em critérios específicos.</p>
            </div>

           
          
        </div>
        </div>
    )
}