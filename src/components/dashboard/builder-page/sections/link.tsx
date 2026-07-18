import { Link, Plus } from "lucide-react";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { EmojiPicker } from "../emoji-picker";
import { Label } from "../../../ui/label";

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function LinkSection (props:Props) {
    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
             <div className="w-full">
                      <Alert className="flex gap-2 items-center p-4  w-full">
                      <EmojiPicker
                      contentItem={props.contentItem}
                  onSelect={(emoji) => {
                    const newContent = [...props.keepoData.content]; // Cria uma cópia do array
                    newContent[props.index] = { ...newContent[props.index], emoji: emoji }; // Atualiza apenas o item específico

                    props.setKeepoData((prev) => ({
                      ...prev,
                      content: newContent, // Atualiza o array no estado
                    }));
                  }}
                />

                     
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
                      className="text-gray-500  rounded-none text-sm w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent h-8" placeholder="Digite o título aqui"/>

                      <Popover>
  <PopoverTrigger>
  <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 "
                    
                    >
                      <Link size={16} />
                    </Button>
  </PopoverTrigger>
  <PopoverContent className="flex  items-end gap-3 w-[500px]" side='left' align='center'>
  <div className="grid items-center gap-1.5 w-full">
                    <Label>Link</Label>
                    <Input placeholder="https://www..." />
                  </div>
    
    <Button className="w-fit"><Plus size={16}/>Adicionar link</Button>
    </PopoverContent>
</Popover>

                      </Alert>
                     </div>
        </Base>
    )
}