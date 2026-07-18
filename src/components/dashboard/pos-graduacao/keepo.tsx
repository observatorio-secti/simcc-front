import { Globe, Info, Plus } from "lucide-react"
import { Alert } from "../../ui/alert"
import { CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"

import bg_popup from '../../../assets/bg_popup.png';
import { useEffect, useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Link, useLocation } from "react-router-dom";

interface Props {
    id:string
    name:string
    type:string
}

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
}

export function Keepo(props:Props) {
 
    const queryUrl = useQuery();
    const type_search = queryUrl.get('graduate_program_id');

const colors = [
  "#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF",
  "#FFC733", "#33FFF2", "#F233FF", "#33FF95", "#3377FF",
  "#FF3333", "#FF8833", "#33FFB8", "#8D33FF", "#FF33D1"
]

const textColors = [
  "#000000", // Black
  "#FFFFFF", // White
  "#4A4A4A", // Dark Gray
  "#808080", // Gray
  "#C0C0C0", // Light Gray
  "#FF0000", // Red
  "#00FF00", // Lime
  "#0000FF", // Blue
  "#FF4500", // Orange Red
  "#FFD700", // Gold
  "#8A2BE2", // Blue Violet
  "#FF69B4", // Hot Pink
  "#00CED1", // Dark Turquoise
  "#228B22", // Forest Green
  "#2F4F4F", // Dark Slate Gray
];

    return(
        <div>

            <div>
            <Alert className=" bg-cover bg-no-repeat bg-center" style={{ backgroundImage: `url(${bg_popup})` }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Crie e edite
                  </CardTitle>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <div className="flex gap-6 justify-between">

                  <CardContent>
                    <div className="text-2xl font-bold">Personalize a página com suas sessões, links, imagens e organizações</div>
                    <div className="flex gap-3 mt-3">

                     <Link to={`/dashboard/construtor-pagina?graduate_program_id=${type_search}`}>
                     <Button size={'sm'} ><Globe size={16} />Adicionar página</Button>
                     </Link>
                    </div>
                  </CardContent>

                  <div></div>
                </div>
              </Alert>
            </div>


        </div>
    )
}