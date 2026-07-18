import { Link, Plus } from "lucide-react";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { Button } from "../../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Alert } from "../../../ui/alert";
import { useState } from "react";

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function VideoSection (props:Props) {
  const sanitizeUrlVideo = (item: string): string => {
    let idVideo = '';
    if (item) {
      // Verifica as três formas possíveis de URL
      const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
      const match = item.match(regex);
      if (match) {
        idVideo = match[1];
      }
    }
    return idVideo ? `https://www.youtube.com/embed/${idVideo}` : '';
  };
 const [open, setOpen] = useState(false);

    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
              <div className="w-full flex md:flex-row flex-col md: h-28">
                                   
                                 <div>
                                 <iframe
                             width="100%"
                             
                             className="w-full h-full border md:border-r-0 border-b-0 md:border-b dark:border-neutral-800 md:rounded-l-md md:rounded-tr-none rounded-t-md"
                             src={sanitizeUrlVideo(props.contentItem.url)}
                             title="YouTube video player"
                             frameBorder="0"
                             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                             allowFullScreen
                         />
                                 </div>
                                   <Alert className="flex gap-2 items-center md:rounded-tr-md p-4  w-full rounded-t-none md:rounded-l-none">
                                   
                                  
                                 <div className="w-full flex flex-1 flex-col">
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
                                  className="rounded-none font-medium text-lg  w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Digite o título aqui"/>
             

             <Input 
                                   value={props.contentItem.description}
                                   onChange={(e) => {
                                    const newContent = [...props.keepoData.content]; // Cria uma cópia do array
                                    newContent[props.index] = { ...newContent[props.index], description: e.target.value }; // Atualiza apenas o item específico
                          
                                    props.setKeepoData((prev) => ({
                                      ...prev,
                                      content: newContent, // Atualiza o array no estado
                                    }));
                                  }}
                                  className="text-gray-500  rounded-none text-sm w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Descrição"/>
             
                                 </div>
                                 <Popover open={open} onOpenChange={setOpen}>
               <PopoverTrigger>
               <Button
                                   variant="ghost"
                                   size="icon"
                                   className="h-8 w-8 "
                                 
                                 >
                                   <Link size={16} />
                                 </Button>
               </PopoverTrigger>
               <PopoverContent className="flex flex-col gap-3" side='left' align='center'>
                 <Input 
                 value={props.contentItem.url}
                 onChange={(e) => {
                  const newContent = [...props.keepoData.content]; // Cria uma cópia do array
                  newContent[props.index] = { ...newContent[props.index], url: e.target.value }; // Atualiza apenas o item específico
             
                  props.setKeepoData((prev) => ({
                    ...prev,
                    content: newContent, // Atualiza o array no estado
                  }));
                }}
                placeholder="https://www..." />
                 <Button onClick={() =>  setOpen(false)} className="w-full"><Plus size={16}/>Adicionar link</Button>
                 </PopoverContent>
             </Popover>
             
                                   </Alert>
                                  </div>
        </Base>
    )
}