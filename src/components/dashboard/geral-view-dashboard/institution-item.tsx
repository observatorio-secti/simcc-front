import { EditInstitutionModal } from "../../modals/edit-institution-modal";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { ColorPicker } from "../../ui/color-picker";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert } from "../../ui/alert";
import { Copy, Hash, Trash, Upload } from "lucide-react";
import { Button } from "../../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../ui/accordion";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { useModal } from "../../hooks/use-modal-store";

interface Props {
    name: string
    institution_id: string
    acronym:string
}
export function InstitutionItem(props:Props) {

    const {onOpen} = useModal()

    const [profile, setProfile] = useState({
        img_perfil: '',
        img_background: '',
        institution_id: '',
        color:'',
        site:'',
        name:''
      });

      useEffect(() => {
       
          setProfile((prevProfile) => ({
            ...prevProfile,
            institution_id: props.institution_id || '', // Se não for array, pega direto
            name: props.name || '' 
          }));
      
      }, [props]); // Atualiza sempre que `total` mudar

        const db = getFirestore();
        const storage = getStorage();
        const isDataLoaded = useRef(false); // Evita loops de salvamento
        
        // Carregar dados ao montar a página
        useEffect(() => {
          if (profile.institution_id) {
            const fetchInstitutionData = async () => {
              const docRef = doc(db, "institutions", profile.institution_id);
              const docSnap = await getDoc(docRef);
        
              if (docSnap.exists()) {
                const data = docSnap.data();
        
                setProfile({
                  institution_id:data?.institution_id || '',
                  img_background: data?.img_background || "",
                  img_perfil: data?.img_perfil || "",
                  color: data?.color || "",
                  site: data?.site || "",
                  name: data?.name || "",
                });
        
                isDataLoaded.current = true; // Marca que os dados foram carregados
              } else {
                console.log("Instituição não encontrada. Criando novo registro...");
                await setDoc(docRef, {
                  img_background: "",
                  img_perfil: "",
                  color: "",
                  site: "",
                  name: "",
                });
                isDataLoaded.current = true;
              }
            };
        
            fetchInstitutionData();
          }
        }, [profile.institution_id]);
      
        console.log('profile',profile)
        
        // Salvar automaticamente no Firebase quando os dados mudam
        useEffect(() => {
          if (profile.institution_id && isDataLoaded.current) {
            const saveData = async () => {
              await setDoc(doc(db, "institutions", profile.institution_id), profile, { merge: true });
            };
            saveData();
          }
        }, [profile]);
        
        // Função para upload de imagem
        const handleUpload = async (folder: "perfil" | "background") => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.click();
        
          fileInput.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file || !profile.institution_id) return;
        
            const storagePath = `institutions/${profile.institution_id}/${folder}/${file.name}`;
            const storageRef = ref(storage, storagePath);
            
            toast.info("Enviando imagem...");
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
        
            setProfile((prev) => ({
              ...prev,
              img_background: folder === "background" ? downloadURL : prev.img_background,
              img_perfil: folder === "perfil" ? downloadURL : prev.img_perfil,
            }));
        
            await setDoc(doc(db, "institutions", profile.institution_id), { [`img_${folder}`]: downloadURL }, { merge: true });
        
            toast.success("Upload concluído!");
          };
        };
      
      

    return(
        <div className="w-full flex">
          <Alert 
  className={`w-2 min-w-2 rounded-r-none p-0 border-r-0`} 
  style={{ backgroundColor: profile.color }} 
/>

             <Alert className="p-0 rounded-l-none">
                    <div className="flex flex-col items-center md:flex-row gap-6 w-full">

<div className="w-full">
{/* 🔹 Seção de Background */}
<Alert
className="h-[100px] border-b border-t-0 border-x-0 rounded-b-none rounded-tl-none flex justify-end bg-no-repeat bg-center bg-cover"
style={{ backgroundImage: `url(${profile.img_background})` }}
>
<Button variant="outline" size="sm" onClick={() => handleUpload("background")}>
<Upload size={16} /> Alterar imagem
</Button>
</Alert>

{/* 🔹 Avatar do usuário */}
<div className="relative group w-fit -top-8 px-4">
<Alert
className="aspect-square bg-no-repeat bg-center bg-contain rounded-md h-20 bg-white dark:bg-white"
style={{ backgroundImage: `url(${profile.img_perfil})` }}
></Alert>
{/* 🔹 Overlay de Upload */}
<div
className="aspect-square rounded-md h-20 group-hover:flex bg-black/20 items-center justify-center absolute hidden top-0 z-[1] cursor-pointer"
onClick={() => handleUpload('perfil')}
>
<Upload size={20} />
</div>
</div>


</div>



</div>
                      <div className="p-4 pt-0">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex gap-3">
                       

                      <div>
                        <h1 className="font-semibold text-lg">{props.name}</h1>
                        <p className="text-gray-500 text-xs">{props.acronym}</p>
                      </div>
                        </div>

                       
                      </div>

                      <Separator className="my-4"/>

                     <div className="items-center flex justify-between gap-3">
                    

                      <div className="flex gap-3 justify-end w-full ">
                     

                      <Button  onClick={() => onOpen('confirm-delete-institution', {id_delete:props.institution_id, name:props.name})} variant={'destructive'} className="h-8 w-8 p-0 text-white  dark:text-white">
             
             <Trash size={8} className="h-4 w-4" />
           </Button>

           <EditInstitutionModal
acronym={props.acronym}
name={props.name}
institution_id={props.institution_id}
profile={profile}
setProfile={setProfile}

/>


                    
                      <Button   onClick={() => {
  navigator.clipboard.writeText(props.institution_id)

  toast("Operação realizada", {
    description: "Id da instituição copiado para área de transferência",
    action: {
      label: "Fechar",
      onClick: () => { },
    },
  })

}} variant={'outline'} className="h-8 w-8 p-0 ">
<Copy size={16} />
</Button>
                      </div>
                     </div>
                      </div>
                  </Alert>
        </div>
    )
}