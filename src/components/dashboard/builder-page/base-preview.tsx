import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { DropdownMenuBuilder } from "./dropdown-menu";
import { Keepo } from "./builder-page";


interface Props {
    keepoData:Keepo
    index:number
    children?: React.ReactNode;
}

export function BasePreview(props:Props) {
    return(
<div className="flex gap-2 group w-full">
                       
                      
                    
                       <div className="w-full">
                        
{props.children}


                       </div>
                       
                     
                    </div>
    )
}