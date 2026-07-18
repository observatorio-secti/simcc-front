import { Dot } from "lucide-react";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function ListPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
             <div className="flex flex-col gap-3">
            {props.contentItem.items.map((item, idx) => (
  <div className="flex  items-center">
    <Dot size={16} />
 
    <p className="text-gray-500 pl-1 text-sm ">{item.title}</p>
    </div>
    ))}
    </div>
        </BasePreview>
    )
}