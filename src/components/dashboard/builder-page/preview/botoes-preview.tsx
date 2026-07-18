import { Link } from "react-router-dom";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function BotoesPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <div className="flex flex-wrap gap-3">
            {props.contentItem.items.map((item, idx) => (
             <Link to={item.url} target="_blank">
             <Button
  variant={'default'}
  className="h-8 px-2"
  style={{
    backgroundColor: props.keepoData.app.button_color,
    color: props.keepoData.app.button_text_color,
  
  }}
>
  {item.name}
</Button>

                </Link>
            ))}
 </div>
        </BasePreview>
    )
}