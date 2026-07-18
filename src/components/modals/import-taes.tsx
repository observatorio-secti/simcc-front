import { ArrowUUpLeft, FileXls, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useState } from "react";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Link } from "react-router-dom";
import { ArrowRight, Info, LoaderCircle, X } from "lucide-react";
import { DataTableModal } from "../componentsModal/data-table";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { columnsDocentes } from "../componentsModal/columns-docentes";
import { columnsTaes } from "../componentsModal/columns-taes";

interface Patrimonio {
    matric: string;
    insUFMG: string;
    nome: string;
    genero: string;
    denoSit: string;
    rt: string;
    classe: string;
    cargo: string;
    nivel: string;
    ref: string;
    titulacao: string;
    setor: string;
    detalheSetor: string;
    dtIngOrg: string;
    dataProg: string;
    year_charge: string;
    semester: string;
}

export function ImportTaes() {
    const { onClose, isOpen, type: typeModal } = useModal();
    const isModalOpen = (isOpen && typeModal === 'import-taes');
    const { urlGeralAdm } = useContext(UserContext);
    const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });
    const [data, setData] = useState<Patrimonio[]>([]);

    const onDrop = useCallback((acceptedFiles: any) => {
        handleFileUpload(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
            const sheetName = workbook.SheetNames[1];
            const worksheet = workbook.Sheets[sheetName];

            // Convert the worksheet to JSON, starting from the third row
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            // Extract headers from the first row
            const headers: string[] = json[0] as string[];

            // Remove the first row (headers themselves)
            const rows = json.slice(1);

            // Map headers to your interface keys
            const headerMap: { [key: string]: keyof Patrimonio } = {
                'MATRIC': 'matric',
                'InscUfmg': 'insUFMG',
                'NOME': 'nome',
                'SEXO': 'genero',
                'DenoSit': 'denoSit',
                'RT': 'rt',
                'DenoClasse': 'classe',
                'DenoCarg': 'cargo',
                'CLAS': 'nivel',
                'REF': 'ref',
                'DenoTit': 'titulacao',
                'DenoSetor': 'setor',
                'DETALHE DE SETOR': 'detalheSetor',
                'DtIngOrg': 'dtIngOrg',
                'DataProg': 'dataProg'
            };

            // Convert rows to an array of objects
            const jsonData = rows.map((row: any) => {
                const obj: Patrimonio = {
                    matric: '',
                    insUFMG: '',
                    nome: '',
                    genero: '',
                    denoSit: '',
                    rt: '',
                    classe: '',
                    cargo: '',
                    nivel: '',
                    ref: '',
                    titulacao: '',
                    setor: '',
                    detalheSetor: '',
                    dtIngOrg: '',
                    dataProg: '',
                    year_charge: String(year),
                    semester: String(semester)
                };

                headers.forEach((header, index) => {
                    const key = headerMap[header];
                    if (key) {
                        if ((header === 'DtIngOrg' || header === 'DataProg') && typeof row[index] === 'number') {
                            // Converte o número serial em uma data
                            const date = XLSX.SSF.format('dd/mm/yyyy', new Date(Math.round((row[index] - 25569) * 86400 * 1000)));
                            obj[key] = date;
                        } else if (header === 'CLAS') {
                            obj[key] = row[index] === 0 ? '0' : String(row[index]);
                        } else {
                            obj[key] = String(row[index] || "");
                        }
                    }
                });

                return obj;
            });

            setData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

   

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
  setUploadProgress(true)
            const urlPatrimonioInsert = `${urlGeralAdm}tecnicos`;

            const response = await fetch(urlPatrimonioInsert, {
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
                    description: "Todos os dados foram enviados.",
                    action: {
                        label: "Fechar",
                        onClick: () => console.log("Fechar"),
                    },
                });
                setUploadProgress(false)
            }

            setData([]);
            setFileInfo({
                name: '',
                size: 0,
            });
            setUploadProgress(false)

        } catch (error) {
            console.error('Erro ao processar a requisição:', error);
            toast("Erro ao processar a requisição", {
                description: "Tente novamente mais tarde.",
                action: {
                    label: "Fechar",
                    onClick: () => console.log("Fechar"),
                },
            });
            setUploadProgress(false)
        }
    };

    const currentYear = new Date().getFullYear();
    const [year, setYear] = useState(new Date().getFullYear());

    const [semester, setSemester] = useState(() => {
        const currentMonth = new Date().getMonth(); // Obtém o mês atual (0 a 11)
        return currentMonth < 6 ? '1' : '2'; // Define o semestre como '1' se estiver entre janeiro e junho, caso contrário '2'
      });

      const years: number[] = [];
    for (let i = currentYear; i > currentYear - 4; i--) {
        years.push(i);
    }

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
                      Indicadores 
                        </p>

                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                          Atualizar dados dos técnicos
                        </h1>
                        <Link to={'/dashboard/informacoes'} target="_blank"  className="inline-flex mt-2 items-center rounded-lg  bg-neutral-100 dark:bg-neutral-700  gap-2 mb-3 px-3 py-1 text-sm font-medium"><Info size={12}/><div className="h-full w-[1px] bg-neutral-200 dark:bg-neutral-800"></div>Veja o modelo do documento .xls<ArrowRight size={12}/></Link>
                      </div>

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

                    {data.length > 0 && (
                    <div className="">
                        <div className="my-6 border-b dark:border-b-neutral-800"></div>
                        <h5 className="font-medium text-xl mb-4">Tabela de dados</h5>
                    <DataTableModal columns={columnsTaes} data={data} />
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

            

             

            </SheetContent>
        </Sheet>
    );
}
