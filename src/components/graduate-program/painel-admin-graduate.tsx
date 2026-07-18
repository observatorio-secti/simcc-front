import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useContext, useEffect, useMemo, useState } from "react";
import { UserContext } from "../../context/context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { SheetContent } from "../ui/sheet";
import { DialogHeader } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { DocentesGraduate } from "../dashboard/components/docentes-graduate";
import { DiscentesGraduate } from "../dashboard/components/discentes-graduate";
import { ArrowLeftFromLine, ArrowRightFromLine, X } from "lucide-react";


interface Props {
    graduate_program_id:string
}

export function PainelAdminGraduate(props:Props) {
    const [tab2, setTab2] = useState('all')
    const [expand, setExpand] = useState(false)
    const [isOpenSheet, setIsOpenSheet] = useState(false); 

    return(

        <Tabs defaultValue={tab2} value={tab2} className="h-full" >
        <DialogHeader className="h-[50px] justify-center px-4 border-b">
      
       <div className="flex items-center gap-3">
       <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
               <Button className="h-8 w-8" onClick={() => setExpand(!expand)} variant={'outline'} size={'icon'}>{expand ? (<ArrowRightFromLine size={16}/>):(<ArrowLeftFromLine size={16}/>)}</Button>
               </TooltipTrigger>
               <TooltipContent> {expand ? ('Recolher'):('Expandir')}</TooltipContent>
             </Tooltip>
             </TooltipProvider>
      
            
             <TooltipProvider>
             <Tooltip>
               <TooltipTrigger asChild>
               <Button className="h-8 w-8" variant={'outline'}  onClick={() => setIsOpenSheet(false)} size={'icon'}><X size={16}/></Button>
               </TooltipTrigger>
               <TooltipContent> Fechar</TooltipContent>
             </Tooltip>
             </TooltipProvider>
                <div className="flex items-center flex-1  w-full justify-between">
      
                <div className="flex items-center gap-3 ml-auto"> 
                <TabsList >
                   <TabsTrigger value="all" onClick={() => setTab2('all')} className="text-zinc-600 dark:text-zinc-200">Visão geral</TabsTrigger>
                     <TabsTrigger value="unread" onClick={() => setTab2('unread')} className="text-zinc-600 dark:text-zinc-200">Docentes</TabsTrigger>
                     <TabsTrigger value="movimentacao-bens" onClick={() => setTab2('movimentacao-bens')} className="text-zinc-600 dark:text-zinc-200">Discentes</TabsTrigger>
                     </TabsList>
                
                 
                </div>
                </div>
       </div>
               
      
              
              </DialogHeader>
     
              <ScrollArea className="relative whitespace-nowrap h-[calc(100vh-50px)] ">
              <TabsContent value="all" className="">
                  
                    </TabsContent>
     
                    <TabsContent value="unread" className="">
                    <DocentesGraduate graduate_program_id={props.graduate_program_id || ''}/>
                    </TabsContent>
     
                    <TabsContent value="movimentacao-bens" className="">
                    <DiscentesGraduate graduate_program_id={props.graduate_program_id || ''}/>
                    </TabsContent>
              </ScrollArea>
      </Tabs>
          
    )
}