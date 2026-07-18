import { useModal } from "../hooks/use-modal-store";

import {
    Sheet,
    SheetContent,
  } from "../../components/ui/sheet"
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";
  

export function CookiesModal() {
    const { onClose, isOpen, type: typeModal } = useModalSecundary();
    const isModalOpen = isOpen && typeModal === "cookies";

    return(
        <>
        {isModalOpen && (
            <Sheet  open={isModalOpen}>
            <SheetContent className="z-[999999]" side={'bottom'}>
                <div className="flex items-center justify-center">
                    <p className="text-sm text-gray-500">Ao clicar em "Aceitar todos os cookies", concorda com o armazenamento de cookies no seu dispositivo para melhorar a navegação no site, analisar a utilização do site e os termos de uso.</p>
                <div className="flex gap-3 items-center">
                    <Link to={'/termos-uso'} target="_blank"  className="z-[999999]"> <Button variant={'link'} >Termos de uso</Button></Link>
                    <Button  className="z-[999999]" onClick={() => {
                        onClose()
                    }}>Aceitar todos os cookies</Button>
                </div>
                </div>
            </SheetContent>
          </Sheet>
        )}
        </>
    )
}