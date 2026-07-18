import { useContext, useMemo, useRef, useState } from "react";
import { Button } from "../../ui/button";
import { UserContext } from "../../../context/context";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../../ui/carousel";

import Autoplay from "embla-carousel-autoplay"
import { ArrowSquareOut } from "phosphor-react";
import { Link } from "react-router-dom";
import { ArticleItem } from "../categorias/articles-home/article-item";

type Publicacao = {
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
  has_image:boolean
  relevance:boolean
}

export function ArtigosRecentes() {
    const {urlGeral} = useContext(UserContext)
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);

    const urlTermPublicacoes = urlGeral + 'recently_updated?year=2024&university='

    useMemo(() => {
        const fetchData = async () => {
            try {

              const response = await fetch( urlTermPublicacoes, {
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
                setPublicacoes(data);

              }
            } catch (err) {
              console.log(err);
            }
          };
          fetchData();
        }, [ urlTermPublicacoes]);


        const plugin = useRef(
          Autoplay({ delay: 2000, stopOnInteraction: true })
        )


    return(
        <div className="w-full">
           <div className="flex items-center justify-between mb-6">
           <h2 className="text-2xl font-medium ">Produções mais recentes</h2>

        <Link to={'/producoes-recentes'}>   <Button variant={ 'outline'} className=""><ArrowSquareOut size={16}/> Ver a página</Button></Link>
           </div>

           <div>
           <Carousel className="w-full flex gap-3 items-center "
             plugins={[plugin.current]}
           
             onMouseEnter={plugin.current.stop}
             onMouseLeave={plugin.current.reset}
           >
                <CarouselPrevious />
      <CarouselContent className="-ml-1 flex w-full flex-1">
        {publicacoes.slice(0,10).map((props, index) => (
          <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
            <div className="p-1 h-full">
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
     distinct={props.distinct}
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
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      
     
      <CarouselNext />
      
    </Carousel>
           </div>
        </div>
    )
}