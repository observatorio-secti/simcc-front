import { useContext, useEffect, useState } from "react";
import { Alert } from "../ui/alert";
import { Chats, Funnel, MagnifyingGlass, X } from "phosphor-react";


import { Button } from "../ui/button";
import { useModal } from "../hooks/use-modal-store";
import { UserContext } from "../../context/context";

import { SelectTypeSearch } from "./select-type-search";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
interface Message {
    message: any;
    direction: string;
    sender: string;
}

import { useLocation, useNavigate, useNavigation } from "react-router-dom";
import { Filter, Play, Trash } from "lucide-react";
const API_KEY = import.meta.env.VITE_API_KEY

const systemMessage = {
    "role": "system",
    "content": `
  Retorne APENAS um JSON com os seguintes campos:
  1. Identificar o Tipo:  "type": Identifique o tipo do termo. Os tipos possíveis são "abstract", "article", "book", "patent", "name", "area", "speaker". Se o tipo não for identificado, defina-o como "article" por padrão.
  2. Formatação de Termos "term": Precisamos concatenar os termos com ; para representar "E" e | para representar "OU", além de adicionar parênteses para agrupar os termos associados por "E". Atenção ao pegar o termo principal da frase.  (exemplo: (matematica;evolucionaria)|robotica, Bioactive|educational. Se o tipo for "name", extraia e coloque o nome completo em "term".
  3. "message": Contenha um array com duas mensagens:
      1. Uma mensagem detalhada sobre o "term" retornado.
      2. Uma mensagem com variações, informando que 'os resultados podem ser filtrados utilizando filtros de instituições, área, qualis e ano'.
  `
}

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

