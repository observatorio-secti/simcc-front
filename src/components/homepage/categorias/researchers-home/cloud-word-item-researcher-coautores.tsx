import { useContext } from "react"
import { Alert } from "../../../ui/alert"
import { Badge } from "../../../ui/badge"
import { UserContext } from "../../../../context/context"
import { useModal } from "../../../hooks/use-modal-store"

interface Props{
    id: string,
    name: string
    among: string
    fontSize: number
}

export function CloudWordItemResearcherCoautores(props:Props) {
    const { searchType} = useContext(UserContext)

    const {onOpen} = useModal()
    

    return(
        <li key={props.id} className="list-none list-item w-min group" >
        <div
         
          className="inline-flex whitespace-nowrap cursor-pointer"
        >
          <Alert
           className={`flex gap-4 font-bold  text-white items-center
           ${
            ( searchType === 'article') && 'bg-yellow-500 ' ||
            (searchType === 'abstract') && 'bg-orange-500 ' ||
            (searchType === 'speaker') && 'bg-red-500' ||
            ('')
        }
        `}
            style={{ fontSize: `${props.fontSize}%` }}
          >
            {props.name} {props.among}
     
          </Alert>
        </div>
      </li>
    )
}