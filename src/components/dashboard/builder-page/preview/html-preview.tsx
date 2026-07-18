import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function HtmlPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
             <div dangerouslySetInnerHTML={{ __html: props.contentItem.description }} />
        </BasePreview>
    )
}