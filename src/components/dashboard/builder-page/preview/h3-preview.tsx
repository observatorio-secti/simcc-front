import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function H3Preview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <h3 className="text-xl font-semibold  ">{props.contentItem.title}</h3> 
        </BasePreview>
    )
}