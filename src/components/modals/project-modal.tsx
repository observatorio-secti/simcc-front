import { SquareArrowOutUpRight, SquareAsterisk, User, X } from "lucide-react";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useModal } from "../hooks/use-modal-store";
import { ScrollArea } from "../ui/scroll-area";
import { useContext } from "react";
import { UserContext } from "../../context/context";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { CalendarBlank } from "phosphor-react";
import { Alert } from "../ui/alert";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";

interface ItemsSelecionados {
    term: string;
}

const normalizeText = (text: string): string => {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
        .replace(/[|();]/g, '')           // Remove caracteres especiais
        .toLowerCase();
};

const highlightText = (text: string, terms: ItemsSelecionados[]): React.ReactNode => {
    if (!text || terms.length === 0) return text;

    // Cria uma lista com os termos normalizados
    const normalizedTerms = terms.map(term => normalizeText(term.term));

    // Função para verificar se um trecho do texto contém algum dos termos
    const containsTerm = (substring: string): boolean => {
        const normalizedSubstring = normalizeText(substring);
        return normalizedTerms.some(term => normalizedSubstring.includes(term));
    };

    // Divide o texto em palavras e processa cada uma
    const parts = text.split(/(\s+)/); // Divide por espaços para preservar as palavras e espaços
    const result: React.ReactNode[] = [];

    let i = 0;
    while (i < parts.length) {
        const part = parts[i];

        if (containsTerm(part)) {
            const normalizedPart = normalizeText(part);
            let j = 0;
            let highlightStart = 0;

            // Verifica a presença de cada termo na parte do texto
            while (j < normalizedPart.length) {
                let matchedTerm = false;

                for (const term of normalizedTerms) {
                    if (normalizedPart.slice(j, j + term.length) === term) {
                        // Adiciona o texto não destacado antes do termo
                        if (j > highlightStart) {
                            result.push(part.slice(highlightStart, j));
                        }

                        // Adiciona o termo destacado
                        result.push(
                            <span key={`${i}-${j}`} className="text-blue-500 capitalize font-semibold">
                                {part.slice(j, j + term.length)}
                            </span>
                        );

                        j += term.length;
                        highlightStart = j;
                        matchedTerm = true;
                        break;
                    }
                }

                if (!matchedTerm) {
                    j++;
                }
            }

            // Adiciona qualquer parte restante do texto
            if (highlightStart < part.length) {
                result.push(part.slice(highlightStart));
            }
        } else {
            result.push(part);
        }

        i++;
    }

    return result;
};

