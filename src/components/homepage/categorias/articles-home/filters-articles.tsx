import { useCallback, useEffect, useState } from "react";
import { Alert } from "../../../ui/alert";
import { CalendarBlank, CheckSquare } from "phosphor-react";
import debounce from "lodash.debounce"; // Importing debounce
import { ArticleQualisSelector, ArticleYearSlider, qualisOptions } from "./article-filter-fields";

interface Props {
  onFilterUpdate: (newResearcher: Filter[]) => void;
}

type Filter = {
  year: number[];
  qualis: string[];
};

export function FilterArticle(props: Props) {
  const [itensSelecionados, setItensSelecionados] = useState<string[]>([]);
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const [filterYear, setFilterYear] = useState([1990]);

  const [isFirstRender, setIsFirstRender] = useState(true);

  const handleCheckboxChangeInput = (itemId: number, isChecked: boolean) => {
    setItensSelecionados((prevSelecionados) => {
      const selectedQualis = qualisOptions.find((q) => q.id === itemId);
      if (selectedQualis) {
        if (isChecked) {
          return [...prevSelecionados, selectedQualis.itens];
        } else {
          return prevSelecionados.filter((item) => item !== selectedQualis.itens);
        }
      } else {
        return prevSelecionados;
      }
    });
  };

  const updateResearcher = useCallback(
    debounce((newResearcher: Filter[]) => {
      props.onFilterUpdate(newResearcher);
    }, 500),
    []
  );

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
      return;
    }

    const filtros = {
      year: filterYear,
      qualis: itensSelecionados,
    };

    updateResearcher([filtros]);
  }, [filterYear, itensSelecionados, updateResearcher, isFirstRender]);

  return (
    <div className="flex  gap-6 lg:flex-row flex-col">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <CheckSquare size={24} className="text-gray-400" />
          <p className=" font-medium">Selecione o Qualis</p>
        </div>
        <Alert className="w-fit">
          <ArticleQualisSelector selected={itensSelecionados} onToggle={handleCheckboxChangeInput} />
        </Alert>
      </div>

      <div className="w-full flex flex-1 flex-col min-w-[300px]">
        <div className="flex items-center gap-3 mb-4">
          <CalendarBlank size={24} className="text-gray-400" />
          <p className=" font-medium">Selecione o ano</p>
        </div>

        <ArticleYearSlider value={filterYear} onChange={setFilterYear} />
      </div>
    </div>
  );
}