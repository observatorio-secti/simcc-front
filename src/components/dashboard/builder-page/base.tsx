import { ChevronDown, ChevronUp, Trash } from "lucide-react";
import { Button } from "../../ui/button";
import { DropdownMenuBuilder } from "./dropdown-menu";
import { Keepo } from "./builder-page";


interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    children?: React.ReactNode;
}

export function Base(props:Props) {
    return(
<div className="flex gap-2 group w-full">
                       
                       <div className="min-w-28 w-28 flex justify-end">
                    <div className="flex gap-2 whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 group-hover:flex hidden"
                        onClick={() => props.moveItem(props.index, "up")}
                        disabled={props.index === 0} // Desativa o botão se for o primeiro item
                      >
                        <ChevronUp size={16} />
                      </Button>
  
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 group-hover:flex hidden"
                        onClick={() => props.moveItem(props.index, "down")}
                        disabled={props.index === props.keepoData.content.length - 1} // Desativa se for o último
                      >
                        <ChevronDown size={16} />
                      </Button>
  
                      <DropdownMenuBuilder
                      setKeepoData={props.setKeepoData}
                      number={props.index}
                      />
                    </div>
  
                    
                  </div>
                    
                       <div className="w-full">
                        
{props.children}


                       </div>
                       
                      <div className="min-w-8 w-8">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 group-hover:flex hidden min-w-8"
                        onClick={() => props.deleteItem(props.index)}
                       
                      >
                        <Trash size={16} />
                      </Button>
                      </div>
                    </div>
    )
}