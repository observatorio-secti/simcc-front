import { AppWindow, Ticket, IdentificationBadge, CalendarBlank, Copyright, CurrencyCircleDollar, LinkBreak, Paperclip, PenNib, DotsThree } from "phosphor-react";
import { useContext } from "react";

import { UserContext } from "../../../../context/context";
import { Alert } from "../../../ui/alert";
import { Link } from "react-router-dom";
import { useModal } from "../../../hooks/use-modal-store";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../ui/dropdown-menu";
import { Button } from "../../../ui/button";

type Publicacao = {
  id?: string,
  title?: string | '',
  year?: string,
  isbn?: string,
  publishing_company?: string

  type?: string
  name?: string

  grant_date?: string,

  financing?: string,
  project_name?: string


  nature?: string,
  oriented?: string,
  status?: string,


  event_name?: string

  participation?: string
  researcher?: string
  has_image?: boolean
  relevance?: boolean
}


interface ItemsSelecionados {
  term: string;
}

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
  const result: React.ReactNode[] = [];

  words.forEach((word, index) => {
    const normalizedWord = normalizeText(word);
    const shouldHighlight = normalizedTerms.some(term => normalizedWord.includes(term));

    if (shouldHighlight) {
      result.push(
        <span key={index} className="text-blue-500 font-semibold">
          {word}
        </span>
      );
    } else {
      result.push(word);
    }
  });

  return result;
};

export function BookItemGeral(props: Publicacao) {
  const { itemsSelecionados } = useContext(UserContext)

  const { urlGeral } = useContext(UserContext)

  const { onOpen } = useModal()
  const highlightedTitleEvent = highlightText(props.event_name || '', itemsSelecionados);
  const highlightedTitle = highlightText(props.title || '', itemsSelecionados);
  return (
    <div className="flex  w-full" >

      <div
        className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0  ${props.type == 'relatorio-tecnico' && ('bg-[#662D91]')}  ${props.type == 'livro' && ('bg-pink-800')} ${props.type == 'software' && ('bg-[#096670]')} ${props.type == 'marca' && ('bg-[#1B1464]')}  ${(props.nature == 'Iniciação Científica') && ('bg-[#8BFBD3]')}
                      ${(props.nature == 'Iniciacao Cientifica') && ('bg-[#8BFBD3]')} 
                      ${(props.nature == 'Dissertação De Mestrado') && ('bg-[#67A896]')} 
                       ${(props.nature == 'Tese De Doutorado') && ('bg-[#425450]')} 
                       ${(props.nature == 'Trabalho de Conclusao de Curso Graduacao') && ('bg-[#77D2B6]')} 
                         ${(props.nature == 'Trabalho De Conclusão De Curso De Graduação') && ('bg-[#77D2B6]')} 
                        ${(props.nature == 'Orientacao-De-Outra-Natureza') && ('bg-[#577E74]')}
                        ${(props.nature == 'Monografia de Conclusao de Curso Aperfeicoamento e Especializacao') && ('bg-[#2F7F7C]')}
                        ${(props.nature == 'Supervisão De Pós-Doutorado') && ('bg-[#46724B]')}
                      ${(props.type == 'patente') && ('bg-[#66B4D0]')} ${props.type == 'capLivro' && ('bg-pink-300')} ${(props.nature == "Congresso") && ('bg-[#FF5800]')} ${(props.nature == "Oficina") && ('bg-[#FCEE21]')} ${(props.nature == "Simpósio") && ('bg-[#D53A2C]')} ${(props.nature == "Encontro") && ('bg-[#E9A700]')}  ${(props.nature == "Outra") && ('bg-[#7F400B]')} ${(props.nature == "Seminário") && ('bg-[#FFBD7B]')}`}
      >
      </div>


      <Alert className="rounded-l-none flex flex-col justify-between p-0">
        <div>
          <div>
            {props.publishing_company != undefined && (
              <h3 className="font-semibold mb-4 ">{props.publishing_company}</h3>
            )}

            {props.type == 'orientacoes' && (
              <h3 className="font-semibold mb-4 ">{props.oriented}</h3>
            )}

            {props.type == 'relatorio-tecnico' && (
              <h3 className="font-semibold mb-4 ">{props.project_name}</h3>
            )}

            {props.type == 'patente' && (
              <h3 className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal "> {highlightedTitle}</h3>
            )}



            {props.type == 'participacao-evento' && (
              <p className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal">{highlightedTitleEvent}</p>
            )}

            {(props.type != 'patente' && props.type != 'speaker') && (
              <p className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal">
                {highlightedTitle}
              </p>
            )}


          </div>
          <div>


          </div>
        </div>

        <div className="flex items-center flex-wrap mt-4 gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><CalendarBlank size={12} />{props.year}</div>


            {(props.isbn != undefined) && (
              <Link to={`https://www.cblservicos.org.br/isbn/pesquisa/?page=1&q=${props.isbn}&filtrar_por%5B0%5D=todos&ord%5B0%5D=relevancia&dir%5B0%5D=asc`} target="_blank" className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><LinkBreak size={16} className="" />ISBN {props.isbn}</Link>
            )}
          </div>

          {props.type == 'software' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><AppWindow size={12} />Software</div>
          )}

          {props.type == 'marca' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><PenNib size={12} />Marca</div>
          )}

          {props.type == 'patente' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Copyright size={12} />Patente</div>
          )}

          {props.type == 'orientacoes' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Paperclip size={12} className={'whitespace-nowrap min-w-4'} />{props.nature}</div>
          )}

          {props.type == 'participacao-evento' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Ticket size={12} className={'whitespace-nowrap min-w-4'} />{props.nature}</div>
          )}

          {(props.type == 'participacao-evento' && props.participation != 'None') && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><IdentificationBadge size={12} className={'whitespace-nowrap min-w-4'} />{props.participation}</div>
          )}

          {props.type == 'relatorio-tecnico' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center  " ><CurrencyCircleDollar size={12} className=" w-3 whitespace-nowrap flex" /><p className="truncate max-w-[300px]">{props.financing}</p></div>
          )}

          {props.type == 'orientacoes' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
              <div className={`w-4 h-4 rounded-md ${(props.status == "Em andamento") ? "bg-yellow-500" : 'bg-green-500'}`}></div>

              {props.status == "Em andamento" ? "Em andamento" : 'Concluída'}</div>
          )}

          {props.type == 'patente' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-2 items-center">
              <div className={`w-4 h-4 rounded-md ${(props.grant_date == 'NaT' || props.grant_date == "None" || props.grant_date == "") ? "bg-red-500" : 'bg-green-500'}`}></div>

              {(props.grant_date == 'NaT' || props.grant_date == "None" || props.grant_date == "") ? "Sem concessão" : props.grant_date}</div>
          )}

          <div className="flex gap-2 items-center ml-auto">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size={'icon'} className="ml-auto text-sm w-8 h-8 text-gray-500 dark:text-gray-300">
                  <DotsThree size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto">

                <DropdownMenuItem onClick={() => onOpen('researcher-modal', { name: props.name })} className="gap-3 flex items-center">
                  <div className="w-6 h-6 "> <img src={`${urlGeral}ResearcherData/Image?name=${props.name}`} alt="" className="w-full h-full object-cover border dark:border-neutral-800 rounded-md " /></div>
                  {props.name}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>



        </div>
      </Alert>
    </div>


  )
};