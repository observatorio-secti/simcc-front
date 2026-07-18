import { useContext } from "react"
import { Alert } from "../../../ui/alert"
import { Badge } from "../../../ui/badge"
import { UserContext } from "../../../../context/context"
import { useModal } from "../../../hooks/use-modal-store"

interface Props{
    id: string,
    frequency:string,
    name: string
    among: string
    fontSize: number
}

export function CloudWordItemResearcher(props:Props) {
    const { searchType} = useContext(UserContext)

    const {onOpen} = useModal()
    

    return(
        <li key={props.id} className="list-none list-item w-min group" onClick={() => onOpen('researcher-modal', {name:props.name})} >
        <div
         
          className="inline-flex whitespace-nowrap cursor-pointer"
        >
          <Alert
           className={`flex gap-2 font-semibold   text-white items-center
           ${
            ( searchType === 'article') && 'bg-blue-500 dark:bg-blue-500 ' ||
            (searchType === 'abstract') && 'bg-yellow-500 dark:bg-yellow-500 ' ||
            (searchType === 'speaker') && 'bg-orange-500 dark:bg-orange-500' ||
            (searchType === 'book') && 'bg-pink-500 dark:bg-pink-500 ' ||
            (searchType === 'patent') && 'bg-cyan-500 dark:bg-cyan-500 ' ||
            (searchType === 'name') && 'bg-red-500 dark:bg-red-500' ||
            (searchType=== 'area') && 'bg-green-500 dark:bg-green-500' ||
            ('')
        }
        `}
            style={{ fontSize: `${props.fontSize}%` }}
          >
            {props.name}
          <div className="font-normal">
          {props.among} 
          </div>
          </Alert>
        </div>
      </li>
    )
}