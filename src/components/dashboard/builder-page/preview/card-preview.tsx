import { Image } from "lucide-react";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";
import { Alert } from "../../../ui/alert";
import { Link } from "react-router-dom";
import { Button } from "../../../ui/button";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function CardPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
           <div className="w-full grid md:grid-cols-2 grid-cols-1 md:h-[300px]">
                <div>
                    {props.contentItem.url && (
                      <div
                      className="w-full md:h-full h-[350px]  border md:border-r-0 border-b-0 md:border-b dark:border-neutral-800 md:rounded-l-md md:rounded-tr-none rounded-t-md bg-no-repeat bg-cover bg-center"
                      style={{
                        backgroundImage: props.contentItem.url ? `url(${props.contentItem.url})` : "none",
                      }}
                    ></div>
                    
                    )}
                </div>
                <Alert className="flex gap-2 items-center md:rounded-tr-md p-8  w-full rounded-t-none md:rounded-l-none">
                    <div className="w-full flex flex-1 flex-col gap-4">
                       <p className="font-medium text-lg">{props.contentItem.title}</p>
                       <p className="text-gray-500 text-sm text-justify">{props.contentItem.description}</p>
                       
                       
<div className="flex flex-wrap gap-3">
            {props.contentItem.items.map((item, idx) => (
                <Link to={item.url} target={'_blank'}>
                 <Button
  variant={'outline'}
  className=""
  style={{
    backgroundColor: props.keepoData.app.button_color,
    color: props.keepoData.app.button_text_color,
  
  }}
>
  {item.name}
</Button>
</Link>
 ))}
 </div>
                    </div>
                   
                </Alert>
            </div>
        </BasePreview>
    )
}