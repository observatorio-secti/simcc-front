import { Input } from "../../../ui/input";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../../ui/carousel"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Textarea } from "../../../ui/textarea";
import { Label } from "../../../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Card, CardContent } from "../../../ui/card";
import { Alert } from "../../../ui/alert";
import { Image, Pencil, Plus, Trash } from "lucide-react";
import { Button } from "../../../ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { BasePreview } from "../base-preview";
import { Link } from "react-router-dom";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function CarrosselPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <Carousel className="w-full flex gap-3 items-center ">
              <CarouselPrevious />
      <CarouselContent className="-ml-1">
      {props.contentItem.items.map((item, idx) => (
          <CarouselItem key={idx} className="pl-1 md:basis-1/2 lg:basis-1/3 xl:lg:basis-1/4 2xl:basis-1/5">
            <Link to={item.image} target="_blank" className="p-1 group">
           
            {!item.url && (
                        <label className="w-full font-medium h-[200px] bg-neutral-50 transition-all hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex cursor-pointer items-center flex-col gap-3 justify-center  border  dark:border-neutral-800 rounded-t-md border-b-0">
                            <Image size={24} /> Sem imagem
                           
                        </label>
                    )}

            {item.url && (
                      <div
                      className="w-full h-[200px] bg-neutral-50 transition-all hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 flex cursor-pointer items-center flex-col gap-3 justify-center  border  dark:border-neutral-800 rounded-t-md border-b-0 bg-no-repeat bg-cover bg-center"
                      style={{
                        backgroundImage: item.url ? `url(${item.url})` : "none",
                      }}
                    ></div>
                    
                    )}
              <Alert className="flex gap-2   p-4  w-full rounded-t-none ">
                    <div className="w-full gap-2 flex flex-1 flex-col">
                       <p className="font-medium text-lg">{item.title || 'Sem título'}</p>
                       <p className="text-gray-500  text-sm">{item.name || 'Sem descrição'}</p>
                    </div>

                    <div className="flex gap-2 ">
                   

                    </div>
                   
                </Alert>
            </Link>
          </CarouselItem>
        ))}

      </CarouselContent>
   
      <CarouselNext />
    </Carousel>
        </BasePreview>
    )
}