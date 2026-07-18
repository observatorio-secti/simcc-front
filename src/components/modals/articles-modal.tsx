import { useContext, useEffect, useRef, useState } from "react";

import { UserContext } from "../../context/context";

import { Buildings, CalendarBlank, DownloadSimple, EyeClosed, File, Globe, LinkBreak, Quotes, Sparkle } from "phosphor-react";
import { Link } from "react-router-dom";

import { ScrollArea } from "../ui/scroll-area";

import { Button } from "../ui/button";
import { Asterisk, Eye, Plus, SquareArrowOutUpRight, Star, User, X } from "lucide-react";
interface Message {
  message: any;
  direction: string;
  sender: string;
}

interface ItemsSelecionados {
  term: string;
}

import {
  DialogHeader
} from "../../components/ui/dialog"
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";
import { Skeleton } from "../ui/skeleton";
import { useModal } from "../hooks/use-modal-store";

const decodeHtmlEntities = (text: string): string => {
  const entities = {
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&apos;': "'",
    '&QUOT;': '"',
    '&LT;': '<',
    '&GT;': '>',
    '&AMP;': '&'
  };
  return text.replace(/&(?:quot|lt|gt|amp|apos|QUOT|LT|GT|AMP);/g, entity => entities[entity.toLowerCase() as keyof typeof entities]);
};

const stripHtmlTags = (text: string): string => {
  // Remove HTML tags but preserve their text content
  const div = document.createElement('div');
  div.innerHTML = text;
  return div.textContent || div.innerText || '';
};

const normalizeText = (text: string): string => {
  // Remove HTML tags and normalize for comparison
  const textWithoutTags = stripHtmlTags(text);
  return textWithoutTags
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // Remove acentos
    .replace(/[|();]/g, '')           // Remove caracteres especiais
    .toLowerCase();
};

const highlightText = (text: string, terms: ItemsSelecionados[]): React.ReactNode => {
  if (!text || terms.length === 0) {
    // Just strip HTML and decode entities for display
    return stripHtmlTags(decodeHtmlEntities(text));
  }

  // First decode HTML entities and strip tags
  const cleanText = stripHtmlTags(decodeHtmlEntities(text));

  // Normalize terms for comparison
  const normalizedTerms = terms.map(term => normalizeText(term.term));

  // Split text into words while preserving spaces
  const words = cleanText.split(/(\s+)/);
  const result: React.ReactNode[] = []

  words.forEach((word, index) => {
    const normalizedWord = normalizeText(word);
    const shouldHighlight = normalizedTerms.some(term => normalizedWord.includes(term));

    if (shouldHighlight) {
      result.push(
        <span key={index} className="text-blue-500 capitalize font-semibold">
          {word}
        </span>
      );
    } else {
      result.push(word);
    }
  });

  return result;
};

const API_KEY = import.meta.env.VITE_API_KEY



