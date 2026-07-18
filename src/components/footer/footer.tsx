import { Copyright } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../../context/context";

export function Footer() {
    const [dataModificacao, setDataModificacao] = useState('');
    const { version } = useContext(UserContext)
    useEffect(() => {
        const dataAtual = new Date();
        const dataFormatada = `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()}`;


        setDataModificacao(dataFormatada);
    }, []);

    return (
        <div className="w-full flex items-center  bg-neutral-50 dark:bg-neutral-900 justify-between py-2 border-t dark:border-t-neutral-800 px-4">
            <div className="flex items-center gap-2">
                <Copyright size={10} />
                <p className="flex text-[10px] gap-1">Sistema de mapeamento de competências da <Link to={'https://www.ba.gov.br/secti/'}>SECTI-BA </Link></p>
            </div>
            <div>
                <p className="flex text-[10px]">Atualizado em {dataModificacao}</p>
            </div>
        </div>
    )
}