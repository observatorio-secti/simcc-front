import { useContext } from "react";
import { columns } from "../componentsModal/columns-pesquisadores";
import { DataTableModal } from "../componentsModal/data-table";
import { useModal } from "../hooks/use-modal-store";
import { Link } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "../ui/dialog";
import { UserContext } from "../../context/context";
import { Button } from "../ui/button";
import { Download, Textbox } from "phosphor-react";

export function PesquisadoresSelecionados() {
  const { onClose, isOpen, type: typeModal } = useModal();
  const isModalOpen = isOpen && typeModal === "pesquisadores-selecionados";
  const { pesquisadoresSelecionados } = useContext(UserContext)

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-[60vw] ">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-medium">
            <strong className="bg-blue-700 text-white hover:bg-blue-800 transition duration-500 font-medium">Pesquisadores</strong> selecionados para consulta
          </DialogTitle>

          <div> <DataTableModal columns={columns} data={pesquisadoresSelecionados} /></div>

        </DialogHeader>

        <DialogFooter className=" py-4 ">
          <Button variant={'ghost'}   >
            <Download size={16} className="" />Baixar csv
          </Button>


          <Link to={'/barema'}>
            <Button className="text-white dark:text-white" >
              <Textbox size={16} className="" />Barema
            </Button>
          </Link>


        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}