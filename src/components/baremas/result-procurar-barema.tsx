import { useModalHomepage } from "../hooks/use-modal-homepage";

export function ResultProcurarBaremas() {
    const { isOpen, type } = useModalHomepage();
    const isModalOpen = isOpen && type === 'result-procurar-baremas';

   return(
    <>
    {isModalOpen && (
         <div className="w-full mr-16 mb-20">
            i
         </div>
    )}
    </>
   );
}