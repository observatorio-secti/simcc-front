import { useModal } from "../hooks/use-modal-store";
import { Sheet, SheetContent } from "../../components/ui/sheet";
import { Bug, Send, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { toast } from "sonner"
import { DialogHeader } from "../ui/dialog";
import { useNavigate } from "react-router-dom";
import { AlertDescription, AlertTitle } from "../ui/alert";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useContext, useState } from "react";
import { UserContext } from "../../context/context";
import { Textarea } from "../ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export function RelatarBug() {
  const { onClose, isOpen, type: typeModal } = useModal();
  const { user, loggedIn, urlGeralAdm } = useContext(UserContext)
  const isModalOpen = (isOpen && typeModal === "relatar-problema")

  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  }

  const close = () => {
   
    onClose()
  }

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState(loggedIn ? (user?.email) : (''))
  const [avaliacao, setAvaliacao] = useState(0)
  const [descricao, setDescricao] = useState('')

  const handleSubmit = async () => {
    try {
      const data =
      {
        name: nome,
        email: email,
        rating: avaliacao,
        description: descricao
      }

      if (!nome) {
        toast("Erro ao enviar", {
          description: "O campo Nome é obrigatório.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }
      
      if (!email) {
        toast("Erro ao enviar", {
          description: "O campo E-mail é obrigatório.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }
      
      if (!avaliacao) {
        toast("Erro ao enviar", {
          description: "O campo Avaliação é obrigatório.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }
      
      if (!descricao) {
        toast("Erro ao enviar", {
          description: "O campo Descrição é obrigatório.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }

      if (!nome || !email || !avaliacao || !descricao) {
        toast("Erro ao enviar", {
          description: "Por favor, preencha todos os campos.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return; // Impede que o código continue
      }


      let urlProgram = urlGeralAdm + 's/feedback'


      const fetchData = async () => {

        try {
          const response = await fetch(urlProgram, {
            mode: 'cors',
            method: 'POST',
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Allow-Headers': 'Content-Type',
              'Access-Control-Max-Age': '3600',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
          });

          if (response.ok) {

            toast("Dados enviados com sucesso", {
              description: "Agradecemos o feedback",
              action: {
                label: "Fechar",
                onClick: () => { },
              },
            })

onClose()

          } else {

            toast("Tente novamente!", {
              description: "Não conseguimos adiciona seu feedback",
              action: {
                label: "Fechar",
                onClick: () => { },
              },
            })
          }

        } catch (err) {
          console.log(err);
        }
      };
      fetchData();



    } catch (error) {
      toast("Erro ao processar requisição", {
        description: "Tente novamente",
        action: {
          label: "Fechar",
          onClick: () => { },
        },
      })
    }
  };




  return (
    <Sheet open={isModalOpen} onOpenChange={close}>
      <SheetContent
        className={`p-0 dark:bg-neutral-900 dark:border-gray-600  w-full lg:min-w-[50vw]`}
      >
        <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 w-8"
                    variant={"outline"}
                    onClick={() => {
                      handleVoltar()
                      onClose()
                    }}
                    size={"icon"}
                  >
                    <X size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent> Fechar</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="flex ml-auto items-center w-full justify-between">
              <div className="flex ml-auto items-center gap-3"></div>
            </div>
          </div>
        </DialogHeader>


        <div>
          <div className="relative pb-4 whitespace-nowrap p-8 pt-4">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                  Desenvolvimento
                </p>

                <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                  Relatar problema
                </h1>
              </div>
            </div>

            <div className="flex flex-col w-full">
              <div className="bg-neutral-100 flex gap-3 dark:bg-neutral-800 w-full px-8 py-4 rounded-md">
                <div>
                  <Bug size={24} />
                </div>

                <div>
                  <AlertTitle className="whitespace-normal">O que aconteceu?</AlertTitle>
                  <AlertDescription className="whitespace-normal">
                    Faça um breve comentário do erro encontrado para que possamos corrigir o mais rápido possível, contamos com seu feedback!
                  </AlertDescription>

                </div>

              </div>
              <div className="my-6 border-b dark:border-b-neutral-800"></div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-col gap-2 w-full md:w-1/2">
                  <Label>Nome completo*</Label>
                  <Input className="w-full" value={nome} onChange={(e) => setNome(e.target.value)} type="text" />
                </div>

                <div className="flex flex-col gap-2 w-full md:w-1/2">
                  <Label>Email*</Label>
                  <Input className="w-full" value={email} defaultValue={loggedIn ? (user?.email) : ('')} onChange={(e) => setEmail(e.target.value)} type="text" />
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 ">
                <Label>Avaliação do sistema*</Label>
                <ToggleGroup onValueChange={(value) => setAvaliacao(Number(value))} type="single" variant={'outline'} className="grid grid-cols-5 md:flex md:flex-wrap gap-3">
                  {Array.from({ length: 10 }, (_, index) => (
                    <ToggleGroupItem className="flex flex-1" key={index + 1} value={`${index + 1}`}>
                      {index + 1}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

              </div>

              <div className="flex flex-col gap-2 mt-4 ">
                <Label>Descrição do problema*</Label>
                <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />
              </div>

              <Button onClick={() => handleSubmit()} size={'sm'} className="text-white dark:text-white mt-3 ml-auto flex ">
                <Send size={16} className="" />Enviar avaliação
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}