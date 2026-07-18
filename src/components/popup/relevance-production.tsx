import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { UserContext } from "../../context/context"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { ArticleItem } from "../homepage/categorias/articles-home/article-item";
import { BookItem } from "./Livro";


// Cache compartilhado para requisições
const requestCache = new Map();

type Publicacao = {
    id: string,
    doi: string,
    name_periodical: string,
    qualis: "A1" | "A2" | "A3" | "A4" | "B1" | "B2" | "B3" | "B4" | "B5" | "C" | "SQ" ,
    title: string,
    year: string,
    color: string,
    researcher: string,
    lattes_id: string,
    magazine: string,
    lattes_10_id: string,
    jcr_link: string,
    jif: string
    researcher_id: string
    abstract:string,
    article_institution:string,
    authors:string
    authors_institution:string
    citations_count:string 
    issn:string 
    keywords:string 
    landing_page_url:string 
    language:string 
    pdf:string
    has_image:boolean
  relevance:boolean

}

type Livros = {
    id: string,
    title: string,
    year: string,
    isbn: string,
    publishing_company: string
    has_image:boolean
    relevance:boolean
    lattes_id:string
    researcher:string
  }


  type Patente = {
    id: string,
    grant_date: string,
    title: string,
    year: string,
    financing: string,
    project_name: string
    has_image:boolean
    relevance:boolean
    lattes_id:string
    researcher:string
    }
  

type Props = {
    name:string
  }

export function RelevanceProduction(props:Props) {

    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);

    const [loading, isLoading] = useState(false)
    const {urlGeral, setItensSelecionadosPopUp, itemsSelecionadosPopUp, searchType, itemsSelecionados} = useContext(UserContext)
    const urlTermPublicacoes = useMemo(() => {
        const baseUrl = `${urlGeral}bibliographic_production_researcher?researcher_id=${props.name}&type=ARTICLE&qualis=&year=1900`;
        return searchType === 'article' 
            ? `${baseUrl}&terms=`
            : baseUrl;
    }, [ props.name]);

    const fetchData = useCallback(async () => {
        const cacheKey = urlTermPublicacoes;
        
        // Verifica cache
        if (requestCache.has(cacheKey)) {
            setPublicacoes(requestCache.get(cacheKey));
            return;
        }

        isLoading(true);
        try {
            const response = await fetch(urlTermPublicacoes, {
                mode: "cors",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET",
                    "Access-Control-Allow-Headers": "Content-Type",
                    "Access-Control-Max-Age": "3600",
                    "Content-Type": "text/plain",
                },
            });
            const data = await response.json();
            if (data) {
                requestCache.set(cacheKey, data);
                setPublicacoes(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            isLoading(false);
        }
    }, [urlTermPublicacoes]);

    useEffect(() => {
        let mounted = true;
        
        if (mounted) {
            fetchData();
        }

        return () => {
            mounted = false;
        };
    }, [fetchData]);



    //livros e capitulos

    let urlTermBook = `${urlGeral}book_production_researcher?researcher_id=${props.name}&year=1900&term=`;

    const [book, setBook] = useState<Livros[]>([]);
       
    useMemo(() => {
        const fetchData = async () => {
            try {
              isLoading(true)
              const response = await fetch( urlTermBook, {
                mode: "cors",
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET",
                  "Access-Control-Allow-Headers": "Content-Type",
                  "Access-Control-Max-Age": "3600",
                  "Content-Type": "text/plain",
                },
              });
              const data = await response.json();
              if (data) {
                setBook(data);
                isLoading(false)
              }
            } catch (err) {
              console.log(err);
            }
          };
          fetchData();
        }, [ urlTermBook]);


 let urlTermCap = `${urlGeral}book_chapter_production_researcher?researcher_id=${props.name}&year=1900&term=`
        const [capLivros, setCapLivros] = useState<Livros[]>([]);


           
        useMemo(() => {
            const fetchData = async () => {
                try {
                  isLoading(true)
                  const response = await fetch( urlTermCap, {
                    mode: "cors",
                    headers: {
                      "Access-Control-Allow-Origin": "*",
                      "Access-Control-Allow-Methods": "GET",
                      "Access-Control-Allow-Headers": "Content-Type",
                      "Access-Control-Max-Age": "3600",
                      "Content-Type": "text/plain",
                    },
                  });
                  const data = await response.json();
                  if (data) {
                    setCapLivros(data);
                    isLoading(false)
                  }
                } catch (err) {
                  console.log(err);
                }
              };
              fetchData();
            }, [ urlTermCap]);


    //patente

    const [patente, setPatente] = useState<Patente[]>([]);

    let urlTermPatent = `${urlGeral}patent_production_researcher?researcher_id=${props.name}&year=1900&term=`;


    useMemo(() => {
        const fetchData = async () => {
            try {
              isLoading(true)
              const response = await fetch( urlTermPatent, {
                mode: "cors",
                headers: {
                  "Access-Control-Allow-Origin": "*",
                  "Access-Control-Allow-Methods": "GET",
                  "Access-Control-Allow-Headers": "Content-Type",
                  "Access-Control-Max-Age": "3600",
                  "Content-Type": "text/plain",
                },
              });
              const data = await response.json();
              if (data) {
                setPatente(data);
                isLoading(false)
              }
            } catch (err) {
              console.log(err);
            }
          };
          fetchData();
        }, [ urlTermPatent]);

    return(
        <div className="w-full">
             <Carousel className="flex items-center justify-center">
             <div className="flex justify-between absolute z-[3] w-full">
     <CarouselPrevious />
     <CarouselNext />
     </div>
      <CarouselContent className="-ml-1">
      {publicacoes
  .filter((props) => props.relevance === true)
  .map((props, index) => (
    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/4">
       <ArticleItem
            id={props.id}
                    doi={props.doi}
                    name_periodical={props.name_periodical}
                    qualis={props.qualis}
                    title={props.title.toUpperCase()}
                    year={props.year}
                    color={props.color}
                    researcher={props.researcher}
                    lattes_id={props.lattes_id}
                    magazine={props.magazine}
                    lattes_10_id={props.lattes_10_id}
                    jcr_link={props.jcr_link}
                    jif={props.jif}
                    researcher_id={props.researcher_id}
                    distinct={false}
                    abstract={props.abstract}
                    article_institution={props.article_institution}
                    authors={props.authors}
                    authors_institution={props.authors_institution}
                    citations_count={props.citations_count}
                    issn={props.issn}
                    keywords={props.keywords}
                    landing_page_url={props.landing_page_url}
                    language={props.language}
                    pdf={props.pdf}
                    has_image={props.has_image}
                    relevance={props.relevance}
            />
    </CarouselItem>
  ))}



{book
  .filter((props) => props.relevance === true)
  .map((props, index) => (
    <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
       <BookItem
            id={props.id}
            title={props.title}
            year={props.year}
            isbn={props.isbn}
            publishing_company={props.publishing_company}
            has_image={props.has_image}
            relevance={props.relevance}
            researcher={props.researcher}
          />
    </CarouselItem>
  ))}

      </CarouselContent>
    
    </Carousel>
        </div>
    )
}