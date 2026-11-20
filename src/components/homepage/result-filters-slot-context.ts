// Guarda a referência ao div "slot" da coluna esquerda da página de resultados.
// Permite que ResearchersHome/ArticlesHome montem a sidebar nesse slot via portal.
import { createContext } from "react";

export type ArticleExportFilters = {
	qualis: string[];
	year: number[];
};

type ResultFiltersContextValue = {
	slot: HTMLElement | null;
	articleDistinct: boolean;
	setArticleDistinct: (value: boolean) => void;
	articleExportFilters: ArticleExportFilters;
	setArticleExportFilters: (value: ArticleExportFilters) => void;
};

export const ResultFiltersSlotContext = createContext<ResultFiltersContextValue>({
	slot: null,
	articleDistinct: false,
	setArticleDistinct: () => {},
	articleExportFilters: { qualis: [], year: [] },
	setArticleExportFilters: () => {},
});