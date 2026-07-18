import { EyeClosed } from "phosphor-react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { useCallback, useState } from "react";
import { Eye, Image } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

interface Props {
    keepoData: Keepo;
    setKeepoData: React.Dispatch<React.SetStateAction<Keepo>>;
    moveItem: (index: number, direction: "up" | "down") => void;
    deleteItem: (index: number) => void;
    index: number;
    contentItem: any;
}

export function ImageSection(props: Props) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fileInfo, setFileInfo] = useState({ name: "", size: 0 });

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        handleFileUpload(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop});

    const handleFileUpload = (files: File[]) => {
        const uploadedFile = files[0];
        if (uploadedFile) {
            setFileInfo({ name: uploadedFile.name, size: uploadedFile.size });
            setSelectedFile(uploadedFile);
        }
    };

    const uploadToFirebase = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const storage = getStorage();
        const storageRef = ref(storage, `construtor-pagina/images/${selectedFile.name}`);

        try {
            await uploadBytes(storageRef, selectedFile);
            const downloadURL = await getDownloadURL(storageRef);
            
            // Atualiza a URL da imagem no estado
            const newContent = [...props.keepoData.content];
            newContent[props.index] = { ...newContent[props.index], url: downloadURL };

            props.setKeepoData(prev => ({ ...prev, content: newContent }));

            toast("Upload concluído", {
                description: "O arquivo foi enviado com sucesso.",
                action: {
                    label: "Fechar",
                    onClick: () => console.log("Fechar"),
                },
            });
        } catch (error) {
            console.error("Erro ao fazer upload da imagem:", error);
            toast("Erro no upload", {
                description: "Não foi possível enviar o arquivo.",
                action: {
                    label: "Fechar",
                    onClick: () => console.log("Fechar"),
                },
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Base setKeepoData={props.setKeepoData} moveItem={props.moveItem} deleteItem={props.deleteItem} index={props.index} keepoData={props.keepoData}>
           <div className="flex flex-col gap-2">
           {props.contentItem.url.length == 0 && (
 <div {...getRootProps()} className="border-dashed mb-3 flex-col border border-neutral-300 p-6 text-center rounded-md text-neutral-400 text-sm cursor-pointer transition-all gap-3 w-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800">
 <input {...getInputProps()} />
 <div className="p-4 border rounded-md">
     <Image size={24} className="whitespace-nowrap" />
 </div>
 {isDragActive ? <p>Solte os arquivos aqui ...</p> : <p>Arraste e solte uma imagem aqui ou clique para selecionar</p>}
</div>
           )}

{props.contentItem.url.length == 0 && (
 fileInfo.name && (
    <div className="justify-center flex items-center gap-3">
        <Image size={16} />
        <p className="text-center text-zinc-500 text-sm">
            Arquivo selecionado: <strong>{fileInfo.name}</strong> ({(fileInfo.size / 1024).toFixed(2)} KB)
        </p>
    </div>
)
           )}
          
          {props.contentItem.url.length == 0 && (
 <Button onClick={uploadToFirebase} disabled={uploading || !selectedFile}>
 {uploading ? "Enviando..." : "Adicionar imagem"}
</Button>
           )}
           

            {props.contentItem.url && (
                <div>
                    <div className="relative">
                        <div className={`overflow-hidden rounded-md ${isExpanded ? "h-auto" : "h-[300px]"}`}>
                            <img src={props.contentItem.url} className="w-full" alt="Dynamic content" />
                        </div>
                        {!isExpanded && (
                            <div className="absolute h-[300px] inset-0 flex justify-center w-full bg-gradient-to-t from-neutral-50 dark:from-neutral-900 to-transparent items-end">
                                <Button className="h-8 px-2" variant={'outline'} onClick={toggleExpand}>
                                    <Eye size={16} />
                                    Ver mais
                                </Button>
                            </div>
                        )}
                        {isExpanded && (
                            <div className="flex justify-center mt-2">
                                <Button className="h-8 px-2" variant={'outline'} onClick={toggleExpand}>
                                    <EyeClosed size={16} />
                                    Mostrar menos
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
           </div>
        </Base>
    );
}