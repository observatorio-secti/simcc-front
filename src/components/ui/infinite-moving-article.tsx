/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "../../lib"
import { useContext, useEffect, useRef, useState } from "react";

import { useModal } from "../hooks/use-modal-store";
import { UserContext } from "../../context/context";
import { ArticleItem } from "../homepage/categorias/articles-home/article-item";

interface Bolsistas {
  aid_quantity:string
  call_title:string
  funding_program_name:string
  modality_code:string
  category_level_code:string
  institute_name:string
  modality_name:string
  scholarship_quantity:string
  
  }


export const InfiniteMovingArticle = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
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

  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { onOpen } = useModal();
  const { urlGeral,  setPesquisadoresSelecionados, pesquisadoresSelecionados} = useContext(UserContext)

  useEffect(() => {
    addAnimation();
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children) as HTMLElement[];


      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true); // MUDAR
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "1080s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative  w-full overflow-hidden  [mask-image:linear-gradient(to_right,transparent, transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          " flex min-w-full shrink-0 gap-4  w-max flex-nowrap",
          start ? "animate-scroll " : "",
          pauseOnHover
            ? "hover:[animation-play-state:paused] hover:cursor-pointer"
            : ""
        )}
      >
        {items.map((props, idx) => (
          <li
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "transition-all duration-300" // Transição suave
             
            )}
          >
          <div className=" w-[400px] relative">
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
          </li>
        ))}
      </ul>
    </div>
  );
};
