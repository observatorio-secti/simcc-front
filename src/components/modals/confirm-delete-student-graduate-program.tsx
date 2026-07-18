
import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { ArrowUUpLeft, Trash } from "phosphor-react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import { useContext, useEffect, useState } from "react";

export function ConfirmDeleteStudentGraduateProgram() {
    console.log('to aqui')
    const { onOpen, onClose, isOpen, type: typeModal, data: dataModal } = useModal();
    const isModalOpen = isOpen && typeModal === "confirm-delete-student-graduate-program";
    const { urlGeralAdm } = useContext(UserContext)
    const [id_program, setIdProgram] = useState(dataModal && dataModal.graduate_program_id)
    const [lattes_id, setLattesId] = useState(dataModal && dataModal.lattes_id)
    useEffect(() => {
        setIdProgram(dataModal.graduate_program_id || '')
        setLattesId(dataModal?.lattes_id || '')
    }, [dataModal]);

    console.log(dataModal)

    const handleSubmitDelete = async () => {
        try {
            const data = [
                {
                    graduate_program_id: id_program,
                    lattes_id: lattes_id,
                }
            ]

            console.log('dataa reesfs', data)

            let urlProgram = urlGeralAdm + '/studentRest/delete'


            const fetchData = async () => {

                try {
                    const response = await fetch(urlProgram, {
                        mode: 'cors',
                        method: 'DELETE',
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Methods': 'POST',
                            'Access-Control-Allow-Headers': 'Content-Type',
                            'Access-Control-Max-Age': '3600',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data),
                    });

                    if (response.ok) {

                        toast("Dados enviados com sucesso", {
                            description: "Discente removido no programa de pós-graduação",
                            action: {
                                label: "Fechar",
                                onClick: () => { },
                            },
                        })

                        onOpen('list-student-program')

                    } else {
                        console.error('Erro ao enviar dados para o servidor.');
                        toast("Tente novamente!", {
                            description: "Erro ao excluir discente",
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
            fetchData();
        } catch (error) {
            toast("Erro ao processar requisição", {
                description: "Tente novamente",
                action: {
                    label: "Fechar",
                    onClick: () => { },
                },
            })
        }
    }

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader className="pt-8 px-6 flex flex-col items-center">
                    <DialogTitle className="text-2xl  mb-2 font-medium max-w-[450px]">
                        <strong className="bg-red-500 text-white hover:bg-red-600 transition duration-500 font-medium">Deletar</strong> discente {dataModal.nome} do programa
                    </DialogTitle>
                    <DialogDescription className=" text-zinc-500">
                        Você tem certeza de que deseja prosseguir com a exclusão do pesquisador que está atualmente vinculado a este programa de pós-graduação?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className=" py-4 ">
                    <Button variant={'ghost'} onClick={() => onOpen('list-student-program')}>
                        <ArrowUUpLeft size={16} className="" />Cancelar
                    </Button>

                    <Button variant={'destructive'} onClick={() => handleSubmitDelete()}>
                        <Trash size={16} className="" />Deletar
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    )
}