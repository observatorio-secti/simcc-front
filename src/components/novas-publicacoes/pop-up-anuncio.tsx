import { useContext } from "react";
import { Alert } from "../ui/alert";
import { UserContext } from "../../context/context";

export function PopUpAnuncio() {

    const {version} = useContext(UserContext)
    return(
        <div className="fixed right-16 bottom-16">
            <Alert className="flex gap-3 items-center border-eng-blue dark:border-eng-blue shadow-lg">
<div>
    <p>Veja mais em {version ? ('conectee.eng.ufmg.br'):('iapos.cimatec.com.br')}</p>
    <p></p>
</div>
            </Alert>
        </div>
    )
}