export function Search() {
    //retorna url
    const queryUrl = useQuery();
    const navigate = useNavigate();
    const type_search = queryUrl.get('type_search');
    const terms = queryUrl.get('terms');

    useEffect(() => {
        if (type_search) {
            setSearchType(String(type_search));
        }
        if (terms) {
            setValoresSelecionadosExport(terms)
        }

    }, [type_search, terms]);


    function parseTerms(encoded: string): { term: string }[] {
        // Decodifica a string URL-encoded
        const formatted = decodeURIComponent(encoded);

        const result: { term: string }[] = [];
        let temp = '';
        let inGroup = false;

        for (let i = 0; i < formatted.length; i++) {
            const char = formatted[i];

            if (char === '(') {
                inGroup = true;
                if (temp.trim()) {
                    result.push({ term: temp.trim() + '|' });
                    temp = '';
                }
            } else if (char === ')') {
                inGroup = false;
                // Processa os termos agrupados
                if (temp.trim()) {
                    const terms = temp.split(';').map(t => t.trim());
                    terms.forEach((term, index) => {
                        if (term) {
                            result.push({ term: term + (index < terms.length - 1 ? ';' : '|') });
                        }
                    });
                    temp = '';
                }
            } else if (char === '|') {
                if (!inGroup && temp.trim()) {
                    result.push({ term: temp.trim() + '|' });
                    temp = '';
                }
            } else {
                temp += char;
            }
        }

        // Adiciona qualquer termo restante
        if (temp.trim()) {
            result.push({ term: temp.trim() + (inGroup ? ';' : '|') });
        }

        // Não remove os conectores finais, pois eles são necessários
        return result;
    }

    const { onOpen } = useModal();

    const { searchType, setMode, setSearchType, setInputMaria, inputMaria, maria, setMaria, valoresSelecionadosExport, mode, setValoresSelecionadosExport, setMessagesMaria, itemsSelecionados, setItensSelecionados, setSugestoes, sugestoes, itemsSelecionadosPopUp, version } = useContext(UserContext)

    const [input, setInput] = useState("");
    const [, setDataModificacao] = useState('');

    useEffect(() => {
        const dataAtual = new Date();
        const dataFormatada = `${dataAtual.getDate()}/${dataAtual.getMonth() + 1}/${dataAtual.getFullYear()}`;

        setDataModificacao(dataFormatada);

    }, []);

    useEffect(() => {
        setInputMaria(input)
    }, [input, maria]);

    const handlePopUppesquisa = () => {
        if (!maria) {
            onOpen('search')
        }
    }

    const [messages, setMessages] = useState<Message[]>([]);
    const [, setIsTyping] = useState(false);


    const handleSend = async (message: any) => {
        const newMessage: Message = {
            message,
            direction: 'outgoing',
            sender: "user"
        };

        setMessages([newMessage]); // Substituir todas as mensagens antigas pela nova mensagem

        // Iniciar uma nova conversa
        setIsTyping(true);
        await processMessageToChatGPT(newMessage);
    };


    async function processMessageToChatGPT(messageObject: any) {
        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": [
                systemMessage,
                { role: "user", content: messageObject.message },
                { role: "assistant", content: "" } // Defina a mensagem vazia para reiniciar a conversa
            ]
        }

        await fetch("https://api.openai.com/v1/chat/completions",


            {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(apiRequestBody)
            }).then((data) => {
                return data.json();
            }).then((data) => {
                console.log(data);
                const chatGptMessage = data.choices[0].message;
                const { content } = chatGptMessage;
                const parsedContent = JSON.parse(content);
                const { type, term, message } = parsedContent;

                console.log('chatGptMessage', chatGptMessage)

                // Defina os valores nas variáveis
                setSearchType(type);
                setMessagesMaria(message)
                const termsArray = term // Split the string into an array of terms

                // Map over the terms array and create an array of objects with the 'term' property set

                setItensSelecionados(prevItems => [...prevItems, { term }]);

                setIsTyping(false);


                queryUrl.set('type_search', searchType);
                queryUrl.set('terms', termsArray);
                setMode(input)
                navigate({
                    pathname: '/resultados',
                    search: queryUrl.toString(),
                });

            })
    }

    const location = useLocation();

    const posGrad = location.pathname == '/pos-graduacao'

    const resultados = location.pathname == '/resultados'

    const history = useNavigate();

    const handlePesquisa = () => {
        if (maria && inputMaria.length > 1 && posGrad) {
            handleSend(inputMaria)

        }
        else if (maria && inputMaria.length > 1) {
            handleSend(inputMaria)
            history('/resultados')
        }
    }

    const handleRemoveItem = (index: number) => {

        if (itemsSelecionados.length == 1) {
            if (posGrad) {
                queryUrl.set('terms', '');
                navigate({
                    pathname: '/pos-graduacao',
                    search: queryUrl.toString(),
                });
            } else if (resultados) {
                queryUrl.set('terms', '');
                navigate({
                    pathname: '/resultados',
                    search: queryUrl.toString(),
                });
            }
            setItensSelecionados([])
        } else {
            const newItems = [...itemsSelecionados];
            newItems.splice(index, 1);
            setItensSelecionados(newItems);
        }

    };

    useEffect(() => {
        const joinedTerms = itemsSelecionados.map(item => item.term).join('');
        // Verifica se o último caractere é ponto e vírgula ou barra vertical
        const lastChar = joinedTerms.slice(-1);
        if (lastChar === ';' || lastChar === '|') {
            // Remove o último caractere da concatenação
            const editedTerms = joinedTerms.slice(0, -1);
            setValoresSelecionadosExport(editedTerms);
        } else {
            setValoresSelecionadosExport(joinedTerms);
        }
    }, [itemsSelecionados]);


    //conectores 
    const handleConnectorChange = (index: number, connector: string) => {
        const newItems = [...itemsSelecionados];
        let term = newItems[index].term.trim();
        term = term.replace(/[|;]$/, ''); // Remove qualquer conector existente no final
        newItems[index].term = term + connector;
        setItensSelecionados(newItems);


        if (posGrad) {
            queryUrl.set('terms', formatTerms(itemsSelecionados));
            navigate({
                pathname: '/pos-graduacao',
                search: queryUrl.toString(),
            });
        } else if (!posGrad) {
            queryUrl.set('terms', formatTerms(itemsSelecionados));
            navigate({
                pathname: '/resultados',
                search: queryUrl.toString(),
            });
        }
    };

    function formatTerms(valores: { term: string }[]): string {
        let result = '';
        let tempTerms: string[] = [];
        let lastConnector = '';

        valores.forEach(item => {
            let term = item.term.trim();
            let connector = term.slice(-1);

            if (connector === ';' || connector === '|') {
                term = term.slice(0, -1);
            }

            if (connector === ';') {
                tempTerms.push(term);
                lastConnector = ';';
            } else if (connector === '|') {
                tempTerms.push(term);
                result += '(' + tempTerms.join(';') + ')|';
                tempTerms = [];
                lastConnector = '|';
            } else {
                if (tempTerms.length > 0) {
                    result += '(' + tempTerms.join(';') + ')|';
                    tempTerms = [];
                }
                result += term + '|';
                lastConnector = '|';
            }
        });

        if (tempTerms.length > 0) {
            result += '(' + tempTerms.join(';') + ')';
        } else if (result.endsWith('|')) {
            result = result.slice(0, -1);
        }

        return result;
    }

    const hasTerms = queryUrl.has('terms');

    useEffect(() => {
        // Se houver itens selecionados, atualize a URL com esses termos
        if (itemsSelecionados.length > 0) {
            if (!hasTerms && posGrad) {
                queryUrl.set('terms', formatTerms(itemsSelecionados));
                navigate({
                    pathname: '/pos-graduacao',
                    search: queryUrl.toString(),
                });
            } else if (hasTerms && resultados) {
                queryUrl.set('terms', formatTerms(itemsSelecionados));
                navigate({
                    pathname: '/resultados',
                    search: queryUrl.toString(),
                });
            }
        } else {


        }
    }, [itemsSelecionados]);


    useEffect(() => {
        if (terms) {
            const parsedTerms = parseTerms(String(terms));
            setItensSelecionados(parsedTerms);
        }
    }, []);


    useEffect(() => {
        if (maria) {
            navigate("/resultados-ia");
            setMaria(false)
        }
    }, [maria]);

    return (
        <div className="bottom-0 mt-4 mb-2 w-full flex flex-col max-sm:flex max-sm:flex-row">
            <div className={` w-full`}>
                <div className="">
                    <div className="flex gap-4 w-full">
                        <Alert className="h-14 p-2 flex items-center justify-between">
                            <div className="flex items-center gap-2 w-full flex-1">
                                <Play size={16} className="hidden md:flex md:whitespace-nowrap md:w-10" />

                                <div className="hidden md:flex gap-2 w-fit  items-center">
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            checked={maria}
                                            onCheckedChange={(value) => setMaria(value)}
                                        />
                                        <Label className="flex gap-2 items-center">{version ? ('GaIA') : ('MarIA')}<Chats size={16} className="" /></Label>
                                    </div>

                                    {!maria && (
                                        <SelectTypeSearch />
                                    )}

                                    {itemsSelecionados.length > 0 && (
                                        <div className='flex gap-2 mx-2 items-center'>
                                            {itemsSelecionados.map((valor, index) => {
                                                return (
                                                    <>
                                                        <div key={index} className={`flex gap-2 items-center h-10 p-2 px-4 capitalize rounded-md text-xs ${searchType == 'article' && ('bg-blue-500 dark:bg-blue-500')} ${searchType == 'abstract' && ('bg-yellow-500 dark:bg-yellow-500')} ${searchType == 'speaker' && ('bg-orange-500 dark:bg-orange-500')} ${searchType == 'book' && ('bg-pink-500 dark:bg-pink-500')} ${searchType == 'patent' && ('bg-cyan-500 dark:bg-cyan-500')} ${searchType == 'name' && ('bg-red-500 dark:bg-red-500')} ${searchType == 'area' && ('bg-green-500 dark:bg-green-500')} ${searchType == '' && ('bg-blue-700 dark:bg-blue-700')} text-white border-0 `} >
                                                            {valor.term.replace(/[|;]/g, '')}
                                                            <X size={12} onClick={() => handleRemoveItem(index)} className="cursor-pointer" />
                                                        </div>
                                                        {index < itemsSelecionados.length - 1 && (
                                                            <button className="rounded-full cursor-pointer flex items-center justify-center whitespace-nowrap h-8 w-8 bg-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-900 dark:bg-neutral-800 transition-all text-xs outline-none" onClick={() => {
                                                                const connector = itemsSelecionados[index].term.endsWith('|') ? ';' : '|';
                                                                handleConnectorChange(index, connector);
                                                            }} >
                                                                {itemsSelecionados[index].term.endsWith(';') ? "e" : "ou"}
                                                            </button>
                                                        )}

                                                    </>
                                                );
                                            })}
                                        </div>
                                    )}

                                </div>

                                <Input onClick={() => handlePopUppesquisa()} onChange={(e) => setInput(e.target.value)} value={input} type="text" className="border-0 w-full  flex flex-1" />

                            </div>

                            <div className="w-fit flex gap-2">
                                {itemsSelecionados.length > 0 && (
                                    <Button size={'icon'} variant={'ghost'} onClick={() => {
                                        setItensSelecionados([])

                                        if (posGrad) {
                                            history('/pos-graduacao')
                                        } else (
                                            history('/resultados')
                                        )

                                    }}><Trash size={16} /></Button>
                                )}
                                <Button
                                    onClick={() => handlePesquisa()}
                                    variant="outline"
                                    className={`
    ${searchType == 'article' && 'bg-blue-500 dark:bg-blue-500 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white'}
    ${searchType == 'abstract' && 'bg-yellow-500 dark:bg-yellow-500 hover:bg-yellow-600 dark:hover:bg-yellow-600 hover:text-white'}
    ${maria && 'bg-[#82AAC0] dark:bg-[#82AAC0] hover:bg-[#6F97AD] dark:hover:bg-[#6F97AD] hover:text-white'}
    ${searchType == 'speaker' && 'bg-orange-500 dark:bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-600 hover:text-white'}
    ${searchType == 'book' && 'bg-pink-500 dark:bg-pink-500 hover:bg-pink-600 dark:hover:bg-pink-600 hover:text-white'}
    ${searchType == 'patent' && 'bg-cyan-500 dark:bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-600 hover:text-white'}
    ${searchType == 'name' && 'bg-red-500 dark:bg-red-500 hover:bg-red-600 dark:hover:bg-red-600 hover:text-white'}
    ${searchType == 'area' && 'bg-green-500 dark:bg-green-500 hover:bg-green-600 dark:hover:bg-green-600 hover:text-white'}
    ${searchType == '' && 'bg-blue-700 dark:bg-blue-700 hover:bg-blue-800 dark:hover:bg-blue-800 hover:text-white'}
    text-white border-0
  `}
                                    size={'icon'}
                                >
                                    <MagnifyingGlass size={16} className="" />
                                </Button>

                            </div>
                        </Alert>
                    </div>
                </div>


            </div>
        </div>
    )
}