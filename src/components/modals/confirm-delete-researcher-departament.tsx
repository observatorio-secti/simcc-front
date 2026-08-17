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
import { useContext, useEffect, useState } from 'react';

export interface PesquisadorProps {
  lattes_id: string;
  name: string;
  type_: string;
}

export function ConfirmDeleteResearcherDepartament() {
  const {
    onOpen,
    onClose,
    isOpen,
    type: typeModal,
    data: dataModal,
  } = useModal();
  const isModalOpen =
    isOpen && typeModal === 'confirm-delete-researcher-departament';
  const { urlGeralAdm } = useContext(UserContext);

  const id_delete = String(dataModal.id_delete);

  const [id_program, setIdProgram] = useState(dataModal && dataModal.id_dep);
  const [lattes_id, setLattesId] = useState(dataModal && dataModal.lattes_id);

  useEffect(() => {
    setIdProgram(dataModal?.id_dep || '');
    setLattesId(dataModal?.lattes_id || '');
  }, [dataModal]);

  const handleSubmitDelete = async () => {
    try {
      const data = [
        {
          dep_id: id_program,
          lattes_id: lattes_id,
        },
      ];

      const urlProgram = urlGeralAdm + 'ResearcherRest/departament';

      const fetchData = async () => {
        try {
          const response = await fetch(urlProgram, {
            mode: 'cors',
            method: 'DELETE',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'DELETE',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            toast('Dados enviados com sucesso', {
              description: 'Pesquisador removido do departamento',
              action: {
                label: 'Fechar',
                onClick: () => {},
              },
            });

            onClose();
          } else {
            console.error('Erro ao enviar dados para o servidor.');
            toast('Tente novamente!', {
              description: 'Erro ao remover pesquisador do departamento',
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
    } catch (error) {
      toast('Erro ao processar requisição', {
        description: 'Tente novamente',
        action: {
          label: 'Fechar',
          onClick: () => {},
        },
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="pt-8 px-6 flex flex-col items-center">
          <DialogTitle className="text-2xl  mb-2 font-medium max-w-[450px]">
            <strong className="bg-red-500 text-white hover:bg-red-600 transition duration-500 font-medium">
              Deletar
            </strong>{' '}
            pesquisador(a) {dataModal.nome} do departamento
          </DialogTitle>
          <DialogDescription className=" text-zinc-500">
            Você tem certeza de que deseja prosseguir com a exclusão do
            pesquisador que está atualmente vinculado a este departamento?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className=" py-4 ">
          <Button
            variant={'ghost'}
            onClick={() => onOpen('add-researcher-graduation')}
          >
            <ArrowUUpLeft size={16} className="" />
            Cancelar
          </Button>

          <Button variant={'destructive'} onClick={() => handleSubmitDelete()}>
            <Trash size={16} className="" />
            Deletar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
