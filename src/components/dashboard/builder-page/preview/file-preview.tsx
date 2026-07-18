import { Link } from "react-router-dom";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";
import { Alert } from "../../../ui/alert";
import { Download } from "lucide-react";
import { Button } from "../../../ui/button";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function FilePreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
         <Link to={props.contentItem.url} target="_blank">
         <div className="w-full">
                      <Alert className="flex gap-2 items-center p-4  w-full">
                      <p className="text-gray-500  text-sm ">{props.contentItem.emoji}</p>

                <p className="text-gray-500  text-sm flex flex-1 ">{props.contentItem.title}</p>
                      
                <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 "
                    
                    >
                      <Download size={16} />
                    </Button>
                      </Alert>
                     </div>
                     </Link>
        </BasePreview>
    )
}