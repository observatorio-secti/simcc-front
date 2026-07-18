import { Dot, Globe, X } from "lucide-react";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { BasePreview } from "../base-preview";
import { Keepo } from "../builder-page";
import { Link } from "react-router-dom";
import { Button } from "../../../ui/button";
import { BehanceLogo, FacebookLogo, GithubLogo, InstagramLogo, LinkedinLogo, YoutubeLogo } from "phosphor-react";

interface Props {
    keepoData:Keepo
    index:number
    contentItem:any
}

export function SocialPreview (props:Props) {
    return(
        <BasePreview index={props.index} keepoData={props.keepoData}>
            <div className="flex flex-wrap gap-3">
            {props.contentItem.items.map((item, idx) => (
 <Link to={item.url} target="_blank">
 <Button
   style={{
    backgroundColor: props.keepoData.app.button_color,
    color: props.keepoData.app.button_text_color,
  
  }}
   variant={'outline'} className="h-8 px-2">
{(() => {
switch (item.name) {
case 'instagram':
return <div className="flex gap-2 items-center"><InstagramLogo size={16} /> Instagram</div>;
case 'facebook':
return <div className="flex gap-2 items-center"><FacebookLogo size={16} /> Facebook</div>;
case 'x':
return <div className="flex gap-2 items-center"><X size={16} /> X (Twitter)</div>;
case 'youtube':
return <div className="flex gap-2 items-center"><YoutubeLogo size={16} /> Youtube</div>;
case 'linkedin':
return <div className="flex gap-2 items-center"><LinkedinLogo size={16} /> LinkedIn</div>;
case 'behance':
return <div className="flex gap-2 items-center"><BehanceLogo size={16} /> Behance</div>;
case 'github':
return <div className="flex gap-2 items-center"><GithubLogo size={16} /> Github</div>;
case 'pagina-web':
return <div className="flex gap-2 items-center"><Globe size={16} /> Página web</div>;
default:
return null;
}
})()}
</Button>
</Link>
    ))}
    </div>
        </BasePreview>
    )
}