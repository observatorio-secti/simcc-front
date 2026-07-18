import { Plus } from "lucide-react";
import { Button } from "../../../ui/button";
import { Base } from "../base";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function Social (props:Props) {
    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
            <div className="flex frex-wrap gap-3">
                <Button variant={'outline'} className="h-8 px-1"><Plus size={16}/>Adicionar rede social</Button>
            </div>
        </Base>
    )
}