import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner"

interface Uid {
    uid: string
    provider: string
    displayName: string
    email: string
}

export function MinhaUfmg() {
    const { setLoggedIn, urlGeralAdm, setUser } = useContext(UserContext);
    const [uid, setUid] = useState<Uid | null>(null);
    const history = useNavigate();

    const handleLoginMinhaUfmg = async () => {
        try {
            const urlProgram = urlGeralAdm + 's/ufmg/user';
            const urlUser = `${urlGeralAdm}s/user?uid=${uid?.uid}`;

            const fetchData = async () => {
                try {
                    const response = await fetch(urlProgram, {
                        method: "GET",
                        mode: "cors",
                        headers: {
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "GET",
                            "Access-Control-Allow-Headers": "Content-Type",
                            "Access-Control-Max-Age": "3600",
                            "Content-Type": "application/json",
                        }
                    });

                    const data = await response.json();

                    if (data && Array.isArray(data) && data.length > 0) {
                        data[0].roles = data[0].roles || [];
                        setUid(data[0]);

                        const fetchDataLogin = async () => {
                            try {
                                const response = await fetch(urlUser, {
                                    mode: "cors",
                                    method: 'GET',
                                    headers: {
                                        "Access-Control-Allow-Origin": "*",
                                        "Access-Control-Allow-Methods": "GET",
                                        "Access-Control-Allow-Headers": "Content-Type",
                                        "Access-Control-Max-Age": "3600",
                                        "Content-Type": "text/plain",
                                    },
                                });
                                const data = await response.json();
                                if (data && Array.isArray(data) && data.length > 0) {
                                    data[0].roles = data[0].roles || [];
                                    setLoggedIn(true);
                                    setUser(data[0]);
                                    history('/');
                                }
                            } catch (err) {
                            }
                        };
                        await fetchDataLogin();
                    }
                } catch (err) {
                }
            };

            await fetchData();

        } catch (error) {
            toast("Erro ao processar requisição", {
                description: "Tente novamente",
                action: {
                    label: "Fechar",
                    onClick: () => {  }
                },
            });
        }
    };

    useEffect(() => {
        handleLoginMinhaUfmg()
    }, []);

    return (
        <div>

        </div>
    )
}