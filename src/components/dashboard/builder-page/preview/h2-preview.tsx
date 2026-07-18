import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function H2Preview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <h2 className="font-semibold text-2xl ">{props.contentItem.title}</h2> 
        </BasePreview>
    )
}