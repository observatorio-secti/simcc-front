import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function H1Preview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <h1 className="font-semibold rounded-none text-3xl">{props.contentItem.title}</h1> 
        </BasePreview>
    )
}