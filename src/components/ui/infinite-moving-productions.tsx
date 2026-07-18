/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { cn } from "../../lib";
import React, { useEffect, useState } from "react";
import { PuzzlePiece } from "phosphor-react";
import { CardContent, CardHeader, CardTitle } from "./card";
import { LucideIcon } from "lucide-react";
import { Alert } from "./alert";

export const InfiniteMovingProductions = ({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: {
  items: {
    name: string;
    icon:LucideIcon
    number:string
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
             <div>
                      <Alert className="p-2 w-[250px]">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                               <div>
                               <CardTitle className="text-sm font-medium">
                                 {item.name}
                               </CardTitle>
                           
                               
                               </div>
           
                               {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                              
                             </CardHeader>
           
                            <CardContent>
                            <span className="text-lg font-bold leading-none sm:text-3xl">
                            {item.number ?? "0"} 
                           </span>
                            </CardContent>
                      </Alert>
                      </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
