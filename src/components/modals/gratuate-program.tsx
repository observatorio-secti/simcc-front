import { ArrowUUpLeft, Check, Hash, MapPin, Star, Student } from "phosphor-react";
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
  import { toast } from "sonner"
import { GraduationCapIcon, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../../context/context";


export function GratuateProgramModal() {
    const { onClose, isOpen, type: typeModal, data } = useModal();
    const isModalOpen = isOpen && typeModal === "gratuate-program";
  const { setIdGraduateProgram } = useContext(UserContext)
    return(
        <Dialog open={isModalOpen} onOpenChange={onClose}> 
        <DialogContent className="min-w-[45vw] p-0 flex gap-0">
        <div
  className={` w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${
    data && data.modality?.includes('ACADÊMICO') ? 'bg-blue-300' : 
    data && data.modality?.includes('PROFISSIONAL') ? 'bg-blue-900' : 
    'bg-[#000]'
  }`}
></div>
                <div className="flex flex-1 flex-col">
                <DialogHeader className="pt-8 px-6 gap-4 flex-row mb-4">
               <div className=" items-center flex gap-4">
               <div className="flex flex-col">
            <img className="w-12 h-auto object-cover object-center rounded-l-lg" src={data.url_image} alt={data.name} />
           
          </div>
                 <div>
                 <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Hash size={12}/>{data.code}</div>
                 <DialogTitle className="text-2xl font-medium text-left">
                {data.name}
                 </DialogTitle>

                 <div className="flex items-center gap-4 mt-1">
                        
                        <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><GraduationCapIcon size={12}/>{data.type}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><MapPin size={12}/>{data.city}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Star size={12}/>{data.rating}</div>

                        </div>
                 </div>
               </div>

                 <div className="ml-auto flex gap-3">
                 <Button variant={'outline'}> <UserCheck size={16} className="" />{Number(data.qtd_colaborador ?? 0) + Number(data.qtd_permanente ?? 0)}</Button>
                  <Button variant={'outline'}> <Student size={16} className="" />{data.qtd_discente}</Button>
                 </div>
                
               </DialogHeader>

              

               <DialogFooter className=" py-4 px-6">
        <Button variant={'ghost'}   onClick={() => {
          onClose()
          
        }}>
            <ArrowUUpLeft size={16} className="" />Cancelar
              </Button>

              <Link to={`/pos-graduacao/${data.graduate_program_id}`}>
              <Button onClick={() => {
                setIdGraduateProgram(data.graduate_program_id || '')
                onClose()
              }}  className="text-white dark:text-white" >
              <Check size={16} className="" />Ir para página
              </Button>
              </Link>
            </DialogFooter>
                </div>
       
               </DialogContent>
               </Dialog>
    )
}