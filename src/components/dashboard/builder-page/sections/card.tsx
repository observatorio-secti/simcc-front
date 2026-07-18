import { Image, Link, Plus, Trash } from "lucide-react";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { Button } from "../../../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Alert } from "../../../ui/alert";
import { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";

interface Props {
    keepoData: Keepo;
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index: number;
    contentItem: any;
}

export function CardSection(props: Props) {
    const [open, setOpen] = useState(false);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const file = event.target.files[0];
        const storage = getStorage();
        const storageRef = ref(storage, `construtor-pagina/images/${file.name}`);
        
        try {
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            const newContent = [...props.keepoData.content];
            newContent[props.index] = { ...newContent[props.index], url };
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

    const addSocialItem = (name: string, url: string, index: number) => {
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
              items: [{ name, url, title: "", image: "" }]
            });
          }
      
          return { ...prev, content: updatedContent };
        });
      
        setName('');
        setUrl('');
      };

    return (
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
            <div className="w-full grid md:grid-cols-2 grid-cols-1 md:h-[300px]">
                <div>
                    {!props.contentItem.url && (
                        <label className="w-full bg-neutral-50 transition-all hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex cursor-pointer items-center flex-col gap-3 justify-center h-full border md:border-r-0 border-b-0 md:border-b dark:border-neutral-800 md:rounded-l-md md:rounded-tr-none rounded-t-md">
                            <Image size={24} /> Adicionar imagem
                            <input type="file" className="hidden" onChange={handleUpload} />
                        </label>
                    )}

                    {props.contentItem.url && (
                      <div
                      className="w-full md:h-full h-[350px] border md:border-r-0 border-b-0 md:border-b dark:border-neutral-800 md:rounded-l-md md:rounded-tr-none rounded-t-md bg-no-repeat bg-cover bg-center"
                      style={{
                        backgroundImage: props.contentItem.url ? `url(${props.contentItem.url})` : "none",
                      }}
                    ></div>
                    
                    )}
                </div>
                <Alert className="flex gap-2 items-center md:rounded-tr-md p-8  w-full rounded-t-none md:rounded-l-none">
                    <div className="w-full gap-4 flex flex-1 flex-col">
                        <Input 
                            value={props.contentItem.title}
                            onChange={(e) => {
                                const newContent = [...props.keepoData.content];
                                newContent[props.index] = { ...newContent[props.index], title: e.target.value };
                                props.setKeepoData((prev) => ({
                                    ...prev,
                                    content: newContent,
                                }));
                            }}
                            className="rounded-none font-medium text-lg  w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Digite o título aqui"
                        />
                        <Textarea 
                            value={props.contentItem.description}
                            onChange={(e) => {
                                const newContent = [...props.keepoData.content];
                                newContent[props.index] = { ...newContent[props.index], description: e.target.value };
                                props.setKeepoData((prev) => ({
                                    ...prev,
                                    content: newContent,
                                }));
                            }}
                            className="text-gray-500  rounded-none text-sm w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent" placeholder="Descrição"
                        />

<div className="flex flex-wrap gap-3">
            {props.contentItem.items.map((item, idx) => (
          <Popover>
            <PopoverTrigger>
                <Button
  variant={'outline'}
  className=""
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
  <Button variant={'outline'} className=""><Plus size={16}/>Adicionar botão</Button>
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

                    </div>
                   
                </Alert>
            </div>
        </Base>
    );
}
