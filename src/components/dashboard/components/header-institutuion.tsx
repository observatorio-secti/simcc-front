import { Hash } from "lucide-react";
import { Alert } from "../../ui/alert";
import { useContext, useEffect, useRef, useState } from "react";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { UserContext } from "../../../context/context";

export function HeaderInstitution() {
const {user} = useContext(UserContext)
      const [profile, setProfile] = useState({
        img_perfil: '',
        img_background: '',
        institution_id: user?.institution_id || '',
        color:'',
        site:'',
        name:''
      });

      
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
                  name: data?.name || ''
                });
        
                isDataLoaded.current = true; // Marca que os dados foram carregados
              } else {
                console.log("Instituição não encontrada. Criando novo registro...");
             
              }
            };
        
            fetchInstitutionData();
          }
        }, [profile.institution_id]);

    return(
        <div className="w-full">
        {/* 🔹 Seção de Background */}
        <Alert
          className="h-[200px] flex justify-end bg-no-repeat bg-center bg-cover"
          style={{ backgroundImage: `url(${profile.img_background})` }}
        >
          
        </Alert>
  
        {/* 🔹 Avatar do usuário */}
        <div className="relative group w-fit -top-16 px-16">
          <Alert
            className="aspect-square bg-no-repeat bg-center bg-contain rounded-md h-28 bg-white dark:bg-white"
            style={{ backgroundImage: `url(${profile.img_perfil})` }}
          ></Alert>
          {/* 🔹 Overlay de Upload */}
         
        </div>
  
        <div className="md:px-16 md:mb-4 -top-8 relative flex justify-between">
              <div>
              <h1 className="text-2xl max-w-[800px] font-bold leading-tight tracking-tighter md:text-4xl lg:leading-[1.1] md:block">
                      {profile.name}
                      </h1>
                      <div className="text-sm text-gray-500 dark:text-gray-300 font-normal flex gap-1 items-center capitalize"><Hash size={12} />{profile.institution_id}</div>
              </div>
             
            </div>
      </div>
    )
}