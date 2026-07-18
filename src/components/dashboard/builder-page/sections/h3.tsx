import { Input } from "../../../ui/input";
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

export function H3Section (props:Props) {
    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
             
             <Input 
                      value={props.contentItem.title}
                      onChange={(e) => {
                       const newContent = [...props.keepoData.content]; // Cria uma cópia do array
                       newContent[props.index] = { ...newContent[props.index], title: e.target.value }; // Atualiza apenas o item específico
             
                       props.setKeepoData((prev) => ({
                         ...prev,
                         content: newContent, // Atualiza o array no estado
                       }));
                     }}
                     className="text-xl font-semibold  rounded-none bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Título 3"/>
        </Base>
    )
}