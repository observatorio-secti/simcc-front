import {
  DialogFooter,
  DialogHeader,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../ui/dialog';
import { useModal } from '../hooks/use-modal-store';
import { Button } from '../ui/button';
import { ArrowUUpLeft, Trash } from 'phosphor-react';
import { toast } from 'sonner';
import { UserContext } from '../../context/context';
import { useContext } from 'react';

export function ConfirmDeleteDepartamento() {
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen = isOpen && typeModal === 'confirm-delete-departamento';
  const { urlGeralAdm } = useContext(UserContext);

  const id_delete = String(data.id_delete);
  const handleDeleteProgram = (id: string) => {
    const urlDeleteProgram = urlGeralAdm + `departamentos?dep_id=${id}`;
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
            'Content-Type': 'text/plain',
          },
        });
        if (response.ok) {
          toast('Dados deletados com sucesso!', {
            description: 'Departamento/setor removido da base de dados',
            action: {
              label: 'Fechar',
              onClick: () => {},
            },
          });
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
          <DialogTitle className="text-2xl  mb-2 font-medium max-w-[450px]">
            <strong className="bg-red-500 text-white hover:bg-red-600 transition duration-500 font-medium">
              Deletar
            </strong>{' '}
            pós-graduação em {data.name}
          </DialogTitle>
          <DialogDescription className=" text-zinc-500">
            É possível alterar informações básicas do programa. Caso delete,
            todas as informações serão perdidas.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className=" py-4 ">
          <Button variant={'ghost'} onClick={() => onClose()}>
            <ArrowUUpLeft size={16} className="" />
            Cancelar
          </Button>

          <Button
            variant={'destructive'}
            onClick={() => handleDeleteProgram(id_delete)}
          >
            <Trash size={16} className="" />
            Deletar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
