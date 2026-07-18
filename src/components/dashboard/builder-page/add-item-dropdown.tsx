import { Alert } from "../../ui/alert";
import { DropdownMenuItem } from "../../ui/dropdown-menu";

interface Props {
titulo:string
chidren:any
desc:string
}

export function AddItemDropdown(props:Props) {
    return(
         <DropdownMenuItem className="flex items-start gap-2">
         {props.chidren}
        <div>
           <p className="">{props.titulo}</p>
           <p className="text-gray-500 text-xs">{props.desc}</p>
        </div>
           </DropdownMenuItem>
    )
}