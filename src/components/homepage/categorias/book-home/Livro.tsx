import { AppWindow, Ticket, IdentificationBadge, CalendarBlank, Copyright, CurrencyCircleDollar, LinkBreak, Paperclip, PenNib, Globe, Check, CheckCircle } from "phosphor-react";
import { useContext } from "react";
import { toast } from "sonner";
import { UserContext } from "../../../../context/context";
import { Alert } from "../../../ui/alert";
import { Link } from "react-router-dom";
import { Image, Maximize2, Pencil, SquareArrowOutUpRight, SquareAsterisk, Star, Trash, User } from "lucide-react";
import { Button } from "../../../ui/button";
import { useModal } from "../../../hooks/use-modal-store";
import { useModalSecundary } from "../../../hooks/use-modal-store-secundary";
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar";

type Publicacao = {

  title?: string | '',
  year?: string,
  isbn?: string,
  publishing_company?: string

  type?: string

distinct?:boolean
  grant_date?: string,

  financing?: string,



  oriented?: string,

  researcher_name?:string

  event_name?: string

  participation?: string
  name?: string
  agency_code?: string
  agency_name?: string
  nature?: string
  description?: string
  end_year?: string
  id?: string
  number_academic_masters?: string
  number_phd?: string
  number_specialists?: string
  number_undergraduates?: string
  project_name?: string
  start_year?: string
  status?: string
  researcher_id?: string
  production?: Production[]
  foment?: Forment[]
  components?: Components[]

  researcher?: string
  has_image?: boolean
  lattes_id?: string


  authors?: string;
  homepage?: string;
  language?: string;
  means_divulgation?: string;

  relevance?: boolean;
  scientific_divulgation?: boolean;

  title_en?: string;
  year_?: string;
}

interface Components {
  citations: string
  lattes_id: string
  name: string
}

interface Production {

  title: string
  type: string
}

interface Forment {
  agency_code: string
  agency_name: string
  nature: string
}



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
              <span key={`${i}-${j}`} className="text-blue-500 font-semibold">
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


