import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "../ui/alert";
import debounce from "lodash.debounce"; // Importing debounce

import { CalendarBlank } from "phosphor-react";
import { Slider } from "../ui/slider";
import { useIsMobile } from "../../hooks/use-mobile";

interface Props {
  onFilterUpdate: (newResearcher: Filter[]) => void;
}

type Filter = {
  year: number[]
  qualis: string[]
}

export function FilterYearIndicators(props: Props) {
  const [itensSelecionados] = useState<string[]>([]);
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const [filterYear, setFilterYear] = useState([useIsMobile() ? 2000 : 1990]);
  const [isFirstRender, setIsFirstRender] = useState(true); // State to track the first render

  // Função para debounced update
  const updateResearcher = useCallback(
    debounce((newResearcher: Filter[]) => {
      props.onFilterUpdate(newResearcher);
    }, 500), // 500ms debounce
    []
  );

  // Atualizando filtros quando filterYear ou itensSelecionados mudarem
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false); // Set first render to false after the first render
      return;
    }

    const filtros = {
      year: filterYear,
      qualis: itensSelecionados,
    };
    updateResearcher([filtros]); // Chamando a função de update
  }, [filterYear, itensSelecionados, updateResearcher, isFirstRender]);

  return (
    <div className="mb-6 flex gap-6">
      <div className="w-full flex flex-1 flex-col">
        <div className="flex items-center gap-3 mb-4 ">
          <CalendarBlank size={24} className="text-gray-400" />
          <p className="text-sm font-bold">Selecione o ano</p>
        </div>

        <Alert className="w-full flex items-center gap-2 h-[74px]">
          <Slider
            defaultValue={filterYear}
            onValueChange={(value) => setFilterYear(value)}
            max={year}
            min={useIsMobile() ? 2000 : 1990}
            step={1}
            className="color-blue-700"
          />
          <p className="text-sm font-bold">{filterYear}</p>
        </Alert>
      </div>
    </div>
  );
}
