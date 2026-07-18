import { Input } from "../../../ui/input";
import { Separator } from "../../../ui/separator";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function SeparatorPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
             <div className="grid grid-cols-1 w-full">
                   <Separator className=""/>
                   </div>
        </BasePreview>
    )
}