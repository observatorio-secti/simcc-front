import { DialogHeader } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useModal } from "../hooks/use-modal-store";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/context";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { PencilSimple } from "phosphor-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Sheet, SheetContent } from "../ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { ScrollArea } from "../ui/scroll-area";
import { X } from "lucide-react";
import { Textarea } from "../ui/textarea";

export function EditGraduateProgram() {
    const { onClose, isOpen, type: typeModal, data } = useModal();
    const isModalOpen = isOpen && typeModal === "edit-graduate-program";

    const { user, urlGeralAdm } = useContext(UserContext);

    const [id_program, setIdProgram] = useState(data?.graduate_program_id || "");
    const [name, setName] = useState(data?.name || "");
    const [city, setCity] = useState(data?.city || "");
    const [modality, setModality] = useState(data?.modality || "");
    const [type, setType] = useState(data?.type || "");
    const [ranking, setRanking] = useState(data?.rating || "");
    const [area, setArea] = useState(data?.area || "");
    const [code, setCode] = useState(data?.code || "");
    const [descricao, setDescricao] = useState(data?.description || "");
    const [site, setSite] = useState(data?.site || "");
    const [sigla, setSigla] = useState(data?.acronym || "");
    const [visible, setVisible] = useState(data?.visible || false);
    const [menagers, setMenager] = useState<string[]>(data?.menagers || []);
    const [newEmail, setNewEmail] = useState("");

    useEffect(() => {
        setIdProgram(data?.graduate_program_id || "");
        setName(data?.name || "");
        setCity(data?.city || "");
        setModality(data?.modality || "");
        setType(data?.type || "");
        setRanking(data?.rating || "");
        setArea(data?.area || "");
        setCode(data?.code || "");
        setDescricao(data?.description || "");
        setSigla(data?.acronym || "");
        setSite(data?.site || "");
        setVisible(data?.visible || false);
        setMenager(data?.menagers || []);
        console.log(data)
    }, [data]);

    const addEmail = () => {
        const email = newEmail.trim();
        if (email && !menagers.includes(email)) {
            setMenager([...menagers, email]);
            setNewEmail("");
        }
    };

    const removeEmail = (emailToRemove: string) => {
        setMenager(menagers.filter(email => email !== emailToRemove));
    };

    const handleSubmit = async () => {
        if (!name) return toast("Campo 'Nome do programa' vazio", { description: "Preencha o campo" });
        if (!area) return toast("Campo 'Área' vazio", { description: "Preencha o campo" });
        if (!modality) return toast("Campo 'Modalidade' vazio", { description: "Preencha o campo" });
        if (!type) return toast("Campo 'Tipo do programa' vazio", { description: "Preencha o campo" });
        if (!city) return toast("Campo 'Cidade' vazio", { description: "Preencha o campo" });

        const payload = [{
            graduate_program_id: id_program,
            code,
            name: name.toUpperCase(),
            area: area.toUpperCase(),
            modality: modality.toUpperCase(),
            type: type.toUpperCase(),
            rating: ranking.toUpperCase(),
            institution_id: user?.institution_id,
            description: descricao,
            url_image: "",
            city,
            visible,
            acronym: sigla,
            site,
            menagers: menagers
        }];
        try {
            const response = await fetch(`${urlGeralAdm}/GraduateProgramRest/Fix`, {
                mode: 'cors',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast("Dados enviados com sucesso", { description: "Programa de pós-graduação atualizado na instituição" });
                onClose();
            } else {
                toast("Tente novamente", { description: "Erro ao enviar dados" });
            }
        } catch {
            toast("Erro ao processar requisição", { description: "Tente novamente" });
        }
    };

    return (
        <Sheet open={isModalOpen} onOpenChange={onClose}>
            <SheetContent className="p-0 dark:bg-neutral-900 dark:border-gray-600 min-w-[50vw]">
                <DialogHeader className="h-[50px] px-4 justify-center border-b">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="icon" onClick={onClose}><X size={16} /></Button>
                            </TooltipTrigger>
                            <TooltipContent>Fechar</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </DialogHeader>

                <ScrollArea className="relative pb-4 whitespace-nowrap h-[calc(100vh-50px)] p-8">
                    <div className="mb-8">
                        <p className="max-w-[750px] mb-2 text-lg font-light text-foreground">Programas de pós-graduação</p>
                        <h1 className="max-w-[500px] text-3xl font-bold leading-tight md:text-4xl">Editar programa</h1>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-2 w-2/3">
                                <Label>Nome do programa*</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2 w-1/3">
                                <Label>Sigla*</Label>
                                <Input value={sigla} onChange={e => setSigla(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label>Modalidade*</Label>
                                <Select value={modality} onValueChange={setModality}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACADÊMICO">Acadêmico</SelectItem>
                                        <SelectItem value="PROFISSIONAL">Profissional</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label>Cidade*</Label>
                                <Input value={city} onChange={e => setCity(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col gap-2 w-1/2">
                                <Label>Tipo de programa*</Label>
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DOUTORADO">Doutorado</SelectItem>
                                        <SelectItem value="MESTRADO">Mestrado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-4 w-1/2">
                                <div className="flex flex-col gap-2 w-2/3">
                                    <Label>Área*</Label>
                                    <Input value={area} onChange={e => setArea(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-2 w-1/3">
                                    <Label>Nota</Label>
                                    <Input value={ranking} onChange={e => setRanking(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col gap-2 w-2/3">
                                <Label>Código do programa (Sucupira)</Label>
                                <Input value={code} onChange={e => setCode(e.target.value)} />
                            </div>
                            <div className="flex flex-col gap-2 w-1/3">
                                <Label>Site</Label>
                                <Input value={site} onChange={e => setSite(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Descrição</Label>
                            <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} className="h-32" />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>Emails dos responsáveis</Label>
                            <div className="flex flex-wrap gap-2 border border-input rounded-md p-2 min-h-[48px]">
                                {menagers.map((email, idx) => (
                                    <div key={idx} className="flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-muted text-muted-foreground">
                                        {email}
                                        <button type="button" onClick={() => removeEmail(email)} className="hover:text-destructive">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Input
                                    placeholder="Digite um e-mail e pressione Enter"
                                    value={newEmail}
                                    onChange={e => setNewEmail(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addEmail();
                                        }
                                    }}
                                />
                                <Button onClick={addEmail}>Adicionar</Button>
                            </div>
                        </div>

                        <Button onClick={handleSubmit} size="sm" className="mt-4 ml-auto">
                            <PencilSimple size={16} />
                            Editar programa
                        </Button>
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
}