export function BookItem(props: Publicacao) {
  const { itemsSelecionados } = useContext(UserContext)

  const highlightedTitleEvent = highlightText(props.event_name || '', itemsSelecionados);
  const highlightedTitle = highlightText(props.title || '', itemsSelecionados);
  const highlightedTitleProject = highlightText(props.project_name || '', itemsSelecionados);

  const { onOpen } = useModalSecundary()
  const { urlGeral, user, permission } = useContext(UserContext);

  const has_editar_producao = permission.some(
    (perm) => perm.permission === 'editar_producao'
  );


  const handleFileDelete = async () => {
    const urlDelete = `${urlGeral}image/${props.id}?type=ARTICLE`;

    try {
      const response = await fetch(urlDelete, {
        method: "DELETE",
      });

      if (response.ok) {
        toast("Imagem excluída com sucesso!", {
          description: "A imagem foi removida do servidor.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });

      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);
      toast("Erro ao excluir imagem", {
        description: "Não foi possível excluir o arquivo. Tente novamente.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };

  const {onOpen:onOpen2, isOpen:isOpen2} = useModal()

  return (
    <div className="flex group w-full" >

      <div
        className={`
          h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0
          ${props.type == 'relatorio-tecnico' && ('bg-[#662D91]')} 
          ${props.type == 'livro' && ('bg-pink-800')}
          ${props.type == 'software' && ('bg-[#096670]')} 
          ${props.type == 'marca' && ('bg-[#1B1464]')}  
          ${(props.nature == 'Iniciação Científica') && ('bg-[#8BFBD3]')}
          ${(props.nature == 'Iniciacao Cientifica') && ('bg-[#8BFBD3]')} 
          ${(props.nature == 'Dissertação De Mestrado') && ('bg-[#67A896]')} 
          ${(props.nature == 'Tese De Doutorado') && ('bg-[#425450]')} 
          ${(props.nature == 'Trabalho de Conclusao de Curso Graduacao') && ('bg-[#77D2B6]')} 
          ${(props.nature == 'Trabalho De Conclusão De Curso De Graduação') && ('bg-[#77D2B6]')} 
          ${(props.nature == 'Orientacao-De-Outra-Natureza') && ('bg-[#577E74]')}
          ${(props.nature == 'Monografia de Conclusao de Curso Aperfeicoamento e Especializacao') && ('bg-[#2F7F7C]')}
          ${(props.nature == 'Supervisão De Pós-Doutorado') && ('bg-[#46724B]')}
          ${(props.type == 'patente') && ('bg-[#66B4D0]')} 
          ${props.type == 'capLivro' && ('bg-pink-300')} 
          ${(props.nature == "Congresso") && ('bg-[#FF5800]')} 
          ${(props.nature == "Oficina") && ('bg-[#FCEE21]')} 
          ${(props.nature == "Simpósio") && ('bg-[#D53A2C]')} 
          ${(props.nature == "Encontro") && ('bg-[#E9A700]')}  
          ${(props.nature == "Outra") && ('bg-[#7F400B]')} ${(props.nature == "Seminário") && ('bg-[#FFBD7B]')}
          ${(props.type == 'research-project') && ('bg-[#bae6fd]')}
          ${(props.type == 'work-event') && ('bg-[#DE2834]')}
          ${(props.type == 'texto-revista') && ('bg-[#E9A700]')}
        `}
      >
      </div>


      <Alert className="rounded-l-none flex flex-col justify-between p-0 text-left">

        {props.has_image && (
          <div
            onClick={() =>
              onOpen('image-article', {
                id: props.id,

                title: props.title,
                year: props.year,

                researcher_id: props.researcher_id,

                authors: props.authors,

                language: props.language,

                researcher: props.researcher,
                has_image: props.has_image,
                relevance: props.relevance
              })
            }
            className="bg-neutral-100 flex justify-between p-4 bg-center bg-cover bg-no-repeat dark:bg-neutral-800 h-[150px] rounded-tr-md cursor-pointer" style={{ backgroundImage: `url(${urlGeral}image/${props.id}) ` }}>

            <div>
              {(props.relevance && props.has_image) && (
                <div className="relative -top-4 py-1 px-4 bg-yellow-600 w-fit rounded-b-md text-white"><Star size={12} /></div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 pb-0">
          <div>
            {(props.relevance && !props.has_image) && (
              <div className="relative -top-4 py-1 px-4 bg-yellow-600 w-fit rounded-b-md text-white"><Star size={12} /></div>
            )}
            <div className="flex justify-between">
              {props.publishing_company != undefined && (
                <h3 className="font-semibold mb-4 ">{props.publishing_company}</h3>
              )}

              {props.type == 'orientacoes' && (
                <h3 className="font-semibold mb-4 ">{props.oriented}</h3>
              )}

              {props.type == 'relatorio-tecnico' && (
                <h3 className="font-semibold mb-4 ">{props.project_name}</h3>
              )}

              {(props.type == 'research-project') && (
                <h3 className="font-semibold mb-4 ">{props.agency_name}</h3>
              )}

              <div className="flex gap-3 min-w-20">

                {((user?.lattes_id == props.lattes_id || has_editar_producao) && (props.type == 'article' || props.type == 'patente' || props.type == 'livro' || props.type == 'capLivro')) && (
                  <Button
                    onClick={() =>
                      onOpen('edit-article', {
                        id: props.id,

                        researcher: props.researcher,
                        has_image: props.has_image,
                        relevance: props.relevance
                      })
                    }
                    variant={'outline'} className="h-8 w-8 text-gray-500 dark:text-white hidden group-hover:flex" size={'icon'}><Pencil size={16} /></Button>
                )}

                {props.type == 'research-project' && (
                  <Button
                    onClick={() =>
                      onOpen('project-modal', {
                        agency_code: props.agency_code,
                        agency_name: props.agency_name,
                        nature: props.nature,
                        description: props.description,
                        end_year: props.end_year,
                        id: props.id,
                        number_academic_masters: props.number_academic_masters,
                        number_phd: props.number_phd,
                        number_specialists: props.number_specialists,
                        number_undergraduates: props.number_undergraduates,
                        project_name: props.project_name,
                        start_year: props.start_year,
                        status: props.status,
                        researcher_id: props.researcher_id,
                        production: props.production,
                        foment: props.foment,
                        components: props.components,
                        researcher_name:props.researcher_name
                      })
                    }
                    variant="outline"
                    size="icon"
                    className="ml-auto hidden group-hover:flex text-sm h-8 w-8 text-gray-500 dark:text-gray-300"
                  >
                    <Maximize2 size={16} />
                  </Button>
                )}

              </div>
            </div>

            {(props.type == 'work-event' || props.type == 'texto-revista') && (
              <div className="flex justify-between gap-6">
                <p className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal">
                  {highlightedTitle}
                </p>

                <div className="h-8 w-8">

                  {(props.homepage != '' && props.homepage != null) && (
                    <Link to={props.homepage.split(/[\[\]]/).join('') || ''} target="_blank">
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-auto hidden group-hover:flex text-sm h-8 w-8 text-gray-500 dark:text-gray-300"
                      >
                        <SquareArrowOutUpRight size={16} />
                      </Button></Link>
                  )}

                </div>
              </div>
            )}

            {props.type == 'research-project' && (
              <p className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal">{highlightedTitleProject}</p>
            )}

            {props.type == 'patente' && (
              <h3 className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal "> {highlightedTitle}</h3>
            )}

            {props.type == 'participacao-evento' && (
              <p className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal">{highlightedTitleEvent}</p>
            )}

            {(props.type != 'patente' && props.type != 'speaker' && props.type != 'work-event' && props.type != 'texto-revista') && (
              <p className="text-sm capitalize text-gray-500 dark:text-gray-300 font-normal">
                {highlightedTitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center flex-wrap mt-4 gap-4 p-4 pt-0">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><CalendarBlank size={12} />{props.year}{props.type == 'research-project' && (`${props.start_year} - ${props.end_year == '' ? ('atual') : (props.end_year)}`)}{props.year_}</div>


            {(props.isbn != undefined) && (
              <Link to={`https://www.cblservicos.org.br/isbn/pesquisa/?page=1&q=${props.isbn}&filtrar_por%5B0%5D=todos&ord%5B0%5D=relevancia&dir%5B0%5D=asc`} target="_blank" className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><LinkBreak size={16} className="" />ISBN {props.isbn}</Link>
            )}
          </div>

          {(props.type == 'work-event' || props.type == 'texto-revista') && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><AppWindow size={12} />{props.means_divulgation?.split('_').join(' ')}</div>
          )}

          {(props.type == 'work-event' || props.type == 'texto-revista') && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><CheckCircle size={12} />{props.nature?.split('_').join(' ')}</div>
          )}

          {(props.type == 'work-event' || props.type == 'texto-revista') && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Globe size={12} />{props.language}</div>
          )}

          {props.type == 'software' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><AppWindow size={12} />Software</div>
          )}

          {props.type == 'research-project' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><SquareAsterisk size={12} />{props.nature}</div>
          )}

          {props.type == 'marca' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><PenNib size={12} />Marca</div>
          )}

          {props.type == 'patente' && (
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><Copyright size={12} />Patente</div>
          )}

{props.type == 'research-project' && (
             <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center"><div className={`h-4 w-4 rounded-md ${props.status == 'EM_ANDAMENTO' ? ('bg-yellow-500'): props.status == 'DESATIVADO' ? ('bg-red-500'):('bg-green-500')}`}></div>{props.status?.split('_').join(' ')}</div>
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
              <div className={`w-4 h-4 rounded-md ${(props.grant_date == 'NaT' || props.grant_date == "None" || props.grant_date == "" || props.grant_date == null) ? "bg-red-500" : 'bg-green-500'}`}></div>

              {(props.grant_date == 'NaT' || props.grant_date == "None" || props.grant_date == "" || props.grant_date == null) ? "Sem concessão" : props.grant_date}</div>
          )}



           {!props.distinct && (
             <div className="flex gap-2 items-center cursor-pointer" onClick={() => onOpen2('researcher-modal', {name:props.name})}>
             <Avatar className="cursor-pointer rounded-md  h-5 w-5">
                           <AvatarImage className={'rounded-md h-5 w-5'} src={`${urlGeral}ResearcherData/Image?name=${props.name}`} />
                           <AvatarFallback className="flex items-center justify-center"><User size={10} /></AvatarFallback>
                         </Avatar>
               <p className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">{props.name}{props.researcher_name}</p>
             </div>
           )}

        </div>
      </Alert>
    </div>
  )
};