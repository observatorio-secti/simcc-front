import { useModal } from "../hooks/use-modal-store";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import {
    DialogHeader,
  } from "../ui/dialog";
  import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
  import { Image, LayoutPanelTop, LoaderCircle, Palette, Plus, SquarePlus, Upload, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useCallback, useContext, useState } from "react";
import { storage } from "../../lib/firebase";
import { v4 as uuidv4 } from 'uuid';

import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getFirestore,  collection, addDoc } from 'firebase/firestore';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useDropzone } from "react-dropzone";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";
import { ColorPicker } from "../ui/color-picker";
import { AddItem } from "../dashboard/builder-page/add-item";
import { Content, items, itemsEspeciais } from "../dashboard/builder-page/builder-page";
import { Textarea } from "../ui/textarea";
import { UserContext } from "../../context/context";


export function EditorpageModal() {
    const { onClose, isOpen, type: typeModal, data } = useModalSecundary();
    const isModalOpen = (isOpen && typeModal === 'editor-page') 

    const {keepoData, setKeepoData} = useContext(UserContext)

        const [tab, setTab] = useState('inicio')

          const addContentItem = (type: Content["type"], index:number) => {
                   if(type == 'slider' || 'list' || 'list-number') {
                    setKeepoData((prev) => ({
                      ...prev,
                      content: [
                        ...prev.content,
                        { type, title: "", emoji: "", url: "", items: [
                         { name:'',
                          url:'',
                          title:'',
                          image:''}
                        ], order:index, description:''},
                      ],
                    }));
                   } else {
                    setKeepoData((prev) => ({
                      ...prev,
                      content: [
                        ...prev.content,
                        { type, title: "", emoji: "", url: "", items: [], order:index, description:''},
                      ],
                    }));
                   }
                  };

    return(
        <Sheet open={isModalOpen} onOpenChange={onClose}>
        <SheetContent
          className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw] max-w-[50vw]`}
        >
          <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="h-8 w-8"
                      variant={"outline"}
                      onClick={() => onClose()}
                      size={"icon"}
                    >
                      <X size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent> Fechar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
  
              <div className="flex ml-auto items-center w-full justify-between">
                <div className="flex ml-auto items-center gap-3"></div>
              </div>
            </div>
          </DialogHeader>

          <div>
          <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
          <div className="mb-8 flex justify-between items-center">
            <div >
              <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
               Configurações
              </p>

              <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                Editor de página
              </h1>
            </div>

            <div>
       
            </div>
            </div>

            <div className={`h-full flex w-full`}>
            <Tabs defaultValue={tab} value={tab} className="flex gap-3 w-full">
 <div className="p-2  flex flex-col gap-1 items-center border rounded-md h-full w-[48px]">

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
    <Button className="h-8 w-8" onClick={() => setTab('inicio')}  variant={tab == 'inicio' ? ('outline'):('ghost')} size={'icon'}>
<LayoutPanelTop size={16}/>
</Button>
    </TooltipTrigger>
    <TooltipContent side='right'>
      <p>Início</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
    <Button className="h-8 w-8" onClick={() => setTab('add')} variant={tab == 'add' ? ('outline'):('ghost')} size={'icon'}>
    <SquarePlus size={16}/>
</Button>
    </TooltipTrigger>
    <TooltipContent side='right'>
      <p>Adicionar</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
 
<Button className="h-8 w-8" onClick={() => setTab('themes')} variant={tab == 'themes' ? ('outline'):('ghost')} size={'icon'}>
    <Palette size={16}/>
</Button>
    </TooltipTrigger>
    <TooltipContent side='right'>
      <p>Layout</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>



 </div>
 <div className="h-full  w-full border rounded-md">
 
 <TabsContent value="inicio" className="m-0 p-4">
        <h3 className="text-3xl font-semibold">Olá, vamos começar personalizando a página</h3>
   <p className="text-sm text-gray-500 pt-2 pb-8">Comece adicionando sessões e alterando as cores do layout</p>
    <div className="flex flex-col gap-4">
    <div className="flex flex-col w-full gap-2">
    <Label>Título</Label>
    <Input
        type="text"
        value={keepoData.profile_info.jobTitle}
        onChange={(e) =>
            setKeepoData((prev) => ({
                ...prev,
                profile_info: { ...prev.profile_info, jobTitle: e.target.value },
            }))
        }
    />
</div>

<div className="flex flex-col w-full gap-2">
    <Label>Sigla</Label>
    <Input
        type="text"
        value={data?.keepoData?.profile_info.jobTitle}
        onChange={(e) =>
            setKeepoData((prev) => ({
                ...prev,
                profile_info: { ...prev.profile_info, jobTitle: e.target.value },
            }))
        }
    />
</div>

<div className="flex flex-col w-full gap-2">
    <Label>Descrição</Label>
    <Textarea
    
        value={keepoData.profile_info.supporting}
        onChange={(e) =>
            setKeepoData((prev) => ({
                ...prev,
                profile_info: { ...prev.profile_info, supporting: e.target.value },
            }))
        }
    />
</div>
    </div>
 <Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger className="py-2 border-b">Informações</AccordionTrigger>
    <AccordionContent className="mt-4 flex flex-col gap-4">
    <div className="flex flex-col w-full gap-2">
    <Label>Título</Label>
    <Input
        type="text"
        value={keepoData.profile_info.jobTitle}
        onChange={(e) =>
            setKeepoData?.((prev) => ({
                ...prev,
                profile_info: { ...prev.profile_info, jobTitle: e.target.value },
            }))
        }
    />
</div>


    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger className="py-2 border-b">Cards</AccordionTrigger>
    <AccordionContent  className="mt-4">
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
</TabsContent>
 <TabsContent value="themes" className="m-0 p-4">
 <Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger className="py-2 border-b">Botões</AccordionTrigger>
    <AccordionContent className="mt-4 flex flex-col gap-4">
    <div className="flex flex-col gap-2">
    <Label>Cor de fundo</Label>
    <div className="flex  gap-4">
    <Input
        type="text"
        value={keepoData.app.button_color}
        onChange={(e) =>
            setKeepoData((prev) => ({
                ...prev,
                app: { ...prev.app, button_color: e.target.value },
            }))
        }
    />

<ColorPicker
          onChange={(v) => {
            setKeepoData((prev) => ({
                ...prev,
                app: { ...prev.app, button_color: v },
            }))
          }}
          value={keepoData.app.button_color || ''}
        />


    </div>
</div>

<div className="flex flex-col gap-2">
    <Label>Cor do texto</Label>
    <div className="flex  gap-4">
    <Input
        type="text"
        value={keepoData.app.button_text_color}
        onChange={(e) =>
            setKeepoData((prev) => ({
                ...prev,
                app: { ...prev.app, button_text_color: e.target.value },
            }))
        }
    />

<ColorPicker
          onChange={(v) => {
            setKeepoData((prev) => ({
                ...prev,
                app: { ...prev.app, button_text_color: v },
            }))
          }}
          value={keepoData.app.button_text_color || ''}
        />


    </div>
</div>
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger className="py-2 border-b">Cards</AccordionTrigger>
    <AccordionContent  className="mt-4">
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
</Accordion>
 </TabsContent>
 <TabsContent value="add" className="m-0 p-4">
 <Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger className="py-2 border-b">Elementos</AccordionTrigger>
    <AccordionContent className="mt-4 flex flex-col gap-4">
    <div className="gap-4 grid grid-cols-2">
    {items.map((item, index) => (
        <div className="cursor-pointer rounded-md " onClick={() =>   addContentItem(item.type, ((keepoData.content.length || 0) + 1 ))}>
            <AddItem
          key={index} 
          titulo={item.titulo} 
          chidren={item.icon} 
        />
        </div>
      ))}

</div>
        </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
    <AccordionTrigger className="py-2 border-b">Funções</AccordionTrigger>
    <AccordionContent className="mt-4 flex flex-col gap-4">
    <div className="gap-4 grid grid-cols-2">
    {itemsEspeciais.map((item, index) => (
        <div className="cursor-pointer rounded-md " onClick={() =>   addContentItem(item.type, ((keepoData.content.length || 0) + 1))}>
            <AddItem
          key={index} 
          titulo={item.titulo} 
          chidren={item.icon} 
        />
        </div>
      ))}

</div>
        </AccordionContent>
        </AccordionItem>
        </Accordion>
   
 </TabsContent>
 </div>
</Tabs>

            </div>
            </ScrollArea>
            </div>
            </SheetContent>
            </Sheet>
    )
}