import { useContext } from "react"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "../../components/ui/accordion"
import { Badge } from "../ui/badge"
import { UserContext } from "../../context/context"

  
export function Duvidas() {

  const {version} = useContext(UserContext)
    return(
        <div>
            <Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger><div className="flex items-center gap-2">O que é a plataforma?</div></AccordionTrigger>
    <AccordionContent>
    É uma plataforma desenvolvida para otimizar a seleção e filtragem das produções e informações dos pesquisadores.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionTrigger><div className="flex items-center gap-2">Quem pode acessar a plataforma?</div></AccordionTrigger>
    <AccordionContent>
    Pode ser acessado por pesquisadores, estudantes, gestores e qualquer pessoa interessada nas produções científicas.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-3">
    <AccordionTrigger><div className="flex items-center gap-2">Quem pode acessar a plataforma?</div></AccordionTrigger>
    <AccordionContent>
    Pode ser acessado por pesquisadores, estudantes, gestores e qualquer pessoa interessada nas produções científicas.
    </AccordionContent>
  </AccordionItem>

  {version && (
     <AccordionItem value="item-5">
     <AccordionTrigger><div className="flex items-center gap-2">O Conectee está disponível para outras unidades da UFMG?</div></AccordionTrigger>
     <AccordionContent>
     No momento, a plataforma é focada na Escola de Engenharia, mas há planos para expansão.
     </AccordionContent>
   </AccordionItem>
  )}

    <AccordionItem value="item-4">
    <AccordionTrigger><div className="flex items-center gap-2">Preciso de um login para acessar?</div></AccordionTrigger>
    <AccordionContent>
    Sim, algumas funcionalidades exigem login para acesso completo.
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-6">
    <AccordionTrigger><div className="flex items-center gap-2">Com que frequência os dados são atualizados?</div></AccordionTrigger>
    <AccordionContent>
    Os dados são extraídos e atualizados diariamente à meia-noite.
    </AccordionContent>
  </AccordionItem>
</Accordion>

        </div>
    )
}