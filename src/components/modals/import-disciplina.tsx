import { ArrowUUpLeft, FileXls, Upload } from "phosphor-react";
import { useModal } from "../hooks/use-modal-store";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { UserContext } from "../../context/context";
import * as XLSX from 'xlsx';
import { useDropzone } from 'react-dropzone';
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Progress } from "../ui/progress";

interface Patrimonio {
    semester: string;
    department: string;
    academic_activity_code: string;
    academic_activity_name: string;
    academic_activity_ch: string;
    demanding_courses: string;
    oft: string;
    id: string;
    available_slots: string;
    occupied_slots: string;
    percent_occupied_slots: string;
    schedule: string;
    language: string;
    professor: string;
    status: string;
    dep_id: string
}

export function ImportDisciplina() {
    const { onClose, isOpen, type: typeModal, data: dataModal } = useModal();
    const isModalOpen = (isOpen && typeModal === 'import-disciplina');
    const { urlGeralAdm } = useContext(UserContext);
    const [fileInfo, setFileInfo] = useState({ name: '', size: 0 });
    const [data, setData] = useState<Patrimonio[]>([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [semester, setSemester] = useState('1');
    const [uploadProgress, setUploadProgress] = useState(0);

    const [depId, setDepId] = useState(dataModal ? dataModal.dep_id : '')

    useEffect(() => {

        setDepId(dataModal.dep_id)
    }, [dataModal]);

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
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            const headers: string[] = json[0] as string[];
            const rows = json.slice(1);

            const headerMap: { [key: string]: keyof Patrimonio } = {
                'Semestre': 'semester',
                'Departamento': 'department',
                'Atividade acadêmica - Código': 'academic_activity_code',
                'Atividade acadêmica - Nome': 'academic_activity_name',
                'Atividade acadêmica - CH': 'academic_activity_ch',
                'Cursos demandantes': 'demanding_courses',
                'Oft.': 'oft',
                'Id.': 'id',
                'Vagas Disp.': 'available_slots',
                'Vagas Ocup.': 'occupied_slots',
                '% Vagas Ocup.': 'percent_occupied_slots',
                'Horário': 'schedule',
                'Língua': 'language',
                'Professores (nome, nº de inscrição, encargo)': 'professor',
                'Sit.': 'status'
            };

            const jsonData = rows.map((row: any) => {
                const obj: Patrimonio = {
                    semester: '',
                    department: '',
                    academic_activity_code: '',
                    academic_activity_name: '',
                    academic_activity_ch: '',
                    demanding_courses: '',
                    oft: '',
                    id: '',
                    available_slots: '',
                    occupied_slots: '',
                    percent_occupied_slots: '',
                    schedule: '',
                    language: '',
                    professor: '',
                    status: '',
                    dep_id: depId || ''
                };
                headers.forEach((header, index) => {
                    const key = headerMap[header];
                    if (key) {
                        let value = row[index] !== undefined ? String(row[index]) : '';
                        // Fix the semester value if it's a number
                        if (key === 'semester') {
                            value = String(value).trim();
                            const regex = /^(\d{4})\/(\d)$/;
                            const match = value.match(regex);
                            if (match) {
                                const [_, year, sem] = match;
                                value = `${year}/${sem}`;
                            } else {
                                // Default to current year and semester if not formatted correctly
                                const currentYear = new Date().getFullYear();
                                const currentSemester = new Date().getMonth() <= 6 ? '1' : '2';
                                value = `${currentYear}/${currentSemester}`;
                            }
                        }
                        obj[key] = String(value || "");
                    }
                });
                return obj;
            });

            setData(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    useEffect(() => {

        const dataToSet = data.map(item => ({
            ...item,
            dep_id: item.dep_id || 'default_value'
        }));
        setData(dataToSet);
    }, [depId]);

    console.log('deep', depId)

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

            const urlPatrimonioInsert = urlGeralAdm + `departamentos/disciplinas`;

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
            }

            setData([]);
            setFileInfo({
                name: '',
                size: 0,
            });

        } catch (error) {
            console.error('Erro ao processar a requisição:', error);
            toast("Erro ao processar a requisição", {
                description: "Tente novamente mais tarde.",
                action: {
                    label: "Fechar",
                    onClick: () => console.log("Fechar"),
                },
            });
        }
    };

    const currentYear = new Date().getFullYear();
    const years: any[] = [];
    for (let i = currentYear; i > currentYear - 4; i--) {
        years.push(i);
    }

    console.log(data)

    return (
        <Dialog open={isModalOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[40vw]">
                <DialogHeader className="pt-8 px-6 flex flex-col items-center">
                    <DialogTitle className="text-2xl text-center font-medium">
                        Importar arquivo .xls
                    </DialogTitle>
                    <DialogDescription className="text-center text-zinc-500 max-w-[350px]">
                        Atualize os itens do na Vitrine com a planilha .xls gerada no SICPAT
                    </DialogDescription>
                </DialogHeader>

                <div className="mb-4">
                    <div {...getRootProps()} className="border-dashed mb-6 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 mt-4">
                        <input {...getInputProps()} />
                        <div className="p-4 border rounded-md">
                            <FileXls size={24} className="whitespace-nowrap" />
                        </div>
                        {isDragActive ? (
                            <p>Solte os arquivos aqui ...</p>
                        ) : (
                            <p>Arraste e solte o arquivo .xls aqui ou clique para selecionar o arquivo</p>
                        )}
                    </div>

                    {fileInfo.name && (
                        <aside>
                            <h4>Arquivo</h4>
                            <ul>
                                <li key={fileInfo.name}>
                                    {fileInfo.name} - {(fileInfo.size / 1024).toFixed(2)} KB
                                </li>
                            </ul>
                        </aside>
                    )}
                </div>

                {uploadProgress > 0 && (
                    <Progress value={uploadProgress} className="w-full" />
                )}

                <DialogFooter className="mt-8">
                    <div className="w-full flex gap-3">
                        <Button onClick={onClose} className="w-full" variant='secondary'>
                            <ArrowUUpLeft className="mr-2" size={20} />
                            Cancelar
                        </Button>
                        <Button onClick={handleSubmitPatrimonio} className="w-full">
                            <Upload className="mr-2" size={20} />
                            Enviar arquivo
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
