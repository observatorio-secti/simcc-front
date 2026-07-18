import { useModal } from "../hooks/use-modal-store";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
  } from "../ui/dialog";

  import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "../../components/ui/table"
  


export function MapResearchersModal() {
    const { onClose, isOpen, type: typeModal, data } = useModal();
    const isModalOpen = isOpen && typeModal === "map-researchers-modal";

    return(
        <>
        <Dialog open={isModalOpen} onOpenChange={onClose} >
        <DialogContent className="p-0 border-0">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-medium">
          Pesquisadores encontrados em <strong className="bg-blue-700 text-white hover:bg-blue-800 transition duration-500 font-medium">{data.city}</strong>
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
          Adicione as informações básicas do programa de pós-graduação como o corpo docente envolvido, classificação e descrição.
          </DialogDescription>
        </DialogHeader>

        <div>
        <Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Nome</TableHead>
      <TableHead>Ocorrências</TableHead>
      <TableHead>Titulação</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
</Table>
        </div>
        </DialogContent>
        </Dialog>
        </>
    )
}