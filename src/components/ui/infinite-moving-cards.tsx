/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "../../lib";
import React, { useEffect, useState } from "react";
import { PuzzlePiece } from "phosphor-react";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    value: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [start, setStart] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    addAnimation();
  }, [items]);

  useEffect(() => {
    checkIfOverflowing();
  }, [items]);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current && items.length > 1) {
      getDirection();
      getSpeed();
      setStart(true);
    } else {
      setStart(false);
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
        containerRef.current.style.setProperty("--animation-duration", "10s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "380s");
      }
    }
  };

  const checkIfOverflowing = () => {
    if (containerRef.current && scrollerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const scrollerWidth = scrollerRef.current.scrollWidth;

      // Set start state only if the content overflows
      setIsOverflowing(scrollerWidth > containerWidth);
    }
  };

  const handleAnimationIteration = () => {
    // Change direction to reverse when animation ends
    if (containerRef.current) {
      const currentDirection = containerRef.current.style.getPropertyValue(
        "--animation-direction"
      );

      containerRef.current.style.setProperty(
        "--animation-direction",
        currentDirection === "forwards" ? "reverse" : "forwards"
      );
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
          "flex min-w-full shrink-0 gap-4  w-max flex-nowrap",
          start && isOverflowing
            ? "animate-scroll "
            : "",
          pauseOnHover
            ? "hover:[animation-play-state:paused] hover:cursor-pointer"
            : ""
        )}
        onAnimationIteration={handleAnimationIteration}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className={cn(
              "transition-all duration-300"
            )}
          >
            <div
              className={`py-1 whitespace-nowrap px-2 rounded-md text-[10px] font-bold flex gap-2 text-white items-center ${
                item.value.includes("CIENCIAS AGRARIAS")
                  ? "bg-red-400"
                  : item.value.includes("CIENCIAS EXATAS E DA TERRA")
                  ? "bg-green-400"
                  : item.value.includes("CIENCIAS DA SAUDE")
                  ? "bg-[#20BDBE]"
                  : item.value.includes("CIENCIAS HUMANAS")
                  ? "bg-[#F5831F]"
                  : item.value.includes("CIENCIAS BIOLOGICAS")
                  ? "bg-[#EB008B]"
                  : item.value.includes("ENGENHARIAS")
                  ? "bg-[#FCB712]"
                  : item.value.includes("CIENCIAS SOCIAIS APLICADAS")
                  ? "bg-[#009245]"
                  : item.value.includes("LINGUISTICA LETRAS E ARTES")
                  ? "bg-[#A67C52]"
                  : item.value.includes("OUTROS")
                  ? "bg-[#1B1464]"
                  : "bg-[#000]"
              }`}
            >
              <PuzzlePiece size={12} className="text-white" /> {item.value.trim()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
