import { Pencil, Plus, RefreshCcw, Trash } from "lucide-react";
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

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function Social (props:Props) {
    const [name, setName] = useState('')
    const [url, setUrl] = useState('')

    const addSocialItem = (name: string, url: string, index: number) => {
        props.setKeepoData((prev) => {
          const updatedContent = [...prev.content];
      
          // Verifica se o índice especificado é válido
          if (updatedContent[index] && updatedContent[index].type === "social") {
            // Se o item social já existir no índice, adiciona o novo item
            updatedContent[index].items.push({ name, url, title: "", image: "" });
          } else {
            // Caso contrário, cria um novo item social no índice especificado
            updatedContent.splice(index, 0, {
              type: "social",
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
                style={{
                  backgroundColor: props.keepoData.app.button_color,
                  color: props.keepoData.app.button_text_color,
                
                }}
              variant={'outline'} className="h-8 px-2">
  {(() => {
    switch (item.name) {
      case 'instagram':
        return <div className="flex gap-2 items-center"><InstagramLogo size={16} /> Instagram</div>;
      case 'facebook':
        return <div className="flex gap-2 items-center"><FacebookLogo size={16} /> Facebook</div>;
      case 'x':
        return <div className="flex gap-2 items-center"><X size={16} /> X (Twitter)</div>;
      case 'youtube':
        return <div className="flex gap-2 items-center"><YoutubeLogo size={16} /> Youtube</div>;
      case 'linkedin':
        return <div className="flex gap-2 items-center"><LinkedinLogo size={16} /> LinkedIn</div>;
      case 'behance':
        return <div className="flex gap-2 items-center"><BehanceLogo size={16} /> Behance</div>;
      case 'github':
        return <div className="flex gap-2 items-center"><GithubLogo size={16} /> Github</div>;
      case 'pagina-web':
        return <div className="flex gap-2 items-center"><Globe size={16} /> Página web</div>;
      default:
        return null;
    }
  })()}
</Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-[300px]  items-end gap-3 " >

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
  <Button variant={'outline'} className="h-8 px-2"><Plus size={16}/>Adicionar rede social</Button>
  </PopoverTrigger>
  <PopoverContent className="flex flex-col  items-end gap-3 " >
  <div className="grid items-center gap-1.5 w-full">
                    <Label>Tipo</Label>
                    <Select  value={name} onValueChange={(value) => setName(value)}>
  <SelectTrigger className="">
    <SelectValue placeholder="" />
  </SelectTrigger>
  <SelectContent>
    {['instagram', 'facebook', 'x', 'youtube', 'linkedin', 'behance', 'github', 'pagina-web']
      .filter(item => !props.contentItem.items.some(content => content.name === item)) // Comparando com a propriedade name
      .map(item => (
        <SelectItem key={item} value={item} className="flex items-center gap-2">
          {item === 'instagram' && <InstagramLogo size={16} />} 
          {item === 'facebook' && <FacebookLogo size={16} />} 
          {item === 'x' && <X size={16} />} 
          {item === 'youtube' && <YoutubeLogo size={16} />} 
          {item === 'linkedin' && <LinkedinLogo size={16} />} 
          {item === 'behance' && <BehanceLogo size={16} />} 
          {item === 'github' && <GithubLogo size={16} />} 
          {item === 'pagina-web' && <Globe size={16} />} 
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </SelectItem>
      ))}
  </SelectContent>
</Select>

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