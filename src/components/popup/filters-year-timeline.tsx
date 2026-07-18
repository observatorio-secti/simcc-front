import { useCallback, useEffect, useMemo, useState } from "react";

import { Slider } from "../ui/slider";
import debounce from "lodash.debounce"; // Importing debounce
interface Props {
    onFilterUpdate: (newResearcher: Filter[]) => void;
}

type Filter = {
    year: number[]
    qualis: string[]
}



export function FilterYearTimeLine(props:Props) {
 


    const [itensSelecionados] = useState<string[]>([]);
    const currentDate = new Date();
    const year = currentDate.getFullYear()
    const [filterYear, setFilterYear] = useState([1990])
  
    
  
 
    //ano atual
   
  // Função para debounced update
  const updateResearcher = useCallback(
    debounce((newResearcher: Filter[]) => {
      props.onFilterUpdate(newResearcher);
    }, 500), // 500ms debounce
    []
  );

  // Atualizando filtros quando filterYear ou itensSelecionados mudarem
  useEffect(() => {
    const filtros = {
      year: filterYear,
      qualis: itensSelecionados,
    };
    updateResearcher([filtros]); // Chamando a função de update
  }, [filterYear, itensSelecionados, updateResearcher]);

    

    return(
       <div className="mb-6 flex gap-6">
    

        <div className="w-full flex flex-1 flex-col">
        
        <div className="flex items-center gap-3 pt-4">
<Slider
defaultValue={filterYear}
onValueChange={(value) => setFilterYear(value)}
max={year}
min={1990}
step={1}
className="color-blue-700"

></Slider>

<p className="text-sm font-bold">{filterYear}</p>

</div>
        </div>
       </div>
    )
}