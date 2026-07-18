import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function ListNumberPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
             <div className="flex flex-col gap-3">
            {props.contentItem.items.map((item, idx) => (
  <div className="flex  items-center">
   <p className="font-semibold text-sm mr-2 text-gray-500">{idx}</p>
 
    <p className="text-gray-500 pl-1 text-sm ">{item.title}</p>
    </div>
    ))}
    </div>
        </BasePreview>
    )
}