import { Link, Plus, Upload } from "lucide-react";
import { Alert } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { Base } from "../base";
import { Keepo } from "../builder-page";
import { EmojiPicker } from "../emoji-picker";
import { useState } from "react";
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

export function FileSection(props: Props) {
    const [uploading, setUploading] = useState(false);
    
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const storage = getStorage();
        const storageRef = ref(storage, `construtor-pagina/docs/${file.name}`);

        try {
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            const newContent = [...props.keepoData.content];
            newContent[props.index] = { ...newContent[props.index], url };
            props.setKeepoData((prev) => ({
                ...prev,
                content: newContent,
            }));
            
            toast("Upload concluído", {
                description: "O arquivo foi enviado com sucesso.",
                action: {
                    label: "Fechar",
                    onClick: () => console.log("Fechar"),
                },
            });
        } catch (error) {
            console.error("Erro no upload: ", error);
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
            <div className="w-full">
                <Alert className="flex gap-2 items-center p-4 w-full">
                    <EmojiPicker
                        contentItem={props.contentItem}
                        onSelect={(emoji) => {
                            const newContent = [...props.keepoData.content];
                            newContent[props.index] = { ...newContent[props.index], emoji };
                            props.setKeepoData((prev) => ({
                                ...prev,
                                content: newContent,
                            }));
                        }}
                    />
                    <Input
                        value={props.contentItem.title}
                        onChange={(e) => {
                            const newContent = [...props.keepoData.content];
                            newContent[props.index] = { ...newContent[props.index], title: e.target.value };
                            props.setKeepoData((prev) => ({
                                ...prev,
                                content: newContent,
                            }));
                        }}
                        className="text-gray-500 rounded-none text-sm w-full bg-transparent border-0 p-0 dark:border-0 dark:bg-transparent h-8"
                        placeholder="Digite o título aqui"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={uploading}
                    >
                        <label>
                            <Upload size={16} />
                            <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </Button>
                </Alert>
            </div>
        </Base>
    );
}
