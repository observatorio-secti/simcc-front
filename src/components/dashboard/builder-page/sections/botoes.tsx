import { Plus, Trash } from "lucide-react";
import { Button } from "../../../ui/button";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../ui/select";
import { BehanceLogo, FacebookLogo, GithubLogo, Globe, InstagramLogo, LinkedinLogo, X, YoutubeLogo } from "phosphor-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../../../lib/utils";

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function BotoesSection (props:Props) {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')

    const addSocialItem = (name: string, url: string, index: number) => {
        props.setKeepoData((prev) => {
          const updatedContent = [...prev.content];
      
          // Verifica se o índice especificado é válido
          if (updatedContent[index] && updatedContent[index].type === "botoes") {
            // Se o item social já existir no índice, adiciona o novo item
            updatedContent[index].items.push({ name, url, title: "", image: "" });
          } else {
            // Caso contrário, cria um novo item social no índice especificado
            updatedContent.splice(index, 0, {
              type: "botoes",
              title: "Redes Sociais",
              emoji: "",
              url: "",
              order: props.index,
              description: '',
              items: [{ name, url, title: "", image: "" }]
            });
          }
      
          return { ...prev, content: updatedContent };
        });
      
        setName('');
        setUrl('');
      };
      

    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
            <div className="flex flex-wrap gap-3">
            {props.contentItem.items.map((item, idx) => (
          <Popover>
            <PopoverTrigger>
                <Button
  variant={'outline'}
  className="h-8 px-2"
  style={{
    backgroundColor: props.keepoData.app.button_color,
    color: props.keepoData.app.button_text_color,
  
  }}
>
  {item.name}
</Button>
 </PopoverTrigger>
 <PopoverContent className="flex w-[400px]  items-end gap-3 " >

 <div className="grid items-center gap-1.5 w-full">
                   <Label>Título</Label>
                   <Input 
                   value={item.name} 
                   onChange={(e) => {
                     const newContent = [...props.keepoData.content]; // Clona o array de conteúdo
                     const updatedItems = [...props.contentItem.items]; // Clona os itens específicos
                     updatedItems[idx] = { ...updatedItems[idx], name: e.target.value }; // Atualiza apenas o item específico
             
                     newContent[props.index] = { ...newContent[props.index], items: updatedItems }; // Atualiza a lista de itens no objeto content
             
                     props.setKeepoData((prev) => ({
                       ...prev,
                       content: newContent, // Atualiza o estado
                     }));
                   }}
             
                   placeholder="" />
                 </div>

 <div className="grid items-center gap-1.5 w-full">
                   <Label>Link</Label>
                   <Input 
                   value={item.url} 
                   onChange={(e) => {
                     const newContent = [...props.keepoData.content]; // Clona o array de conteúdo
                     const updatedItems = [...props.contentItem.items]; // Clona os itens específicos
                     updatedItems[idx] = { ...updatedItems[idx], url: e.target.value }; // Atualiza apenas o item específico
             
                     newContent[props.index] = { ...newContent[props.index], items: updatedItems }; // Atualiza a lista de itens no objeto content
             
                     props.setKeepoData((prev) => ({
                       ...prev,
                       content: newContent, // Atualiza o estado
                     }));
                   }}
             
                   placeholder="https://www..." />
                 </div>
   


<Button
variant='destructive'
size="icon"
className="min-w-10"
onClick={() => {
const updatedItems = props.contentItem.items.filter((_, i) => i !== idx);
const newContent = [...props.keepoData.content];
newContent[props.index] = { ...newContent[props.index], items: updatedItems };
props.setKeepoData((prev) => ({ ...prev, content: newContent }));
}}
>
<Trash size={16} />
</Button>

   </PopoverContent>
</Popover>


              
              ))}
            <Popover>
  <PopoverTrigger>
  <Button variant={'outline'} className="h-8 px-2"><Plus size={16}/>Adicionar botão</Button>
  </PopoverTrigger>
  <PopoverContent className="flex flex-col  items-end gap-3 " >
  <div className="grid items-center gap-1.5 w-full">
                    <Label>Título do botão</Label>
                    <Input 
                    value={name} onChange={(e) => setName(e.target.value)}
                   />

                  </div>
 
  <div className="grid items-center gap-1.5 w-full">
                    <Label>Link</Label>
                    <Input 
                    value={url} onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www..." />
                  </div>
    
    <Button
     onClick={() => {
        if(name != '' && url != '') {
            addSocialItem(name, url, props.index)
        }
     }}
    
    className="w-full"><Plus size={16}/>Adicionar</Button>
    </PopoverContent>
</Popover>
              
            </div>
        </Base>
    )
}