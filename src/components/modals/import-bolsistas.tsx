import { ArrowUUpLeft,  FileXls, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useState } from "react";
import { toast } from "sonner"
import { UserContext } from "../../context/context";
import * as XLSX from 'xlsx';
import {useDropzone} from 'react-dropzone'

interface Patrimonio {
    id: string
    id_lattes: string
    nome_beneficiario: string
    cpf_beneficiario: string
    nome_pais: string
    nome_regiao: string
    nome_uf: string
    nome_cidade: string
    nome_grande_area: string
    nome_area: string
    nome_sub_area: string
    cod_modalidade: string
    nome_modalidade: string
    titulo_chamada: string
    cod_categoria_nivel: string
    nome_programa_fomento: string
    nome_instituto: string
    quant_auxilio: string
    quant_bolsa: string
}

import {
    Sheet,
    SheetContent,
  
  } from "../../components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ArrowRight, Info, LoaderCircle, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { columnsBolsistas } from "../componentsModal/columns-bolsistas";
import { DataTableModal } from "../componentsModal/data-table";
import { Link } from "react-router-dom";

export function ImportBolsistas() {
    const { onClose, isOpen, type: typeModal } = useModal();
    
    const isModalOpen = (isOpen && typeModal === 'import-bolsistas')

    const {urlGeralAdm} = useContext(UserContext)
    const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });

    const [data, setData] = useState<Patrimonio[]>([]);

    const onDrop = useCallback((acceptedFiles: any) => {
        handleFileUpload(acceptedFiles);
    }, []);
  
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
    });
  
    const handleFileUpload = (files: any) => {
        const uploadedFile = files[0];
        if (uploadedFile) {
            setFileInfo({
                name: uploadedFile.name,
                size: uploadedFile.size,
            });
            readExcelFile(uploadedFile);
        }
    };
  
    const readExcelFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
  
            // Convert the worksheet to JSON, starting from the third row
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  
            // Extract headers from the first row
            const headers: string[] = json[0] as string[];
  
            // Remove the first row (headers themselves)
            const rows = json.slice(1);
  
            // Map headers to your interface keys
            const headerMap: { [key: string]: keyof Patrimonio } = {
                '#': 'id',
                '# Id Lattes': 'id_lattes',
                '# Nome Beneficiário': 'nome_beneficiario',
                '# CPF Beneficiário': 'cpf_beneficiario',
                '# Nome País': 'nome_pais',
                '# Nome Região': 'nome_regiao',
                '# Nome UF': 'nome_uf',
                '# Nome Cidade': 'nome_cidade',
                '# Nome Grande Área': 'nome_grande_area',
                '# Nome Área': 'nome_area',
                '# Nome Sub-área': 'nome_sub_area',
                '# Cod Modalidade': 'cod_modalidade',
                '# Nome Modalidade': 'nome_modalidade',
                '# Título Chamada': 'titulo_chamada',
                '# Cod Categoria Nível': 'cod_categoria_nivel',
                '# Nome Programa Fomento': 'nome_programa_fomento',
                '# Nome Instituto': 'nome_instituto',
                'QUANTAUXILIO': 'quant_auxilio',
                'QUANTBOLSA': 'quant_bolsa'
            };
  
            // Convert rows to an array of objects
            const jsonData = rows.map((row: any) => {
                const obj: Patrimonio = {
                    id: '',
                    id_lattes: '',
                    nome_beneficiario: '',
                    cpf_beneficiario: '',
                    nome_pais: '',
                    nome_regiao: '',
                    nome_uf: '',
                    nome_cidade: '',
                    nome_grande_area: '',
                    nome_area: '',
                    nome_sub_area: '',
                    cod_modalidade: '',
                    nome_modalidade: '',
                    titulo_chamada: '',
                    cod_categoria_nivel: '',
                    nome_programa_fomento: '',
                    nome_instituto: '',
                    quant_auxilio: '',
                    quant_bolsa: ""
                };
                headers.forEach((header, index) => {
                    const key = headerMap[header];
                    if (key) {
                        obj[key] = String(row[index] || "");
                    }
                });
                return obj;
            });
  
            setData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };
  

    console.log(data)
    const [uploadProgress, setUploadProgress] = useState(false);


    const handleSubmitPatrimonio = async () => {
        try {
            if (data.length === 0) {
                toast("Erro: Nenhum arquivo selecionado", {
                    description: "Por favor, selecione um arquivo csv para enviar.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
                return;
            }
    
            setUploadProgress(true);
    
            let urlPatrimonioInsert = `${urlGeralAdm}ResearcherRest/InsertGrant`;
    
            const response = await fetch(urlPatrimonioInsert, {
                mode: 'cors',
                method: 'POST',
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Max-Age': '3600',
                    'Content-Type': 'application/json',
                    'Connection': 'keep-alive', // Mantém a conexão aberta
                },
                body: JSON.stringify(data),
            });
    
            if (response.ok) {
                toast("Dados enviados com sucesso", {
                    description: "Todos os dados foram enviados.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
    
                setData([]);
                setFileInfo({
                    name: '',
                    size: 0,
                });
            } else {
                throw new Error('Erro ao enviar os dados.');
            }
    
        } catch (error) {
            console.error('Erro ao processar a requisição:', error);
            toast("Erro ao processar a requisição", {
                description: "Tente novamente mais tarde.",
                action: {
                    label: "Fechar",
                    onClick: () => console.log("Fechar"),
                },
            });
        } finally {
            setUploadProgress(false);
        }
    };
    

    console.log(data)

    return (
        <Sheet open={isModalOpen} onOpenChange={onClose}>
        <SheetContent className={`p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw]`}>
        <DialogHeader className="h-[50px] px-4 justify-center border-b dark:border-b-neutral-600">
 
 <div className="flex items-center gap-3">
 <TooltipProvider>
 <Tooltip>
  <TooltipTrigger asChild>
  <Button className="h-8 w-8" variant={'outline'}  onClick={() => onClose()} size={'icon'}><X size={16}/></Button>
  </TooltipTrigger>
  <TooltipContent> Fechar</TooltipContent>
 </Tooltip>
 </TooltipProvider>
 
 <div className="flex ml-auto items-center w-full justify-between">
 
   <div className="flex ml-auto items-center gap-3">
 
  
      </div>
 </div>
 
 </div>
  
 </DialogHeader>

 <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8 ">
        <div className="mb-8">
                      <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">
                      Pesquisadores
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                          Atualizar bolsistas CNPq
                        </h1>
                        <Link to={'http://www.bi.cnpq.br/painel/mapa-fomento-cti/'} target="_blank"  className="inline-flex mt-2 items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Saiba como extrair os bolsistas CNPq<ArrowRight size={12}/></Link>
                      </div>
                <div className="">
                


                    <div {...getRootProps()} className="border-dashed mb-3 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm  cursor-pointer transition-all gap-3  w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 mt-4">
                        <input {...getInputProps()} />
                        <div className="p-4  border rounded-md">
                            <FileXls size={24} className=" whitespace-nowrap" />
                        </div>
                        {isDragActive ? (
                            <p>Solte os arquivos aqui ...</p>
                        ) : (
                            <p>Arraste e solte o arquivo .xls aqui ou clique para selecionar o arquivo</p>
                        )}
                    </div>

                    <div>
                        {fileInfo.name && (
                            <div className="justify-center flex items-center gap-3">
                                <FileXls size={16} />
                                <p className=" text-center  text-zinc-500 text-sm">
                                    Arquivo selecionado: <strong>{fileInfo.name}</strong> ({(fileInfo.size / 1024).toFixed(2)} KB)
                                </p>
                            </div>
                        )}
                    </div>
                </div>


                {data.length > 0 && (
                    <div className="">
                        <div className="my-6 border-b dark:border-b-neutral-800"></div>
                        <h5 className="font-medium text-xl mb-4">Tabela de dados</h5>
                    <DataTableModal columns={columnsBolsistas} data={data} />
                    <div className="mt-2 mb-6 border-b dark:border-b-neutral-800"></div>

                    
                    </div>
                )}

<div className="flex items-center justify-between">
    <div className="text-sm font-gray-500">
    {uploadProgress ? ('Isso pode demorar bastante, não feche a página.'):('')}
    </div>
<Button onClick={() => handleSubmitPatrimonio()} className="ml-auto flex mt-3">
                        {uploadProgress ? (<LoaderCircle size={16} className="an animate-spin" />):(<Upload size={16} className="" />)}  {uploadProgress ? ('Atualizando dados'):('Atualizar dados')} 
                    </Button>

</div>
                
                </ScrollArea>
     

                <div></div>
                </SheetContent>
                </Sheet>
    )
}
