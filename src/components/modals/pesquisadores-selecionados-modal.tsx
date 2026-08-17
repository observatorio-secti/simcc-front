import { useModal } from '../hooks/use-modal-store';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { Download, Trash, UserIcon, X } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { DialogHeader } from '../ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../context/context';
import { Alert } from '../ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Research } from './researcher-modal';

export function PesquisadoresSelecionadosModal() {
  const { onClose, isOpen, type: typeModal, data, onOpen } = useModal();
  const {
    pesquisadoresSelecionados,
    urlGeral,
    permission,
    setPesquisadoresSelecionados,
  } = useContext(UserContext);
  const isModalOpen = isOpen && typeModal === 'pesquisadores-selecionados';

  const history = useNavigate();

  const handleVoltar = () => {
    history(-1);
  };

  const close = () => {
    onClose();
  };

  const handleRemove = (indexToRemove: number) => {
    setPesquisadoresSelecionados((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const [jsonData, setJsonData] = useState<Research[]>([]);

  const urlPesquisadores = `${urlGeral}researcherName?name=${pesquisadoresSelecionados
    .map((pesquisador) => encodeURIComponent(pesquisador.name))
    .join('|')}`;

  console.log(urlPesquisadores);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(urlPesquisadores, {
          mode: 'cors',
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600',
            'Content-Type': 'text/plain',
          },
        });
        const data = await response.json();
        if (data) {
          setJsonData(data);
        }
      } catch (err) {
        console.log(err);
      } finally {
      }
    };
    fetchData();
  }, [urlPesquisadores]);

  const convertJsonToCsv = (json: any[]): string => {
    const items = json;
    const replacer = (_: string, value: any) => (value === null ? '' : value); // Handle null values
    const header = Object.keys(items[0]);
    const csv = [
      '\uFEFF' + header.join(';'), // Add BOM and CSV header
      ...items.map((item) =>
        header
          .map((fieldName) => JSON.stringify(item[fieldName], replacer))
          .join(';'),
      ), // CSV data
    ].join('\r\n');

    return csv;
  };

  const handleDownloadJson = async () => {
    try {
      const csvData = convertJsonToCsv(jsonData);
      const blob = new Blob([csvData], {
        type: 'text/csv;charset=windows-1252;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `dados.csv`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error(error);
    }
  };

  const hasBaremaAvaliacao = permission.some(
    (perm) => perm.permission === 'criar_barema_avaliacao',
  );

  return (
    <Sheet open={isModalOpen} onOpenChange={close}>
      <SheetContent
        className={`p-0 dark:bg-neutral-900 dark:border-gray-600 w-full lg:min-w-[50vw]`}
      >
        <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="h-8 w-8"
                    variant={'outline'}
                    onClick={() => {
                      handleVoltar();
                      onClose();
                    }}
                    size={'icon'}
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
          <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                  Barema de avaliação
                </p>

                <h1 className="max-w-[500px] whitespace-pre-wrap flex-wrap text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                  Pesquisadores selecionados
                </h1>
              </div>
            </div>

            <div className="flex flex-col h-full gap-4">
              {pesquisadoresSelecionados.length == 0 && (
                <div className="flex flex-col py-32 justify-center w-full h-full">
                  <p className="text-9xl text-center text-[#719CB8] font-bold mb-16 animate-pulse">{`⚆_⚆`}</p>
                  <h1 className="text-2xl md:text-3xl text-neutral-400 text-center font-medium leading-tight tracking-tighter lg:leading-[1.1] ">
                    Nenhum pesquisador selecionado
                  </h1>
                </div>
              )}
              {pesquisadoresSelecionados.map((props, index) => (
                <Alert key={index}>
                  <div className="flex justify-between items-center h-10 group">
                    <div className="h-10">
                      <div className="flex items-center gap-2">
                        <Avatar className="cursor-pointer rounded-md h-8 w-8">
                          <AvatarImage
                            className="rounded-md h-8 w-8"
                            src={`${urlGeral}ResearcherData/Image?name=${props.name}`}
                          />
                          <AvatarFallback className="flex items-center justify-center">
                            <UserIcon size={12} />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{props.name}</p>
                          <div className="text-xs text-gray-500">
                            {props.university}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className=" items-center gap-3 hidden group-hover:flex transition-all">
                        <Button
                          size="icon"
                          variant="destructive"
                          className="text-white h-8 w-8 dark:text-white"
                          onClick={() => handleRemove(index)} // 🔥 Remove pesquisador
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>

            {pesquisadoresSelecionados.length == 0 && <div></div>}

            {pesquisadoresSelecionados.length > 0 && (
              <div className="flex items-center gap-3 w-full justify-end">
                <Button
                  onClick={() => handleDownloadJson()}
                  variant={'ghost'}
                  size={'sm'}
                  className=" mt-3  flex "
                >
                  <Download size={16} className="" />
                  Baixar dados
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
