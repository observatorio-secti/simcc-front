import { Input } from "../../../ui/input";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Card, CardContent } from "../../../ui/card";
import { Alert } from "../../../ui/alert";
import { Image, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "../../../ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    keepoData:Keepo
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index:number
    contentItem:any
}

export function CarrosselSection (props:Props) {

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    if (!event.target.files) return;
    const file = event.target.files[0];
    const storage = getStorage();
    const storageRef = ref(storage, `construtor-pagina/images/${file.name}`);
    
    try {
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);

        const newContent = [...props.keepoData.content];
        const updatedItems = [...props.contentItem.items];
        updatedItems[idx] = { ...updatedItems[idx], url }; // Atualiza apenas o item específico

        newContent[props.index] = { ...newContent[props.index], items: updatedItems };

        props.setKeepoData((prev) => ({
            ...prev,
            content: newContent,
        }));

        toast("Upload concluído", {
            description: "A imagem foi enviada com sucesso!",
            action: {
                label: "Fechar",
                onClick: () => console.log("Fechar"),
            },
        });
    } catch (error) {
        console.error("Erro no upload:", error);
    }
};
  
      const [name, setName] = useState('')
      const [url, setUrl] = useState('')
  
      const addSocialItem = (index: number) => {
          props.setKeepoData((prev) => {
            const updatedContent = [...prev.content];
        
            // Verifica se o índice especificado é válido
            if (updatedContent[index]) {
              // Se o item social já existir no índice, adiciona o novo item
              updatedContent[index].items.push({ name, url, title: "", image: "" });
            } else {
              // Caso contrário, cria um novo item social no índice especificado
              updatedContent.splice(index, 0, {
                type: "card",
                title: props.contentItem.title,
                emoji: props.contentItem.emoji,
                url: props.contentItem.url,
                order: props.index,
                description: '',
                items: [{ name:'', url:'', title: "", image: "" }]
              });
            }
        
            return { ...prev, content: updatedContent };
          });
        
          setName('');
          setUrl('');
        };

    return(
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
              <Carousel className="w-full flex gap-3 items-center ">
              <CarouselPrevious />
      <CarouselContent className="-ml-1">
      {props.contentItem.items.map((item, idx) => (
          <CarouselItem key={idx} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-1 group">
            {!item.url && (
                        <label className="w-full font-medium h-[200px] bg-neutral-50 transition-all hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex cursor-pointer items-center flex-col gap-3 justify-center  border  dark:border-neutral-800 rounded-t-md border-b-0">
                            <Image size={24} /> Adicionar imagem
                            <input type="file" className="hidden" onChange={(e) => handleUpload(e, idx)} />
                        </label>
                    )}
            {item.url && (
                      <div
                      className="w-full h-[200px] bg-neutral-50 transition-all hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex cursor-pointer items-center flex-col gap-3 justify-center  border  dark:border-neutral-800 rounded-t-md border-b-0 bg-no-repeat bg-cover bg-center"
                      style={{
                        backgroundImage: item.url ? `url(${item.url})` : "none",
                      }}
                    ></div>
                    
                    )}
              <Alert className="flex gap-2   p-4  w-full rounded-t-none ">
                    <div className="w-full gap-2 flex flex-1 flex-col">
                        <Input 
                            value={item.title} 
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
                            className="rounded-none font-medium text-lg  w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Digite o título aqui"
                        />
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
                            className="text-gray-500  rounded-none text-sm w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Descrição"
                        />


                    </div>

                    <div className="flex gap-2 ">
                   
<Popover>
            <PopoverTrigger className="h-fit">
                <Button
  variant={'outline'}
  className="h-8 w-8"
  size={'icon'}

>
  <Pencil size={16}/>
</Button>
 </PopoverTrigger>
 <PopoverContent className="flex w-[400px]  items-end gap-3 " >

 <div className="grid items-center gap-1.5 w-full">
                   <Label>Link</Label>
                   <Input 
                   value={item.image} 
                   onChange={(e) => {
                     const newContent = [...props.keepoData.content]; // Clona o array de conteúdo
                     const updatedItems = [...props.contentItem.items]; // Clona os itens específicos
                     updatedItems[idx] = { ...updatedItems[idx], image: e.target.value }; // Atualiza apenas o item específico
             
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
                  

                    </div>
                   
                </Alert>
            </div>
          </CarouselItem>
        ))}
 <CarouselItem className="pl-1 md:basis-1/2 lg:basis-1/3">
 <div className="p-1 h-full">
 <Alert className=" h-full font-medium  flex-col  cursor-pointer hover:bg-neutral-100 transition-all dark:hover:bg-neutral-800 flex items-center justify-center gap-3" onClick={() => addSocialItem(props.index)}>
        <div>
        <Plus size={32}/>
        </div>
        Adicionar card
        </Alert>
 </div>
 </CarouselItem>
       
      </CarouselContent>
   
      <CarouselNext />
    </Carousel>
                  
        </Base>
    )
}