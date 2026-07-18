import { useState } from "react";
import { CodeBlock } from "../../../ui/code-block";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { Textarea } from "../../../ui/textarea";
import { Alert } from "../../../ui/alert";

interface Props {
  keepoData: any;
  setKeepoData: React.Dispatch<React.SetStateAction<any>>;
  moveItem: (index: number, direction: "up" | "down") => void;
  deleteItem: (index: number) => void;
  index: number;
  contentItem: any;
}

export function HtmlSection(props: Props) {
  const [htmlCode, setHtmlCode] = useState("<p>Escreva seu código HTML aqui!</p>");

  return (
    <Base
      setKeepoData={props.setKeepoData}
      moveItem={props.moveItem}
      deleteItem={props.deleteItem}
      index={props.index}
      keepoData={props.keepoData}
    >
      <div className="space-y-4">
        {/* Campo de entrada para escrever HTML */}
        <Textarea
          className="w-full p-2 border rounded-lg h-40"
          value={htmlCode}
          onChange={(e) => {
            setHtmlCode(e.target.value)

            const newContent = [...props.keepoData.content]; // Cria uma cópia do array
                       newContent[props.index] = { ...newContent[props.index], description: e.target.value }; // Atualiza apenas o item específico
             
                       props.setKeepoData((prev) => ({
                         ...prev,
                         content: newContent, // Atualiza o array no estado
                       }));
          }}
        />
        
        {/* Exibição do código digitado */}
        <CodeBlock language="html" filename="UserCode.html" code={htmlCode} />
        
        {/* Renderização do HTML interpretado */}
       <Alert>
       <div dangerouslySetInnerHTML={{ __html: htmlCode }} />
       </Alert>
      </div>
    </Base>
  );
}
