import { useContext, useState } from "react"
import { UserContext } from "../../context/context"
import { BracketsCurly, CaretDown, Copy, GraduationCap, IdentificationBadge, LinkSimple, LinkedinLogo, MapPin, PuzzlePiece, StripeLogo } from "phosphor-react"

import { Button } from "../ui/button"

import { Link } from "react-router-dom"
import { toast } from "sonner"

import htmlParser from "html-react-parser";
import useWindowSize from "./use-windows-size"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"


interface Props {
  atualizacao_lattes?: string,
  among: number,
  articles: number,
  book: number,
  book_chapters: number,
  id: string,
  name: string,
  university: string,
  lattes_id: string,
  area: string,
  lattes_10_id: string,
  abstract: string,
  city: string,
  orcid: string,
  image: string
  graduation: string,
  patent: string,
  software: string,
  brand: string,
  lattes_update: Date,
  onResearcherUpdate?: (newResearcher: Research[]) => void;

  h_index: string,
  relevance_score: string,
  works_count: string,
  cited_by_count: string,
  i10_index: string,
  scopus: string,
  openalex: string,
  openAPI: boolean

}
type Research = {
  h_index: number;
  relevance_score: number;
  works_count: number;
  cited_by_count: number;
  i10_index: number;
  scopus: string;
  orcid: string
  openalex: string
}

interface ItemsSelecionados {
  term: string
}

export function InformationResearcher(props: Props) {
  const { itemsSelecionados, version } = useContext(UserContext)
  const [isVisible, setIsVisible] = useState(false);

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


  const { urlGeral } = useContext(UserContext)

  //data atualização
  const urlApi = `${urlGeral}researcherName?name=${props.name.split(' ').join(';')}`

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

  // const highlightedAbstract = highlightText(props.abstract, itemsSelecionados);
  const highlightedAbstract = highlightText(props.abstract, itemsSelecionados);

  const size = useWindowSize();

  let charLimit;
  if (size && size.width !== undefined) {
    if (size.width > 1600) {
      charLimit = 820; // Aumenta o limite para telas grandes
    } else if (size.width > 1500) {
      charLimit = 500; // Aumenta o limite para telas grandes
    } else if (size.width > 1200) {
      charLimit = 500;
    } else if (size.width > 768) {
      charLimit = 500;
    } else {
      charLimit = 300;
    }
  } else {
    charLimit = 300; // Default value if size or size.width is undefined
  }

  const formatString = (input) => {
    return input
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas
      .replace(/[^a-zA-Z0-9 ]/g, '') // Remover caracteres especiais
      .trim() // Remover espaços nas extremidades
      .replace(/\s+/g, '-') // Substituir espaços por hifens
      .toLowerCase(); // Converter para letras minúsculas
  };

  const [imageUrl, setImageUrl] = useState<string | null>(null);



  return (
    <div className="flex flex-col">
      <div className="flex items-center flex-col relative">
        <div className="grid grid-cols-1">
          <ScrollArea>
            <div
              className="
              mb-4  w-max flex flex-nowrap gap-3 items-center justify-center

              md:flex-wrap md:w-full
            "
            >
              {props.area != null && (
                props.area.split(';').map((value, index) => (
                  <li
                    key={index}
                    className={`
                    py-2 whitespace-nowrap px-4 rounded-md text-xs font-bold flex gap-2 text-white items-center
                    ${value.includes('CIENCIAS AGRARIAS') ? 'bg-red-400' : value.includes('CIENCIAS EXATAS E DA TERRA') ? 'bg-green-400' : value.includes('CIENCIAS DA SAUDE') ? 'bg-[#20BDBE]' : value.includes('CIENCIAS HUMANAS') ? 'bg-[#F5831F]' : value.includes('CIENCIAS BIOLOGICAS') ? 'bg-[#EB008B]' : value.includes('ENGENHARIAS') ? 'bg-[#FCB712]' : value.includes('CIENCIAS SOCIAIS APLICADAS') ? 'bg-[#009245]' : value.includes('LINGUISTICA LETRAS E ARTES') ? 'bg-[#A67C52]' : value.includes('OUTROS') ? 'bg-[#1B1464]' : 'bg-[#000]'}
                  `}
                  >
                    <PuzzlePiece size={12} className="text-white" /> {value.trim()}
                  </li>
                ))
              )}
              {props.graduation != '' && (
                <div className={`bg-blue-700 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center`}><GraduationCap size={12} className="textwhite" /> {props.graduation}</div>
              )}
              {(props.city != "None" && props.city != '') && (
                <div className="bg-blue-700 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center"><MapPin size={12} className="textwhite" /> {props.city}</div>
              )}
              {(props.orcid != '0' && props.orcid != '') && (
                <Link to={`https://orcid.org/${props.orcid}`} target="_blank" className="bg-[#A6CE39] py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center">
                  <IdentificationBadge size={12} className="" />
                  Orcid: {props.orcid ? props.orcid.replace(/[^\d-]/g, '') : props.orcid}
                </Link>
              )}
              {props.scopus != '' && (
                <Link to={props.scopus} target="_blank" className="bg-[#FF8200] py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center">
                  <StripeLogo size={12} className="" />
                  Scopus
                </Link>
              )}
              {version && (
                <Link to={`https://somos.ufmg.br/professor/${formatString(props.name)}`} target="_blank" className="bg-[#F3A01E] py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center">
                  <IdentificationBadge size={12} className="" />
                  Somos UFMG
                </Link>
              )}
              <a href={`https://lattes.cnpq.br/${props.lattes_id}`} target="blank_" className="bg-blue-900 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center"><LinkSimple size={12} className="textwhite" /> Currículo Lattes</a>
              <a href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(props.name)}`} rel="noopener noreferrer" target="blank_" className="bg-blue-500 py-2 px-4 text-white rounded-md text-xs font-bold flex gap-2 items-center"><LinkedinLogo size={12} className="textwhite" />Pesquisar no LinkedIn</a>
            </div>

            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {props.openAPI && (
          <div className="w-full bg-slate-100 dark:bg-neutral-800 px-4 py-2 rounded-md text-xs mb-4 flex gap-3 items-center justify-between">
            <div className="flex items-center gap-3"><BracketsCurly className="h-4 w-4" />{urlApi}</div>
            <Button onClick={() => {
              navigator.clipboard.writeText(urlApi)
              toast("Operação realizada", {
                description: "URL copiada para área de transferência",
                action: {
                  label: "Fechar",
                  onClick: () => { },
                },
              })
            }} variant="ghost" className="h-8 w-8 p-0">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}


        <div className={isVisible || (props.abstract.length < 500) ? "h-auto transition-all mb-4" : "h-[60px] overflow-hidden transition-all mb-4"}>
          <p className="text-gray-400 text-sm text-justify ">{highlightedAbstract}</p>
        </div>

        {props.abstract.length > charLimit && (
          <div className="flex gap-4 items-center ">
            <Button
              variant='ghost'
              size={'icon'}
              className={`mb-2 ${!isVisible && 'animate-bounce'} h-8 w-8`}
              onClick={() => setIsVisible(!isVisible)}
            >
              <CaretDown
                size={16}
                className={isVisible ? "rotate-180 transition-all text-gray-400" : "text-gray-400 transition-all"}
              />
            </Button>
          </div>
        )}

      </div>
    </div>
  )

}