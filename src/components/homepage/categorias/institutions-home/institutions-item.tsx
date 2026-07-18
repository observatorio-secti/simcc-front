import { useContext, useEffect, useState } from "react"
import { Alert } from "../../../ui/alert"
import { UserContext } from "../../../../context/context"
import { CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { User } from "lucide-react"
import { getInstitutionImage } from "./institution-image"
import { getInstitutionImageBackground } from "./institution-image-background"

type Institutions = {
    among: string,
    id: string,
    image: string,
    institution: string,
}

export function InstitutionsItem(props: Institutions) {

    const {valoresSelecionadosExport, searchType, itemsSelecionados} = useContext(UserContext)

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
      const fetchImage = async () => {
        const url = await getInstitutionImage(props.id);
        setImageUrl(url);
      };
  
      fetchImage();
    }, [props.id]);

    const [imageUrlBg, setImageUrlBg] = useState<string | null>(null);

    useEffect(() => {
      const fetchImage = async () => {
        const url = await getInstitutionImageBackground(props.id);
        setImageUrlBg(url);
      };
  
      fetchImage();
    }, [props.id]);


    return(
        <div className="flex w-full group">

        <Alert className=" flex flex-col p-0 justify-between">
        <CardHeader className="flex p-0  justify-between space-y-0 pb-2">
    
      
        <div className="mb-3">

        <div>
        <Alert className="rounded-md border-0 border-b  h-32 rounded-b-none  bg-no-repeat bg-center bg-cover"
           style={{ backgroundImage: `url(${imageUrlBg})` }}>

          </Alert>
         <div className="relative group w-fit -top-8 px-4">
         <Alert
          className="aspect-square dark:bg-white  bg-no-repeat bg-center bg-contain rounded-md h-20 bg-white "
          style={{ backgroundImage: `url(${imageUrl})` }}
        ></Alert>
         </div>
        </div>
          
            </div>
        <div className="px-4">
        <CardTitle className="text-xl font-medium -top-4  relative">
           {props.institution}
          </CardTitle>

      
       
        </div>
        </CardHeader>
        
        </Alert>
        </div>
    )
}