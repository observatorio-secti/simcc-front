import { CalendarBlank, LinkBreak, Quotes } from "phosphor-react";
import { Alert } from "../../../ui/alert";
import { useContext } from "react";
import { UserContext } from "../../../../context/context";
import { toast } from "sonner";
import { Button } from "../../../ui/button";
import { Link } from "react-router-dom";
import { Maximize2, Pencil, Star } from "lucide-react";
import { useModalSecundary } from "../../../hooks/use-modal-store-secundary";

type Articles = {
  id: string,
  doi: string,
  name_periodical: string,
  qualis: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "None" | "SQ",
  title: string,
  year: string,
  color: string,
  researcher: string,
  lattes_id: string,
  magazine: string,
  lattes_10_id: string,
  jif: string,
  jcr_link: string
  researcher_id: string
  distinct: boolean

  abstract: string,
  article_institution: string,
  authors: string
  authors_institution: string
  citations_count: string
  issn: string
  keywords: string
  landing_page_url: string
  language: string
  pdf: string
  has_image: boolean
  relevance: boolean
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

export function ArticleItem(props: Articles) {
  const { urlGeral, itemsSelecionados, user, permission } = useContext(UserContext);

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
  };

  const doi = props.doi?.replace('http://dx.doi.org/', '') || '';

  const { onOpen } = useModalSecundary()

  const highlightedTitleEvent = highlightText(props.title, itemsSelecionados);

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

  return (
    <div className="flex w-full group">
      <div className={`h-full w-2 rounded-l-md dark:border-neutral-800 border border-neutral-200 border-r-0 ${qualisColor[props.qualis as keyof typeof qualisColor]}`}></div>
      <Alert className={`rounded-l-none flex flex-col justify-between p-0`}>
        {props.has_image && (
          <div
            onClick={() =>
              onOpen('image-article', {
                id: props.id,
                doi: doi,
                qualis: props.qualis,
                title: props.title,
                year: props.year,
                jif: props.jif,
                lattes_10_id: props.lattes_10_id,
                researcher_id: props.researcher_id,
                magazine: props.magazine,
                abstract: props.abstract,
                article_institution: props.article_institution,
                authors: props.authors,
                authors_institution: props.authors_institution,
                citations_count: props.citations_count,
                issn: props.issn,
                keywords: props.keywords,
                landing_page_url: props.landing_page_url,
                language: props.language,
                pdf: props.pdf,
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
            <div className="flex mb-1 gap-3 justify-between">
              <div>
                {(props.relevance && !props.has_image) && (
                  <div className="relative -top-4 py-1 px-4 bg-yellow-600 w-fit rounded-b-md text-white"><Star size={12} /></div>
                )}

                <h3 className="font-semibold text-left mb-4 flex flex-1">{props.name_periodical}{props.magazine}</h3>
              </div>

              <div className="flex items-start justify-end min-w-20   gap-3">
                {(user?.lattes_id == props.lattes_id || has_editar_producao) && (
                  <Button
                    onClick={() =>
                      onOpen('edit-article', {
                        id: props.id,
                        doi: doi,
                        qualis: props.qualis,
                        title: props.title,
                        year: props.year,
                        jif: props.jif,
                        lattes_10_id: props.lattes_10_id,
                        researcher_id: props.researcher_id,
                        magazine: props.magazine,
                        abstract: props.abstract,
                        article_institution: props.article_institution,
                        authors: props.authors,
                        authors_institution: props.authors_institution,
                        citations_count: props.citations_count,
                        issn: props.issn,
                        keywords: props.keywords,
                        landing_page_url: props.landing_page_url,
                        language: props.language,
                        pdf: props.pdf,
                        researcher: props.researcher,
                        has_image: props.has_image,
                        relevance: props.relevance
                      })
                    }
                    variant={'outline'} className="h-8 w-8 text-gray-500 dark:text-white hidden group-hover:flex" size={'icon'}><Pencil size={16} /></Button>
                )}

                <Button
                  onClick={() =>
                    onOpen('articles-modal', {
                      doi: doi,
                      id: props.id,
                      qualis: props.qualis,
                      title: props.title,
                      year: props.year,
                      jif: props.jif,
                      lattes_10_id: props.lattes_10_id,
                      researcher_id: props.researcher_id,
                      magazine: props.magazine,
                      abstract: props.abstract,
                      article_institution: props.article_institution,
                      authors: props.authors,
                      authors_institution: props.authors_institution,
                      citations_count: props.citations_count,
                      issn: props.issn,
                      keywords: props.keywords,
                      landing_page_url: props.landing_page_url,
                      language: props.language,
                      pdf: props.pdf,
                      researcher: props.researcher,
                      has_image: props.has_image,
                      relevance: props.relevance
                    })
                  }
                  variant="outline"
                  size={'icon'}
                  className=" hidden group-hover:flex text-sm h-8 w-8 text-gray-500 dark:text-gray-300"
                >
                  <Maximize2 size={16} />
                </Button>
              </div>
            </div>
            <div>
              <div className="text-left">
                {highlightedTitleEvent}
              </div>
            </div>
          </div>
          <div></div>
        </div>
        <div className="flex items-center mt-4 p-4 pt-0 gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <CalendarBlank size={12} />{props.year}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
              <div className={`w-4 h-4 rounded-md ${qualisColor[props.qualis as keyof typeof qualisColor]}`}></div>Qualis {props.qualis}
            </div>
            {(props.jif != "None" && props.jif != "") && (
              <Link to={props.jcr_link} target="_blank" className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                <LinkBreak size={16} />JCR {props.jif}
              </Link>
            )}

            {(props.citations_count != "") && (
              <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center">
                <Quotes size={16} />Citações {props.citations_count}
              </div>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}
