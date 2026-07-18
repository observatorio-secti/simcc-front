
import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { ArrowCounterClockwise, ArrowUUpLeft, Trash } from "phosphor-react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import { useContext, useEffect, useState} from "react";


export function ResetPesoProducoes() {
    const { onOpen, onClose, isOpen, type: typeModal, data:dataModal } = useModal();
    const isModalOpen = isOpen && typeModal === 'reset-peso-producoes'
    const {urlGeralAdm} = useContext(UserContext)

  console.log(dataModal.type_reset)

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent>
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
        <DialogTitle className="text-2xl text-center font-medium max-w-[350px]">
        <strong className="bg-red-500 text-white hover:bg-red-600 transition duration-500 font-medium">Resetar</strong> peso de produções
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
          Você tem certeza de que deseja prosseguir e resetar os pesos de produções? Isso irá impactar os índices de produções 
          </DialogDescription>
            </DialogHeader>

            <DialogFooter className=" py-4 ">
            <Button variant={'ghost'}   onClick={() => onClose()}>
            <ArrowUUpLeft size={16} className="" />Voltar
              </Button>

              <Button variant={'destructive'} onClick={() => {
                onClose()
                
               
              }}  >
              <ArrowCounterClockwise size={16} className="" />Resetar
              </Button>
            </DialogFooter>

            </DialogContent>
            </Dialog>
    )
}