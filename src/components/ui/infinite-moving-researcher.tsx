/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "../../lib"
import React, { useContext, useEffect, useState } from "react";
import dt from '../../assets/dt.png'
import pq from '../../assets/pq.png'
import { PuzzlePiece } from "phosphor-react";
import { InfiniteMovingCards } from "./infinite-moving-cards";
import { CardTitle } from "./card";
import { Alert } from "./alert";
import { GraduationCap, MapPin } from "lucide-react";
import { useModal } from "../hooks/use-modal-store";
import { UserContext } from "../../context/context";

interface Bolsistas {
  aid_quantity: string
  call_title: string
  funding_program_name: string
  modality_code: string
  category_level_code: string
  institute_name: string
  modality_name: string
  scholarship_quantity: string

}


export const InfiniteMovingResearchers = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    name: string,
    area: string,
    id: string,
    city: string,
    graduation: string,
    subsidy: Bolsistas[]
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { onOpen } = useModal();
  const { urlGeral, setPesquisadoresSelecionados, pesquisadoresSelecionados } = useContext(UserContext)

  useEffect(() => {
    if (start) return;
    addAnimation();
  }, [start]);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

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
        containerRef.current.style.setProperty("--animation-duration", "500s");
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
        {items.map((item, idx) => (
          <li
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={cn(
              "transition-all duration-300" // Transição suave

            )}


          >
            <div onClick={() => {
              onOpen('researcher-modal', { name: item.name })
              console.log('opi')
            }} className="flex group min-h-[300px]  min-w-[200px] cursor-pointer">

              <Alert className="flex border-0 p-0 flex-col flex-1 gap-4 bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${item.id}) ` }}>
                <div className="bg-[#000000] rounded-md  bg-opacity-30 hover:bg-opacity-70 transition-all absolute w-full h-full rounded-t-md ">
                  <div className="flex flex-col justify-between h-full">
                    <div className="z-[1] w-full  p-4 flex gap-3 justify-end">

                      <div></div>

                      {item.subsidy && item.subsidy.length != 0 && item.subsidy.slice(0, 1).map((item) => (
                        <img src={item.modality_code == 'DT' ? (dt) : (pq)} className="w-8 relative -top-4" alt="" />
                      ))}
                    </div>

                    <div className="flex gap-2 px-6 flex-col pb-6  w-full h-full text-white justify-end  ">
                      <div className="flex gap-1 flex-col">


                        <CardTitle className="text-lg font-medium">{item.name}</CardTitle>

                        <div className="group-hover:flex hidden items-center flex-wrap gap-1  mb-2">
                          <div className="flex gap-1 text-sm  items-center "><GraduationCap size={12} />{item.graduation}</div>

                          {(item.city != "" && item.city != "None") && (
                            <div className="flex gap-1 text-sm  items-center"><MapPin size={12} />{item.city}</div>
                          )}


                        </div>
                      </div>

                      {item.area && item.area.length !== 0 && (
                        <div className="flex gap-3 flex-wrap">
                          {item.area !== '' && (
                            <InfiniteMovingCards
                              items={[...new Set(item.area?.split(';').map((item) => item.trim()) ?? [])] // Remove duplicados e espaços
                                .filter((item) => item !== '') // Remove entradas vazias
                                .map((item) => ({ value: item }))} // Formata cada item como um objeto
                              direction="right"
                              speed="fast"
                              pauseOnHover={true}
                              className="custom-class"
                            />
                          )}
                        </div>
                      )}






                    </div>
                  </div>
                </div>



              </Alert>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
