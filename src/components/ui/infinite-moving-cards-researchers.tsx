/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "../../lib";
import React, { useContext, useEffect, useState } from "react";
import { PuzzlePiece } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { UserContext } from "../../context/context";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { User } from "lucide-react";

export const InfiniteMovingCardsResearchers = ({
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
        containerRef.current.style.setProperty("--animation-duration", "60s");
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

  const {onOpen} = useModal()

  const {urlGeral} = useContext(UserContext)

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
          "flex min-w-full shrink-0 gap-2  w-max flex-nowrap",
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
  <li key={idx} className="transition-all duration-300">
    <Avatar onClick={() => onOpen('researcher-modal', {name:item.value})} className="cursor-pointer rounded-md  h-8 w-8">
                        <AvatarImage className={'rounded-md h-8 w-8'} src={`${urlGeral}ResearcherData/Image?name=${item.value}`} />
                        <AvatarFallback className="flex items-center justify-center"><User size={16} /></AvatarFallback>
                      </Avatar>
  </li>
))}
      </ul>
    </div>
  );
};
