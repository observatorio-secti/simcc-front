// Guarda a referência ao div "slot" da coluna esquerda da página de resultados.
// Permite que ResearchersHome/ArticlesHome montem a sidebar nesse slot via portal.
import { createContext } from "react";

export const ResultFiltersSlotContext = createContext<HTMLElement | null>(null);