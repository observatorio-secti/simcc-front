import { Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";
import { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../context/context";
import { Alert } from "../ui/alert";

interface Coautor {
  id: string
  name: string
  among: number
  type: string
}


export function CoautoresModal() {
  const { onClose, isOpen, type: typeModal, data } = useModalSecundary();
  const isModalOpen = (isOpen && typeModal === "coautores")

  const [count, setCount] = useState(20)
  const [researcher, setResearcher] = useState<Coautor[]>([]);
  const [, isLoading] = useState(false)
  const { urlGeral } = useContext(UserContext);
  let urlTermPesquisadores = urlGeral + `researcher/co-authorship/${data.id}`;
  console.log(urlTermPesquisadores)

  useEffect(() => {
    const fetchData = async () => {

      try {
        isLoading(true)
        const response = await fetch(urlTermPesquisadores, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Max-Age": "3600",
            "Content-Type": "text/plain",
          },
        });

        const data = await response.json();
        if (data) {
          setResearcher(data);

        }

      } catch (err) {
        console.log(err);
      } finally {
        isLoading(false);
      }
    };
    fetchData();
  }, [urlTermPesquisadores]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [maxFontSize, setMaxFontSize] = useState(100);

  useEffect(() => {
    if (containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      setMaxFontSize(containerHeight * 0.2); // Define um tamanho máximo baseado na altura da div pai
    }
  }, [researcher]);

  const minFontSize = maxFontSize * 0.6;
  // Ordena os pesquisadores em ordem decrescente pelo valor de among
  const sortedResearchers = [...researcher].sort((a, b) => b.among - a.among);

  return (
    <Sheet open={isModalOpen} onOpenChange={onClose}>

      <SheetContent
        className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw]`}
      >
        <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 w-8"
                    variant={"outline"}
                    onClick={() => onClose()}
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

        <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
          <div className="mb-8 flex justify-between items-center">
            <div >
              <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                Coautores de
              </p>

              <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                {data.name}
              </h1>
            </div>

            <div>

            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 rounded-md bg-yellow-500"></div>
              <p className="text-sm text-gray-500">Mesma instituição</p>
            </div>

            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 rounded-md bg-orange-400"></div>
              <p className="text-sm text-gray-500">Externo</p>
            </div>

            <div className="flex gap-1 items-center">
              <div className="w-4 h-4 rounded-md bg-red-400"></div>
              <p className="text-sm text-gray-500">Não identificado</p>
            </div>
          </div>

          <div>
            <div className="gap-2 mt-8 flex-wrap flex w-full items-center ">
              {sortedResearchers.map((item) => {
                const maxFontSize = 250;
                const minFontSize = 70;

                const distinctAmongValues = [...new Set(sortedResearchers.map((item: any) => item.among))];
                const distinctAmongCount = distinctAmongValues.length;
                const fontSize =
                  maxFontSize -
                  ((maxFontSize - minFontSize) / (distinctAmongCount - 1)) *
                  distinctAmongValues.indexOf(item.among);

                return (
                  <li key={item.id} className="list-none">
                    <div className="">
                      <Alert
                        className={`flex items-start justify-start text-left w-fit gap-4 font-semibold text-white  p-2 truncate 
               ${(item.type === 'internal' && 'bg-yellow-500 dark:bg-yellow-500') ||
                          (item.type === 'external' && 'bg-orange-400 dark:bg-orange-400') ||
                          (item.type === 'speaker' && 'bg-red-400 dark:bg-red-400') || ''
                          }
            `}
                        style={{
                          fontSize: `${fontSize}%`,
                          maxWidth: '100%',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          textAlign: 'center'
                        }}
                      >
                        <p className="text-left">{item.name} <strong className="font-normal">{item.among}</strong></p>
                      </Alert>
                    </div>
                  </li>
                );
              })}
            </div>



            
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}