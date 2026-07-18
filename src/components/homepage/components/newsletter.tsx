import { Envelope } from "phosphor-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { useContext, useState } from "react";
import { UserContext } from "../../../context/context";
import { toast } from "sonner"

export function Newsletter() {
    const { version, urlGeralAdm } = useContext(UserContext)

    const [input, setInput] = useState('')

    const handleSubmitBolsista = async () => {
        try {

            let urlBolsistaInsert = `${urlGeralAdm}/newsletter?email=${input}`;

            const response = await fetch(urlBolsistaInsert, {
                mode: 'cors',
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '3600'
                },
            });

            if (response.ok) {
                toast("Dados enviados com sucesso", {
                    description: "Email cadastrado no newsletter",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
            }


        } catch (error) {

            toast("Erro ao processar a requisição", {
                description: "Tente novamente mais tarde.",
                action: {
                    label: "Fechar",
                    onClick: () => console.log("Fechar"),
                },
            });

        }
    };
    return (
        <div className="w-full flex flex-col items-center py-24">
            <div className="flex items-center flex-col justify-center mb-6">
                <h2 className="text-2xl font-medium ">Newsletter semanal do {version ? ('Conectee') : ('Simcc')}</h2>
                <p className="max-w-[750px] text-center text-lg font-light text-foreground">Receba atualizações na sua caixa de e-mails sobre as produções mais recentes</p>
            </div>

            <div className="max-w-[540px]">
                <div className="flex gap-3 w-full">
                    <div className="w-full flex flex-1">
                        <Input value={input} onChange={(e) => setInput(e.target.value)}></Input>
                    </div>
                    <Button onClick={() => handleSubmitBolsista()}><Envelope size={16} /> Fazer inscrição</Button>
                </div>

                <p className="text-sm mt-4">Suas informações vão ser usadas de acordo com a
                    Política de Privacidade do {version ? ('Conectee') : ('Simcc')}. É possível cancelar a inscrição a qualquer momento.</p>
            </div>

        </div>
    )
}