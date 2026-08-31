// Guarda a referência ao div "slot" da coluna esquerda da página de resultados.
// Permite que ResearchersHome/ArticlesHome montem a sidebar nesse slot via portal.
import { createContext } from "react";

type ResultFiltersContextValue = {
	slot: HTMLElement | null;
	articleDistinct: boolean;
	setArticleDistinct: (value: boolean) => void;
};

export const ResultFiltersSlotContext = createContext<ResultFiltersContextValue>({
	slot: null,
	articleDistinct: false,
	setArticleDistinct: () => {},
});