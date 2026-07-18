import { FadersHorizontal, Trash } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
  } from "../ui/dialog";

export function FiltersModal() {
    const { onClose, isOpen, type: typeModal } = useModal();
    const isModalOpen = isOpen && typeModal === "filters";
    
    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent className="min-w-[60vw]">
        <DialogHeader className="pt-8 px-6">
                 <DialogTitle className="text-2xl text-center font-medium">
                 <strong className="bg-blue-700 text-white hover:bg-blue-800 transition duration-500 font-medium">Vincule</strong> os pesquisadores à sua instituição de ensino
                 </DialogTitle>
                
               </DialogHeader>

               <DialogFooter className=" py-4 ">
        <Button variant={'ghost'}   onClick={() => onClose()}>
            <Trash size={16} className="" />Limpar Filtros
              </Button>

              <Button  className="text-white dark:text-white" >
              <FadersHorizontal size={16} className="" />Mostrar x resultados
              </Button>
            </DialogFooter>
               </DialogContent>
               </Dialog>
    )
}