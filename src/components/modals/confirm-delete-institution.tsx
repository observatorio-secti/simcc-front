
import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { ArrowUUpLeft, Trash } from "phosphor-react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import { useContext} from "react";



export function ConfirmDeleteInstitution() {
    const { onClose, isOpen, type: typeModal, data } = useModal();
    const isModalOpen = isOpen && typeModal === "confirm-delete-institution";

    const id_delete = String(data.id_delete)
    const {urlGeralAdm} = useContext(UserContext)

    const handleDeleteResearcher= (id: string) => {

  
    
    
      const urlDeleteProgram =  urlGeralAdm + `InstitutionRest/Delete?institution_id=${id}`
      
    
      const fetchData = async () => {
       
        try {
          const response = await fetch(urlDeleteProgram, {
            mode: 'cors',
            method: 'DELETE',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'DELETE',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'text/plain'
            }
          });
          if (response.ok) {
            toast("Dados deletados com sucesso!", {
              description: "Pesquisador removido da base de dados",
              action: {
                label: "Fechar",
                onClick: () => { },
              },
            })
          
          }
        } catch (err) {
          console.log(err);
        } 
      };
      
      fetchData()
      onClose()
    
    }

    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent>
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
        <DialogTitle className="text-2xl mb-2 font-medium max-w-[450px]">
           <strong className="bg-red-500 text-white hover:bg-red-600 transition duration-500 font-medium">Deletar</strong> pesquisador(a) {data.name}
          </DialogTitle>
          <DialogDescription className=" text-zinc-500">
          Você tem certeza de que deseja prosseguir com a exclusão do pesquisador que está atualmente vinculado a esta instituição?
          </DialogDescription>
            </DialogHeader>

            <DialogFooter className=" py-4 ">
            <Button variant={'ghost'}   onClick={() => onClose()}>
            <ArrowUUpLeft size={16} className="" />Cancelar
              </Button>

              <Button variant={'destructive'}   onClick={() => handleDeleteResearcher(id_delete)}>
              <Trash size={16} className="" />Deletar
              </Button>
            </DialogFooter>

            </DialogContent>
            </Dialog>
    )
}