export function ProjectModal() {
    const { urlGeral, itemsSelecionados } = useContext(UserContext)

    const { onClose, isOpen, type: typeModal, data } = useModalSecundary();
    const isModalOpen = isOpen && typeModal === "project-modal";

    const teste = highlightText(data.project_name || '', itemsSelecionados)

    const normalizeArea = (area: string): string => {
        return area

            .toUpperCase(); // Converte para maiúsculas
    };

    const qualisColor: { [key: string]: string } = {
        "APRESENTAÇÃO DE TRABALHO": "bg-red-200",
        "ARTIGO PUBLICADO EM PERIÓDICO": "bg-[#5F82ED]",
        "CURSO DE CURTA DURAÇÃO MINISTRADO": "bg-red-200",
        "LIVRO OU CAPÍTULO DE LIVRO": "bg-[#D15697]",
        "ORGANIZAÇÃO DE EVENTO": "bg-[#DE7A36]",
        "OUTRA PRODUÇÃO BIBLIOGRÁFICA": "bg-red-200",
        "OUTRA PRODUÇÃO TÉCNICA": "bg-[#66B4D0]",
        "PARTICIPAÇÃO EM BANCA DE COMISSÕES JULGADORAS": "bg-red-200",
        "PARTICIPAÇÃO EM BANCA DE TRABALHOS DE CONCLUSÃO": "bg-red-200",
        "PARTICIPAÇÕES EM EVENTOS": "bg-[#DE7A36]",
        "PATENTES E REGISTROS": "bg-[#66B4D0]",
        "PRODUTO TECNOLÓGICO": "bg-red-200",
        "SOFTWARE": "bg-[#096670]",
        "TEXTO EM JORNAL OU REVISTA": "bg-[#E9A700]",
        "TRABALHO PUBLICADO EM ANAIS DE EVENTO": "bg-[#DE2834]",
        "TRABALHO TÉCNICO": "bg-red-200",
    };

    const getQualisColor = (type: string): string => {
        const normalizedType = normalizeArea(type);

        // Encontra a chave que contém o texto normalizado do tipo
        const matchingKey = Object.keys(qualisColor).find(key =>
            normalizedType.includes(normalizeArea(key))
        );

        // Retorna a cor correspondente ou uma cor padrão
        return matchingKey ? qualisColor[matchingKey] : "bg-gray-200"; // cor padrão
    };

    return (
        <Sheet open={isModalOpen} onOpenChange={onClose}>
            <SheetContent
                className={`p-0 gap-0 dark:bg-neutral-900  dark:border-gray-600 w-full md:min-w-[50vw]`}
            >
                <div
                    className={`h-full w-2 absolute bg-[#66B4D0]  `}
                >
                </div>

                <div className="ml-2">
                    <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
                        <div className="flex items-center gap-3">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            className="h-8 w-8"
                                            variant={"outline"}
                                            onClick={() => onClose()}
                                            size={"icon"}
                                        >
                                            <X size={16} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent> Fechar</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <div className="flex ml-auto items-center w-full justify-between">
                                <div className="flex ml-auto items-center gap-3">

                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className=" pb-4  h-[calc(100vh-50px)] p-8 flex-1">
                        <div>
                            <div>
                                <p className=" mb-2 text-lg font-light text-foreground">
                                    {data.agency_name}
                                </p>

                                <h1 className=" relative  text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]  capitalize">
                                    {teste}
                                </h1>

                                <div className="flex items-center flex-wrap gap-4 mt-6">

                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><CalendarBlank size={12} />{data.start_year} - {data.end_year == '' ? ('atual') : (data.end_year)}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><SquareAsterisk size={12} />{data.nature}</div>

                                    <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><div className={`h-4 w-4 rounded-md ${data.status == 'EM_ANDAMENTO' ? ('bg-yellow-500') : data.status == 'DESATIVADO' ? ('bg-red-500') : ('bg-green-500')}`}></div>{data.status?.split('_').join(' ')}</div>
                                </div>
                            </div>
                        </div>

                        <div className="my-6 border-b dark:border-b-neutral-800"></div>

                        <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="text-sm w-fit text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
                                <Avatar className="cursor-pointer rounded-md  h-16 w-16">
                                    <AvatarImage className={'rounded-md h-16 w-16'} src={`${urlGeral}ResearcherData/Image?name=${data.researcher_name}`} />
                                    <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                                </Avatar>

                                <div>
                                    <p>Encontrado no Lattes de </p>
                                    <p className="text-black dark:text-white font-medium text-lg">{data.researcher_name}</p>
                                </div>
                            </div>

                            <div className="flex justify-end w-full md:w-fit">
                                <Link className="flex self-end" to={`/researcher?researcher_name=${data.researcher_name}&search_type=&terms=`} target="_blank" ><Button size={'icon'}><SquareArrowOutUpRight size={16} /></Button></Link>
                            </div>
                        </div>

                        {data.description != '' && (
                            <div>

                                <div className="my-6 border-b dark:border-b-neutral-800"></div>
                                <h4 className="font-medium text-xl mb-4">Descrição</h4>
                                <p className="text-sm text-gray-500 flex flex-wrap text-justify">{data.description}</p>
                            </div>
                        )}

                        {(data.production && data.production.length > 0) && (
                            <div>
                                <div className="my-6 border-b dark:border-b-neutral-800"></div>
                                <h4 className="font-medium text-xl mb-4">Produções</h4>

                                <div className="flex flex-col gap-3">
                                    {data.production

                                        .map((props, index) => (
                                            <div className="flex">
                                                <div className={`w-2 min-w-2 rounded-l-md dark:border-neutral-800 border min-h-[120px] border-neutral-200 border-r-0 ${getQualisColor(props.type || '')} min-h-full relative`}></div>
                                                <Alert
                                                    key={index}
                                                    className="rounded-l-none"
                                                >
                                                    <div>
                                                        <p className="mb-1 text-sm">{props.type}</p>
                                                        <p className="font-semibold text-sm">{props.title}</p>

                                                    </div>
                                                </Alert>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {data.foment?.length != 0 && (

                            <div>
                                <div className="my-6 border-b dark:border-b-neutral-800"></div>
                                <h4 className="font-medium text-xl mb-4">Agências de formento</h4>

                                <div className="flex flex-col gap-3">
                                    {data.foment
                                        ?.filter((item, index, self) =>
                                            index === self.findIndex((t) => t.agency_name === item.agency_name) // Filtra elementos únicos por 'name'
                                        )
                                        .map((props, index) => (
                                            <div
                                                key={index}
                                                className="border-neutral-200 border w-full dark:border-neutral-800 py-2 px-2 rounded-md text-xs flex gap-2 items-center"
                                            >

                                                <div>
                                                    <p className="font-semibold text-sm">{props.agency_name}</p>
                                                    <p className="mt-1">{props.nature.split('_').join(' ')}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {(data.components && data.components.length > 0) && (
                            <div>

                                <div className="my-6 border-b dark:border-b-neutral-800"></div>
                                <h4 className="font-medium text-xl mb-4">Componentes</h4>

                                <div className="flex flex-wrap gap-3">
                                    {data.components
                                        ?.filter((item, index, self) =>
                                            index === self.findIndex((t) => t.name === item.name) // Filtra elementos únicos por 'name'
                                        )
                                        .map((props, index) => (
                                            <div
                                                key={index}
                                                className="border-neutral-200 border dark:border-neutral-800 py-2 px-2 rounded-md text-xs flex gap-2 items-center"
                                            >
                                                <Avatar className="cursor-pointer rounded-md  h-6 w-6">
                                                    <AvatarImage
                                                        className="rounded-md h-6 w-6"
                                                        src={`${urlGeral}ResearcherData/Image?name=${props.name}`}
                                                    />
                                                    <AvatarFallback className="flex items-center justify-center">
                                                        <User size={16} />
                                                    </AvatarFallback>
                                                </Avatar>
                                                {props.name}
                                            </div>
                                        ))}
                                </div>

                            </div>
                        )}
                    </ScrollArea>

                </div>
            </SheetContent>
        </Sheet>
    )
}