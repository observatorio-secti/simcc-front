import { Link } from "react-router-dom";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";
import { Alert } from "../../../ui/alert";
import { Download, Link2 } from "lucide-react";
import { Button } from "../../../ui/button";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function VideoPreview (props:Props) {
  const sanitizeUrlVideo = (item: string): string => {
    let idVideo = '';
    if (item) {
      // Verifica as três formas possíveis de URL
      const regex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
      const match = item.match(regex);
      if (match) {
        idVideo = match[1];
      }
    }
    return idVideo ? `https://www.youtube.com/embed/${idVideo}` : '';
  };

    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
          <div className="w-full flex md:flex-row flex-col md: h-28">
                                   
                                   <div>
                                   <iframe
                               width="100%"
                               
                               className="w-full h-full border md:border-r-0 border-b-0 md:border-b dark:border-neutral-800 md:rounded-l-md md:rounded-tr-none rounded-t-md"
                               src={sanitizeUrlVideo(props.contentItem.url)}
                               title="YouTube video player"
                               frameBorder="0"
                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                               allowFullScreen
                           />
                                   </div>
                                     <Alert className="flex gap-2 items-center md:rounded-tr-md p-4  w-full rounded-t-none md:rounded-l-none">
                                     
                                    
                                   <div className="w-full flex flex-1 flex-col">
                                 
                <p className="font-medium text-lg ">{props.contentItem.title}</p>
                {props.contentItem.description != '' && (
 <p className="text-gray-500  rounded-none text-sm">{props.contentItem.description}</p>
                )}    
               
                                   </div>
                                   <Link to={props.contentItem.url} target="_blank">
                                   <Button
                                     variant="ghost"
                                     size="icon"
                                     className="h-8 w-8 "
                                   
                                   >
                                     <Link2 size={16} />
                                   </Button>
                                   </Link>
                                  
               
                                     </Alert>
                                    </div>
        </BasePreview>
    )
}