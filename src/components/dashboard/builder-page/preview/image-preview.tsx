import { EyeClosed } from "phosphor-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";
import { Eye } from "lucide-react";
import { useState } from "react";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function ImagePreview (props:Props) {
      const [isExpanded, setIsExpanded] = useState(false);

      const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <div>
                    <div className="relative">
                        <div className={`overflow-hidden rounded-md ${isExpanded ? "h-auto" : "h-[300px]"}`}>
                            <img src={props.contentItem.url} className="w-full" alt="Dynamic content" />
                        </div>
                        {!isExpanded && (
                            <div className="absolute h-[300px] inset-0 flex justify-center w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 to-transparent items-end">
                                <Button className="h-8 px-2" variant={'outline'} onClick={toggleExpand}>
                                    <Eye size={16} />
                                    Ver mais
                                </Button>
                            </div>
                        )}
                        {isExpanded && (
                            <div className="flex justify-center mt-2">
                                <Button className="h-8 px-2" variant={'outline'} onClick={toggleExpand}>
                                    <EyeClosed size={16} />
                                    Mostrar menos
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

        </BasePreview>
    )
}