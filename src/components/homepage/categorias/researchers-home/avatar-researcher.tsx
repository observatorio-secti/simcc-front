import { useContext } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";
import { UserContext } from "../../../../context/context";
import { Alert } from "../../../ui/alert";
import { User } from "phosphor-react";

interface Props {
    raw_affiliation_string:string
    display_name:string
    
}

export function AvatarResearcher(props:Props) {
const {urlGeral} = useContext(UserContext)

    return(
        <Alert className="flex gap-4 items-center w-fit">
          <Avatar className="cursor-pointer rounded-md">
                    <AvatarImage  className={'rounded-md'} src={`${urlGeral}ResearcherData/Image?name=${props.display_name}`} />
                    <AvatarFallback className="flex items-center justify-center"><User size={16}  /></AvatarFallback>
                </Avatar>
        
            <div>
            <p className="text-xs truncate font-bold max-w-[270px]">{props.display_name}</p>
            <p className="text-xs truncate max-w-[270px]">{props.raw_affiliation_string}</p>
            </div>
        
        </Alert>
    )
}