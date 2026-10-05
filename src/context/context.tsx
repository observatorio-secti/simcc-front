import { createContext } from 'react';

export interface HistoricoItem {
  termo: string;
  tipo: string;
}

export interface ItemsSelecionados {
  term: string;
}

export interface UserContextType {
  test: boolean;
  setTest: React.Dispatch<React.SetStateAction<boolean>>;
  navbar: boolean;
  setNavbar: React.Dispatch<React.SetStateAction<boolean>>;

  historico: HistoricoItem[];
  setHistorico: React.Dispatch<React.SetStateAction<HistoricoItem[]>>;

  valoresSelecionadosExport: string;
  setValoresSelecionadosExport: React.Dispatch<React.SetStateAction<string>>;

  itemsSelecionados: ItemsSelecionados[];
  setItensSelecionados: React.Dispatch<
    React.SetStateAction<ItemsSelecionados[]>
  >;

  itemsSelecionadosPopUp: ItemsSelecionados[];
  setItensSelecionadosPopUp: React.Dispatch<
    React.SetStateAction<ItemsSelecionados[]>
  >;

  sugestoes: ItemsSelecionados[];
  setSugestoes: React.Dispatch<React.SetStateAction<ItemsSelecionados[]>>;

  valorDigitadoPesquisaDireta: string;
  setValorDigitadoPesquisaDireta: React.Dispatch<React.SetStateAction<string>>;

  /** @deprecated Configuração estática de API */
  urlGeral: string;
  setUrlGeral?: React.Dispatch<React.SetStateAction<string>>;

  /** @deprecated Configuração estática de API */
  urlGeral2: string;
  setUrlGeral2?: React.Dispatch<React.SetStateAction<string>>;

  idGraduateProgram: string;
  setIdGraduateProgram: React.Dispatch<React.SetStateAction<string>>;

  searchType: string;
  setSearchType: React.Dispatch<React.SetStateAction<string>>;

  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;

  isCollapsedRight: boolean;
  setIsCollapsedRight: React.Dispatch<React.SetStateAction<boolean>>;

  simcc: boolean;
  setSimcc: React.Dispatch<React.SetStateAction<boolean>>;

  mode: string;
  setMode: React.Dispatch<React.SetStateAction<string>>;
}

export const UserContext = createContext<UserContextType>({
  test: false,
  setTest: () => {},
  navbar: false,
  setNavbar: () => {},

  historico: [],
  setHistorico: () => {},

  valoresSelecionadosExport: '',
  setValoresSelecionadosExport: () => {},

  itemsSelecionados: [],
  setItensSelecionados: () => {},

  itemsSelecionadosPopUp: [],
  setItensSelecionadosPopUp: () => {},

  sugestoes: [],
  setSugestoes: () => {},

  valorDigitadoPesquisaDireta: '',
  setValorDigitadoPesquisaDireta: () => {},

  urlGeral: '',
  setUrlGeral: () => {},

  urlGeral2: '',
  setUrlGeral2: () => {},

  searchType: '',
  setSearchType: () => {},

  isCollapsed: false,
  setIsCollapsed: () => {},

  isCollapsedRight: false,
  setIsCollapsedRight: () => {},

  simcc: false,
  setSimcc: () => {},

  mode: '',
  setMode: () => {},

  idGraduateProgram: '',
  setIdGraduateProgram: () => {},
});
