import { ChevronDown, ChevronUp, Dot, Plus, Trash } from "lucide-react";
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
import { Alert } from "../../../ui/alert";

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function ListSection (props:Props) {
  

  const addSocialItem = (index: number) => {
    props.setKeepoData((prev) => {
      const updatedContent = [...prev.content];
      // Verifica se a posição especificada pelo índice existe no conteúdo
      if (updatedContent[index] && updatedContent[index].type === "list") {
        // Se já for uma lista, adiciona um novo item à lista existente
        updatedContent[index].items.push({ name: '', url: '', title: "", image: "" });
      } else {
        // Caso não seja uma lista, cria um novo item de lista e o adiciona na posição especificada
        updatedContent.splice(index, 0, { 
          type: "list", 
          title: "Lista com marcadores", 
          emoji: "", 
          url: "", 
          order: props.index, 
          description: '', 
          items: [{ name: '', url: '', title: "", image: "" }] 
        });
      }
      return { ...prev, content: updatedContent };
    });
  };
  
      

    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
            <div className="flex flex-col gap-3">
            {props.contentItem.items.map((item, idx) => (
  <div className="flex  items-center">
    <Dot size={16} />
    <Input
      key={idx}
      value={item.title} // Usa o título do próprio item
      onChange={(e) => {
        const newContent = [...props.keepoData.content]; // Clona o array de conteúdo
        const updatedItems = [...props.contentItem.items]; // Clona os itens específicos
        updatedItems[idx] = { ...updatedItems[idx], title: e.target.value }; // Atualiza apenas o item específico

        newContent[props.index] = { ...newContent[props.index], items: updatedItems }; // Atualiza a lista de itens no objeto content

        props.setKeepoData((prev) => ({
          ...prev,
          content: newContent, // Atualiza o estado
        }));
      }}

      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          addSocialItem(props.index);
        }
      }}
      
      className="text-gray-500 pl-1 flex w-full flex-1 h-auto rounded-none text-sm bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent"
      placeholder="Item da lista"
    />

    <Alert className="flex w-fit items-center gap-1 p-1">
      <div className="flex gap-1 whitespace-nowrap">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex"
          onClick={() => {
            if (idx > 0) {
              const updatedItems = [...props.contentItem.items];
              [updatedItems[idx - 1], updatedItems[idx]] = [updatedItems[idx], updatedItems[idx - 1]];
              const newContent = [...props.keepoData.content];
              newContent[props.index] = { ...newContent[props.index], items: updatedItems };
              props.setKeepoData((prev) => ({ ...prev, content: newContent }));
            }
          }}
          disabled={idx === 0} // Desativa o botão se for o primeiro item
        >
          <ChevronUp size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex"
          onClick={() => {
            if (idx < props.contentItem.items.length - 1) {
              const updatedItems = [...props.contentItem.items];
              [updatedItems[idx], updatedItems[idx + 1]] = [updatedItems[idx + 1], updatedItems[idx]];
              const newContent = [...props.keepoData.content];
              newContent[props.index] = { ...newContent[props.index], items: updatedItems };
              props.setKeepoData((prev) => ({ ...prev, content: newContent }));
            }
          }}
          disabled={idx === props.contentItem.items.length - 1} // Desativa se for o último
        >
          <ChevronDown size={16} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex"
          onClick={() => {
            const updatedItems = props.contentItem.items.filter((_, i) => i !== idx);
            const newContent = [...props.keepoData.content];
            newContent[props.index] = { ...newContent[props.index], items: updatedItems };
            props.setKeepoData((prev) => ({ ...prev, content: newContent }));
          }}
        >
          <Trash size={16} />
        </Button>
      </div>
    </Alert>
  </div>
))}

             <Button variant={'outline'} onClick={() => addSocialItem(props.index)} className="h-8 w-fit px-2"><Plus size={16}/>Adicionar item</Button>
              
            </div>
        </Base>
    )
}