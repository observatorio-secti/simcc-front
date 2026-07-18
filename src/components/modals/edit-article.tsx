import { DialogFooter, DialogHeader, Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog";
import { useModalSecundary } from "../hooks/use-modal-store-secundary";
import { Button } from "../ui/button";
import { ArrowUUpLeft, Trash } from "phosphor-react";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import { useCallback, useContext, useState, useEffect } from "react";
import { Switch } from "../ui/switch";
import { Check, Image } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { updateMetadata } from "firebase/storage";
import { Alert } from "../ui/alert";

export const EditArticle: React.FC = () => {
  const { onClose, isOpen, type: typeModal, data, onUpdate } = useModalSecundary();
  const isModalOpen = isOpen && typeModal === "edit-article";

  const { urlGeral } = useContext(UserContext);

  const [relevance, setRelevance] = useState(data.relevance || false);
  const [fileInfo, setFileInfo] = useState<File | null>(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    if (!isModalOpen && shouldRefresh) {
      // Reset the refresh flag
      setShouldRefresh(false);
      // Trigger a page reload to refresh the articles
      window.location.reload();
    }
  }, [isModalOpen, shouldRefresh]);

  const handleRelevanceChange = async () => {
    const urlRelevance = `${urlGeral}relevant/${data.id}?type=ARTICLE`;
    try {
      const response = await fetch(urlRelevance, {
        method: relevance ? "DELETE" : "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": relevance ? "DELETE" : "POST",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast(`Alterado com sucesso`, {
          description: `Produção ${relevance ? "removida" : "adicionada"} às relevantes com sucesso!`,
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });

        setRelevance(!relevance);

        onUpdate({
          ...data,
          relevance: !relevance,
        });
        setShouldRefresh(true);
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast("Erro ao alterar a relevânica", {
        description: "Por favor, tente novamente.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles[0]) {
      setFileInfo(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileUpload = async () => {
    if (!fileInfo) {
      toast("Nenhum arquivo selecionado!", {
        description: "Por favor, selecione um arquivo antes de enviar.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", fileInfo, `${data.id}-${fileInfo.name}`);

    const urlUpload = `${urlGeral}image/${data.id}?type=ARTICLE`;

    try {
      const response = await fetch(urlUpload, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast("Upload realizado com sucesso!", {
          description: `Arquivo ${fileInfo.name} foi enviado com sucesso!`,
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });

        setFileInfo(null); // Reset file info
        onUpdate({ ...data, has_image: true });
        setShouldRefresh(true);
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast("Erro no envio", {
        description: "Não foi possível enviar o arquivo. Tente novamente.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };

  const handleFileDelete = async () => {
    const urlDelete = `${urlGeral}image/${data.id}?type=ARTICLE`;

    try {
      const response = await fetch(urlDelete, {
        method: "DELETE",
      });

      if (response.ok) {
        toast("Imagem excluída com sucesso!", {
          description: "A imagem foi removida do servidor.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });

        setFileInfo(null); // Clear local file state

        onUpdate({ ...data, has_image: false });
        setShouldRefresh(true);
      } else {
        throw new Error("Erro na resposta do servidor");
      }
    } catch (error) {
      console.error("Erro ao excluir imagem:", error);
      toast("Erro ao excluir imagem", {
        description: "Não foi possível excluir o arquivo. Tente novamente.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="z-[999999999] p-0">
      <Alert className="rounded-t-md rounded-b-none bg-eng-blue p-6 border-0 border-b">
      <DialogTitle className="text-2xl font-medium max-w-[450px] text-white">
           Editar produção {data.name}
          </DialogTitle>
          <DialogDescription className="text-white">
            Você pode atualizar a relevância deste artigo ou fazer upload de arquivos associados.
          </DialogDescription>
            </Alert>

           
        <DialogHeader className="p-4 pt-0 flex flex-col">
        


          <div className="flex gap-2 items-center pt-">
            <Switch checked={relevance} onCheckedChange={handleRelevanceChange} />
            <p className="text-sm">{relevance ? "Remover" : "Adicionar"} artigo às produções relevantes</p>
          </div>

         {data.has_image ? (
        <div className="py-4">
            <div 
         
         className="bg-neutral-100 flex justify-end group p-4 bg-center bg-cover bg-no-repeat dark:bg-neutral-800 h-[200px] rounded-md cursor-pointer" style={{ backgroundImage: `url(${urlGeral}image/${data.id}) ` }}>
          
          <Button size={'icon'} variant={'destructive'}  onClick={handleFileDelete} className="hidden group-hover:flex h-8 w-8">
            <Trash size={16} /> 
          </Button>
         </div>
        </div>
         ):(
          <div className="">
          <div
          {...getRootProps()}
          className="border-dashed mb-3 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 mt-4"
        >
          <input {...getInputProps()} />
          <div className="p-4 border rounded-md">
            <Image size={24} className="whitespace-nowrap" />
          </div>
          {isDragActive ? (
            <p>Solte os arquivos aqui...</p>
          ) : (
            <p>Arraste e solte a imagem aqui ou clique para selecionar o arquivo</p>
          )}
        </div>

        {fileInfo && (
          <div className="justify-center flex items-center gap-3 mt-2">
            <Image size={16} />
            <p className="text-center text-zinc-500 text-sm">
              Arquivo selecionado: ({(fileInfo.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}

        <div>
       
        </div>
          </div>
         )}

         

      
        </DialogHeader>

        <DialogFooter className="flex gap-3 p-4 pt-0">
        <Button variant="ghost" onClick={onClose}>
            <ArrowUUpLeft size={16} /> Fechar
          </Button>

          <Button  onClick={handleFileUpload} disabled={!fileInfo} className="ml-auto flex">
          <Check size={16}/>  Enviar Arquivo
          </Button>
        </DialogFooter>
       
       
      </DialogContent>
    </Dialog>
  );
};
