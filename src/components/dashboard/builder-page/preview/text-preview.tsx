import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function TextPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <p className="text-gray-500 text-sm  ">{props.contentItem.description}</p> 
        </BasePreview>
    )
}