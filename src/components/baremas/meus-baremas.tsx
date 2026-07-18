import { useContext, useEffect, useState } from "react";
import { useModalHomepage } from "../hooks/use-modal-homepage";
import { HeaderMeusBarema } from "./header-meus-baremas";
import { UserContext } from "../../context/context";
import {  getFirestore, doc, getDocs, getDoc, collection, addDoc, query, deleteDoc,  where,  Query } from 'firebase/firestore';
import { Link, useNavigate } from "react-router-dom";
import { FileCsv, Plus, Trash, Users } from "phosphor-react";
import { Alert } from "../ui/alert";
import { Button } from "../ui/button";

interface PesquisadoresSelecionados {
    id:string
    name: string,
    university: string,
    lattes_id: string,
    city: string,
    area: string,
    graduation: string,
  }

  interface Firebase {
    id:string
    name:string
    createdAt:string
    userId:string
    pesquisadores:PesquisadoresSelecionados[]
    grupos:Grupo[]

    anoArtigo:string
    anoWorkInEvent:string
    anoLivro:string
    anoCapLivro:string
    anoPatente:string
    anoMarca:string
    anoSoftware:string
    anoResourceProgess:string
    anoResourceCompleted:string
    anoParticipacao:string
    [`Document ID`]: string

}

interface Grupo {
    id: string;
    titulo: string;
    descricao: string;
    categorias: Categoria[];
    quantidade_max_pontos: number;
    // outras propriedades do grupo
}

interface Categoria {
    id_criterio: number;
    criterio: string;
   
            pontos: string,
            pontuacao_max: string,
            id_grupo: string,
       
            pesquisadores:PesquisadorUpdate[]
}

type PesquisadorUpdate = {
    total:number,
    id:string,
    name:string
    id_criterio:number
}


export function MeusBaremasHome() {
    const { isOpen, type } = useModalHomepage();
    const isModalOpen = isOpen && type === 'meus-baremas';
    const { user, urlGeral, idDocumentBarema, setIdDocumentBarema } = useContext(UserContext);
    const [userData, setUserData] = useState<Firebase[] | null>(null);

    const db = getFirestore();
    const userId = user && user.uid;

    useEffect(() => {
        const fetchData = async () => {
          try {
            if (userId) {
              console.log('userId:', userId);
      
              const userDocsRef = collection(db, 'baremas');
const userDocsQuery = query(userDocsRef, where('userId', '==', userId));
const userDocSnapshot = await getDocs(userDocsQuery);
      
              console.log('userDocSnapshot:', userDocSnapshot);
      
              if (userDocSnapshot.size > 0) {
               
                
                const userDataArray: Firebase[] = userDocSnapshot.docs.map((doc) => {
                    // Get the document ID using .id
                    const documentId = doc.id;
                    // Combine document ID with document data
                    const userData = { ...(doc.data() as Firebase), ['Document ID']: documentId };
                    return userData;
                  });
  setUserData(userDataArray);

  console.log('User Data:', userData);
              } else {
                console.log('User data not found');
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        };
      
        fetchData();
      }, [db, userId]);

      const history = useNavigate();
      const handleBarema = async (idBarema: string) => {
        setIdDocumentBarema(idBarema)
        console.log(idBarema)

        setTimeout(() => {
            history(`/barema/${idBarema}`);
          }, 0);

        
      };

    
    return(
        <>
        {isModalOpen && (
             <div className="w-full mr-16 mb-20">
             <HeaderMeusBarema />

             <div className="flex">
                </div>

                <div className=" grid grid-cols-5 gap-6">
                <div className=' flex flex-col  rounded-xl cursor-pointer transition-all  min-h-[180px] '>
            <Link to={`/barema`} >
            <Alert className="text-blue-700 flex h-full flex-col items-center justify-center rounded-b-none">
                <Plus size={32} className=" text-blue-700" />
            <p className='font-medium text-sm'>Adicionar barema</p>
            </Alert>
            </Link>

            <a  href="/public/modelo_barema.csv" download className=''>
           <Alert className="border-t-0 rounded-t-none flex gap-3 items-center text-blue-700">
           <FileCsv size={16} className="" />Download modelo csv
           </Alert>
            </a>
        </div>

        {userData && userData.length > 0 && (
           
           userData.map((user) => (
       <div onClick={() =>  handleBarema(user['Document ID'])}>
           <Alert className="min-h-[180px]" >
       <div>
           <h3 className='font-medium text-xl text-gary-500'>{user.name}</h3>
           <p className='text-sm text-gray-400 mt-2'>{user.createdAt}</p>
       </div>


       <div className='flex justify-between gap-3'>
       <div>
       
       </div>
       <div className='flex gap-3 text-gray-400 items-center'>
       <Users size={20} className=" " />


       {user.pesquisadores.slice(0, 3).map((props) => {
               return (
                   <div
                   className="bg-cover border-[1px] border-gray-300 bg-center bg-no-repeat h-8 w-8 bg-white rounded-md relative"
                   style={{ backgroundImage: `url(${urlGeral}ResearcherData/Image?researcher_id=${props.id}) ` }}
                   ></div>
               );
               })}

               {user.pesquisadores.length > 3 ? (<p>+ {user.pesquisadores.length -3}</p>):(``)}
       </div>

       
       </div>
       </Alert>
  <div className='ml-auto  z-[9] absolute float-right w-max '>
               <Button variant={'destructive'} size={'icon'}><Trash size={20} className={''} /></Button>
  </div>
  
       </div>
     ))
       
       )}

                </div>
                </div>
        )}
        </>
    )
}