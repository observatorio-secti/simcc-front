import { Keepo } from "./builder-page"
import { BotoesPreview } from "./preview/botoes-preview";
import { CardPreview } from "./preview/card-preview";
import { CarrosselPreview } from "./preview/carrossel-preview";
import { FilePreview } from "./preview/file-preview";
import { H1Preview } from "./preview/h1-preview";
import { H2Preview } from "./preview/h2-preview";
import { H3Preview } from "./preview/h3-preview";
import { HtmlPreview } from "./preview/html-preview";
import { ImagePreview } from "./preview/image-preview";
import { LinkPreview } from "./preview/link-preview";
import { ListNumberPreview } from "./preview/list-number-preview";
import { ListPreview } from "./preview/list-preview";
import { SeparatorPreview } from "./preview/separator-preview";
import { SocialPreview } from "./preview/social-preview";
import { TextPreview } from "./preview/text-preview";
import { VideoPreview } from "./preview/video-preview";

interface Props {
    keepoData:Keepo
  
}

export function PreviewBuilderPage(props:Props) {
    return(
        <div className="flex flex-col gap-8 ">
{props.keepoData.content.map((contentItem, index) => (
        <div key={index} className="">
          {(() => {
            switch (contentItem.type) {
              case "h1":
                return (
                  <H1Preview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )
            case "h2":
                return (
                  <H2Preview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )
            case "h3":
                return (
                    <H3Preview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )
            case "text":
                return (
                    <TextPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )
            case "html":
                return (
                    <HtmlPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )
            case "file":
                return (
                    <FilePreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )
            case "list-number":
            return (
                <ListNumberPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
            )
            case "list":
            return (
                <ListPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
            )

            case "social":
                return (
                    <SocialPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )

                case 'divider':
                return (
                    <SeparatorPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                )

                case 'link':
                    return (
                        <LinkPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                    )

                    case 'video':
                        return (
                            <VideoPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                        )
                        case 'image':
                            return (
                                <ImagePreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                            )

                case 'botoes':
                    return (
                        <BotoesPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                    )

                    case 'card':
                        return (
                            <CardPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                        )
                        case 'slider':
                            return (
                                <CarrosselPreview contentItem={contentItem} index={index} keepoData={props.keepoData}/>
                            )
                default:
                    return <span>Elemento não reconhecido</span>;
                }
              })()}
            </div>
          ))}
        </div>
    )
}