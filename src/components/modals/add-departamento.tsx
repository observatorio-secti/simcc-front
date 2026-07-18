import {
  DialogHeader,
} from "../ui/dialog";

import { v4 as uuidv4 } from "uuid";
import axios from "axios";

import { useModal } from "../hooks/use-modal-store";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";

import { toast } from "sonner";
import { Button } from "../ui/button";
import { PencilSimple, Plus } from "phosphor-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

import { Sheet, SheetContent } from "../../components/ui/sheet";
import { X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";

export function AddDepartamento() {
  const { onClose, isOpen, type: typeModal, data } = useModal();
  const isModalOpen =
    (isOpen && typeModal === "add-departamento") ||
    (isOpen && typeModal === "edit-departamento");

  const { urlGeralAdm } = useContext(UserContext);

  const uuid = uuidv4();

  // Extract numbers from the UUID and join them into a single string
  const id = uuid.replace(/\D/g, "").slice(0, 10);

  const [depId, setDepId] = useState(id);
  const [orgCod, setOrgCod] = useState('');
  const [depNom, setDepNom] = useState('');
  const [depDes, setDepDes] = useState('');
  const [depEmail, setDepEmail] = useState('');
  const [depSite, setDepSite] = useState('');
  const [depTel, setDepTel] = useState('');
  const [depSigla, setDepSigla] = useState('');
  const [img, setImg] = useState('');

  useEffect(() => {
    if (typeModal == 'edit-departamento') {
      setDepId(data.dep_id || uuid.replace(/\D/g, "").slice(0, 10))
      setOrgCod(data.org_cod || '')
      setDepNom(data.dep_nom || '')
      setDepDes(data.dep_des || '')
      setDepEmail(data.dep_email || '')
      setDepSite(data.dep_site || '')
      setDepEmail(data.dep_email || '')
      setDepSigla(data.dep_sigla || '')
      setDepTel(data.dep_tel || '')
      setImg(data.img_data || '')
    }
  }, [data]);


  const [, setFileInfo] = useState({
    name: "",
    size: 0,
  });

  const [pdfs, setPdfs] = useState({
    img_data: null as File | null,
  });



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfs({
      ...pdfs,
      img_data: e.target.files?.[0] || null,
    });
    setFileInfo({
      name: e.target.files?.[0]?.name || "",
      size: e.target.files?.[0]?.size || 0,
    });
  };

  const handleSubmit = () => {
    handleSubmitDepartamento();
  };


  const formatPhone = (value: string) => {
    value = value.replace(/\D/g, ""); // Remove todos os caracteres que não são dígitos
    value = value.replace(/^(\d{2})(\d)/, "($1) $2"); // Adiciona parênteses em torno dos dois primeiros dígitos
    value = value.replace(/(\d{1})(\d{4})(\d{4})/, "$1 $2-$3"); // Formata o restante como x xxxx-xxxx
    return value.slice(0, 16); // Limita a 15 caracteres
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhone(e.target.value);
    setDepTel(formattedPhone)
  };

  const handleSubmitDepartamento = async () => {
    try {
      if (!pdfs.img_data && typeModal === "add-departamento") {
        toast("Erro: Nenhuma imagem selecionada", {
          description: "Por favor, selecione uma imagem para enviar.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });
        return;
      }

      let urlDepartamentoInsert = urlGeralAdm + `departamentos`;

      if (typeModal === "edit-departamento") {
        urlDepartamentoInsert = urlGeralAdm + `departamentos/update`;
      }

      const data = new FormData();

      const dataDep = {
        dep_id: depId,
        org_cod: orgCod,
        dep_nom: depNom,
        dep_des: depDes,
        dep_email: depEmail,
        dep_site: depSite,
        dep_tel: depTel,
        dep_sigla: depSigla,
      };

      Object.entries(dataDep).forEach(([key, value]) => {
        data.append(key, value as string);
      });

      // Adicionar o arquivo apenas se ele existir ou se estiver adicionando um novo departamento
      if (pdfs.img_data && typeModal === "add-departamento") {
        data.append("img_data", pdfs.img_data);
      } else if (pdfs.img_data && typeModal === "edit-departamento") {
        data.append("img_data", pdfs.img_data);
      }

      const response = await axios.post(urlDepartamentoInsert, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "3600",
        },
      });

      if (response.status === 201 || response.status === 200) {
        toast("Dados enviados com sucesso", {
          description: "Todos os dados foram enviados.",
          action: {
            label: "Fechar",
            onClick: () => console.log("Fechar"),
          },
        });

        setDepId(uuid.replace(/\D/g, "").slice(0, 10));
        setOrgCod("");
        setDepNom("");
        setDepDes("");
        setDepEmail("");
        setDepSite("");
        setDepTel("");
        setDepSigla("");
        setFileInfo({ name: "", size: 0 });
        setPdfs({ img_data: null });

        onClose();
      }
    } catch (error) {
      console.error("Erro ao processar a requisição:", error);
      toast("Erro ao processar a requisição", {
        description: "Tente novamente mais tarde.",
        action: {
          label: "Fechar",
          onClick: () => console.log("Fechar"),
        },
      });
    }
  };


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

        <div>
          <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
            <div className="mb-8 flex justify-between items-center">
              <div >
                <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                  Departamentos
                </p>

                <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                  {typeModal === "add-departamento"
                    ? "Adicionar departamento"
                    : "Editar departamento"}
                </h1>
              </div>

              <div>
                {typeModal == 'edit-departamento' && (<img className="h-12 mix-blend-multiply" src={`data:image/jpeg;base64,${img}`} />)}
              </div>
            </div>
            <div className="flex gap-3 flex-col">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex w-full gap-3 items-end">
                  <div className="grid w-2/3 items-center gap-1.5">
                    <Label>Nome do departamento*</Label>
                    <Input
                      type="text"
                      name="dep_nom"
                      value={depNom}
                      onChange={(e) => setDepNom(e.target.value)}

                    />
                  </div>
                  <div className="grid w-1/3 items-center gap-1.5">
                    <Label>Sigla*</Label>
                    <Input
                      type="text"
                      name="dep_sigla"
                      value={depSigla}
                      onChange={(e) => setDepSigla(e.target.value)}

                    />
                  </div>
                </div>
                <div className="flex w-full gap-3">
                  <div className="grid w-1/3 items-center gap-1.5">
                    <Label>Código</Label>
                    <Input
                      type="text"
                      name="org_cod"
                      value={orgCod}
                      onChange={(e) => setOrgCod(e.target.value)}

                    />
                  </div>
                  <div className="grid w-2/3 items-center gap-1.5">
                    <Label>Email*</Label>
                    <Input
                      type="email"
                      name="dep_email"
                      value={depEmail}
                      onChange={(e) => setDepEmail(e.target.value)}

                    />
                  </div>
                </div>


                <div className="flex w-full gap-3">
                  <div className="grid w-2/3 items-center gap-1.5">
                    <Label>Site*</Label>
                    <Input
                      type="text"
                      name="dep_site"
                      value={depSite}
                      onChange={(e) => setDepSite(e.target.value)}
                    />
                  </div>
                  <div className="grid w-1/3 items-center gap-1.5">
                    <Label>Telefone*</Label>
                    <Input
                      type="tel"
                      name="dep_tel"
                      value={depTel}
                      onChange={handlePhoneChange}

                    />
                  </div>

                </div>
                <div className="grid w-full items-center gap-1.5">
                  <Label>Imagem</Label>
                  <Input type="file" accept="image/*" onChange={handleFileChange} />
                </div>

                <div className="grid w-full items-center gap-1.5">
                  <Label>Descrição</Label>
                  <Textarea
                    name="dep_des"
                    value={depDes}
                    onChange={(e) => setDepDes(e.target.value)}

                  />
                </div>
              </div>

              <Button onClick={handleSubmit} className="mt-3 ml-auto flex ">
                {typeModal === "edit-departamento" ? <PencilSimple size={16} className="" /> : <Plus size={16} className="" />}
                {typeModal === "edit-departamento" ? "Editar departamento" : "Adicionar departamento"}
              </Button>
            </div>
          </ScrollArea>
        </div>


      </SheetContent>
    </Sheet>
  );
}
