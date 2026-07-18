import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
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

export function TextSection (props:Props) {
    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
               <Textarea
                      value={props.contentItem.description}
                      onChange={(e) => {
                       const newContent = [...props.keepoData.content]; // Cria uma cópia do array
                       newContent[props.index] = { ...newContent[props.index], description: e.target.value }; // Atualiza apenas o item específico
             
                       props.setKeepoData((prev) => ({
                         ...prev,
                         content: newContent, // Atualiza o array no estado
                       }));
                     }}
                     className="text-gray-500 h-auto overflow-y-auto  rounded-none text-sm w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Parágrafo"/>
        </Base>
    )
}