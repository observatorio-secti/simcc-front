import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { ArrowUUpLeft, Trash } from "phosphor-react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import { useContext } from "react";

export function ConfirmDeleteResearcherGraduateProgram() {
    const { onClose, isOpen, type: typeModal, data: dataModal } = useModal();
    const isModalOpen = isOpen && typeModal === "confirm-delete-researcher-graduate-program";
    const { urlGeralAdm } = useContext(UserContext)


    const handleSubmitDelete = async () => {

        if (!dataModal.graduate_program_id || !dataModal.researcher_id) {
            toast.error("Erro: Dados do modal estão incompletos.");
            return;
        }

        try {
            const data = [
                {
                    graduate_program_id: dataModal.graduate_program_id,
                    lattes_id: dataModal.researcher_id,
                }
            ]

            console.log('Enviando payload do delete:', data)

            let urlProgram = urlGeralAdm + 'GraduateProgramResearcherRest/Delete'

            try {
                const response = await fetch(urlProgram, {
                    mode: 'cors',
                    method: 'DELETE',
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'DELETE',
                        'Access-Control-Allow-Headers': 'Content-Type',
                        'Access-Control-Max-Age': '3600',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok || response.status === 204) {
                    toast("Pesquisador removido com sucesso", {
                        description: `${dataModal.name || 'O pesquisador'} foi removido do programa.`,
                        action: {
                            label: "Fechar",
                            onClick: () => { },
                        },
                    })
                    if (dataModal?.onSuccess) {
                        dataModal.onSuccess();
                    }
                    onClose();


                } else {
                    console.error('Erro ao enviar dados para o servidor.', response.status);
                    toast("Tente novamente!", {
                        description: "Erro ao remover pesquisador do programa de pós-graduação",
                        action: {
                            label: "Fechar",
                            onClick: () => { },
                        },
                    })
                }
            } catch (err) {
                console.log(err);
                toast.error("Erro de conexão ao tentar deletar.");
            }
        } catch (error) {
            toast("Erro ao processar requisição", {
                description: "Tente novamente",
                action: {
                    label: "Fechar",
                    onClick: () => { },
                },
            })
        }
    };


    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="pt-8 px-6 flex flex-col items-center">
                    <DialogTitle className="text-2xl  mb-2 font-medium max-w-[450px] text-center">
                        <strong className="bg-red-500 text-white hover:bg-red-600 transition duration-500 font-medium px-1 py-0.5 rounded">Deletar</strong> pesquisador(a) {dataModal.name} do programa
                    </DialogTitle>
                    <DialogDescription className=" text-zinc-500 text-center">
                        Você tem certeza de que deseja prosseguir com a exclusão do pesquisador que está atualmente vinculado a este programa de pós-graduação?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className=" py-4 ">
                    <Button variant={'ghost'} onClick={onClose}>
                        <ArrowUUpLeft size={16} className="" />Cancelar
                    </Button>

                    <Button variant={'destructive'} onClick={handleSubmitDelete}>
                        <Trash size={16} className="" />Deletar
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}