export function ArticlesModal() {

  const { urlGeral, itemsSelecionados, version } = useContext(UserContext)

  const { onClose, isOpen, type: typeModal, data } = useModalSecundary();
  const isModalOpen = isOpen && typeModal === "articles-modal";


  const systemMessage = (title: string, author: string) => ({
    role: "system",
    content: `Retorne APENAS UM JSON válido e formatado conforme abaixo, sem explicações adicionais. O JSON deve conter informações detalhadas sobre o artigo, com base no DOI (se disponível) ou em fontes confiáveis da internet. O resumo não pode conter informações inventadas. O resumo deve ser em PORTUGUÊS BRASIL
  
  {
    "authors": [], // Lista completa de autores do artigo, tanto o fornecido, e os nomes que você encontrou
    "doi": "", // DOI do artigo, se disponível
    "year": "", // Ano de publicação
    "journal": "", // Nome da revista ou conferência
    "message": "", // Resumo detalhado com pelo menos 500 caracteres, baseado em fontes verificáveis
    "methodology": "", // Metodologia utilizada no estudo
    "main_findings": "", // Principais conclusões do artigo
    "sources": [] // Lista de fontes usadas para obter as informações, incluindo o DOI se aplicável
  }
  
  Priorize a obtenção do resumo a partir do DOI. Caso o DOI não esteja disponível, busque informações em fontes confiáveis na internet com base no TÍTULO e um dos AUTORES que seram passados. Garanta que os dados sejam verificáveis e corretamente referenciados. Retorne APENAS o JSON acima, sem explicações ou formatação adicional.`,
  });



  const qualisColor = {
    'A1': 'bg-[#006837]',
    'A2': 'bg-[#8FC53E]',
    'A3': 'bg-[#ACC483]',
    'A4': 'bg-[#BDC4B1]',
    'B1': 'bg-[#F15A24]',
    'B2': 'bg-[#F5831F]',
    'B3': 'bg-[#F4AD78]',
    'B4': 'bg-[#F4A992]',
    'B5': 'bg-[#F2D3BB]',
    'C': 'bg-[#EC1C22]',
    'None': 'bg-[#560B11]',
    'SQ': 'bg-[#560B11]'
  }

  const imgRef = useRef<HTMLImageElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const checkImageHeight = () => {
      if (imgRef.current && imgRef.current.clientHeight > 300) {
        setShowOverlay(true);
      }
    };

    // Check image height after the image has loaded
    const img = imgRef.current;
    if (img) {
      img.onload = checkImageHeight;
      if (img.complete) {
        checkImageHeight();
      }
    }
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);
  const [gaia, setGaia] = useState('')

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const teste = highlightText(data.title || '', itemsSelecionados)

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);


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

  const [parsedContent, setParsedContent] = useState({
    authors: [],
    message: '',
    journal: '',
    doi: '',
    year: '',
    methodology: '',
    main_findings: '',
    sources: []
  });

  const { onOpen } = useModal()

  async function processMessageToChatGPT(messageObject: any) {
    try {
      // Valida se "data" está definido antes de acessá-lo
      const title = data?.title || 'Título Desconhecido';
      const researcher = data?.researcher || 'Autor Desconhecido';

      const apiRequestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          systemMessage(title, researcher),
          { role: "user", content: messageObject.message },
          { role: "assistant", content: "" }
        ]
      };

      console.log("Enviando para API:", JSON.stringify(apiRequestBody, null, 2)); // Verifique os dados antes de enviar

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(apiRequestBody)
      });

      const data2 = await response.json();
      console.log("Resposta da API:", data2);

      if (data2.choices?.length > 0) {
        const chatGptMessage = data2.choices[0].message;
        const parsedData = JSON.parse(chatGptMessage.content); // Tenta fazer o parse do JSON

        setParsedContent(parsedData); // Garante que o JSON é válido antes de sobrescrever


        setGaia(parsedData.message);
      } else {
        console.error("Erro: resposta inesperada da API", data);
      }

      setIsTyping(false);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      setIsTyping(false);
    }
  }


  const testeMensagem = `Resumo fiel e sem invenções sobre o artigo '${data.title}', onde um dos autores é '${data.researcher}'. ${(data.doi != '' && data.doi != null && data.doi != undefined) && (`E o doi do artigo é ${data.doi}`)}`


  return (
    <Sheet open={isModalOpen} onOpenChange={onClose}>
      <SheetContent
        className={`p-0 gap-0 dark:bg-neutral-900  dark:border-gray-600 w-full md:min-w-[50vw]`}
      >
        <div
          className={`h-full w-2 absolute  ${qualisColor[data.qualis as keyof typeof qualisColor]} `}
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
                  {(data.pdf != '' || data.landing_page_url != '' || data.doi != '') && (
                    <Link target="_blank" to={data.pdf || data.landing_page_url || `https://doi.org/${data.doi || 'default-doi'}`}>
                      <Button variant={'default'} className="h-8  text-white dark:text-white">
                        Download do arquivo
                        <DownloadSimple size={8} className="h-4 w-4" />
                      </Button></Link>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>


          <ScrollArea className=" pb-4  h-[calc(100vh-50px)] p-8 flex-1">
            <div className="mb-8 flex gap-8 justify-between flex-col-reverse md:flex-row">
              <div className="">
                <div className="">
                  {data.relevance && (
                    <div className="relative mb-3  py-2 px-4 bg-yellow-600 w-fit rounded-md text-white"><Star size={16} /></div>
                  )}

                  <p className=" mb-2 text-lg text-md md:text-xl font-light text-foreground">
                    {data.magazine}
                  </p>
                </div>


                <h1 className=" relative  text-2xl font-bold leading-tight tracking-tighter md:text-3xl lg:leading-[1.1]  capitalize">
                  {teste}
                </h1>


                <div className="flex items-center flex-wrap gap-4 mt-6">
                  {data.article_institution != '' && (<p className="text-gray-500 dark:text-gray-300 text-sm text-justify  flex items-center gap-1"> <Buildings size={16} />{data.article_institution}</p>)}
                  <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><CalendarBlank size={12} />{data.year}</div>
                  {data.language != '' && (<div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Globe size={12} />{data.language}</div>)}
                </div>
              </div>

              <div>
                <div>
                  <div id="mudarCorDiv" className={` h-16 w-16 rounded-md relative  whitespace-nowrap flex items-center justify-center  ${qualisColor[data.qualis as keyof typeof qualisColor]}`}>
                    <File size={36} className="text-white whitespace-nowrap  w-10" />
                    <p className="text-[8px] text-white absolute font-bold mt-[6px]">{data.qualis}</p>

                  </div>

                </div>
              </div>
            </div>

            <div>

              <div className="mb-6 border-b dark:border-b-neutral-800"></div>

              <div className="flex justify-between items-center flex-wrap">
                <div className="text-sm w-fit text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center"><Avatar className="cursor-pointer rounded-md h-16 w-16">
                  <AvatarImage className={'rounded-md h-16 w-16'} src={`${urlGeral}ResearcherData/Image?name=${data.researcher}`} />
                  <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                </Avatar>
                  <div>
                    <p>Encontrado no Lattes de </p>
                    <p className="text-black dark:text-white font-medium text-lg">{data.researcher}</p>
                  </div>
                </div>

                <div className="flex justify-end w-full md:w-fit">
                  <Link to={`/researcher?researcher_name=${data.researcher}&search_type=&terms=`} target="_blank" ><Button size={'icon'}><SquareArrowOutUpRight size={16} /></Button></Link>
                </div>
              </div>

              <div className="my-6 border-b dark:border-b-neutral-800"></div>
              {((data.jif != "None" && data.jif != "") || data.citations_count != '' || data.issn != '' || data.doi != '') && (<h4 className="font-medium text-xl mb-4">Informações gerais</h4>)}

              <div className="flex gap-3 flex-wrap">
                {data?.jif && (
                  <Link target="_blank" to={data.jcr_link || ''} className=" border-neutral-200 border dark:border-neutral-800 py-2 px-4 rounded-md text-xs flex gap-2 items-center">
                    <LinkBreak size={16} /> JCR {data.jif}
                  </Link>
                )}

                {data.citations_count != '' && (<div className=" border-neutral-200 border dark:border-neutral-800 py-2 px-4  rounded-md text-xs flex gap-2 items-center"><Quotes size={16} />Citações {data.citations_count}</div>)}


                {typeof data.issn === 'string' && data.issn.trim() !== '' &&
                  data.issn.split(',').map((author, index) => (
                    <div
                      key={index}
                      className="border-neutral-200 border dark:border-neutral-800 py-2 px-4 rounded-md text-xs flex gap-2 items-center">
                      <Asterisk size={16} />ISSN {author.trim()}
                    </div>
                  ))
                }

                {data.doi != '' && (<Link to={`https://doi.org/${data.doi}`} target="_blank" className=" border-neutral-200 border dark:border-neutral-800 py-2 px-4  rounded-md text-xs  flex gap-2 items-center"><LinkBreak size={16} />DOI {data.doi}</Link>)}
              </div>
            </div>

            {data.has_image && (
              <div>
                <div className="my-6 border-b dark:border-b-neutral-800"></div>
                <div className="relative">
                  <div
                    className={`overflow-hidden rounded-md ${isExpanded ? "h-auto" : "h-[300px]"
                      }`}
                  >
                    <img
                      src={`${urlGeral}image/${data.id}`}
                      className="w-full"
                      alt="Dynamic content"
                    />
                  </div>
                  {!isExpanded && (
                    <div className="absolute h-[300px] inset-0 flex justify-center w-full bg-gradient-to-t from-white dark:from-neutral-900 to-transparent items-end">
                      <Button
                        onClick={toggleExpand}
                      >
                        <Eye size={16} />
                        Ver mais
                      </Button>
                    </div>
                  )}
                  {isExpanded && (
                    <div className="flex justify-center mt-2">
                      <Button
                        onClick={toggleExpand}

                      >
                        <EyeClosed size={16} />
                        Mostrar menos
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="my-6 border-b dark:border-b-neutral-800"></div>
              <h4 className="font-medium text-xl mb-4">Resumo</h4>
              {data.abstract != '' ? (
                <p className="text-sm text-gray-500 flex flex-wrap text-justify">{data.abstract}</p>
              ) : (
                <div>
                  <Button onClick={() => handleSend(testeMensagem)} variant={'outline'} className="w-full border-eng-blue text-eng-blue hover:text-eng-dark-blue hover:border-eng-dark-blue"><Sparkle size={16} />Gerar resumo com a {version ? 'Gaia' : 'MarIA'}</Button>

                  {isTyping ? (
                    <div className="flex flex-col gap-3 mt-8">
                      <Skeleton className="w-full h-5 rounded-md" />
                      <Skeleton className="w-full h-5 rounded-md" />
                      <Skeleton className="w-full h-5 rounded-md" />
                      <Skeleton className="w-full h-5 rounded-md" />
                      <Skeleton className="w-full h-5 rounded-md" />
                      <Skeleton className="w-[80%] h-5 rounded-md" />
                    </div>
                  ) : (
                    gaia != '' && (
                      <div>
                        <p className="text-sm text-gray-500 flex flex-wrap text-justify mt-6">
                          {gaia}</p>

                        <p className="text-md font-medium flex flex-wrap text-justify mt-6">
                          Metodologia</p>

                        <p className="text-sm text-gray-500 flex flex-wrap text-justify mt-2">
                          {parsedContent.methodology}
                        </p>

                        <p className="text-md font-medium flex flex-wrap text-justify mt-6">
                          Conclusões</p>

                        <p className="text-sm text-gray-500 flex flex-wrap text-justify mt-2">
                          {parsedContent.main_findings}
                        </p>

                        <p className="text-md font-medium flex flex-wrap text-justify mt-6">
                          Autores</p>

                        <p className="text-sm text-gray-500 flex flex-wrap text-justify mt-2">
                          {parsedContent.authors.length > 0 ? parsedContent.authors.join(", ") : "Autores não disponíveis"}
                        </p>

                        <p className="text-sm text-gray-500 flex flex-wrap font-bold text-justify mt-6">
                          A {version ? 'Gaia' : 'MarIA'} pode cometer erros. Considere verificar informações importantes.</p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {data.authors != '' && (
              <div>
                <div className="my-6 border-b dark:border-b-neutral-800"></div>
                <h4 className="font-medium text-xl mb-4">Autores</h4>

                <div className="flex flex-wrap gap-3">
                  {data.authors?.split(';').map((author, index) => (
                    <div
                      onClick={() => onOpen('researcher-modal', { name: author.trim() })}
                      key={index}
                      className="border-neutral-200 border cursor-pointer dark:border-neutral-800 py-2 px-2 rounded-md text-xs flex gap-2 items-center">
                      <Avatar className="cursor-pointer rounded-md  h-6 w-6">
                        <AvatarImage className={'rounded-md h-6 w-6'} src={`${urlGeral}ResearcherData/Image?name=${author.trim()}`} />
                        <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                      </Avatar> {author.trim()}
                    </div>
                  ))}

                </div>
              </div>
            )}

            {data.keywords != '' && (
              <div>
                <div className="my-6 border-b dark:border-b-neutral-800"></div>
                <h4 className="font-medium text-xl mb-4">Palavras-chaves</h4>

                <div className="flex flex-wrap gap-3">
                  {data.keywords?.split(';').map((props, index) => (
                    <div key={index} className=" border-neutral-200 border dark:border-neutral-800 py-2 px-4  rounded-md text-xs  flex gap-2 items-center">{props.trim()}</div>
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